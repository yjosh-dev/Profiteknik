import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FaCheck, FaXmark, FaChevronDown } from "react-icons/fa6";

/* =========================================================
   TYPES
========================================================= */

export type Tier = "highly_qualified" | "qualified" | "underqualified" | "not_qualified";

/** Raw facts about the applicant vs. the job. This is what the API should eventually return. */
export interface MatchInput {
  skills: { required: string[]; owned: string[] };
  experience: { requiredYears: number; applicantYears: number };
  education: { required: string; applicant: string; met: boolean };
  questions: { total: number; satisfied: number };
  /** Legally mandated requirements (e.g. a license). Any unmet one blocks "Highly Qualified". */
  mandatory: { label: string; met: boolean }[];
}

interface Criterion {
  key: "skills" | "experience" | "education" | "questions";
  label: string;
  symbol: string;
  weight: number; // 0..1
  score: number; // 0..1
  points: number; // score * weight * 100
  maxPoints: number; // weight * 100
  detail: string;
}

export interface MatchResult {
  criteria: Criterion[];
  total: number; // 0..1
  percent: number; // 0..100, 2 decimals
  tier: Tier;
  capped: boolean;
  reason: string;
  matched: string[];
  missing: string[];
  gates: { expMet: boolean; eduMet: boolean; mandatoryMet: boolean };
}

/* =========================================================
   ALGORITHM
   Match Score = (S x 0.50) + (E x 0.20) + (Ed x 0.10) + (Q x 0.20)
========================================================= */

export const WEIGHTS = { skills: 0.5, experience: 0.2, education: 0.1, questions: 0.2 };

const trim = (n: number, digits = 1) => String(Number(n.toFixed(digits)));
const fmtPct = (n: number) => trim(n, 1);
const plural = (n: number, word: string) => `${trim(n)} ${word}${n === 1 ? "" : "s"}`;

export function computeMatch(input: MatchInput): MatchResult {
  const owned = new Set(input.skills.owned.map((s) => s.trim().toLowerCase()));
  const matched = input.skills.required.filter((s) => owned.has(s.trim().toLowerCase()));
  const missing = input.skills.required.filter((s) => !owned.has(s.trim().toLowerCase()));

  const skillsScore = input.skills.required.length
    ? matched.length / input.skills.required.length
    : 1;

  const { requiredYears, applicantYears } = input.experience;
  const experienceScore = requiredYears > 0 ? Math.min(applicantYears / requiredYears, 1) : 1;

  const educationScore = input.education.met ? 1 : 0;

  const qTotal = input.questions.total;
  const qDone = Math.min(input.questions.satisfied, qTotal);
  const questionsScore = qTotal > 0 ? qDone / qTotal : 1;

  const make = (
    key: Criterion["key"],
    label: string,
    symbol: string,
    weight: number,
    score: number,
    detail: string,
  ): Criterion => ({
    key,
    label,
    symbol,
    weight,
    score,
    points: score * weight * 100,
    maxPoints: weight * 100,
    detail,
  });

  const criteria: Criterion[] = [
    make(
      "skills",
      "Technical skills",
      "S",
      WEIGHTS.skills,
      skillsScore,
      `${matched.length} of ${input.skills.required.length} required skills`,
    ),
    make(
      "experience",
      "Work experience",
      "E",
      WEIGHTS.experience,
      experienceScore,
      `${plural(applicantYears, "year")} of ${plural(requiredYears, "year")} required`,
    ),
    make(
      "education",
      "Education",
      "Ed",
      WEIGHTS.education,
      educationScore,
      input.education.met
        ? `Meets minimum: ${input.education.required}`
        : `Below minimum: ${input.education.required}`,
    ),
    make(
      "questions",
      "Pre-screening questions",
      "Q",
      WEIGHTS.questions,
      questionsScore,
      `${qDone} of ${qTotal} questions satisfied`,
    ),
  ];

  const total = criteria.reduce((sum, c) => sum + c.score * c.weight, 0);
  const percent = Math.round(total * 10000) / 100;

  /* ---------- Stage 2: decision tree ---------- */
  const expMet = applicantYears >= requiredYears;
  const eduMet = input.education.met;
  const mandatoryMet = input.mandatory.every((m) => m.met);
  const baseOk = expMet && eduMet;

  let tier: Tier;
  let capped = false;
  let reason: string;

  if (percent < 60) {
    tier = "not_qualified";
    reason = "The weighted score is below 60%.";
  } else if (percent >= 80 && mandatoryMet) {
    tier = "highly_qualified";
    reason = "The weighted score is 80% or higher and every mandatory requirement is met.";
  } else {
    tier = baseOk ? "qualified" : "underqualified";

    if (percent >= 80) {
      capped = true;
      reason = `The score is 80% or higher, but a mandatory requirement is missing, so the tier is capped at ${
        tier === "qualified" ? "Qualified" : "Underqualified"
      }.`;
    } else {
      reason = baseOk
        ? "The score is between 60% and 79%, and the minimum experience and education are met."
        : "The score is between 60% and 79%, but the minimum experience or education is not met.";
    }
  }

  return {
    criteria,
    total,
    percent,
    tier,
    capped,
    reason,
    matched,
    missing,
    gates: { expMet, eduMet, mandatoryMet },
  };
}

