import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaArrowUpFromBracket,
  FaFileLines,
  FaPen,
  FaXmark,
} from "react-icons/fa6";
import { MdCheckCircle, MdError } from "react-icons/md";

import { AuthContext } from "../../context/AuthProvider";
import StatusModal from "../../components/ui/StatusModal";
import { applicantProfileService } from "../../service/api/applicants/applicantProfileService";

/* ---------- Types ---------- */

type Tab = "resume" | "information" | "contact" | "experience" | "skills";
type SectionId = "name" | "address" | "contact" | "experience";

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

type Experience = {
  id: number;
  job_title: string;
  company: string;
  start_date: string; // "YYYY-MM"
  end_date: string | null; // null = currently working here
};

type ProfileResponse = {
  information: Partial<Information> | null;
  contact: Partial<Contact> | null;
  experiences: Partial<Experience>[] | null;
  skills: unknown[] | null;
};

type Status =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
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

const thisMonth = new Date().toISOString().slice(0, 7);

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

// "2024-03" -> "Mar 2024"
function formatMonth(value: string): string {
  if (!value) return "";
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString("en-PH", {
    month: "short",
    year: "numeric",
  });
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

function toExperiences(raw: Partial<Experience>[] | null): Experience[] {
  return (raw ?? []).map((e) => ({
    id: Number(e.id),
    job_title: e.job_title ?? "",
    company: e.company ?? "",
    start_date: e.start_date ?? "",
    end_date: e.end_date ?? null,
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

  // Which pencils are active, e.g. { "name.first_name": true }
  const [editing, setEditing] = useState<Record<string, boolean>>({});

  const [savingSection, setSavingSection] = useState<SectionId | null>(null);
  const [status, setStatus] = useState<Status>(null);

  // Resume (local only for now)
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      setSavedInfo(info);
      setInfoDraft(info);
      setSavedContact(contact);
      setContactDraft(contact);
      setSavedExperiences(experiences);
      setExpDraft(experiences);
      setSkills(toSkills(data.skills));
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
    start_date: e.start_date ? undefined : "Required",
    end_date:
      e.end_date && e.end_date < e.start_date
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

  {
    /*  const saveExperience = () =>
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
            end_date: e.end_date,
            is_current: e.end_date === null,
          })),
        },
      });

      // Rows are re-created on save, so take the fresh ids from the server
      const fresh = res.data?.experiences
        ? toExperiences(res.data.experiences)
        : expDraft;
      setSavedExperiences(fresh);
      setExpDraft(fresh);
      clearEditing("exp.");
    });*/
  }

  const handleModalClose = () => setStatus(null);

  /* ----- Resume (local only) ----- */

  const acceptFile = (file: File | undefined) => {
    if (!file) return;
    const error = validateResume(file);
    if (error) {
      setResumeError(error);
      return;
    }
    setResumeError(null);
    setResume(file);
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

  const handleRemoveResume = () => {
    setResume(null);
    setResumeError(null);
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
  const dataTabLoading = activeTab !== "resume" && loading;
  const dataTabFailed = activeTab !== "resume" && !loading && loadError;

  return (
    <div className="w-full flex flex-col items-center bg-white px-4 py-10">
      {/* Avatar */}
      <div className="p-1.5 rounded-full border-2 border-gray-200">
        <div className="w-32 h-32 rounded-full bg-red-50 text-red-700 flex items-center justify-center overflow-hidden">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
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
        {/* Loading / error for the data tabs */}
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
        {activeTab === "resume" && (
          <>
            {resume ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                    <FaFileLines size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="archivo text-sm font-semibold text-zinc-900 truncate">
                      {resume.name}
                    </p>
                    <p className="archivo text-xs text-zinc-500">
                      {formatSize(resume.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={openPicker}
                    className="archivo text-sm font-semibold text-red-700 hover:text-red-800 cursor-pointer"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    aria-label="Remove resume"
                    onClick={handleRemoveResume}
                    className="p-1.5 rounded-full text-zinc-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <FaXmark size={14} />
                  </button>
                </div>
              </div>
            ) : (
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
                  Upload a resume
                </p>
                <p className="archivo text-sm text-zinc-500">
                  PDF, .doc, or .docx file under 5 MB.
                </p>
              </div>
            )}

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
              heading="We couldn't save your changes"
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
