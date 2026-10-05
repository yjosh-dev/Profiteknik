import Header from "../../../components/common/Header";
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


  me: async (token: string) =>
    axiosClient.get("/applicant/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