/* =========================================================
   TIER STYLES
========================================================= */

const TIERS: Record<
  Tier,
  { label: string; actions: string[]; color: string; badge: string }
> = {
  highly_qualified: {
    label: "Highly Qualified",
    actions: ["Subject to priority hiring", "Add to qualified talent pool"],
    color: "#047857",
    badge: "bg-emerald-50 text-emerald-800",
  },
  qualified: {
    label: "Qualified",
    actions: ["Eligible for hiring"],
    color: "#0369A1",
    badge: "bg-sky-50 text-sky-800",
  },
  underqualified: {
    label: "Underqualified",
    actions: ["Add to talent pool", "Or mark eligible for rejection"],
    color: "#B45309",
    badge: "bg-amber-50 text-amber-800",
  },
  not_qualified: {
    label: "Not qualified",
    actions: ["Subject to rejection"],
    color: "#B91C1C",
    badge: "bg-red-50 text-red-800",
  },
};

/* =========================================================
   MOCK DATA
   Pass any of these as <MatchScoreCard match={...} /> to preview every tier.
========================================================= */

const REQUIRED_SKILLS = ["Welding", "Pipefitting", "Blueprint Reading", "Safety Training"];

export const MOCK_MATCH_SCENARIOS: Record<string, MatchInput> = {
  // Sample computation from the paper: S .75, E 1.00, Ed 1.00, Q .80  ->  83.5%
  highlyQualified: {
    skills: { required: REQUIRED_SKILLS, owned: ["Welding", "Pipefitting", "Blueprint Reading", "Rigging"] },
    experience: { requiredYears: 3, applicantYears: 4 },
    education: { required: "High School Graduate", applicant: "High School Graduate", met: true },
    questions: { total: 5, satisfied: 4 },
    mandatory: [{ label: "TESDA Welding NC II", met: true }],
  },
  // Same 83.5%, but the license is missing, so the tree caps the tier
  cappedByLicense: {
    skills: { required: REQUIRED_SKILLS, owned: ["Welding", "Pipefitting", "Blueprint Reading"] },
    experience: { requiredYears: 3, applicantYears: 4 },
    education: { required: "High School Graduate", applicant: "High School Graduate", met: true },
    questions: { total: 5, satisfied: 4 },
    mandatory: [{ label: "TESDA Welding NC II", met: false }],
  },
  qualified: {
    skills: { required: REQUIRED_SKILLS, owned: ["Welding", "Pipefitting"] },
    experience: { requiredYears: 3, applicantYears: 3 },
    education: { required: "High School Graduate", applicant: "Senior High Graduate", met: true },
    questions: { total: 5, satisfied: 4 },
    mandatory: [{ label: "TESDA Welding NC II", met: true }],
  },
  underqualified: {
    skills: { required: REQUIRED_SKILLS, owned: ["Welding", "Pipefitting", "Blueprint Reading"] },
    experience: { requiredYears: 3, applicantYears: 1 },
    education: { required: "High School Graduate", applicant: "High School Graduate", met: true },
    questions: { total: 5, satisfied: 3 },
    mandatory: [{ label: "TESDA Welding NC II", met: true }],
  },
  notQualified: {
    skills: { required: REQUIRED_SKILLS, owned: ["Welding"] },
    experience: { requiredYears: 3, applicantYears: 1 },
    education: { required: "High School Graduate", applicant: "Elementary Graduate", met: false },
    questions: { total: 5, satisfied: 2 },
    mandatory: [{ label: "TESDA Welding NC II", met: false }],
  },
};

