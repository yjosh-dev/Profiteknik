import React from "react";

type ContentContainerType = {
  children: React.ReactNode;
  className?: string;
};

export default function ContentContainer({
  children,
  className,
}: ContentContainerType) {
  return (
    <div
      className={`w-full h-full bg-[#EDE9E6] rounded-xl border-3 border-dotted border-gray-400 flex items-center justify-center ${className}`}
    > 
      {children}
    </div>
  );
}
