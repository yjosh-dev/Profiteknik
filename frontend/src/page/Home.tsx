import Background from "../components/common/Background";
import GridBackground from "../components/common/GridBackground";
import SearchBar from "../components/ui/SearchBar";

const avatars = [
  {
    src: "https://i.pravatar.cc/150?img=32",
    position: "top-4 left-6 md:left-16",
    arrow: "left-16 top-14 md:left-28 rotate-[15deg]",
    arrowSide: "right",
  },
  {
    src: "https://i.pravatar.cc/150?img=59",
    position: "top-4 right-6 md:right-16",
    arrow: "right-16 top-14 md:right-28 -rotate-[15deg]",
    arrowSide: "left",
  },
  {
    src: "https://i.pravatar.cc/150?img=45",
    position: "bottom-24 left-6 md:left-20",
    arrow: "left-16 bottom-28 md:left-32 -rotate-[15deg]",
    arrowSide: "right",
  },
  {
    src: "https://i.pravatar.cc/150?img=12",
    position: "bottom-24 right-6 md:right-20",
    arrow: "right-16 bottom-28 md:right-32 rotate-[15deg]",
    arrowSide: "left",
  },
];

const partners = ["HubSpot", "Dropbox", "Square", "Intercom", "Grammarly"];

export default function HomeLayout() {
  return (
    <div className="relative w-full h-[92vh] flex flex-col items-center overflow-hidden bg-white">
      {/* content */}
      <div className="relative z-10 flex flex-col items-center px-6 h-full justify-center">
        <div>
          <h1 className="inter font-medium text-6xl max-w-[60vw] text-center leading-tight text-zinc-900">
            Your Next{" "}
            <span className="relative inline-block text-black">
              Job and Opportunity
              <svg
                className="absolute left-0 -bottom-1 w-full"
                height="10"
                viewBox="0 0 120 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M2,7 C30,2 90,2 118,7"
                  stroke="#dc2626"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
          </h1>
          <div className="flex gap-4 justify-center">
            <h1 className="inter font-medium text-6xl max-w-[60vw] text-center leading-tight text-zinc-900">
              Starts Here at{" "}
            </h1>
            <h1 className="inter font-bold text-6xl max-w-[60vw] text-center leading-tight text-black flex gap-3">
              Profiteknik <p className="text-red-800">Corporation</p>
            </h1>
          </div>
        </div>

        <p className="mt-6 max-w-[38vw] text-center text-md text-zinc-500 leading-relaxed">
          Search thousands of blue-collar job opportunities across construction,
          mechanical, maintenance and engineering. Explore openings from
          Profiteknik Corporation, compare salaries and locations, and find the
          right position that matches your skills and experience all in one
          place.
        </p>

        <div className="w-full">
          <SearchBar />
        </div>
      </div>

      {/* partner strip */}
      <div className="relative z-10 w-full max-w-4xl mt-auto mb-10 px-6 flex items-center justify-between flex-wrap gap-4">
        <p className="text-xs text-zinc-500 leading-snug max-w-[120px]">
          More than 100+ companies partner
        </p>
        <div className="flex items-center gap-8 flex-wrap opacity-70">
          {partners.map((name) => (
            <span
              key={name}
              className="text-sm font-semibold text-zinc-500 hover:text-red-600 transition-colors tracking-tight"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}