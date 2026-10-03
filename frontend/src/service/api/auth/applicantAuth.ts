import axiosClient from "../axiosClient";

type LoginPayload = {
  username: string;
  password: string;
};

export const ApplicantAuth = {
  login: (payload: LoginPayload) => {
    return axiosClient.post("/applicant/auth/login", payload);
  },

  logout: () => {
    return axiosClient.post("applicant/authlogout");
  },

  me: () => {
    return axiosClient.get("/applicant/auth/me");
  },
};