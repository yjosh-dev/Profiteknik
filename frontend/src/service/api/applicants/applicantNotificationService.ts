import axiosClient from "../axiosClient";

export const applicantNotificationService = {
  fetchNotifications: async (token: string) =>
    axiosClient.get("/applicant/notifications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  deactivateNotification: async (
    recordId: number,
    token: string,
  ) =>
    axiosClient.patch(
      `/applicant/notifications/${recordId}/deactivate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    ),

  deleteNotification: async (
    recordId: number,
    token: string,
  ) =>
    axiosClient.delete(`/applicant/notifications/${recordId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};