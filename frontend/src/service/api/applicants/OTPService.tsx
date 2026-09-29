import axios from "axios";
import axiosClient from "../axiosClient";

export const OTPService = {
     sendOTP: async(email: string) =>
        axiosClient.post('/otp/send', {email}),

     verifyOTP: async(email: string, otp: number | string) =>
        axiosClient.post('/otp/verify', {email, otp}),

     createAccount: async(username: string, password: string) =>
        axiosClient.post('/create_account', {username, password})
}
