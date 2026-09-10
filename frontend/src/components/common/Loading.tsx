import logo from "../../assets/logo/profiteknik_logo.svg";


export default function Loading() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-5">
      <img src={logo} className="" />
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      <h1 className="text-base font-semibold">
        Loading, please wait while we set up things for you.
      </h1>
    </div>
  );
}

