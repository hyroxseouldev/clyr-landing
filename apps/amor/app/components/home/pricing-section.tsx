import React from "react";
import { landingProgramCards } from "@/data/program-catalog";
import { getProgramPricing } from "@/pricing";

const PricingSection = () => {
  function formatPrice(value: number) {
    return `₩${new Intl.NumberFormat("ko-KR").format(value)}`;
  }

  return (
    <section className="bg-[#0d0d0d] py-16 md:py-24" id="pricing">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary">
            Program & Pricing
          </span>
          <h2 className="mt-2 text-3xl font-extrabold leading-[1.15] md:text-4xl lg:text-[46px]">
            당신의 목표에 맞는
            <br />
            코칭 프로그램
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-gray-400 md:text-base">
            현재 수행 능력과 목표에 따라 맞춤 설계된 4가지 프로그램 중
            선택하세요.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] text-gray-300">
            <span className="text-base">⚙️</span> 1:1 맞춤형 WOD
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] text-gray-300">
            <span className="text-base">📊</span> 실시간 소통 및 피드백
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2 lg:max-w-6xl">
          {landingProgramCards.map((card) => {
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
                    🔥 추천
                  </div>
                )}

                <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {card.name}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">
                    {displayPrice}
                  </span>
                  <span className="text-sm text-gray-500">/ 1개월</span>
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
                  지원하기 →
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
