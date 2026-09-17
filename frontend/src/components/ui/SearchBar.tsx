import { FiSearch, FiMapPin, FiBell } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { useState } from "react";

export default function SearchBar() {

  const [activeTab, setActiveTab] = useState("search");
  return (
    <div className="w-full flex flex-col items-center gap-4 py-6">
      {/* Search pill */}
      <div className="flex items-center w-full max-w-2xl h-12 border border-gray-300 rounded-full overflow-hidden bg-[#f8fafc]">
        <div className="flex items-center gap-2 flex-1 px-4 h-full">
          <FiSearch className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Find your perfect job"
            className="outline-none w-full text-sm text-gray-700 placeholder:text-gray-400 bg-transparent focus:font-semibold focus:text-lg"
          />
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <div className="flex items-center gap-2 flex-1 px-4 h-full">
          <FiMapPin className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder='City, state, zipcode, or "remote"'
            className="outline-none w-full text-sm text-gray-700 placeholder:text-gray-400 bg-transparent focus:font-semibold focus:text-lg"
          />
        </div>
        <button className="w-32 h-full text-white bg-red-700 hover:bg-white hover:text-red-700 transition hover:border-t-2 hover:border-r-2 hover:rounded-full hover:border-b-2 hover:border-red-700">
          <p className="text-md font-bold ">Find Now</p>
        </button>
      </div>

      {/* Tabs + job alert row */}
      <div className="flex items-center w-full max-w-2xl justify-between px-1">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("forYou")}
            className={`flex items-center gap-1.5 text-sm ${
              activeTab === "forYou"
                ? "font-semibold text-gray-900"
                : "font-normal text-gray-500"
            }`}
          >
            <HiOutlineSparkles className="w-4 h-4" />
            For You
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`text-sm ${
              activeTab === "search"
                ? "font-semibold text-gray-900"
                : "font-normal text-gray-500"
            }`}
          >
            Search
          </button>
        </div>

        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
          <FiBell className="w-4 h-4" />
          Create job alert
        </button>
      </div>
    </div>
  );
}