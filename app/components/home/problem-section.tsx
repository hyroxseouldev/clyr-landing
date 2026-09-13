import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Activity, ScanLine, MessagesSquare } from "lucide-react";

export default function ProblemSection() {
  const en = useLocale() === "en";
  const t = useTranslations("Problem");
  const items = en
    ? [
        [
          "ASSESS",
          "Understand your starting point.",
          "Your current ability, movement and goals shape the plan. Training starts with understanding you.",
        ],
        [
          "BUILD",
          "Train with a clear purpose.",
          "Running and station work come together in a program built around your level and race goals.",
        ],
        [
          "REFINE",
          "Feedback. Adjust. Progress.",
          "Stay connected with your coach. Use video feedback to refine your movement and your next session.",
        ],
      ]
    : [
        [
          "ASSESS",
          "당신의 출발점부터.",
          "현재 수행 능력과 움직임, 목표를 살핍니다. 나를 제대로 아는 것에서 훈련은 시작됩니다.",
        ],
        [
          "BUILD",
          "이유 있는 훈련을.",
          "러닝과 스테이션을 하나의 흐름으로 연결합니다. 내 수준과 목표에 맞는 훈련을 쌓아갑니다.",
        ],
        [
          "REFINE",
          "피드백이 만드는 차이.",
          "코치와의 소통, 그리고 영상 피드백. 매 세션의 움직임을 다듬어 다음 훈련에 반영합니다.",
        ],
      ];
  const icons = [ScanLine, Activity, MessagesSquare];
  return (
    <section className="editorial-section method-section" id="agitation">
      <div className="section-index">
        <span>01 / THE APPROACH</span>
        <span>PRECISION OVER GUESSWORK</span>
      </div>
      <div className="section-heading">
        <h2>
          {en ? (
            <>
              Don’t just work harder.
              <br />
              <span>Train with intent.</span>
            </>
          ) : (
            <>
              더 많이, 보다
              <br />
              <span>더 정확하게.</span>
            </>
          )}
        </h2>
        <div>
          <p>{t("description")}</p>
          <a href="#pricing" className="text-link">
            {en ? "Find your program" : "나에게 맞는 프로그램"}
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <div className="method-grid">
        {items.map(([label, title, body], i) => {
          const Icon = icons[i];
          return (
            <article key={label}>
              <div className="method-top">
                <span>0{i + 1}</span>
                <Icon size={24} strokeWidth={1.3} />
              </div>
              <span className="eyebrow">{label}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
