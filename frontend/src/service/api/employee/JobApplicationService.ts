import axiosClient from "../axiosClient";

export const JobApplicationService = {
     fetchApplications: async(job_id: string | number) =>
        axiosClient.get(`employee/jobs/${job_id}/applications`),

}