import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SiteHeader } from "../components/site-header";
import "../globals.css";
import { ContainerWrapper } from "../components/container-wrapper";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";

type Props = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

  return {
    title: isEnglish
      ? "AMOR LAB — HYROX Online Coaching"
      : "AMOR LAB — HYROX 온라인 코칭",
    description: isEnglish
      ? "Data-driven HYROX online coaching by AMOR LAB."
      : "AMOR LAB의 데이터 기반 HYROX 온라인 코칭.",
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        ko: `${baseUrl}/ko`,
        en: `${baseUrl}/en`,
        "x-default": `${baseUrl}/ko`,
      },
    },
    openGraph: {
      url: `${baseUrl}/${locale}`,
      siteName: "AMOR LAB",
      locale: isEnglish ? "en_US" : "ko_KR",
      alternateLocale: isEnglish ? ["ko_KR"] : ["en_US"],
      type: "website",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  const validLocale = locale as Locale;
  setRequestLocale(validLocale);
  const messages = await getMessages();

  return (
    <html lang={validLocale} data-theme="amor">
      <body>
        <NextIntlClientProvider messages={messages}>
          <SiteHeader />
          <ContainerWrapper>{children}</ContainerWrapper>
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
