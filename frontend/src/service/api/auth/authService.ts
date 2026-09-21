import Header from "../../../components/common/Header"
import axiosClient from "../axiosClient"

export const Logout = {
    rootLogout: async({token} : {token: string}) => (
         axiosClient.post('/employee/auth/logout', {
             headers: {Authorization: `Bearer ${token}`},
         })
    ),

    employeeLogout: async({token} : {token: string}) => (
         axiosClient.post('/employee/auth/logout', {
             headers: {Authorization: `Bearer ${token}`},
         })
    )
}