/* =========================================================
   SMALL PARTS
========================================================= */

// Lets bars and the gauge animate from zero on first paint
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

function StageHeading({ n, title, aside }: { n: number; title: string; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="archivo flex h-6 w-6 items-center justify-center rounded-full bg-[#991B1B]/10 text-xs font-bold text-[#991B1B]">
          {n}
        </span>
        <h4 className="archivo text-sm font-bold text-[#1C2321]">{title}</h4>
      </div>
      {aside}
    </div>
  );
}

function MatchGauge({ percent, color }: { percent: number; color: string }) {
  const mounted = useMounted();
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((mounted ? percent : 0) / 100) * circumference;

  return (
    <div
      className="relative h-36 w-36"
      role="img"
      aria-label={`Match score ${fmtPct(percent)} percent`}
    >
      <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#E8E6E0" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="archivo text-3xl font-bold tabular-nums text-[#1C2321]">
          {fmtPct(percent)}
          <span className="text-lg">%</span>
        </span>
        <span className="archivo text-[11px] text-[#6B6F76]">match score</span>
      </div>
    </div>
  );
}

function CriterionRow({ c, extra }: { c: Criterion; extra?: ReactNode }) {
  const mounted = useMounted();
  const pct = Math.round(c.score * 100);
  const weightPct = Math.round(c.weight * 100);

  return (
    <li>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="archivo text-sm font-semibold text-[#1C2321]">{c.label}</span>
          <span className="archivo rounded-full bg-[#F3F1EC] px-2 py-0.5 text-[11px] font-semibold text-[#6B6F76]">
            {weightPct}% weight
          </span>
        </div>

        <span className="archivo shrink-0 text-sm font-bold tabular-nums text-[#1C2321]">
          +{trim(c.points)}
          <span className="font-normal text-[#9A9EA5]"> / {weightPct}</span>
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8E6E0]" aria-hidden="true">
        <div
          className="h-full rounded-full bg-[#991B1B] transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${mounted ? pct : 0}%` }}
        />
      </div>

      <div className="archivo mt-1.5 flex items-center justify-between gap-3 text-xs text-[#6B6F76]">
        <span>{c.detail}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>

      {extra}
    </li>
  );
}

function SkillChips({ matched, missing }: { matched: string[]; missing: string[] }) {
  return (
    <ul className="mt-2.5 flex flex-wrap gap-1.5">
      {matched.map((s) => (
        <li
          key={s}
          className="archivo inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800"
        >
          <FaCheck size={9} aria-hidden="true" />
          {s}
          <span className="sr-only"> (matched)</span>
        </li>
      ))}
      {missing.map((s) => (
        <li
          key={s}
          className="archivo inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
        >
          <FaXmark size={10} aria-hidden="true" />
          {s}
          <span className="sr-only"> (missing)</span>
        </li>
      ))}
    </ul>
  );
}

