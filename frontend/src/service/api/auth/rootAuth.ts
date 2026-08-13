import axiosClient from "../axiosClient";

export const rootAuth = {
  authLogin: (username: string, password: string) =>
    axiosClient.post("/root/auth/login", { username, password }),
};