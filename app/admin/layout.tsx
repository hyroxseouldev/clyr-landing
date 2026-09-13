import type { Metadata } from "next";
import "../globals.css";
export const metadata: Metadata = {
  title: "AMOR LAB · 주문 마스터",
  robots: { index: false, follow: false },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body>{children}</body>
    </html>
  );
}
