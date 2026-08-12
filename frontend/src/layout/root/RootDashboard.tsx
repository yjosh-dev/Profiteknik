import { useState } from "react";
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
        <Sidebar handleMinimize={() => setIsActive(!isActive)} isA={isActive} />
      </aside>

      <div className="flex-1 h-dvh flex flex-col gap-3 py-3 pr-3">
        <header className="w-full h-[12%] ">
          <Header></Header>
        </header>
        <main className="w-full flex-1 ">

        </main>
      </div>
    </div>
  );
}
