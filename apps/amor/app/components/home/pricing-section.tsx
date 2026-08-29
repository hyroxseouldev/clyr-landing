import React from "react";
import { getProgramPricing } from "@/pricing";

// ===== Types =====
interface PriceCard {
  programId: string;
  regularText: string;
  name: string;
  description: string;
  features: string[];
  href: string;
  isFeatured?: boolean;
}

const PricingSection = () => {
  // ===== Data =====
  const landingPriceCards: PriceCard[] = [
    {
      programId: "06a42964-2aa4-4287-a724-32fb8526e2df",
      regularText: "₩150,000",
      name: "기본 4주반",
      description:
        "러닝 + 스테이션 통합 기본반. 하이록스를 처음 시작하거나 레이스 경험이 적은 분을 위한 4주 프로그램입니다.",
      features: [
        "4주 클래스",
        "러닝 + 스테이션 통합 구성",
        "4주 마지막 대면 미팅 및 레슨 1회",
        "개인 수준에 맞춘 기본 훈련 방향 제공",
      ],
      href: "/order?program=06a42964-2aa4-4287-a724-32fb8526e2df",
    },
    {
      programId: "0d925d9f-bdb1-4e34-ae70-5609faa20983",
      regularText: "₩300,000",
      name: "대회준비반",
      description:
        "구체적인 목표 기록 달성, 포디움, 대회 완주 전략까지 준비하는 러닝 + 스테이션 통합 클래스입니다.",
      features: [
        "4주 클래스",
        "일주일에 4회 프로그램 제공",
        "러닝 + 스테이션 통합 훈련",
        "2주 간격 대면 훈련 및 미팅, 총 2회 진행",
      ],
      href: "/order?program=0d925d9f-bdb1-4e34-ae70-5609faa20983",
      isFeatured: true,
    },
    {
      programId: "8f81d9f1-8559-4fd8-bbe9-c49779770461",
      regularText: "₩200,000",
      name: "러닝 클래스",
      description:
        "하이록스에서 러닝 페이스가 무너지거나, 러닝 구간 기록을 집중적으로 끌어올리고 싶은 분을 위한 클래스입니다.",
      features: [
        "4주 클래스",
        "일주일에 3회 또는 4회",
        "러닝 수준과 강도에 따른 프로그램 제공",
        "개인별 페이스와 목표에 맞춘 러닝 보완",
      ],
      href: "/order?program=8f81d9f1-8559-4fd8-bbe9-c49779770461",
    },
    {
      programId: "c881344f-267c-4aa4-ad49-008e4275ec1f",
      regularText: "₩200,000",
      name: "하이록스 스테이션",
      description:
        "러닝은 자신 있지만 스테이션에 부담이 있거나, 종목별 목적에 맞는 보완 훈련이 필요한 분을 위한 4주 클래스입니다.",
      features: [
        "4주 클래스",
        "일주일에 3회 프로그램 제공",
        "스테이션별 목적 훈련 프로그래밍",
        "부족한 구간을 보완하는 근지구력 훈련",
      ],
      href: "/order?program=c881344f-267c-4aa4-ad49-008e4275ec1f",
    },
  ];

  // ===== Helper Functions =====
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
          {landingPriceCards.map((card) => {
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
