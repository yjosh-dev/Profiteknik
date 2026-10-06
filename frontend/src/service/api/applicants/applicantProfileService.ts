import axiosClient from "../axiosClient";
import type {
  ContactForm,
  ProfileForm,
} from "../../../types/ApplicantProfileTypes";

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

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

    return axiosClient.post("/applicant/info", formData, authHeaders(token));
  },

  // Step 2: email, mobile and telephone
  storeApplicantContact: async ({
    token,
    data,
  }: {
    token: string;
    data: ContactForm;
  }) => axiosClient.post("/applicant/contact", data, authHeaders(token)),

  // Step 3 (last): work history. Also marks the account as no longer new. to be created

  // Profile page, Skills tab: replaces the whole list
  storeApplicantSkills: async ({
    token,
    skills,
  }: {
    token: string;
    skills: string[];
  }) => axiosClient.post("/applicant/skills", { skills }, authHeaders(token)),

  // Profile page: information, contact, experiences and skills in one request
  fetchApplicantProfile: async (token: string) =>
    axiosClient.get("/applicant/profile", authHeaders(token)),
};
