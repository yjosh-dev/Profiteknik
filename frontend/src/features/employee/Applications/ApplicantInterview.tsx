import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { applicantScreeningService } from "../../../service/api/employee/applicantScreeningService";

type GoogleState = "checking" | "connected" | "disconnected";

type Interview = {
  id: number;
  title: string | null;
  applicant_email: string | null;
  meet_link: string | null;
  starts_at: string;
  ends_at: string;
};

type Screening = {
  applicationId: string | number | null;
  name: string;
  email: string;
  jobTitle: string;
};

const DURATIONS = [15, 30, 45, 60, 90];
const QUICK_TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

const pad = (n: number) => String(n).padStart(2, "0");

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const fmtTime = (d: Date) =>
  d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", hour12: true });

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

// Adjust the field names here if your API response differs
function pickScreening(raw: any): Screening {
  const d = raw?.data ?? raw ?? {};
  const applicant = d.applicant ?? d.user ?? {};
  const first = applicant.first_name ?? d.first_name ?? "";
  const last = applicant.last_name ?? d.last_name ?? "";
  return {
    applicationId: d.application_id ?? d.application?.id ?? null,
    name:
      d.applicant_name ??
      d.full_name ??
      d.name ??
      applicant.full_name ??
      applicant.name ??
      (`${first} ${last}`.trim() || "the applicant"),
    email: d.email ?? applicant.email ?? d.contact?.email ?? d.applicant_email ?? "",
    jobTitle: d.job_title ?? d.job?.title ?? d.job_listing?.title ?? "",
  };
}

/* ---------------------------------- styles ---------------------------------- */

const inputBase =
  "w-full rounded-md border bg-white px-3 py-2.5 text-sm text-[#1C2321] outline-none transition-colors placeholder:text-[#9A9EA5] focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B]";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-md bg-[#991B1B] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#7F1616] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#991B1B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-md border border-[#E3E0D8] bg-white px-4 py-2.5 text-sm font-bold text-[#1C2321] transition-colors hover:bg-[#FAF9F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#991B1B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const chip = (active: boolean) =>
  `rounded-md border px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#991B1B] ${
    active
      ? "border-[#991B1B] bg-[#991B1B] text-white"
      : "border-[#E3E0D8] bg-white text-[#1C2321] hover:border-[#991B1B] hover:text-[#991B1B]"
  }`;

/* -------------------------------- small parts -------------------------------- */

function Spinner({ light = false }: { light?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${
        light ? "border-white/40 border-t-white" : "border-[#E3E0D8] border-t-[#991B1B]"
      }`}
    />
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[#E8E6E0] ${className}`} />;
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-bold uppercase tracking-wide text-[#6B6F76]">
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-xs text-[#991B1B]">{error}</span>
      ) : hint ? (
        <span className="text-xs text-[#6B6F76]">{hint}</span>
      ) : null}
    </div>
  );
}

/* ---------------------------------- component ---------------------------------- */

