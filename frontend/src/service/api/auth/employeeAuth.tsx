import axiosClient from "../axiosClient";

export const employeeAuth = {
  authLogin: async (username: string, password: string) =>
    axiosClient.post("/employee/auth/login", {username, password }),
};