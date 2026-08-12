import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import RootHome from "./page/RootHome.tsx";
import RootDashboard from "./layout/root/RootDashboard.tsx";

import Test from "./page/Test.tsx";
import ContextProvider from "./context/ContextProvider.tsx";

function App() {
  return (
    <ContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/root" element={<RootHome />} />
          <Route path="/root/dash" element={<RootDashboard />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </BrowserRouter>
    </ContextProvider>
  );
}

export default App;
