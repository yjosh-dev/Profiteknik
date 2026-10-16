import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaArrowUpFromBracket,
  FaEllipsis,
  FaFileLines,
  FaPen,
  FaXmark,
} from "react-icons/fa6";
import { MdCheckCircle, MdError } from "react-icons/md";

import { AuthContext } from "../../context/AuthProvider";
import StatusModal from "../../components/ui/StatusModal";
import { applicantProfileService } from "../../service/api/applicants/applicantProfileService";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

/* ---------- Types ---------- */

type Tab = "resume" | "information" | "contact" | "experience" | "skills";
type SectionId = "name" | "address" | "contact" | "experience" | "resume";

type Information = {
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  building_no: string;
  house_no: string;
  street: string;
  city: string;
  region: string;
  country: string;
};
type InfoKey = keyof Information;

type Contact = {
  email: string;
  phone_no: string; // international format, e.g. +639171234567
  tel_no: string;
};

// end_date: null = currently working here
//           ""   = not current, end date not picked yet (draft only)
//           "YYYY-MM" = ended
type Experience = {
  id: number; // server record_id, or a negative temporary id for new rows
  job_title: string;
  company: string;
  start_date: string; // "YYYY-MM"
  end_date: string | null;
};

type SavedResume = {
  name: string;
  size: number | null;
  uploaded_at: string | null; // ISO date
};

type ProfileResponse = {
  information: Partial<Information> | null;
  contact: Partial<Contact> | null;
  experiences: Partial<Experience>[] | null;
  skills: unknown[] | null;
  resume: SavedResume | null;
};

type Status =
  | { type: "success"; message: string }
  | { type: "error"; message: string; heading?: string }
  | null;

/* ---------- Constants ---------- */

const TABS: { id: Tab; label: string }[] = [
  { id: "resume", label: "Resume" },
  { id: "information", label: "Information" },
  { id: "contact", label: "Contact" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
];

// Where the pencil and "Build a resume" buttons go (change to your routes)
const EDIT_PROFILE_PATH = "/applicant/profile/edit";
const BUILD_RESUME_PATH = "/applicant/resume/build";

const STORAGE_URL =
  import.meta.env.VITE_STORAGE_URL ?? "http://localhost:8000/storage";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_EXPERIENCES = 50; // matches the backend's max:50

const NAME_FIELDS: InfoKey[] = [
  "first_name",
  "middle_name",
  "last_name",
  "suffix",
];
const ADDRESS_FIELDS: InfoKey[] = [
  "building_no",
  "house_no",
  "street",
  "city",
  "region",
  "country",
];
const REQUIRED_INFO: InfoKey[] = [
  "first_name",
  "last_name",
  "street",
  "city",
  "region",
  "country",
];

const FIELD_LABELS: Record<InfoKey, string> = {
  first_name: "First name",
  middle_name: "Middle name",
  last_name: "Last name",
  suffix: "Suffix",
  building_no: "Building no.",
  house_no: "House no.",
  street: "Street",
  city: "City",
  region: "Region",
  country: "Country",
};

const EMPTY_INFORMATION: Information = {
  first_name: "",
  middle_name: "",
  last_name: "",
  suffix: "",
  building_no: "",
  house_no: "",
  street: "",
  city: "",
  region: "",
  country: "",
};

const EMPTY_CONTACT: Contact = { email: "", phone_no: "", tel_no: "" };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+\d{10,15}$/;
const FALLBACK_ERROR = "Something went wrong. Please try again.";

// Current month in the browser's local time, "YYYY-MM"
// (toISOString would use UTC, which is wrong for the first hours of a month in PH)
const today = new Date();
const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

const inputClass =
  "archivo w-full h-9 rounded-md border border-red-300 bg-red-50/30 px-2.5 text-sm text-zinc-800 placeholder-zinc-400 outline-none transition-all focus:border-red-700 focus:ring-1 focus:ring-red-700/40 disabled:bg-zinc-100 disabled:text-zinc-400";

/* ---------- Helpers ---------- */

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// +639171234567 -> +63 917 123 4567 (anything else is shown as-is)
function formatPhone(phone: string): string {
  const match = phone.match(/^\+63(\d{3})(\d{3})(\d{4})$/);
  return match ? `+63 ${match[1]} ${match[2]} ${match[3]}` : phone;
}

function validateResume(file: File): string | null {
  const lower = file.name.toLowerCase();
  if (!ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    return "Upload a PDF, .doc, or .docx file.";
  }
  if (file.size > MAX_RESUME_SIZE) {
    return "File must be under 5 MB.";
  }
  return null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Pulls the first Laravel validation message, or the general message
function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    const firstValidation = data?.errors
      ? (Object.values(data.errors)[0] as string[] | undefined)?.[0]
      : undefined;
    return firstValidation ?? data?.message ?? FALLBACK_ERROR;
  }
  return FALLBACK_ERROR;
}

