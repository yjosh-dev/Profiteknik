import axiosClient from "../axiosClient";

export const jobListingService = {
  fetchJobListings: async (page?: number | string) =>
    axiosClient.get("/job_listing", {
      params: page ? { page } : {},
    }),

  fetchJobListing: async(job_id?: number | string) =>
    axiosClient.get(`/job_listing/${job_id}`)
};
