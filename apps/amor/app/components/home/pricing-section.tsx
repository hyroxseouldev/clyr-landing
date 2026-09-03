import React from "react";
import { landingProgramCards } from "@/data/program-catalog";
import { getProgramPricing } from "@/pricing";
import { useLocale, useTranslations } from "next-intl";

const PricingSection = () => {
  const t = useTranslations("Pricing");
  const locale = useLocale();
  const localizedCards = locale === "en"
    ? landingProgramCards.map((card, index) => ({
        ...card,
        name: ["Foundation 4-Week", "Race Preparation", "Running Class", "HYROX Stations"][index] ?? card.name,
        description: [
          "A foundation program combining running and HYROX stations.",
          "Four weekly running and station sessions with in-person coaching.",
          "Running sessions tailored to your level and training intensity.",
          "Purpose-built station programming to strengthen weak points.",
        ][index] ?? card.description,
        features: [
          ["4-week class", "Integrated running + stations", "One in-person meeting and lesson", "Fundamentals tailored to your level"],
          ["4-week class", "Four sessions per week", "Integrated running + station training", "Two in-person sessions and meetings"],
          ["4-week class", "Three or four sessions per week", "Programming by running level and intensity", "Pacing and goal-specific running support"],
          ["4-week class", "Three sessions per week", "Purpose-built station programming", "Strength-endurance work for weak points"],
        ][index] ?? card.features,
      }))
    : landingProgramCards;
  function formatPrice(value: number) {
    return `₩${new Intl.NumberFormat("ko-KR").format(value)}`;
  }

  return (
    <section className="bg-[#0d0d0d] py-16 md:py-24" id="pricing">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary">
            {t("eyebrow")}
          </span>
          <h2 className="mt-2 text-3xl font-extrabold leading-[1.15] md:text-4xl lg:text-[46px]">
            <span className="whitespace-pre-line">{t("title")}</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-gray-400 md:text-base">
            {t("description")}
          </p>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] text-gray-300">
            <span className="text-base">⚙️</span> {t("customWod")}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] text-gray-300">
            <span className="text-base">📊</span> {t("feedback")}
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2 lg:max-w-6xl">
          {localizedCards.map((card) => {
            const pricing = getProgramPricing(card.programId);
            if (!pricing) return null;

            const displayPrice = formatPrice(pricing.regularPriceKrw);

            return (
              <div
                key={card.programId}
                className={`flex flex-col rounded-2xl border p-6 ${
                  card.isFeatured
                    ? "border-primary bg-gradient-to-b from-[#1a2000] to-[#151500]"
                    : "border-white/10 bg-gradient-to-b from-[#141414] to-[#111]"
                } transition hover:-translate-y-1 hover:border-primary/30`}
              >
                {card.isFeatured && (
                  <div className="badge badge-primary -mt-10 mx-auto mb-2 w-fit text-[10px] uppercase tracking-wider">
                    {t("recommended")}
                  </div>
                )}

                <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {card.name}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">
                    {displayPrice}
                  </span>
                  <span className="text-sm text-gray-500">{t("perMonth")}</span>
                </div>

                <p className="mt-3 text-[13px] text-gray-500">
                  {card.description}
                </p>

                <ul className="mt-4 flex-1 space-y-2 text-[13px] text-gray-300">
                  {card.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={card.href}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-bold transition ${
                    card.isFeatured
                      ? "bg-primary text-black hover:bg-[#d4ff5a] hover:shadow-[0_0_30px_rgba(198,255,51,0.25)] hover:-translate-y-0.5"
                      : "border border-white/10 bg-white/5 text-white hover:bg-primary hover:text-black"
                  }`}
                >
                  {t("apply")}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
