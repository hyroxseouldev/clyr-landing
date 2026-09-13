"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ContainerWrapper } from "./container-wrapper";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const navItems = [
    { label: t("coach"), href: "/#coach" },
    { label: t("programs"), href: "/#pricing" },
    { label: t("reviews"), href: "/#proof" },
    { label: t("faq"), href: "/#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/85 backdrop-blur-xl">
      <ContainerWrapper className="site-header-shell flex items-center p-2 min-h-16">
        <div className="flex flex-1 items-center">
          <Link
            className="flex items-center transition-opacity hover:opacity-80"
            href="/"
            aria-label={t("home")}
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
        <nav
          className="shrink-0 items-center hidden lg:flex"
          aria-label={t("home")}
        >
          <div className="flex items-center gap-4">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                size="sm"
                className="rounded-full text-foreground/70"
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </div>
        </nav>

        {/* 우측 버튼 */}
        <div className="flex flex-1 items-center justify-end gap-2 lg:gap-3">
          <Label className="hidden sm:block" aria-label="Language">
            <NativeSelect
              aria-label="Language"
              className="h-8 text-xs w-28 border-foreground/20 bg-card text-foreground"
              value={locale}
              onChange={(event) =>
                router.replace(pathname, {
                  locale: event.target.value as "ko" | "en",
                })
              }
            >
              <NativeSelectOption
                className="bg-card text-foreground"
                value="ko"
              >
                {t("korean")}
              </NativeSelectOption>
              <NativeSelectOption
                className="bg-card text-foreground"
                value="en"
              >
                {t("english")}
              </NativeSelectOption>
            </NativeSelect>
          </Label>
          {/* 주문 확인 - 모바일에서 숨김 */}
          <Button
            asChild
            variant="outline"
            size="default"
            className="hidden border-foreground/25 text-foreground/80 sm:inline-flex px-5"
          >
            <Link href="/lookup">{t("lookup")}</Link>
          </Button>

          {/* 주문하기 - 모바일에서 숨김 (lg 이상에서만 노출) */}
          <Button
            asChild
            variant="default"
            size="default"
            className="hidden px-6 font-black lg:inline-flex"
          >
            <Link href="/order">{t("order")}</Link>
          </Button>

          {/* 햄버거 버튼 - 모바일 */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={t("home")}
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
          </Button>
        </div>
      </ContainerWrapper>

      {/* 모바일 메뉴 */}
      <div
        id="mobile-navigation"
        inert={!isOpen}
        aria-hidden={!isOpen}
        className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-foreground/10 bg-background/95 backdrop-blur-xl">
          <ContainerWrapper className="py-4">
            <nav className="flex flex-col gap-2" aria-label={t("home")}>
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  size="default"
                  className="justify-start rounded-full text-foreground/70"
                >
                  <Link href={item.href} onClick={() => setIsOpen(false)}>
                    {item.label}
                  </Link>
                </Button>
              ))}

              {/* 모바일 메뉴 안에 버튼들 */}
              <div className="mt-2 flex flex-col gap-3 border-t border-foreground/10 pt-4 px-4">
                <Button
                  asChild
                  variant="outline"
                  size="default"
                  className="justify-start border-foreground/25 text-foreground/80"
                >
                  <Link href="/lookup" onClick={() => setIsOpen(false)}>
                    {t("lookup")}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="default"
                  size="default"
                  className="justify-start font-black"
                >
                  <Link href="/order" onClick={() => setIsOpen(false)}>
                    {t("order")}
                  </Link>
                </Button>
              </div>
            </nav>
          </ContainerWrapper>
        </div>
      </div>
    </header>
  );
}