function ScoreScale({ percent, color }: { percent: number; color: string }) {
  const pos = Math.min(98, Math.max(2, percent));
  const ticks = [0, 60, 80, 100];

  return (
    <div>
      <div className="px-1 pt-9">
        <div className="relative h-2.5">
          <div className="flex h-full overflow-hidden rounded-full" aria-hidden="true">
            <div className="w-[60%] bg-red-200" />
            <div className="w-[20%] bg-[#D9D6CE]" />
            <div className="w-[20%] bg-emerald-200" />
          </div>

          {/* marker */}
          <div
            className="absolute bottom-[-6px] flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${pos}%` }}
            aria-hidden="true"
          >
            <span
              className="archivo mb-1 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums text-white"
              style={{ backgroundColor: color }}
            >
              {fmtPct(percent)}%
            </span>
            <span className="h-5 w-0.5 rounded-full" style={{ backgroundColor: color }} />
          </div>
        </div>

        <div className="archivo relative mt-2.5 h-4 text-[11px] text-[#9A9EA5]" aria-hidden="true">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute tabular-nums"
              style={{
                left: `${t}%`,
                transform: `translateX(-${t === 0 ? 0 : t === 100 ? 100 : 50}%)`,
              }}
            >
              {t}%
            </span>
          ))}
        </div>
      </div>

      <ul className="archivo mt-4 grid gap-1.5 text-xs text-[#6B6F76] sm:grid-cols-3">
        <li className="flex items-start gap-2">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-300" aria-hidden="true" />
          Below 60%: Not qualified
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C9C6BD]" aria-hidden="true" />
          60% to 79%: Qualified, or Underqualified if minimum experience or education isn't met
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-300" aria-hidden="true" />
          80% and above: Highly Qualified, if all mandatory requirements are met
        </li>
      </ul>
    </div>
  );
}

