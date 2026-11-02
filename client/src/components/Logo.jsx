import React from 'react';

/**
 * 99subcircle Minimal Human-Created Style Logo
 * 
 * Concept: A handcrafted geometric mark featuring two interlocking circular 
 * loops forming the '99' and an unbroken rotating circle.
 * Crafted with editorial line weight and human subtle asymmetry.
 */
export default function Logo({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Outer subtle circular boundary (orbital cycle) */}
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="1.5 3.5"
        className="opacity-40"
      />

      {/* First '9' loop: Hand-balanced top circle that arcs into bottom center */}
      <path
        d="M20 18C20 14.6863 17.3137 12 14 12C10.6863 12 8 14.6863 8 18C8 21.3137 10.6863 24 14 24C16.5 24 18.5 22.8 19.5 21L20 32C20 33.5 18.5 34.5 17 34.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Second '9' loop: Nested offset loop flowing forward */}
      <path
        d="M34 18C34 14.6863 31.3137 12 28 12C24.6863 12 22 14.6863 22 18C22 21.3137 24.6863 24 28 24C30.5 24 32.5 22.8 33.5 21L34 32C34 33.5 32.5 34.5 31 34.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Human organic dot accent: The core shared center point */}
      <circle cx="39" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function LogoBrand({ size = 28, showTagline = false }) {
  return (
    <div className="flex items-center space-x-2.5">
      <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center border border-black shadow-sm">
        <Logo size={size} className="text-white" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center space-x-1.5">
          <span className="font-mono text-base font-bold tracking-tight text-black">
            99<span className="font-sans font-semibold text-zinc-600">subcircle</span>
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
            shared subscription circles
          </span>
        )}
      </div>
    </div>
  );
}

