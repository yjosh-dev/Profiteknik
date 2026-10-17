import { useMemo, useState } from "react";
import { FaCheck, FaSearch, FaTimes } from "react-icons/fa";

// NOTE: adjust this path to wherever your skills database file lives
import { SKILLS_DATABASE, type Skill } from "../../utils/Skills";

const PAGE_SIZE = 20;

const CATEGORIES: Array<{
  key: Skill["category"];
  title: string;
  description: string;
}> = [
  { key: "Blue-Collar", title: "Blue-collar", description: "Trades, manual and machine-based work" },
  { key: "Gray-Collar", title: "Gray-collar", description: "Technical, service and support roles" },
  { key: "White-Collar", title: "White-collar", description: "Professional, office and degree-based work" },
];

// Helper for pages that store skills as names (e.g. the applicant profile)
export function skillNamesToIds(names: string[]): number[] {
  const wanted = new Set(names.map((n) => n.trim().toLowerCase()));
  return SKILLS_DATABASE.filter((s) => wanted.has(s.name.toLowerCase())).map(
    (s) => s.id,
  );
}

export default function SkillPicker({
  selectedSkillIds,
  onToggle,
}: {
  selectedSkillIds: number[];
  onToggle: (id: number) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<Skill["category"] | null>(null);
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    SKILLS_DATABASE.forEach((s) => {
      result[s.category] = (result[s.category] ?? 0) + 1;
    });
    return result;
  }, []);

  const { items, total } = useMemo(() => {
    if (!activeCategory) return { items: [] as Skill[], total: 0 };
    const q = query.trim().toLowerCase();
    const matches = SKILLS_DATABASE.filter(
      (s) =>
        s.category === activeCategory &&
        (!q || s.name.toLowerCase().includes(q) || s.industry.toLowerCase().includes(q)),
    );
    return { items: matches.slice(0, PAGE_SIZE), total: matches.length };
  }, [activeCategory, query]);

  const selectedSkills = useMemo(
    () => SKILLS_DATABASE.filter((s) => selectedSkillIds.includes(s.id)),
    [selectedSkillIds],
  );

  const activeTitle = CATEGORIES.find((c) => c.key === activeCategory)?.title;

  return (
    <div>
      {/* Category picker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => {
          const isActive = cat.key === activeCategory;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                setActiveCategory(cat.key);
                setQuery("");
              }}
              className={`text-left rounded-md border p-4 transition-colors cursor-pointer ${
                isActive
                  ? "border-red-800 bg-white ring-1 ring-red-800"
                  : "border-[#D8D5CD] bg-white hover:border-red-800/50"
              }`}
            >
              <span className="archivo block text-sm font-semibold text-[#1C2321]">{cat.title}</span>
              <span className="archivo block text-xs text-[#6B6F76] mt-1">{cat.description}</span>
              <span className="archivo block text-xs text-red-800 mt-3">
                {counts[cat.key] ?? 0} skills
              </span>
            </button>
          );
        })}
      </div>

      {/* Skill list */}
      {activeCategory ? (
        <div className="mt-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B6F76]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${activeTitle?.toLowerCase()} skills`}
              className="w-full border border-[#D8D5CD] bg-white rounded p-2.5 pl-9 text-sm text-[#1C2321] focus:outline-none focus:ring-1 focus:ring-[#991B1B] focus:border-[#991B1B]"
            />
          </div>

          <p className="archivo text-xs text-[#6B6F76] mt-3 mb-2">
            {total === 0
              ? "No skills match your search."
              : total > PAGE_SIZE
                ? `Showing ${PAGE_SIZE} of ${total} — search to find more.`
                : `${total} ${total === 1 ? "skill" : "skills"}`}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {items.map((skill) => {
              const isSelected = selectedSkillIds.includes(skill.id);
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => onToggle(skill.id)}
                  className={`flex items-start gap-3 text-left rounded-md border p-3 transition-colors cursor-pointer ${
                    isSelected
                      ? "border-red-800 bg-red-800/5"
                      : "border-[#E3E0D8] bg-white hover:border-red-800/50"
                  }`}
                >
                  <span
                    className={`mt-0.5 w-4 h-4 rounded-sm border shrink-0 flex items-center justify-center ${
                      isSelected ? "bg-red-800 border-red-800 text-white" : "border-[#D8D5CD] bg-white"
                    }`}
                  >
                    {isSelected && <FaCheck size={9} />}
                  </span>
                  <span className="min-w-0">
                    <span className="archivo block text-sm text-[#1C2321] leading-snug">{skill.name}</span>
                    <span className="archivo block text-xs text-[#6B6F76] mt-0.5">{skill.industry}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="archivo text-sm text-[#6B6F76] mt-6">
          Select a worker type above to see its skills.
        </p>
      )}

      {/* Selected skills (across all categories) */}
      {selectedSkills.length > 0 && (
        <div className="mt-8 border-t border-[#E3E0D8] pt-5">
          <span className="archivo block text-sm text-[#1C2321] mb-3">
            Selected ({selectedSkills.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <span
                key={skill.id}
                className="archivo inline-flex items-center gap-2 text-xs text-red-800 bg-white border border-red-800/30 rounded-full pl-3 pr-2 py-1"
              >
                {skill.name}
                <button
                  type="button"
                  onClick={() => onToggle(skill.id)}
                  className="p-0.5 hover:text-red-950 cursor-pointer"
                  title="Remove skill"
                >
                  <FaTimes className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}