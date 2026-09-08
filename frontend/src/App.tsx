import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import RootHome from "./page/RootHome.tsx";
import RootDashboard from "./layout/root/RootDashboard.tsx";

import Test from "./page/Test.tsx";
import ContextProvider from "./context/ContextProvider.tsx";

import ProtectedRoute from "./layout/ProtectedRoute.tsx";

import RegisterEmployee from "./features/root/RegisterEmployee.tsx";
import ManageEmployee from "./features/root/ManageEmployee.tsx";

function App() {
  return (
    <ContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/root" element={<RootHome />} />
          <Route element={<ProtectedRoute path="/root" />}>
            <Route path="/root/dash" element={<RootDashboard />}>
              <Route path="manage_employee" element={<ManageEmployee/>} />
              <Route path="register_employee" element={<RegisterEmployee/>} />
            </Route>
          </Route>
          <Route path="/test" element={<Test />} />
        </Routes>
      </BrowserRouter>
    </ContextProvider>
  );
}

export default App;
