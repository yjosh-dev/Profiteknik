import axiosClient from "../axiosClient";

export const OTPService = {
     sendOTP: async(email: string) =>
        axiosClient.post('/send_otp', {email})
}