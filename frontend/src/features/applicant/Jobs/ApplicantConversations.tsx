import { useState } from "react";

interface Conversation {
  id: string;
  companyName: string;
  preview: string;
  date: string;
  logoText: string;
  logoBg: string;
}

export default function ApplicantConversations() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inboxFilter, setInboxFilter] = useState("Inbox");

  // Sample data — swap with API later
  const conversations: Conversation[] = [
    {
      id: "c1",
      companyName: "Xure App Inc.",
      preview: "Dear JOSHUA, Thank you for applying fo...",
      date: "May 9, 2025",
      logoText: "❖",
      logoBg: "bg-gradient-to-br from-red-500 to-red-700",
    },
    {
      id: "c2",
      companyName: "Outsourced Doers",
      preview: "Hi Joshua, Thanks for submitting your ap...",
      date: "Oct 1, 2024",
      logoText: "TDW",
      logoBg: "bg-gradient-to-br from-red-700 to-red-900",
    },
    {
      id: "c3",
      companyName: "BrightHire Tech",
      preview: "We'd like to schedule an interview with you...",
      date: "Sep 22, 2024",
      logoText: "BH",
      logoBg: "bg-gradient-to-br from-red-400 to-red-600",
    },
  ];

  return (
    <div className="w-full h-full min-h-[560px] grid grid-cols-[30fr_70fr] gap-4">
      {/* ---------- LEFT: Conversations list ---------- */}
      <aside className="bg-white border border-red-200 rounded-xl shadow-md flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-red-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full border border-red-100">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Online
            </span>
          </div>

          {/* Inbox dropdown */}
          <div className="relative mt-4">
            <select
              value={inboxFilter}
              onChange={(e) => setInboxFilter(e.target.value)}
              className="w-full appearance-none rounded-lg border border-red-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 cursor-pointer"
            >
              <option>Inbox</option>
              <option>Archived</option>
              <option>Starred</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-red-50">
          {conversations.map((c) => {
            const isActive = selectedId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-colors ${
                  isActive
                    ? "bg-red-50 border-l-4 border-red-500"
                    : "hover:bg-red-50/50 border-l-4 border-transparent"
                }`}
              >
                {/* Logo */}
                <div
                  className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${c.logoBg}`}
                >
                  {c.logoText}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {c.companyName}
                    </p>
                    <span className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5">
                      {c.date}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500 truncate mt-1">
                    {c.preview}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ---------- RIGHT: Empty state / Conversation ---------- */}
      <main className="bg-white border border-red-200 rounded-xl shadow-md flex items-center justify-center overflow-hidden min-w-0">
        {selectedId ? (
          // When a conversation is selected — placeholder for now
          <div className="p-8 text-center text-gray-400 text-sm">
            Conversation view goes here.
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center text-center px-6">
            <EmptyStateIllustration />
            <h3 className="mt-6 text-lg font-bold text-gray-900">
              Welcome to Messages
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              Select a conversation to view and respond.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------- Icons & Illustration ---------- */

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * Red-themed empty state illustration — replaces the blue/orange one
 * from the screenshot with two overlapping chat bubbles on a tilted card.
 */
function EmptyStateIllustration() {
  return (
    <svg
      width="220"
      height="180"
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tilted backdrop card */}
      <rect
        x="45"
        y="45"
        width="130"
        height="100"
        rx="4"
        fill="#FEE2E2"
        transform="rotate(-8 110 95)"
      />

      {/* Right speech bubble (light red) */}
      <path
        d="M120 55 
           C120 48 126 42 133 42 
           L172 42 
           C179 42 185 48 185 55 
           L185 78 
           C185 85 179 91 172 91 
           L160 91 
           L152 100 
           L152 91 
           L133 91 
           C126 91 120 85 120 78 
           Z"
        fill="#FCA5A5"
      />

      {/* Left speech bubble (deep red) */}
      <path
        d="M40 88 
           C40 81 46 75 53 75 
           L118 75 
           C125 75 131 81 131 88 
           L131 118 
           C131 125 125 131 118 131 
           L85 131 
           L72 145 
           L72 131 
           L53 131 
           C46 131 40 125 40 118 
           Z"
        fill="#DC2626"
      />

      {/* Three dots inside deep red bubble */}
      <circle cx="66" cy="103" r="4" fill="white" />
      <circle cx="86" cy="103" r="4" fill="white" />
      <circle cx="106" cy="103" r="4" fill="white" />
    </svg>
  );
}