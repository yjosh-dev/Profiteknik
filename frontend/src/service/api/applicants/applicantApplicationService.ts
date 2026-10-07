import axiosClient from "../axiosClient";

export interface ApplicationPayload {
  screening_answers: string[];
}

export const applicantApplicationService = {
  applyJob: async (
    job_id: number | string,
    payload: ApplicationPayload,
    token: string
  ) =>
    axiosClient.post(`/applicant/job_listing/${job_id}/apply`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }),
};