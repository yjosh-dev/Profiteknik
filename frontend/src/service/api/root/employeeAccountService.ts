import type { EmployeeFormData } from "../../../types/EmployeeTypes";
import axiosClient from "../axiosClient";

export const employeeAccount = {
  registerEmployee: async (form: FormData) => {
    return await axiosClient.post("/root/employees", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
