import { useEffect, useMemo, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";

export default function RootDashboard() {
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="min-h-screen flex bg-white">
      <aside
        className={`h-dvh p-3 transition-[width] duration-300 ease-in-out ${
          isActive ? "w-[15%]" : "w-[6%]"
        }`}
      >
        <Sidebar
          handleMinimize={() => setIsActive(!isActive)}
          isActive={isActive}
        />
      </aside>

      <div className="flex-1 h-dvh flex flex-col gap-3 py-3 pr-3">
        <header className="w-full h-[10%] ">
          <Header />
        </header>
        <main className="w-full flex-1 ">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
