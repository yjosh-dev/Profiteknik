import Header from "../../../components/common/Header";
import axiosClient from "../axiosClient";

export const employeeAuth = {
  authLogin: async (username: string, password: string) =>
    axiosClient.post("/employee/auth/login", {username, password }),

  verifyEmployee: async(token: string) => 
   axiosClient.get("/employee/auth/me", {
     headers: {Authorization: `Bearer ${token}`},
   })

};