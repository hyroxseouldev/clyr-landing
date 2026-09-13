import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import React from "react";
import { landingProgramCards } from "@/data/program-catalog";
import { getProgramPricing } from "@/pricing";
import { useLocale, useTranslations } from "next-intl";

const PricingSection = () => {
  const t = useTranslations("Pricing");
  const locale = useLocale();
  const localizedCards =
    locale === "en"
      ? landingProgramCards.map((card, index) => ({
          ...card,
          name:
            [
              "Foundation 4-Week",
              "Race Preparation",
              "Running Class",
              "HYROX Stations",
            ][index] ?? card.name,
          description:
            [
              "A foundation program combining running and HYROX stations.",
              "Four weekly running and station sessions with in-person coaching.",
              "Running sessions tailored to your level and training intensity.",
              "Purpose-built station programming to strengthen weak points.",
            ][index] ?? card.description,
          features:
            [
              [
                "4-week class",
                "Integrated running + stations",
                "One in-person meeting and lesson",
                "Fundamentals tailored to your level",
              ],
              [
                "4-week class",
                "Four sessions per week",
                "Integrated running + station training",
                "Two in-person sessions and meetings",
              ],
              [
                "4-week class",
                "Three or four sessions per week",
                "Programming by running level and intensity",
                "Pacing and goal-specific running support",
              ],
              [
                "4-week class",
                "Three sessions per week",
                "Purpose-built station programming",
                "Strength-endurance work for weak points",
              ],
            ][index] ?? card.features,
        }))
      : landingProgramCards;
  function formatPrice(value: number) {
    return `₩${new Intl.NumberFormat("ko-KR").format(value)}`;
  }

  return (
    <section className="editorial-section programs-section" id="pricing">
      <div className="section-index">
        <span>04 / FIND YOUR PROGRAM</span>
        <span>BUILT AROUND YOU</span>
      </div>
      <div className="section-heading">
        <h2>
          {locale === "en" ? (
            <>
              Your goal.
              <br />
              <span>Your game plan.</span>
            </>
          ) : (
            <>
              목표는 다르게.
              <br />
              <span>훈련은 나답게.</span>
            </>
          )}
        </h2>
        <p>{t("description")}</p>
      </div>
      <div className="program-grid">
        {localizedCards.map((card, index) => {
          const pricing = getProgramPricing(card.programId);
          if (!pricing) return null;
          return (
            <article
              key={card.programId}
              className={`program-card ${card.isFeatured ? "program-featured" : ""}`}
            >
              <div className="program-meta">
                <span>PROGRAM / 0{index + 1}</span>
                {card.isFeatured && (
                  <span>{locale === "en" ? "COACH’S PICK" : "코치 추천"}</span>
                )}
              </div>
              <span className="program-english">
                {["FOUNDATION", "RACE READY", "RUNNING", "STATIONS"][index]}
              </span>
              <h3>{card.name}</h3>
              <p className="program-description">{card.description}</p>
              <div className="program-price">
                <strong>{formatPrice(pricing.regularPriceKrw)}</strong>
                <span>{t("perMonth")}</span>
              </div>
              <ul>
                {card.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={card.isFeatured ? "default" : "outline"}
                className="program-action"
              >
                <Link href={card.href}>
                  {locale === "en" ? "Choose program" : "프로그램 신청"}
                  <ArrowUpRight size={18} />
                </Link>
              </Button>
            </article>
          );
        })}
      </div>
      <div className="program-note">
        <span>{t("customWod")}</span>
        <span>{t("feedback")}</span>
        <a
          href="https://www.instagram.com/amor_jh.special/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {locale === "en"
            ? "Need help choosing? Talk to us"
            : "어떤 프로그램이 맞을지 고민된다면, 상담하기"}
          <ArrowUpRight size={15} />
        </a>
      </div>
    </section>
  );
};

export default PricingSection;
