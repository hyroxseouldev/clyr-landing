import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SiteHeader } from "./components/site-header";
import "./globals.css";
import { ContainerWrapper } from "./components/container-wrapper";

export const metadata: Metadata = {
  title: "AMOR LAB — HYROX Online Coaching",
  description: "HYROX online coaching by AMOR LAB.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-theme="amor">
      <body>
        <SiteHeader />
        <ContainerWrapper>{children}</ContainerWrapper>
        <Analytics />
      </body>
    </html>
  );
}
