import axiosClient from "../axiosClient";

export const applicantsMyJobService = {
  fetchMyJobs: async (token: string) =>
    axiosClient.get("/applicant/my-jobs", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  fetchPendingJobs: async (token: string) =>
    axiosClient.get("/applicant/my-jobs/pending", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  fetchShortlistedJobs: async (token: string) =>
    axiosClient.get("/applicant/my-jobs/shortlisted", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  fetchInterviewJobs: async (token: string) =>
    axiosClient.get("/applicant/my-jobs/interview", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  fetchApplicationTracking: async (applicationId: number, token: string) =>
    axiosClient.get(`/applicant/application/${applicationId}/tracking`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  fetchConversation: async (jobId: number, token: string) =>
    axiosClient.get(`/applicant/job/${jobId}/conversation`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};
