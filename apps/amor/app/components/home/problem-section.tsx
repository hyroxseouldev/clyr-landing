import React from "react";
import { useTranslations } from "next-intl";

const ProblemSection = () => {
  const t = useTranslations("Problem");
  return (
    <section className="bg-[#0d0d0d] py-16 md:py-24" id="agitation">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary">
              Problem
            </span>

            <h2 className="mt-2 text-3xl font-extrabold leading-[1.15] md:text-4xl lg:text-[46px]">
              <span className="whitespace-pre-line">{t("title")}</span>
            </h2>

            <p className="mt-3 text-[15px] text-gray-400 md:text-base">
              <span className="whitespace-pre-line">{t("description")}</span>
            </p>

            <div className="mt-6 space-y-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="group motion-safe:animate-[fade-up_0.5s_ease-out_both] flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4 text-[15px] transition hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/5"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="mt-1 h-5 w-5 flex-shrink-0 rounded border-2 border-white/20 transition group-hover:border-primary" />
                  <p className="text-gray-300">
                    {t(`questions.${index}`)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex items-center gap-4 rounded-r-xl border-l-4 border-primary bg-primary/10 p-4 transition hover:bg-primary/15">
              <p className="text-sm text-gray-300 md:text-[15px]">
                {t("insight")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-2xl border border-white/5 bg-gradient-to-br from-[#141414] to-[#1a1a1a] transition hover:border-primary/20">
            <div className="p-10 text-center">
              <div className="relative mx-auto mb-5 flex h-28 w-28 animate-[pulse-ring_2.5s_ease-out_infinite] items-center justify-center rounded-full border-2 border-primary/20">
                <div className="h-14 w-14 animate-pulse rounded-full border-2 border-primary bg-primary/10" />
              </div>
              <p className="text-sm text-gray-500">
                <span className="whitespace-pre-line">{t("balance")}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
