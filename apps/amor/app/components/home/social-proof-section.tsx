import React from "react";

const SocialProofSection = () => {
  const testimonials = [
    {
      badge: "🔥 20분 단축",
      stat: "1:40 → 1:20",
      text: "첫 대회 1시간 40분대였는데, 코칭 받고 1시간 20분대로 20분이나 단축했습니다. 페이싱 전략이 이렇게 중요한지 몰랐어요.",
      author: "A님",
      tag: "30대 직장인 · HYROX 3회 참가",
    },
    {
      badge: "🔥 퍼짐 제로",
      stat: "완주 만족도 ↑",
      text: "늘 샌드백과 슬레드에서 퍼졌는데, 구간별 페이싱 알려주신 대로 하니 지치지 않고 완주했습니다. 크로스핏터라면 꼭 들어야 할 코칭!",
      author: "B님",
      tag: "크로스핏터 · HYROX 첫 도전",
    },
    {
      badge: "🔥 Wall Ball 극복",
      stat: "구간 기록 40% 향상",
      text: "Wall Ball에서 항상 막혔는데, 자세 교정 받고 나니까 후반부에도 안정적인 페이스 유지가 가능해졌어요. 영상 피드백이 진짜 도움 됩니다.",
      author: "C님",
      tag: "HYROX Pro Division 참가자",
    },
    {
      badge: "🔥 체력 빌드업",
      stat: "RPE 안정화 성공",
      text: "하이록스가 처음이라 걱정했는데, 내 체력 수준에 맞춰서 천천히 빌드업할 수 있게 프로그램을 짜줘서 부상 없이 준비할 수 있었습니다.",
      author: "D님",
      tag: "일반 헬스 출신 · HYROX 입문",
    },
  ];

  const allTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="overflow-hidden bg-[#080808] py-16 md:py-24" id="proof">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary">
            Testimonials
          </span>
          <h2 className="mt-2 text-3xl font-extrabold leading-[1.15] md:text-4xl lg:text-[46px]">
            이미 많은 멤버들이
            <br />
            한계를 깨부수고 있습니다
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-gray-400 md:text-base">
            AMOR LAB과 함께 기록을 경신한 크루들의 생생한 후기입니다.
          </p>
        </div>
      </div>

      <div className="mt-7 overflow-hidden">
        <div className="marquee-track flex w-max gap-4">
          {allTestimonials.map((t, index) => (
            <div
              key={index}
              className="w-[340px] flex-shrink-0 rounded-2xl border border-white/5 bg-gradient-to-b from-[#141414] to-[#111] p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-primary/10 text-primary text-[10px] font-bold">
                  {t.badge}
                </span>
                <span className="text-base font-extrabold text-primary">
                  {t.stat}
                </span>
              </div>
              <p className="mt-3 text-[14px] text-gray-300">{t.text}</p>
              <div className="mt-4 flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {t.author[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-200">
                    {t.author}
                  </div>
                  <div className="text-[11px] text-gray-500">{t.tag}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6">
        <div className="mt-10 text-center">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-black transition hover:bg-[#d4ff5a] hover:shadow-[0_0_30px_rgba(198,255,51,0.25)] hover:-translate-y-0.5"
          >
            나도 기록 단축 도전하기 →
          </a>
        </div>
      </div>

    </section>
  );
};

export default SocialProofSection;
