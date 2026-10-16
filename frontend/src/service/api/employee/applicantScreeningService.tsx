import axiosClient from "../axiosClient";

const authHeaders = () => {
  const token = localStorage.getItem("token"); // adjust the key if yours is named differently
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: "application/json",
  };
};

export const applicantScreeningService = {
  getScreeningDetails: async (jobId: string, applicantId: string) => {
    return axiosClient.get("/employee/screen-applicant", {
      params: {
        job_id: jobId,
        applicant_id: applicantId,
      },
      headers: authHeaders(),
    });
  },

  updateStatus: async (applicationId: string, status: string) => {
    return axiosClient.patch(
      `/employee/screen-applicant/${applicationId}/status`,
      { status },
      {
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
      },
    );
  },

  getGoogleAuthUrl: (returnTo?: string) =>
    axiosClient.get("/google/auth-url", {
      params: { return_to: returnTo },
      headers: authHeaders(),
    }),

  getGoogleStatus: () =>
    axiosClient.get("/google/status", { headers: authHeaders() }),

  scheduleInterview: (
    applicationId: string,
    payload: {
      starts_at: string;
      duration_minutes: number;
      applicant_email: string;
      title?: string;
    },
  ) =>
    axiosClient.post(
      `/employee/screen-applicant/${applicationId}/interview`,
      payload,
      {
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
      },
    ),

  getInterview: (applicationId: string) =>
    axiosClient.get(`/employee/screen-applicant/${applicationId}/interview`, {
      headers: authHeaders(),
    }),

  cancelInterview: (id: number) =>
    axiosClient.delete(`/employee/interview/${id}`, {
      headers: authHeaders(),
    }),

  getInterviews: () =>
    axiosClient.get("/employee/interviews", { headers: authHeaders() }),
};