function toInformation(raw: Partial<Information> | null): Information {
  const info = { ...EMPTY_INFORMATION };
  (Object.keys(info) as InfoKey[]).forEach((key) => {
    info[key] = raw?.[key] ?? "";
  });
  return info;
}

function toContact(raw: Partial<Contact> | null): Contact {
  return {
    email: raw?.email ?? "",
    phone_no: raw?.phone_no ?? "",
    tel_no: raw?.tel_no ?? "",
  };
}

// The server sends { id, job_title, company, start_date, end_date } with
// "YYYY-MM" dates. The slice(0, 7) is just a safety net.
function toExperiences(raw: Partial<Experience>[] | null): Experience[] {
  return (raw ?? []).map((e) => ({
    id: Number(e.id),
    job_title: e.job_title ?? "",
    company: e.company ?? "",
    start_date: (e.start_date ?? "").slice(0, 7),
    end_date: e.end_date ? e.end_date.slice(0, 7) : null,
  }));
}

function toSkills(raw: unknown[] | null): string[] {
  return (raw ?? [])
    .map((s) =>
      typeof s === "string"
        ? s
        : String((s as { skill_name?: string })?.skill_name ?? ""),
    )
    .filter(Boolean);
}

function isPdfName(name: string): boolean {
  return name.toLowerCase().endsWith(".pdf");
}

// "2026-10-06T..." -> "3 days ago"
function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  const diffSec = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, secs] of units) {
    if (Math.abs(diffSec) >= secs) {
      return rtf.format(Math.round(diffSec / secs), unit);
    }
  }
  return "just now";
}

// Tracks an element's content width so PDF pages can fit it
function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

/* ---------- Small building blocks ---------- */

function Section({
  title,
  children,
  onSave,
  dirty = false,
  disabled = false,
  saving = false,
}: {
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  dirty?: boolean;
  disabled?: boolean;
  saving?: boolean;
}) {
  return (
    <section className="rounded-xl border border-gray-200 px-5 py-4">
      <h2 className="archivo text-base font-bold text-zinc-900 mb-3">
        {title}
      </h2>
      {children}

      {onSave && (
        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
          <p className="archivo text-xs text-zinc-500">
            {dirty ? "You have unsaved changes." : "No changes to save."}
          </p>
          <button
            type="button"
            onClick={onSave}
            disabled={disabled}
            className="archivo h-9 px-5 rounded-md bg-red-700 text-white text-sm font-semibold hover:bg-red-800 transition-colors cursor-pointer disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}
    </section>
  );
}

// A read-only value with a pencil that turns it into an input
function EditableField({
  label,
  display,
  editing,
  onToggle,
  error,
  children,
}: {
  label: string;
  display: string;
  editing: boolean;
  onToggle: () => void;
  error?: string;
  children: React.ReactNode; // the input shown while editing
}) {
  return (
    <div>
      <dt className="archivo text-xs text-zinc-500">{label}</dt>
      <dd className="mt-0.5 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {editing ? (
            children
          ) : (
            <p className="archivo text-sm text-zinc-800 py-2 truncate">
              {display.trim() !== "" ? display : "—"}
            </p>
          )}
          {error && (
            <p className="archivo text-[11px] text-red-700 mt-1">{error}</p>
          )}
        </div>
        <button
          type="button"
          aria-label={editing ? `Stop editing ${label}` : `Edit ${label}`}
          aria-pressed={editing}
          onClick={onToggle}
          className={`mt-1 p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
            editing
              ? "bg-red-100 text-red-700"
              : "text-zinc-400 hover:bg-red-50 hover:text-red-700"
          }`}
        >
          <FaPen size={11} />
        </button>
      </dd>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
  maxLength,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <input
      autoFocus
      type={type}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
  );
}

// A label + always-visible input used by the experience cards
function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="archivo text-xs text-zinc-500">{label}</span>
      <div className="mt-0.5">{children}</div>
      {error && (
        <span className="archivo block text-[11px] text-red-700 mt-1">
          {error}
        </span>
      )}
    </label>
  );
}

