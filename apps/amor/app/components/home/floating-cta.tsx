"use client";

import Link from "next/link";
import React from "react";

const FloatingCTA = () => {
  return (
    <>
      <Link
        href="https://www.instagram.com/amor_jh.special/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-gradient-to-br from-primary to-[#b8e63b] px-4 py-3.5 text-sm font-extrabold text-black shadow-[0_8px_32px_rgba(198,255,51,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-105 hover:shadow-[0_16px_48px_rgba(198,255,51,0.5)] active:scale-95 sm:px-6 sm:py-4 sm:text-base"
        aria-label="인스타그램에서 AMOR LAB 상담하기"
      >
        <svg
          className="h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>

        <span className="text-center leading-tight">상담하기</span>
      </Link>
    </>
  );
};

export default FloatingCTA;
