"use client";

import Image from "next/image";
import Link from "next/link";
import { ContainerWrapper } from "./container-wrapper";
import { useState } from "react";

const navItems = [
  { label: "코치 소개", href: "/#coach" },
  { label: "프로그램", href: "/#pricing" },
  { label: "후기", href: "/#proof" },
  { label: "FAQ", href: "/#faq" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-base-content/10 bg-base-100/85 backdrop-blur-xl">
      <ContainerWrapper className="site-header-shell navbar min-h-16">
        <div className="navbar-start">
          <Link
            className="flex items-center transition-opacity hover:opacity-80"
            href="/"
            aria-label="AMOR LAB 홈"
          >
            <Image
              className="h-8 w-auto sm:h-9"
              src="/brand/amor-lab-logo.png"
              alt="AMOR LAB"
              width={1960}
              height={880}
              priority
            />
          </Link>
        </div>

        {/* 데스크탑 메뉴 */}
        <nav className="navbar-center hidden lg:flex" aria-label="주요 메뉴">
          <div className="flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="btn btn-ghost btn-sm rounded-field text-base-content/70"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* 우측 버튼 */}
        <div className="navbar-end gap-2 lg:gap-3">
          {/* 주문 확인 - 모바일에서 숨김 */}
          <Link
            className="btn btn-outline btn-md hidden border-base-content/25 text-base-content/80 sm:inline-flex px-5"
            href="/lookup"
          >
            주문 확인
          </Link>

          {/* 주문하기 - 모바일에서 숨김 (lg 이상에서만 노출) */}
          <Link
            className="btn btn-primary btn-md hidden px-6 font-black lg:inline-flex"
            href="/order"
          >
            주문하기
          </Link>

          {/* 햄버거 버튼 - 모바일 */}
          <button
            className="btn btn-ghost btn-square btn-md lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="메뉴 열기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </ContainerWrapper>

      {/* 모바일 드롭다운 메뉴 - DaisyUI drawer 스타일 적용 */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-base-content/10 bg-base-100/95 backdrop-blur-xl">
          <ContainerWrapper className="py-4">
            <nav className="flex flex-col gap-2" aria-label="모바일 메뉴">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  className="btn btn-ghost justify-start rounded-field text-base-content/70"
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* 모바일 메뉴 안에 버튼들 */}
              <div className="mt-2 flex flex-col gap-3 border-t border-base-content/10 pt-4 px-4">
                <Link
                  className="btn btn-outline btn-md justify-start border-base-content/25 text-base-content/80"
                  href="/lookup"
                  onClick={() => setIsOpen(false)}
                >
                  주문 확인
                </Link>
                <Link
                  className="btn btn-primary btn-md justify-start font-black"
                  href="/order"
                  onClick={() => setIsOpen(false)}
                >
                  주문하기
                </Link>
              </div>
            </nav>
          </ContainerWrapper>
        </div>
      </div>
    </header>
  );
}
