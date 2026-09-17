import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import RootHome from "./page/RootHome.tsx";
import RootDashboard from "./layout/root/RootDashboard.tsx";

import Test from "./page/Test.tsx";
import ContextProvider from "./context/ContextProvider.tsx";

import ProtectedRoute from "./layout/ProtectedRoute.tsx";

import RegisterEmployee from "./features/root/RegisterEmployee.tsx";
import ManageEmployee from "./features/root/ManageEmployee.tsx";
import EmployeeDashboard from "./layout/employee/EmployeeDashboard.tsx";
import EmployeeHome from "./page/EmployeeHome.tsx";
import JobListing from "./features/employee/JobListing.tsx";

function App() {
  return (
    <ContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/root" element={<RootHome />} />
          <Route path="/employee" element={<EmployeeHome />} />

          {/* ROOT */}
          <Route element={<ProtectedRoute path="/root" />}>
            <Route path="/root/dash" element={<RootDashboard />}>
              <Route path="manage_employee" element={<ManageEmployee />} />
              <Route path="register_employee" element={<RegisterEmployee />} />
            </Route>
          </Route>


          {/* EMPLOYEE */}
          <Route element={<ProtectedRoute path="/employee" />}>
            <Route path="/employee/dash" element={<EmployeeDashboard />}>
               <Route path="job_listing" element={<JobListing />} />
            </Route>
          </Route>

          <Route path="/test" element={<Test />} />
        </Routes>
      </BrowserRouter>
    </ContextProvider>
  );
}

export default App;
