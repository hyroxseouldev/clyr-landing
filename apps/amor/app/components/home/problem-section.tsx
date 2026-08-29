import React from "react";

const ProblemSection = () => {
  return (
    <section className="bg-[#0d0d0d] py-16 md:py-24" id="agitation">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary">
              Problem
            </span>

            <h2 className="mt-2 text-3xl font-extrabold leading-[1.15] md:text-4xl lg:text-[46px]">
              달리기만 잘한다고,
              <br />
              힘만 세다고 해결되지 않습니다.
            </h2>

            <p className="mt-3 text-[15px] text-gray-400 md:text-base">
              하이록스는 다릅니다. 단순한 체력 싸움이 아닌
              <br className="hidden md:block" />
              철저한 &apos;전환 전략&apos;과 &apos;페이스 분배&apos;의
              과학입니다.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "러닝 후 기능성 운동(Sled, Burpee 등)으로 전환할 때 페이스가 무너지나요?",
                "나에게 맞는 체계적인 하이록스 전용 루틴을 몰라 헤매고 계시나요?",
                "대회 후반부, Wall Ball Shots에서 유독 기록이 지체되나요?",
              ].map((text, index) => (
                <div
                  key={index}
                  className="group motion-safe:animate-[fade-up_0.5s_ease-out_both] flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4 text-[15px] transition hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/5"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="mt-1 h-5 w-5 flex-shrink-0 rounded border-2 border-white/20 transition group-hover:border-primary" />
                  <p className="text-gray-300">
                    {text.includes("무너지나요") && (
                      <>
                        러닝 후 기능성 운동(Sled, Burpee 등)으로 전환할 때{" "}
                        <strong className="text-white">
                          페이스가 무너지나요?
                        </strong>
                      </>
                    )}
                    {text.includes("루틴") && (
                      <>
                        나에게 맞는 체계적인{" "}
                        <strong className="text-white">
                          하이록스 전용 루틴
                        </strong>
                        을 몰라 헤매고 계시나요?
                      </>
                    )}
                    {text.includes("Wall Ball") && (
                      <>
                        대회 후반부,{" "}
                        <strong className="text-white">Wall Ball Shots</strong>
                        에서 유독 기록이 지체되나요?
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex items-center gap-4 rounded-r-xl border-l-4 border-primary bg-primary/10 p-4 transition hover:bg-primary/15">
              <p className="text-sm text-gray-300 md:text-[15px]">
                <strong className="text-primary">💡 핵심 인사이트</strong> —
                하이록스는 단순한 체력 싸움이 아닌, 철저한 &apos;전환
                전략&apos;과 &apos;페이스 분배&apos;의 과학입니다.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-2xl border border-white/5 bg-gradient-to-br from-[#141414] to-[#1a1a1a] transition hover:border-primary/20">
            <div className="p-10 text-center">
              <div className="relative mx-auto mb-5 flex h-28 w-28 animate-[pulse-ring_2.5s_ease-out_infinite] items-center justify-center rounded-full border-2 border-primary/20">
                <div className="h-14 w-14 animate-pulse rounded-full border-2 border-primary bg-primary/10" />
              </div>
              <p className="text-sm text-gray-500">
                훈련 강도와 회복의 균형,
                <br />그 critical point가 당신의 기록을 결정합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
