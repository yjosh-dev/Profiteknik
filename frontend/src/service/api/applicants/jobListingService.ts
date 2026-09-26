import axiosClient from "../axiosClient";

export const jobListingService = {
  fetchJobListing: async (page?: number | string) =>
    axiosClient.get("/job_listing", {
      params: page ? { page } : {},
    }),
};
