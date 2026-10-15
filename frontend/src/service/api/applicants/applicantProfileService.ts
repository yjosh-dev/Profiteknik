import axiosClient from "../axiosClient";
import type {
  ContactForm,
  ProfileForm,
} from "../../../types/ApplicantProfileTypes";

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export type ExperienceItemForm = {
  job_title: string;
  company: string;
  start_date: string; // "YYYY-MM"
  end_date: string | null; // "YYYY-MM", or null = currently working here
};

export type ExperienceForm = {
  has_experience: boolean;
  experiences: ExperienceItemForm[];
};

export const applicantProfileService = {
  // Step 1: personal information + optional profile photo (multipart)
  storeApplicantInformation: async ({
    token,
    form,
    profileImage,
  }: {
    token: string;
    form: ProfileForm;
    profileImage?: File | null;
  }) => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (profileImage) formData.append("profile_image", profileImage);

    return axiosClient.post("/applicant/info", formData, {
      headers: {
        ...authHeaders(token).headers,
        "Content-Type": "multipart/form-data",
      },
    });
  },

  storeApplicantContact: async ({
    token,
    data,
  }: {
    token: string;
    data: ContactForm;
  }) => axiosClient.post("/applicant/contact", data, authHeaders(token)),

  // Step 3 (last) and Profile page, Experience tab: replaces the whole list
  // and marks the account as no longer new.
  // Response: { experiences: [{ id, job_title, company, start_date, end_date }] }
  storeApplicantExperience: async ({
    token,
    data,
  }: {
    token: string;
    data: ExperienceForm;
  }) => axiosClient.post("/applicant/experience", data, authHeaders(token)),

  // Profile page, Skills tab: replaces the whole list
  storeApplicantSkills: async ({
    token,
    skills,
  }: {
    token: string;
    skills: string[];
  }) => axiosClient.post("/applicant/skills", { skills }, authHeaders(token)),

  // Profile page, Resume tab: upload or replace (multipart, key "resume").
  // The explicit Content-Type is needed because axiosClient defaults to JSON.
  storeApplicantResume: async ({
    token,
    resume,
  }: {
    token: string;
    resume: File;
  }) => {
    const formData = new FormData();
    formData.append("resume", resume);

    return axiosClient.post("/applicant/resume", formData, {
      headers: {
        ...authHeaders(token).headers,
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Profile page, Resume tab: remove the saved resume
  deleteApplicantResume: async (token: string) =>
    axiosClient.delete("/applicant/resume", authHeaders(token)),

  // Profile page, Resume tab: returns the file as a Blob (needs the auth
  // header, so a plain <a href> won't work)
  downloadApplicantResume: async (token: string) =>
    axiosClient.get<Blob>("/applicant/resume", {
      ...authHeaders(token),
      responseType: "blob",
    }),

  // Profile page: information, contact, experiences, skills and resume in one request
  fetchApplicantProfile: async (token: string) =>
    axiosClient.get("/applicant/profile", authHeaders(token)),
};