function GateItem({
  ok,
  title,
  detail,
  needed,
}: {
  ok: boolean;
  title: string;
  detail: string;
  needed: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-lg bg-[#FAF9F6] p-4">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}
        aria-hidden="true"
      >
        {ok ? <FaCheck size={11} /> : <FaXmark size={13} />}
      </span>

      <div className="min-w-0">
        <p className="archivo text-sm font-semibold text-[#1C2321]">
          {title}
          <span className="sr-only">{ok ? " (met)" : " (not met)"}</span>
        </p>
        <p className="archivo mt-0.5 text-xs text-[#6B6F76]">{detail}</p>
        <p className="archivo mt-1.5 text-[11px] text-[#9A9EA5]">{needed}</p>
      </div>
    </li>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MatchScoreCard({
  match = MOCK_MATCH_SCENARIOS.highlyQualified,
  sample = true,
}: {
  match?: MatchInput;
  /** Shows the "Sample data" tag. Pass false once real data is wired in. */
  sample?: boolean;
}) {
  const result = useMemo(() => computeMatch(match), [match]);
  const [showCalc, setShowCalc] = useState(false);
  const tier = TIERS[result.tier];

  const [s, e, ed, q] = result.criteria;
  const terms = result.criteria.map((c) => c.score * c.weight);

  return (
    <section className="rounded-xl bg-[#FAF9F6] p-6" aria-labelledby="match-heading">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            id="match-heading"
            className="archivo text-xs font-bold uppercase tracking-wider text-[#991B1B]"
          >
            Match evaluation
          </h3>
          <p className="archivo mt-1 text-xs text-[#6B6F76]">
            Stage 1 scores the applicant against the job. Stage 2 classifies them.
          </p>
        </div>

        {sample && (
          <span className="archivo rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#6B6F76]">
            Sample data
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* RESULT */}
        <div className="flex flex-col items-center rounded-xl bg-white p-5 text-center">
          <MatchGauge percent={result.percent} color={tier.color} />

          <span
            className={`archivo mt-4 rounded-full px-3 py-1 text-sm font-bold ${tier.badge}`}
          >
            {tier.label}
          </span>

          <p
            className={`archivo mt-2 text-xs leading-relaxed ${
              result.capped ? "text-amber-800" : "text-[#6B6F76]"
            }`}
          >
            {result.reason}
          </p>

          <div className="mt-4 w-full border-t border-[#F0EEEA] pt-4 text-left">
            <p className="archivo text-[11px] font-semibold text-[#9A9EA5]">Recommended action</p>
            <ul className="mt-2 space-y-1.5">
              {tier.actions.map((a) => (
                <li key={a} className="archivo flex items-start gap-2 text-sm text-[#1C2321]">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: tier.color }}
                    aria-hidden="true"
                  />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* STAGE 1 */}
        <div className="rounded-xl bg-white p-5">
          <StageHeading
            n={1}
            title="Weighted score"
            aside={
              <span className="archivo text-sm font-bold tabular-nums text-[#1C2321]">
                {fmtPct(result.percent)}
                <span className="font-normal text-[#9A9EA5]"> / 100 pts</span>
              </span>
            }
          />

          <ul className="mt-5 space-y-6">
            {result.criteria.map((c) => (
              <CriterionRow
                key={c.key}
                c={c}
                extra={
                  c.key === "skills" ? (
                    <SkillChips matched={result.matched} missing={result.missing} />
                  ) : undefined
                }
              />
            ))}
          </ul>

          <div className="mt-6 border-t border-[#F0EEEA] pt-4">
            <button
              type="button"
              onClick={() => setShowCalc((v) => !v)}
              aria-expanded={showCalc}
              aria-controls="match-calc"
              className="archivo inline-flex cursor-pointer items-center gap-2 rounded text-sm font-semibold text-[#991B1B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#991B1B] focus-visible:ring-offset-2"
            >
              How is this calculated?
              <FaChevronDown
                size={11}
                className={`transition-transform motion-reduce:transition-none ${
                  showCalc ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {showCalc && (
              <div id="match-calc" className="mt-3 rounded-lg bg-[#FAF9F6] p-4">
                <pre className="overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed text-[#1C2321]">
                  {[
                    `Match Score = (S × ${s.weight.toFixed(2)}) + (E × ${e.weight.toFixed(2)}) + (Ed × ${ed.weight.toFixed(2)}) + (Q × ${q.weight.toFixed(2)})`,
                    `            = (${s.score.toFixed(2)} × ${s.weight.toFixed(2)}) + (${e.score.toFixed(2)} × ${e.weight.toFixed(2)}) + (${ed.score.toFixed(2)} × ${ed.weight.toFixed(2)}) + (${q.score.toFixed(2)} × ${q.weight.toFixed(2)})`,
                    `            = ${terms.map((t) => t.toFixed(3)).join(" + ")}`,
                    `            = ${result.total.toFixed(3)}  ->  ${fmtPct(result.percent)}%`,
                  ].join("\n")}
                </pre>

                <ul className="archivo mt-3 space-y-1 text-xs text-[#6B6F76]">
                  <li>S: required skills the applicant has, divided by all required skills.</li>
                  <li>E: applicant years divided by required years, capped at 1.</li>
                  <li>Ed: 1 if the minimum education is met, otherwise 0.</li>
                  <li>Q: screening questions satisfied, divided by total questions.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STAGE 2 */}
      <div className="mt-5 rounded-xl bg-white p-5">
        <StageHeading
          n={2}
          title="Classification"
          aside={
            <span className={`archivo rounded-full px-2.5 py-1 text-xs font-bold ${tier.badge}`}>
              {tier.label}
            </span>
          }
        />

        <ScoreScale percent={result.percent} color={tier.color} />

        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <GateItem
            ok={result.gates.expMet}
            title="Minimum experience"
            detail={`${plural(match.experience.applicantYears, "year")} of ${plural(match.experience.requiredYears, "year")} required`}
            needed="Needed for Qualified"
          />
          <GateItem
            ok={result.gates.eduMet}
            title="Minimum education"
            detail={`${match.education.applicant} (needs ${match.education.required})`}
            needed="Needed for Qualified"
          />
          {match.mandatory.map((m) => (
            <GateItem
              key={m.label}
              ok={m.met}
              title={m.label}
              detail={m.met ? "Provided by the applicant" : "Not provided"}
              needed="Needed for Highly Qualified"
            />
          ))}
        </ul>
      </div>
    </section>
  );
}