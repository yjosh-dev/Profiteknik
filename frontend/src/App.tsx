import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootHome from "./page/RootHome.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/root" element={<RootHome/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
