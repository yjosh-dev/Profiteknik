import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser } from "react-icons/fa6";
import { MdCheckCircle, MdError } from "react-icons/md";

import contactBanner from "../../assets/img/applicant_contact.jpg";
import StatusModal from "../../components/ui/StatusModal";
import { AuthContext } from "../../context/AuthProvider";
import { applicantProfileService } from "../../service/api/applicants/applicantProfileService";

export type ProfileForm = {
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

type Status =
  | { type: "success" }
  | { type: "error"; message: string }
  | null;

const initialForm: ProfileForm = {
  first_name: "",
  middle_name: "",
  last_name: "",
  suffix: "",
  building_no: "",
  house_no: "",
  street: "",
  city: "",
  region: "",
  country: "Philippines",
};

const REQUIRED: (keyof ProfileForm)[] = [
  "first_name",
  "last_name",
  "street",
  "city",
  "region",
  "country",
];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

// Where to go after this step is saved (change to your real route)
const NEXT_STEP_PATH = "/applicant/profile";

const FALLBACK_ERROR = "Something went wrong. Please try again.";

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-2">
      <p className="archivo text-xs font-semibold uppercase tracking-wide text-zinc-800">
        {children}
      </p>
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder,
  className = "",
}: {
  label: string;
  name: keyof ProfileForm;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="archivo block text-xs font-medium text-zinc-700 mb-1"
      >
        {label}
        {required && <span className="text-red-700"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="archivo w-full h-9 rounded-md border border-gray-300 px-2.5 text-sm text-zinc-800 placeholder-zinc-400 outline-none transition-all focus:border-red-700 focus:ring-1 focus:ring-red-700/40"
      />
    </div>
  );
}

export default function CompleteAccountInformation() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build a preview URL for the chosen file and free it when it changes
  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(profileImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again later
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Use a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Image must be 2 MB or smaller.");
      return;
    }

    setImageError(null);
    setProfileImage(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImageError(null);
  };

  const canSubmit = REQUIRED.every((key) => form[key].trim() !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token") ?? "";
      await applicantProfileService.storeApplicantInformation({
        token,
        form,
        profileImage,
      });
      setStatus({ type: "success" });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = async () => {
    const wasSuccess = status?.type === "success";
    setStatus(null);
    if (!wasSuccess) return;

    // Refresh the logged-in user (isNew, profile picture), then move on
    await auth?.checkAuth("applicant");
    navigate('/applicant/profile');
  };

  return (
    <div className="w-full min-h-full flex justify-center bg-white px-4 py-6">
      <div className="w-full max-w-[360px]">
        <div className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
          <img
            src={contactBanner}
            alt=""
            className="w-full h-24 object-cover object-center"
          />

          <form onSubmit={handleSubmit} className="px-4 py-4">
            <h2 className="archivo text-base font-bold text-zinc-900 leading-snug">
              Add your details to continue
            </h2>
            <p className="archivo text-xs text-zinc-600 mt-1">
              This helps employers know who you are and where you're based.
            </p>

            {/* Profile photo */}
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50/60 p-2.5">
              <button
                type="button"
                aria-label="Choose profile photo"
                onClick={() => fileInputRef.current?.click()}
                className="w-14 h-14 shrink-0 rounded-full border border-red-200 bg-white overflow-hidden flex items-center justify-center text-red-300 hover:border-red-400 focus-visible:ring-2 focus-visible:ring-red-500 outline-none transition-all cursor-pointer"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser size={22} />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p className="archivo text-xs font-medium text-zinc-700">
                  Profile photo{" "}
                  <span className="font-normal text-zinc-400">(optional)</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="archivo h-6 px-2.5 rounded border border-red-700 text-[11px] font-semibold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    {profileImage ? "Change" : "Upload"}
                  </button>
                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="archivo text-[11px] text-zinc-500 hover:text-red-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p
                  className={`archivo text-[11px] mt-1 ${
                    imageError ? "text-red-700" : "text-zinc-500"
                  }`}
                >
                  {imageError ?? "JPG, PNG or WEBP, up to 2 MB"}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Name */}
            <SectionLabel>Name</SectionLabel>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
              <Field
                label="First name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
              />
              <Field
                label="Middle name"
                name="middle_name"
                value={form.middle_name}
                onChange={handleChange}
              />
              <Field
                label="Last name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
              />
              <Field
                label="Suffix"
                name="suffix"
                value={form.suffix}
                onChange={handleChange}
                placeholder="Jr., Sr."
              />
            </div>

            {/* Address */}
            <SectionLabel>Address</SectionLabel>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
              <Field
                label="Building no."
                name="building_no"
                value={form.building_no}
                onChange={handleChange}
              />
              <Field
                label="House no."
                name="house_no"
                value={form.house_no}
                onChange={handleChange}
              />
              <Field
                label="Street"
                name="street"
                value={form.street}
                onChange={handleChange}
                required
                className="col-span-2"
              />
              <Field
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              />
              <Field
                label="Region"
                name="region"
                value={form.region}
                onChange={handleChange}
                required
              />
              <Field
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
                required
                className="col-span-2"
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="archivo mt-5 w-full h-9 rounded-md bg-red-700 text-white text-sm font-semibold transition-colors hover:bg-red-800 cursor-pointer disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Continue"}
            </button>
          </form>
        </div>
      </div>

      {/* Result modal */}
      {status && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        >
          {status.type === "success" ? (
            <StatusModal
              heading="Details saved"
              description="Your personal information has been saved. Let's continue setting up your account."
              icon={<MdCheckCircle className="text-green-600" />}
              button_name="Continue"
              button_color="bg-red-700 text-white hover:bg-red-800"
              onClick={handleModalClose}
            />
          ) : (
            <StatusModal
              heading="We couldn't save your details"
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