function SkeletonBlock() {
  return (
    <div className="rounded-xl border border-gray-200 px-5 py-4 animate-pulse">
      <div className="h-4 w-28 rounded bg-zinc-200 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 rounded bg-zinc-200" />
            <div className="h-4 w-32 rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Saved resume: file name, upload time, "..." menu and a first-page preview
function ResumeCard({
  resume,
  url,
  loadFailed,
  busy,
  downloading,
  onOpen,
  onDownload,
  onReplace,
  onRemove,
}: {
  resume: SavedResume;
  url: string | null;
  loadFailed: boolean;
  busy: boolean;
  downloading: boolean;
  onOpen: () => void;
  onDownload: () => void;
  onReplace: () => void;
  onRemove: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [previewRef, previewWidth] = useElementWidth<HTMLDivElement>();

  const isPdf = isPdfName(resume.name);
  const canPreview = isPdf && !!url && !thumbFailed;
  const waiting = isPdf && !url && !loadFailed;

  useEffect(() => setThumbFailed(false), [url]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const menuItem =
    "archivo w-full text-left px-4 py-2 text-sm text-zinc-800 hover:bg-red-50 hover:text-red-700 cursor-pointer disabled:text-zinc-300 disabled:cursor-not-allowed";

  return (
    <div className="rounded-2xl border border-gray-200 px-5 py-4 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="archivo text-base font-semibold text-zinc-900 truncate">
            {resume.name}
          </p>
          <p className="archivo text-sm text-zinc-500">
            {timeAgo(resume.uploaded_at) ||
              (resume.size !== null ? formatSize(resume.size) : "")}
          </p>
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            aria-label="Resume options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="p-2 rounded-full text-zinc-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
          >
            <FaEllipsis size={16} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-10 z-10 w-40 py-1 rounded-lg border border-gray-200 bg-white shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                disabled={downloading || busy}
                onClick={() => {
                  setMenuOpen(false);
                  onDownload();
                }}
                className={menuItem}
              >
                {downloading ? "Downloading..." : "Download"}
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={busy}
                onClick={() => {
                  setMenuOpen(false);
                  onReplace();
                }}
                className={menuItem}
              >
                Replace
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={busy}
                onClick={() => {
                  setMenuOpen(false);
                  onRemove();
                }}
                className={menuItem}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={previewRef}
        role="button"
        tabIndex={0}
        aria-label={canPreview ? "View resume" : "Download resume"}
        onClick={canPreview ? onOpen : onDownload}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            (canPreview ? onOpen : onDownload)();
          }
        }}
        className="relative mt-3 h-56 overflow-hidden rounded-lg border border-gray-200 bg-white cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        {canPreview && previewWidth > 0 ? (
          <Document
            file={url}
            loading={null}
            error={null}
            onLoadError={() => setThumbFailed(true)}
          >
            <Page
              pageNumber={1}
              width={previewWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        ) : waiting ? (
          <div className="h-full w-full animate-pulse bg-zinc-100" />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-500">
            <FaFileLines size={28} />
            <p className="archivo text-sm">
              {isPdf ? "Preview unavailable" : "No preview for this file type"}
            </p>
            <p className="archivo text-xs">Click to download</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Full PDF over a dimmed, blurred page. Click outside or press Esc to close.
function ResumeViewer({
  url,
  name,
  onClose,
  onDownload,
}: {
  url: string;
  name: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  const [numPages, setNumPages] = useState(0);
  const [failed, setFailed] = useState(false);
  const [bodyRef, bodyWidth] = useElementWidth<HTMLDivElement>();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full max-w-3xl max-h-[92vh] rounded-xl bg-white shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-200">
          <p className="archivo text-sm font-semibold text-zinc-900 truncate">
            {name}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onDownload}
              className="archivo text-sm font-semibold text-red-700 hover:text-red-800 cursor-pointer"
            >
              Download
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
            >
              <FaXmark size={14} />
            </button>
          </div>
        </div>

        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto bg-zinc-100 p-4 space-y-4"
        >
          {failed ? (
            <p className="archivo text-sm text-zinc-600 text-center py-10">
              We couldn't display this file. Try downloading it instead.
            </p>
          ) : (
            <Document
              file={url}
              loading={
                <p className="archivo text-sm text-zinc-500 text-center py-10">
                  Loading resume...
                </p>
              }
              error={null}
              onLoadError={() => setFailed(true)}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              {bodyWidth > 0 &&
                Array.from({ length: numPages }, (_, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <Page
                      pageNumber={i + 1}
                      width={bodyWidth}
                      className="shadow-md"
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </div>
                ))}
            </Document>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Component ---------- */

export default function ApplicantProfile() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  // Name and photo come from the logged-in user
  const name = auth?.userData?.userData.name ?? "";
  const profileImage = auth?.userData?.userData.profile_image ?? null;
  const profileImageUrl = profileImage
    ? `${STORAGE_URL}/${profileImage}`
    : null;

  const [activeTab, setActiveTab] = useState<Tab>("resume");

  // Loaded data: `saved*` is what the server has, `*Draft` is what's on screen
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [savedInfo, setSavedInfo] = useState<Information>(EMPTY_INFORMATION);
  const [infoDraft, setInfoDraft] = useState<Information>(EMPTY_INFORMATION);
  const [savedContact, setSavedContact] = useState<Contact>(EMPTY_CONTACT);
  const [contactDraft, setContactDraft] = useState<Contact>(EMPTY_CONTACT);
  const [savedExperiences, setSavedExperiences] = useState<Experience[]>([]);
  const [expDraft, setExpDraft] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  // Negative ids for rows added in the browser, so they never clash with
  // server ids. The server recreates every row on save anyway.
  const nextTempId = useRef(-1);

  // Which pencils are active, e.g. { "name.first_name": true }
  const [editing, setEditing] = useState<Record<string, boolean>>({});

  const [savingSection, setSavingSection] = useState<SectionId | null>(null);
  const [status, setStatus] = useState<Status>(null);

  // Resume: `savedResume` is what the server has
  const [savedResume, setSavedResume] = useState<SavedResume | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null); // blob URL for the PDF
  const [resumeUrlFailed, setResumeUrlFailed] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [profile_image, setProfile] = useState<any>();

  /* ----- Loading ----- */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const token = localStorage.getItem("token") ?? "";
      const res = await applicantProfileService.fetchApplicantProfile(token);
      const data = res.data as ProfileResponse;
      const info = toInformation(data.information);
      const contact = toContact(data.contact);
      const experiences = toExperiences(data.experiences);
      setProfile(res.data.information.applicant_profile_picture)
      setSavedInfo(info);
      setInfoDraft(info);
      setSavedContact(contact);
      setContactDraft(contact);
      setSavedExperiences(experiences);
      setExpDraft(experiences);
      setSkills(toSkills(data.skills));
      setSavedResume(data.resume ?? null);
      setEditing({});
    } catch (err) {
      console.error(err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Once the profile says there's a PDF resume, fetch the file for the
  // preview. Runs again after an upload/replace, and frees the blob URL.
  useEffect(() => {
    setResumeUrl(null);
    setResumeUrlFailed(false);

    if (!savedResume || !isPdfName(savedResume.name)) {
      setViewerOpen(false);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      try {
        const token = localStorage.getItem("token") ?? "";
        const res = await applicantProfileService.downloadApplicantResume(token);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setResumeUrl(objectUrl);
      } catch (err) {
        console.error(err);
        if (!cancelled) setResumeUrlFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [savedResume]);

  /* ----- Editing helpers ----- */

  const isEditing = (key: string) => !!editing[key];
  const toggleEdit = (key: string) =>
    setEditing((prev) => ({ ...prev, [key]: !prev[key] }));
  const clearEditing = (prefix: string) =>
    setEditing((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([key]) => !key.startsWith(prefix)),
      ),
    );

  const updateExperience = (id: number, patch: Partial<Experience>) =>
    setExpDraft((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );

  // New jobs go on top. end_date "" = not current, so an end date is required.
  const addExperience = () =>
    setExpDraft((prev) => [
      {
        id: nextTempId.current--,
        job_title: "",
        company: "",
        start_date: "",
        end_date: "",
      },
      ...prev,
    ]);

  const removeExperience = (id: number) =>
    setExpDraft((prev) => prev.filter((e) => e.id !== id));

  /* ----- Validation and dirty checks ----- */

  const infoErrors: Partial<Record<InfoKey, string>> = {};
  REQUIRED_INFO.forEach((key) => {
    if (infoDraft[key].trim() === "") infoErrors[key] = "Required";
  });

  const nameDirty = NAME_FIELDS.some((k) => infoDraft[k] !== savedInfo[k]);
  const addressDirty = ADDRESS_FIELDS.some(
    (k) => infoDraft[k] !== savedInfo[k],
  );
  const nameValid = NAME_FIELDS.every((k) => !infoErrors[k]);
  const addressValid = ADDRESS_FIELDS.every((k) => !infoErrors[k]);

  const contactErrors = {
    email: EMAIL_REGEX.test(contactDraft.email.trim())
      ? undefined
      : "Enter a valid email address.",
    phone_no: PHONE_REGEX.test(contactDraft.phone_no)
      ? undefined
      : "Use international format, e.g. +639171234567.",
  };
  const contactDirty =
    JSON.stringify(contactDraft) !== JSON.stringify(savedContact);
  const contactValid = !contactErrors.email && !contactErrors.phone_no;

  const experienceErrors = (e: Experience) => ({
    job_title: e.job_title.trim() ? undefined : "Required",
    company: e.company.trim() ? undefined : "Required",
    start_date: !e.start_date
      ? "Required"
      : e.start_date > thisMonth
        ? "Can't be in the future."
        : undefined,
    end_date:
      e.end_date === ""
        ? 'Required, or tick "I currently work here".'
        : e.end_date && e.end_date > thisMonth
          ? "Can't be in the future."
          : e.end_date && e.start_date && e.end_date < e.start_date
            ? "Can't be before the start date."
            : undefined,
  });
  const experienceDirty =
    JSON.stringify(expDraft) !== JSON.stringify(savedExperiences);
  const experienceValid = expDraft.every((e) =>
    Object.values(experienceErrors(e)).every((error) => !error),
  );

  /* ----- Saving ----- */

  const runSave = async (
    section: SectionId,
    successMessage: string,
    request: () => Promise<void>,
  ) => {
    try {
      setSavingSection(section);
      await request();
      setStatus({ type: "success", message: successMessage });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: getErrorMessage(err) });
    } finally {
      setSavingSection(null);
    }
  };

  // The server needs the full record, so merge this section's edits into
  // what's already saved. Edits in the other section aren't sent.
  const saveInformation = (section: "name" | "address", keys: InfoKey[]) =>
    runSave(
      section,
      section === "name"
        ? "Your name has been updated."
        : "Your address has been updated.",
      async () => {
        const token = localStorage.getItem("token") ?? "";
        const payload: Information = { ...savedInfo };
        keys.forEach((key) => {
          payload[key] = infoDraft[key].trim();
        });

        await applicantProfileService.storeApplicantInformation({
          token,
          form: payload,
        });

        setSavedInfo(payload);
        setInfoDraft((prev) => {
          const next = { ...prev };
          keys.forEach((key) => {
            next[key] = payload[key];
          });
          return next;
        });
        clearEditing(`${section}.`);

        // Refresh the header name
        if (section === "name") await auth?.checkAuth("applicant");
      },
    );

  const saveContact = () =>
    runSave("contact", "Your contact details have been updated.", async () => {
      const token = localStorage.getItem("token") ?? "";
      const payload: Contact = {
        email: contactDraft.email.trim(),
        phone_no: contactDraft.phone_no,
        tel_no: contactDraft.tel_no.trim(),
      };

      await applicantProfileService.storeApplicantContact({
        token,
        data: { ...payload, tel_no: payload.tel_no || null },
      });

      setSavedContact(payload);
      setContactDraft(payload);
      clearEditing("contact.");
    });

  // Replaces the whole list on the server. Every row gets a new record_id,
  // so take the fresh list from the response.
  const saveExperience = () =>
    runSave("experience", "Your work experience has been updated.", async () => {
      const token = localStorage.getItem("token") ?? "";

      const res = await applicantProfileService.storeApplicantExperience({
        token,
        data: {
          has_experience: expDraft.length > 0,
          experiences: expDraft.map((e) => ({
            job_title: e.job_title.trim(),
            company: e.company.trim(),
            start_date: e.start_date,
            end_date: e.end_date || null, // null = currently working here
          })),
        },
      });

      const fresh = toExperiences(res.data?.experiences ?? []);
      setSavedExperiences(fresh);
      setExpDraft(fresh);
    });

  const handleModalClose = () => setStatus(null);

  /* ----- Resume ----- */

  const uploadResume = (file: File) =>
    runSave(
      "resume",
      savedResume
        ? "Your resume has been replaced."
        : "Your resume has been uploaded.",
      async () => {
        const token = localStorage.getItem("token") ?? "";
        const res = await applicantProfileService.storeApplicantResume({
          token,
          resume: file,
        });
        setSavedResume(res.data.resume);
      },
    );

  const removeResume = () =>
    runSave("resume", "Your resume has been removed.", async () => {
      const token = localStorage.getItem("token") ?? "";
      await applicantProfileService.deleteApplicantResume(token);
      setSavedResume(null);
    });

  const downloadResume = async () => {
    if (!savedResume) return;
    try {
      setDownloading(true);
      const token = localStorage.getItem("token") ?? "";
      const res = await applicantProfileService.downloadApplicantResume(token);

      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = savedResume.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        heading: "We couldn't download your resume",
        message: "No resume found, or the download failed. Please try again.",
      });
    } finally {
      setDownloading(false);
    }
  };

  const acceptFile = (file: File | undefined) => {
    if (!file || savingSection !== null) return;
    const error = validateResume(file);
    if (error) {
      setResumeError(error);
      return;
    }
    setResumeError(null);
    uploadResume(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0]);
    e.target.value = ""; // lets the same file be picked again later
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const openPicker = () => fileInputRef.current?.click();

  /* ----- Render helpers ----- */

  const infoField = (section: "name" | "address", key: InfoKey) => {
    const editKey = `${section}.${key}`;
    return (
      <EditableField
        key={key}
        label={FIELD_LABELS[key]}
        display={infoDraft[key]}
        editing={isEditing(editKey)}
        onToggle={() => toggleEdit(editKey)}
        error={isEditing(editKey) ? infoErrors[key] : undefined}
      >
        <TextInput
          value={infoDraft[key]}
          onChange={(value) =>
            setInfoDraft((prev) => ({ ...prev, [key]: value }))
          }
        />
      </EditableField>
    );
  };

  const busy = savingSection !== null;
  const uploading = savingSection === "resume";
  const dataTabLoading = loading;
  const dataTabFailed = !loading && loadError;

  return (
    <div className="w-full flex flex-col items-center bg-white px-4 py-10">
      {/* Avatar */}
      <div className="p-1.5 rounded-full border-2 border-gray-200">
        <div className="w-32 h-32 rounded-full bg-red-50 text-red-700 flex items-center justify-center overflow-hidden">
          {profile_image ? (
            <img
              src={`http://localhost:8000/storage/${profile_image}`}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="archivo text-4xl font-bold">
              {getInitials(name)}
            </span>
          )}
        </div>
      </div>

      {/* Name + edit */}
      <div className="flex items-center gap-3 mt-6">
        <h1 className="archivo text-2xl font-bold text-zinc-900">{name}</h1>
        <button
          type="button"
          aria-label="Edit profile"
          onClick={() => navigate(EDIT_PROFILE_PATH)}
          className="p-2 rounded-full text-zinc-700 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
        >
          <FaPen size={15} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-2 mt-2 animate-pulse">
          <div className="h-4 w-24 rounded bg-zinc-200" />
          <div className="h-3.5 w-64 rounded bg-zinc-200" />
        </div>
      ) : (
        <>
          {savedInfo.city && (
            <p className="archivo text-base text-zinc-500 mt-1">
              {savedInfo.city}
            </p>
          )}
          <p className="archivo text-sm text-zinc-600 mt-1 flex items-center gap-2 flex-wrap justify-center">
            {savedContact.phone_no && (
              <span>{formatPhone(savedContact.phone_no)}</span>
            )}
            {savedContact.phone_no && savedContact.email && (
              <span aria-hidden="true">•</span>
            )}
            {savedContact.email && <span>{savedContact.email}</span>}
          </p>
        </>
      )}

      {/* Tabs */}
      <div
        role="tablist"
        className="w-full max-w-3xl border-b border-gray-200 mt-10 overflow-x-auto"
      >
        <div className="flex w-max mx-auto">
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`archivo px-5 py-3 text-base -mb-px border-b-2 transition-colors cursor-pointer ${
                  active
                    ? "border-red-700 font-bold text-zinc-900"
                    : "border-transparent text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="w-full max-w-3xl mt-6 px-1">
        {/* Loading / error for every tab (the resume comes with the profile) */}
        {dataTabLoading && (
          <div className="space-y-4">
            <SkeletonBlock />
            <SkeletonBlock />
          </div>
        )}

        {dataTabFailed && (
          <div className="rounded-xl border border-gray-200 px-5 py-10 text-center">
            <p className="archivo text-base font-semibold text-zinc-800">
              We couldn't load your profile
            </p>
            <button
              type="button"
              onClick={loadProfile}
              className="archivo mt-3 h-9 px-5 rounded-md bg-red-700 text-white text-sm font-semibold hover:bg-red-800 transition-colors cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {/* RESUME */}
        {activeTab === "resume" && !loading && !loadError && (
          <>
            {savedResume && (
              <div className="mb-4">
                <ResumeCard
                  resume={savedResume}
                  url={resumeUrl}
                  loadFailed={resumeUrlFailed}
                  busy={busy}
                  downloading={downloading}
                  onOpen={() => setViewerOpen(true)}
                  onDownload={downloadResume}
                  onReplace={openPicker}
                  onRemove={removeResume}
                />
              </div>
            )}

            <div
              role="button"
              tabIndex={0}
              onClick={openPicker}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openPicker();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-2 h-36 rounded-xl border border-dashed text-center cursor-pointer outline-none transition-colors focus-visible:ring-2 focus-visible:ring-red-500 ${
                dragging
                  ? "border-red-700 bg-red-50"
                  : "border-red-600 hover:bg-red-50/60"
              }`}
            >
              <FaArrowUpFromBracket size={18} className="text-red-700" />
              <p className="archivo text-lg font-bold text-red-700">
                {uploading
                  ? "Uploading..."
                  : savedResume
                    ? "Replace your resume"
                    : "Upload a resume"}
              </p>
              <p className="archivo text-sm text-zinc-500">
                PDF, .doc, or .docx file under 5 MB.
              </p>
            </div>

            {resumeError && (
              <p className="archivo text-sm text-red-700 mt-2">{resumeError}</p>
            )}

            <button
              type="button"
              onClick={() => navigate(BUILD_RESUME_PATH)}
              className="archivo w-full h-14 mt-6 rounded-xl border border-gray-200 text-lg font-bold text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
            >
              Build a resume
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.join(",")}
              onChange={handleFileInput}
              className="hidden"
            />
          </>
        )}

        {/* INFORMATION */}
        {activeTab === "information" && !loading && !loadError && (
          <div className="space-y-4">
            <Section
              title="Name"
              onSave={() => saveInformation("name", NAME_FIELDS)}
              dirty={nameDirty}
              saving={savingSection === "name"}
              disabled={!nameDirty || !nameValid || busy}
            >
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {NAME_FIELDS.map((key) => infoField("name", key))}
              </dl>
            </Section>

            <Section
              title="Address"
              onSave={() => saveInformation("address", ADDRESS_FIELDS)}
              dirty={addressDirty}
              saving={savingSection === "address"}
              disabled={!addressDirty || !addressValid || busy}
            >
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {ADDRESS_FIELDS.map((key) => infoField("address", key))}
              </dl>
            </Section>
          </div>
        )}

        {/* CONTACT */}
        {activeTab === "contact" && !loading && !loadError && (
          <Section
            title="Contact details"
            onSave={saveContact}
            dirty={contactDirty}
            saving={savingSection === "contact"}
            disabled={!contactDirty || !contactValid || busy}
          >
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              <EditableField
                label="Email"
                display={contactDraft.email}
                editing={isEditing("contact.email")}
                onToggle={() => toggleEdit("contact.email")}
                error={
                  isEditing("contact.email") ? contactErrors.email : undefined
                }
              >
                <TextInput
                  type="email"
                  value={contactDraft.email}
                  onChange={(value) =>
                    setContactDraft((prev) => ({ ...prev, email: value }))
                  }
                />
              </EditableField>

              <EditableField
                label="Mobile number"
                display={formatPhone(contactDraft.phone_no)}
                editing={isEditing("contact.phone_no")}
                onToggle={() => toggleEdit("contact.phone_no")}
                error={
                  isEditing("contact.phone_no")
                    ? contactErrors.phone_no
                    : undefined
                }
              >
                <TextInput
                  type="tel"
                  value={contactDraft.phone_no}
                  maxLength={16}
                  placeholder="+639171234567"
                  onChange={(value) =>
                    setContactDraft((prev) => ({
                      ...prev,
                      phone_no: value.replace(/[^\d+]/g, ""),
                    }))
                  }
                />
              </EditableField>

              <EditableField
                label="Telephone"
                display={contactDraft.tel_no}
                editing={isEditing("contact.tel_no")}
                onToggle={() => toggleEdit("contact.tel_no")}
              >
                <TextInput
                  type="tel"
                  value={contactDraft.tel_no}
                  maxLength={30}
                  placeholder="(02) 8123-4567"
                  onChange={(value) =>
                    setContactDraft((prev) => ({
                      ...prev,
                      tel_no: value.replace(/[^\d\s()+-]/g, ""),
                    }))
                  }
                />
              </EditableField>
            </dl>
          </Section>
        )}

        {/* EXPERIENCE */}
        {activeTab === "experience" && !loading && !loadError && (
          <Section
            title="Work experience"
            onSave={saveExperience}
            dirty={experienceDirty}
            saving={savingSection === "experience"}
            disabled={!experienceDirty || !experienceValid || busy}
          >
            <button
              type="button"
              onClick={addExperience}
              disabled={expDraft.length >= MAX_EXPERIENCES || busy}
              className="archivo mb-4 h-9 px-4 rounded-md border border-red-700 text-red-700 text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add job
            </button>

            {expDraft.length === 0 && (
              <p className="archivo text-sm text-zinc-500">
                No work experience added.
              </p>
            )}

            <div className="space-y-4">
              {expDraft.map((e) => {
                const errs = experienceErrors(e);
                const isNew = e.id < 0;
                // Don't shout "Required" at a row that was just added
                const show = (msg?: string) =>
                  msg && !(isNew && msg.startsWith("Required")) ? msg : undefined;
                const current = e.end_date === null;

                return (
                  <div
                    key={e.id}
                    className="rounded-lg border border-gray-200 p-4 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField label="Job title" error={show(errs.job_title)}>
                        <input
                          className={inputClass}
                          value={e.job_title}
                          maxLength={255}
                          onChange={(ev) =>
                            updateExperience(e.id, { job_title: ev.target.value })
                          }
                        />
                      </FormField>

                      <FormField label="Company" error={show(errs.company)}>
                        <input
                          className={inputClass}
                          value={e.company}
                          maxLength={255}
                          onChange={(ev) =>
                            updateExperience(e.id, { company: ev.target.value })
                          }
                        />
                      </FormField>

                      <FormField label="Start date" error={show(errs.start_date)}>
                        <input
                          type="month"
                          className={inputClass}
                          value={e.start_date}
                          max={thisMonth}
                          onChange={(ev) =>
                            updateExperience(e.id, { start_date: ev.target.value })
                          }
                        />
                      </FormField>

                      <FormField label="End date" error={show(errs.end_date)}>
                        <input
                          type="month"
                          className={inputClass}
                          value={e.end_date ?? ""}
                          min={e.start_date || undefined}
                          max={thisMonth}
                          disabled={current}
                          onChange={(ev) =>
                            updateExperience(e.id, { end_date: ev.target.value })
                          }
                        />
                      </FormField>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <label className="archivo text-sm text-zinc-700 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={current}
                          onChange={(ev) =>
                            updateExperience(e.id, {
                              end_date: ev.target.checked ? null : "",
                            })
                          }
                        />
                        I currently work here
                      </label>
                      <button
                        type="button"
                        onClick={() => removeExperience(e.id)}
                        className="archivo text-sm text-red-700 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* SKILLS (read-only for now) */}
        {activeTab === "skills" && !loading && !loadError && (
          <Section title="Skills">
            {skills.length === 0 ? (
              <p className="archivo text-sm text-zinc-500">
                No skills added yet.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <li
                    key={skill}
                    className="archivo rounded-full bg-red-50 border border-red-200 px-3 py-1 text-sm text-red-800"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}
      </div>

      {/* Resume viewer */}
      {viewerOpen && resumeUrl && savedResume && (
        <ResumeViewer
          url={resumeUrl}
          name={savedResume.name}
          onClose={() => setViewerOpen(false)}
          onDownload={downloadResume}
        />
      )}

      {/* Result modal */}
      {status && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
        >
          {status.type === "success" ? (
            <StatusModal
              heading="Changes saved"
              description={status.message}
              icon={<MdCheckCircle className="text-green-600" />}
              button_name="Done"
              button_color="bg-red-700 text-white hover:bg-red-800"
              onClick={handleModalClose}
            />
          ) : (
            <StatusModal
              heading={status.heading ?? "We couldn't save your changes"}
              description={status.message}
              icon={<MdError className="text-red-600" />}
              button_name="Try again"
              button_color="bg-red-700 text-white hover:bg-red-800"
              onClick={handleModalClose}
            />
          )}
        </div>
      )}
    </div>
  );
}