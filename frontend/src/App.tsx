import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import RootHome from "./page/RootHome.tsx";
import RootDashboard from "./layout/root/RootDashboard.tsx";

import Test from "./page/Test.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/root" element={<RootHome/>}/>
        <Route path="/root/dashboard" element={<RootDashboard/>}/>
        <Route path="/test" element={<Test/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