export default function ApplicantInterview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const jobId = searchParams.get("job_id");
  const applicantId = searchParams.get("applicant_id");

  const [screening, setScreening] = useState<Screening | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const applicantName = screening?.name ?? "the applicant";

  // Existing meeting (only one allowed per application)
  const [interview, setInterview] = useState<Interview | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [google, setGoogle] = useState<GoogleState>("checking");
  const [connecting, setConnecting] = useState(false);
  const [notice, setNotice] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  const [title, setTitle] = useState("Interview");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [email, setEmail] = useState("");

  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  /* ----------------------- load applicant + existing meeting ----------------------- */

  useEffect(() => {
    if (!jobId || !applicantId) {
      setLoadError("Missing job_id or applicant_id in the URL.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await applicantScreeningService.getScreeningDetails(jobId, applicantId);
        if (cancelled) return;

        const s = pickScreening(res.data);
        setScreening(s);
        setEmail(s.email);
        setTitle(s.jobTitle ? `Interview: ${s.jobTitle}` : "Interview");

        if (!s.applicationId) {
          setLoadError("Could not find the application for this applicant.");
          return;
        }

        try {
          const iv = await applicantScreeningService.getInterview(String(s.applicationId));
          if (!cancelled) setInterview(iv.data?.data ?? null);
        } catch (err: any) {
          console.error("Load interview failed", err.response?.status, err.response?.data ?? err);
          if (!cancelled) {
            setNotice({
              kind: "error",
              text: `Could not load the existing meeting (${err.response?.status ?? "no response"}).`,
            });
          }
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error("Load screening failed", err.response?.status, err.response?.data);
        setLoadError("Could not load the applicant. Please refresh and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [jobId, applicantId]);

  /* ----------------------- google status + redirect flag ----------------------- */

  useEffect(() => {
    const flag = searchParams.get("google");

    if (flag === "error") {
      setNotice({ kind: "error", text: "Google connection failed. Please try again." });
    } else if (flag === "connected") {
      setNotice({ kind: "info", text: "Google account connected." });
    }

    if (flag) {
      const next = new URLSearchParams(searchParams);
      next.delete("google");
      setSearchParams(next, { replace: true });
    }

    (async () => {
      try {
        const res = await applicantScreeningService.getGoogleStatus();
        setGoogle(res.data?.connected ? "connected" : "disconnected");
      } catch {
        setGoogle("disconnected");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectGoogle = async () => {
    setConnecting(true);
    try {
      const returnTo = `${location.pathname}${location.search}`;
      const { data } = await applicantScreeningService.getGoogleAuthUrl(returnTo);
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Google auth url failed", err.response?.status, err.response?.data);
      setNotice({ kind: "error", text: "Could not start the Google connection." });
      setConnecting(false);
    }
  };

  /* ----------------------- close the delete dialog with Escape ----------------------- */

  useEffect(() => {
    if (!confirmingCancel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !cancelling) setConfirmingCancel(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmingCancel, cancelling]);

  /* ----------------------- derived values + validation ----------------------- */

  const start = useMemo(
    () => (date && time ? new Date(`${date}T${time}:00`) : null),
    [date, time],
  );

  const end = useMemo(
    () => (start ? new Date(start.getTime() + duration * 60_000) : null),
    [start, duration],
  );

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!title.trim()) e.title = "Add a title for the invite.";
    if (!date) e.date = "Pick a date.";
    if (!time) e.time = "Pick a start time.";
    if (start && start.getTime() <= Date.now()) e.time = "Choose a time in the future.";
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email address.";

    return e;
  }, [title, date, time, start, email]);

  const hasErrors = Object.keys(errors).length > 0;
  const show = (key: string) => (touched ? errors[key] : undefined);

  const isUpcoming = interview ? new Date(interview.ends_at).getTime() > Date.now() : false;

  /* ----------------------- create ----------------------- */

  const handleSubmit = async () => {
    setTouched(true);
    setNotice(null);

    if (!screening?.applicationId) {
      setNotice({ kind: "error", text: "No application found for this applicant." });
      return;
    }
    if (hasErrors || !start) return;

    setSubmitting(true);
    try {
      const res = await applicantScreeningService.scheduleInterview(
        String(screening.applicationId),
        {
          starts_at: `${date}T${time}:00`, // backend reads this as Asia/Manila
          duration_minutes: duration,
          applicant_email: email.trim(),
          title: title.trim(),
        },
      );
      setInterview(res.data.data as Interview);
      setNotice({ kind: "info", text: `Interview scheduled. An invite was sent to ${email.trim()}.` });
    } catch (err: any) {
      console.error("Schedule failed", err.response?.status, err.response?.data);
      const body = err.response?.data;

      if (body?.code === "already_scheduled") {
        if (body.data) setInterview(body.data as Interview);
        setNotice({ kind: "error", text: body.message });
      } else if (body?.code === "wrong_status") {
        setNotice({ kind: "error", text: body.message });
      } else if (body?.needs_google) {
        setGoogle("disconnected");
        setNotice({
          kind: "error",
          text: "Your Google account isn't connected, or its access expired. Reconnect it and try again.",
        });
      } else if (err.response?.status === 422) {
        const first = Object.values(body?.errors ?? {})[0] as string[] | undefined;
        setNotice({ kind: "error", text: first?.[0] ?? body?.message ?? "Some details are invalid." });
      } else {
        setNotice({ kind: "error", text: "Could not create the meeting. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ----------------------- delete ----------------------- */

  const handleCancel = async () => {
    if (!interview) return;

    setCancelling(true);
    setNotice(null);
    try {
      await applicantScreeningService.cancelInterview(interview.id);
      setInterview(null);
      setConfirmingCancel(false);
      setDate("");
      setTime("");
      setTouched(false);
      setNotice({
        kind: "info",
        text: "Meeting deleted. The calendar event was removed and the applicant was notified.",
      });
    } catch (err: any) {
      console.error("Cancel failed", err.response?.status, err.response?.data);
      const body = err.response?.data;

      if (body?.needs_google) {
        setGoogle("disconnected");
        setNotice({ kind: "error", text: "Your Google access expired. Reconnect, then delete again." });
      } else {
        setNotice({ kind: "error", text: body?.message ?? "Could not delete the meeting." });
      }
      setConfirmingCancel(false);
    } finally {
      setCancelling(false);
    }
  };

  const copyLink = async () => {
    if (!interview?.meet_link) return;

    try {
      await navigator.clipboard.writeText(interview.meet_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  /* ----------------------- loading / error (after all hooks) ----------------------- */

  if (loading) {
    return (
      <div className="archivo mx-auto max-w-4xl" role="status" aria-label="Loading interview details">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-7 w-64" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            <Skeleton className="h-10 w-full" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-44" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (loadError && !screening?.applicationId) {
    return (
      <div
        className="archivo rounded-md border border-[#991B1B]/30 bg-[#991B1B]/5 p-4 text-sm text-[#991B1B]"
        role="alert"
      >
        {loadError}
      </div>
    );
  }

  /* ----------------------------------- UI ----------------------------------- */

  return (
    <section className="archivo mx-auto max-w-4xl text-[#1C2321]" aria-labelledby="iv-heading">
      {/* HEADER */}
      <header className="mb-6">
        <h2 id="iv-heading" className="mt-1 text-2xl font-bold leading-tight">
          {interview ? interview.title || "Interview" : "Schedule an interview"}
        </h2>
        <p className="mt-1 max-w-prose text-sm text-[#6B6F76]">
          {interview
            ? `Meeting details for ${applicantName}.`
            : `Creates a Google Calendar event with a Meet link and emails the invite to ${applicantName}.`}
        </p>
      </header>

      {/* NOTICE */}
      {notice && (
        <div
          role={notice.kind === "error" ? "alert" : "status"}
          className={`mb-6 border-l-2 px-4 py-3 text-sm ${
            notice.kind === "error"
              ? "border-[#991B1B] bg-[#991B1B]/5 text-[#991B1B]"
              : "border-[#1C2321] bg-[#FAF9F6] text-[#1C2321]"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* GOOGLE CONNECTION */}
      {google === "checking" && (
        <div className="mb-6 flex items-center gap-2 text-sm text-[#6B6F76]" role="status">
          <Spinner /> Checking Google connection…
        </div>
      )}

      {google === "disconnected" && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-y border-[#E3E0D8] py-4">
          <div>
            <p className="text-sm font-bold">Connect your Google account</p>
            <p className="mt-0.5 text-sm text-[#6B6F76]">
              Meetings are created on your own calendar. You only need to connect once.
            </p>
          </div>
          <button type="button" className={btnPrimary} onClick={connectGoogle} disabled={connecting}>
            {connecting && <Spinner light />}
            {connecting ? "Redirecting…" : "Connect Google"}
          </button>
        </div>
      )}

      {interview ? (
        /* ------------------------------ EXISTING MEETING ------------------------------ */
        <div className="max-w-xl">
          <div className="rounded-lg border border-[#E3E0D8] bg-white">
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-lg font-bold">{fmtDate(new Date(interview.starts_at))}</p>
                <p className="mt-0.5 text-sm text-[#6B6F76]">
                  {fmtTime(new Date(interview.starts_at))} to {fmtTime(new Date(interview.ends_at))}
                  <span className="mx-1.5">·</span>Philippine Time
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                  isUpcoming ? "bg-[#991B1B]/10 text-[#991B1B]" : "bg-[#E8E6E0] text-[#6B6F76]"
                }`}
              >
                {isUpcoming ? "Scheduled" : "Past"}
              </span>
            </div>

            <dl className="divide-y divide-[#E3E0D8] border-t border-[#E3E0D8] text-sm">
              <div className="flex items-baseline justify-between gap-4 px-5 py-3">
                <dt className="text-[#6B6F76]">Invite sent to</dt>
                <dd className="break-all text-right font-bold">
                  {interview.applicant_email || "the applicant"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 px-5 py-3">
                <dt className="text-[#6B6F76]">Where</dt>
                <dd className="text-right font-bold">Google Meet</dd>
              </div>
            </dl>

            {interview.meet_link ? (
              <div className="border-t border-[#E3E0D8] p-5">
                <a
                  href={interview.meet_link}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm font-bold text-[#991B1B] underline-offset-2 hover:underline"
                >
                  {interview.meet_link}
                </a>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className={btnSecondary} onClick={copyLink}>
                    {copied ? "Copied" : "Copy link"}
                  </button>
                  {isUpcoming && (
                    <a
                      className={btnPrimary}
                      href={interview.meet_link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Meet
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="border-t border-[#E3E0D8] p-5 text-sm text-[#6B6F76]">
                The event exists but Google did not return a Meet link. Check your calendar.
              </p>
            )}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setConfirmingCancel(true)}
              className="text-sm font-bold text-[#991B1B] underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#991B1B]"
            >
              {isUpcoming ? "Delete meeting" : "Delete record and schedule a new one"}
            </button>
          </div>
        </div>
      ) : (
        /* ------------------------------ CREATE FORM ------------------------------ */
        <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <form
            className="flex flex-col gap-5"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <Field label="Title" htmlFor="iv-title" error={show("title")}>
              <input
                id="iv-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-invalid={!!show("title")}
                placeholder="Interview: Frontend Developer"
                className={`${inputBase} ${show("title") ? "border-[#991B1B]" : "border-[#E3E0D8]"}`}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date" htmlFor="iv-date" error={show("date")}>
                <input
                  id="iv-date"
                  type="date"
                  min={todayStr()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-invalid={!!show("date")}
                  className={`${inputBase} ${show("date") ? "border-[#991B1B]" : "border-[#E3E0D8]"}`}
                />
              </Field>

              <Field label="Start time" htmlFor="iv-time" error={show("time")}>
                <input
                  id="iv-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  aria-invalid={!!show("time")}
                  className={`${inputBase} ${show("time") ? "border-[#991B1B]" : "border-[#E3E0D8]"}`}
                />
              </Field>
            </div>

            <Field label="Common start times">
              <div className="flex flex-wrap gap-2">
                {QUICK_TIMES.map((t) => {
                  const [h, m] = t.split(":").map(Number);
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={time === t}
                      onClick={() => setTime(t)}
                      className={chip(time === t)}
                    >
                      {fmtTime(new Date(2000, 0, 1, h, m))}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Length">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Meeting length">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={duration === d}
                    onClick={() => setDuration(d)}
                    className={chip(duration === d)}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </Field>

            <Field
              label="Applicant email"
              htmlFor="iv-email"
              error={show("email")}
              hint="The Google Calendar invite is sent here."
            >
              <input
                id="iv-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!show("email")}
                placeholder="applicant@example.com"
                className={`${inputBase} ${show("email") ? "border-[#991B1B]" : "border-[#E3E0D8]"}`}
              />
            </Field>

            <button
              type="submit"
              className={`${btnPrimary} w-full self-start sm:w-auto sm:min-w-[190px]`}
              disabled={submitting || google === "checking"}
            >
              {submitting && <Spinner light />}
              {submitting ? "Creating meeting…" : "Create meeting"}
            </button>
          </form>

          {/* SUMMARY */}
          <aside
            aria-label="Meeting summary"
            className="rounded-lg border border-[#E3E0D8] bg-[#FAF9F6] p-5 md:sticky md:top-4"
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#991B1B]">Summary</h3>

            <dl className="mt-3 divide-y divide-[#E3E0D8] text-sm">
              {[
                ["Applicant", applicantName],
                ["Title", title || "—"],
                ["Date", start ? fmtDate(start) : "Not set"],
                ["Time", start && end ? `${fmtTime(start)} to ${fmtTime(end)}` : "Not set"],
                ["Length", `${duration} minutes`],
                ["Invite to", email || "Not set"],
              ].map(([label, value]) => (
                <div key={label} className="py-2.5 first:pt-0 last:pb-0">
                  <dt className="text-xs text-[#6B6F76]">{label}</dt>
                  <dd className="mt-0.5 break-words font-bold">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 text-xs text-[#6B6F76]">
              Meet link is created on submit. Times are in Philippine Time (UTC+8).
            </p>
          </aside>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {confirmingCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C2321]/50 p-4"
          onClick={() => !cancelling && setConfirmingCancel(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="iv-del-title"
            aria-describedby="iv-del-desc"
            className="archivo w-full max-w-sm rounded-lg border border-[#E3E0D8] bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="iv-del-title" className="text-lg font-bold text-[#991B1B]">
              Delete this meeting?
            </h3>
            <p id="iv-del-desc" className="mt-2 text-sm text-[#6B6F76]">
              The event is removed from your Google Calendar and {applicantName} gets a cancellation
              email. This can't be undone. You can schedule a new meeting afterwards.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className={btnSecondary}
                onClick={() => setConfirmingCancel(false)}
                disabled={cancelling}
                autoFocus
              >
                Keep meeting
              </button>
              <button type="button" className={btnPrimary} onClick={handleCancel} disabled={cancelling}>
                {cancelling && <Spinner light />}
                {cancelling ? "Deleting…" : "Delete meeting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}