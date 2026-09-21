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
      className={`w-full h-full bg-[#EDE9E6] rounded-xl   ${className}`}
    > 
      {children}
    </div>
  );
}
