import React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const FooterCTASection = () => {
  const t = useTranslations("Footer");
  return (
    <section className="bg-[#080808] py-20 text-center md:py-28" id="footer">
      <div className="container mx-auto max-w-7xl px-6">
        <span className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary">
          {t("eyebrow")}
        </span>
        <h2 className="mt-2 text-3xl font-extrabold leading-[1.15] md:text-4xl lg:text-[46px]">
          <span className="whitespace-pre-line">{t("title")}</span>
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-[15px] text-gray-400 md:text-base">
          <span className="whitespace-pre-line">{t("description")}</span>
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-black transition hover:bg-[#d4ff5a] hover:shadow-[0_0_30px_rgba(198,255,51,0.25)] hover:-translate-y-0.5"
          >
            {t("join")}
          </Link>
          <Link
            href="/lookup"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-primary hover:text-primary"
          >
            {t("lookup")}
          </Link>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-[13px] text-gray-500 sm:flex-row">
          <div className="flex flex-wrap gap-5">
            <a href="#" className="transition hover:text-primary">
              {t("terms")}
            </a>
            <a href="#" className="transition hover:text-primary">
              {t("privacy")}
            </a>
            <a href="#" className="transition hover:text-primary">
              {t("business")}
            </a>
          </div>
          <div>&copy; 2026 AMOR LAB. All rights reserved.</div>
        </div>
      </div>
    </section>
  );
};

export default FooterCTASection;
