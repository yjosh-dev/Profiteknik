import axiosClient from "../axiosClient"

export const applicantsMyJobService = {
    fetchMyJobs: async(token: string) =>
        axiosClient.get("/applicant/my-jobs", {
            headers: {Authorization: `Bearer ${token}`}
        }),

    fetchPendingJobs: async(token: string) =>
        axiosClient.get("/applicant/my-jobs/pending", {
            headers: {Authorization: `Bearer ${token}`}
        })
}