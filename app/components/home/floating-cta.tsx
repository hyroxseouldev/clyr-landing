"use client";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
export default function FloatingCTA() {
  const t = useTranslations("Common");
  return (
    <a
      href="https://www.instagram.com/amor_jh.special/"
      target="_blank"
      rel="noopener noreferrer"
      className="consult-link"
      aria-label={t("consult")}
    >
      <MessageCircle size={18} />
      <span>{t("consult")}</span>
    </a>
  );
}
