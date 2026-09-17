import React from "react";

export default function Background() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: -1,
        pointerEvents: "none",
        backgroundColor: "#ffffff",
      }}
    >
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMinYMin slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      >
        {/* Green Wedge */}
        <path
          d="M0,0 L950,0 C1050,220 780,480 520,560 C300,630 120,560 0,650 Z"
          fill="url(#bgGradWedge)"
        />

        {/* Large Circle */}
        <circle
          cx="120"
          cy="650"
          r="420"
          fill="url(#bgGradCircleA)"
        />

        {/* Medium Circle */}
        <circle
          cx="560"
          cy="300"
          r="260"
          fill="url(#bgGradCircleB)"
        />

        {/* Small Circle */}
        <circle
          cx="860"
          cy="90"
          r="90"
          fill="#82C98D"
        />

        <defs>
          {/* Wedge */}
          <linearGradient id="bgGradWedge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E3F4E6" />
            <stop offset="100%" stopColor="#8DD59A" />
          </linearGradient>

          {/* Large Circle */}
          <radialGradient id="bgGradCircleA" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#97DDA3" />
            <stop offset="100%" stopColor="#F7FCF8" />
          </radialGradient>

          {/* Medium Circle */}
          <radialGradient id="bgGradCircleB" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D8F1DD" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}