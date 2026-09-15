import axiosClient from "../axiosClient";

export const employeeAccount = {
  
  registerEmployee: async (form: FormData) => {
    return await axiosClient.post("/root/employees", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
   
  getEmployees: async () => {
    return await axiosClient.get("/root/employees")
  },

  deleteEmployee: async (id: string) => {
     return await axiosClient.delete(`/root/employees/${id}`)
  }
};
