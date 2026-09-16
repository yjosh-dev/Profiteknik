import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";

export default function EmployeeDashboard() {
  const [isActive, setIsActive] = useState(true);
  return (
    <div className="min-h-screen flex bg-white">
      <aside
        className={`h-[98vh] p-3 transition-[width] duration-300 ease-in-out ${
          isActive ? "w-[15%]" : "w-[6%]"
        }`}
      >
        <Sidebar
          handleMinimize={() => setIsActive(!isActive)}
          isActive={isActive}
        />
      </aside>

      <div className="flex-1 h-dvh flex flex-col gap-3 py-3 pr-3">
        <header className="w-[98%] h-[10%] ">
          <Header />
        </header>
        <main className="w-[98%] h-[86%] ">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
