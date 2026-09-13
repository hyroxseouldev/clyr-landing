import React from "react";
import { useLocale, useTranslations } from "next-intl";

const SocialProofSection = () => {
  const t = useTranslations("Social");
  const locale = useLocale();
  const testimonials = [
    {
      badge: "🔥 20분 단축",
      stat: "1:40 → 1:20",
      text: "첫 대회 1시간 40분대였는데, 코칭 받고 1시간 20분대로 20분이나 단축했습니다. 페이싱 전략이 이렇게 중요한지 몰랐어요.",
      author: "A",
      tag: "30대 직장인 · HYROX 3회 참가",
    },
    {
      badge: "🔥 퍼짐 제로",
      stat: "완주 만족도 ↑",
      text: "늘 샌드백과 슬레드에서 퍼졌는데, 구간별 페이싱 알려주신 대로 하니 지치지 않고 완주했습니다. 크로스핏터라면 꼭 들어야 할 코칭!",
      author: "B",
      tag: "크로스핏터 · HYROX 첫 도전",
    },
    {
      badge: "🔥 Wall Ball 극복",
      stat: "구간 기록 40% 향상",
      text: "Wall Ball에서 항상 막혔는데, 자세 교정 받고 나니까 후반부에도 안정적인 페이스 유지가 가능해졌어요. 영상 피드백이 진짜 도움 됩니다.",
      author: "C",
      tag: "HYROX Pro Division 참가자",
    },
    {
      badge: "🔥 체력 빌드업",
      stat: "RPE 안정화 성공",
      text: "하이록스가 처음이라 걱정했는데, 내 체력 수준에 맞춰서 천천히 빌드업할 수 있게 프로그램을 짜줘서 부상 없이 준비할 수 있었습니다.",
      author: "D",
      tag: "일반 헬스 출신 · HYROX 입문",
    },
  ];

  const localizedTestimonials =
    locale === "en"
      ? testimonials.map((item, index) => ({
          ...item,
          badge: [
            "🔥 20 min faster",
            "🔥 No blow-ups",
            "🔥 Wall Ball breakthrough",
            "🔥 Built-up fitness",
          ][index],
          stat: [
            "1:40 → 1:20",
            "Finished feeling strong",
            "40% segment improvement",
            "Stable RPE",
          ][index],
          text: [
            "I cut 20 minutes from my first HYROX time after learning how important pacing strategy really is.",
            "I used to fade on the sandbag and sled, but the segment pacing helped me finish without running out of energy.",
            "Form corrections helped me maintain a steady pace through the second half. The video feedback made a real difference.",
            "I was nervous as a beginner, but the program helped me build up gradually and prepare without injury.",
          ][index],
          tag: [
            "Office worker in their 30s · 3 HYROX races",
            "CrossFit athlete · First HYROX",
            "HYROX Pro Division athlete",
            "From a regular gym · HYROX beginner",
          ][index],
        }))
      : testimonials;

  return (
    <section className="editorial-section community-section" id="proof">
      <div className="community-heading">
        <span className="eyebrow">SMALL WINS. BIG CHANGES.</span>
        <h2>
          {locale === "en"
            ? "Progress looks different on everyone."
            : "각자의 출발점, 함께 만드는 변화."}
        </h2>
        <p>{t("description")}</p>
      </div>
      <div className="community-grid">
        {localizedTestimonials.map((item, index) => (
          <article key={item.author}>
            <span className="eyebrow">MEMBER STORY / 0{index + 1}</span>
            <h3>{item.stat}</h3>
            <blockquote>{item.text}</blockquote>
            <div className="community-author">
              <span>{item.author}</span>
              <p>{item.tag}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
export default SocialProofSection;
