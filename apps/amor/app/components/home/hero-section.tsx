import React from "react";
import { useTranslations } from "next-intl";

const HeroSection = () => {
  const t = useTranslations("Home");
  return (
    <section
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[#080808] py-12 md:min-h-[75vh] md:py-16 lg:min-h-[80vh] border-x border-base-content/10"
      id="hero"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        src="/brand/hero-background.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />

      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#080808]/90 via-[#080808]/70 to-[#080808]/40 lg:from-[#080808]/92 lg:via-[#080808]/72 lg:to-[#080808]/36" />

      <div className="container relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:pl-12">
        <div className="motion-safe:animate-[fade-up_0.6s_ease-out_both] flex max-w-3xl flex-col items-start text-left">
          <div className="motion-safe:animate-[fade-up_0.45s_ease-out_0.1s_both]">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary backdrop-blur-sm">
              🔥 {t("eyebrow")}
            </div>
          </div>

          <h1
            className="motion-safe:animate-[fade-up_0.55s_ease-out_0.2s_both] mt-4 text-3xl font-black leading-[1.1] tracking-tight md:text-4xl lg:text-5xl xl:text-[52px]"
          >
            <span className="whitespace-pre-line">{t("title")}</span>
          </h1>

          <p
            className="motion-safe:animate-[fade-up_0.55s_ease-out_0.3s_both] mt-3 max-w-md text-[14px] text-gray-300 md:text-[15px]"
          >
            <span className="whitespace-pre-line">{t("description")}</span>
          </p>

          <div
            className="motion-safe:animate-[fade-up_0.55s_ease-out_0.4s_both] mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
          >
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-primary/20 transition-all hover:bg-[#d4ff5a] hover:shadow-[0_0_40px_rgba(198,255,51,0.35)] hover:-translate-y-1"
            >
              {t("viewPrograms")}
            </a>
            <a
              href="#proof"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-primary hover:text-primary hover:bg-primary/5"
            >
              {t("viewReviews")}
            </a>
          </div>

          <div
            className="motion-safe:animate-[fade-up_0.55s_ease-out_0.5s_both] mt-8 flex flex-wrap gap-6 sm:gap-8"
          >
            <div className="group">
              <div className="text-xl font-extrabold text-primary transition group-hover:scale-110 md:text-2xl">
                20+
              </div>
              <div className="text-[10px] text-gray-400">
                {t("stats.experience")}
              </div>
            </div>
            <div className="group">
              <div className="text-xl font-extrabold text-primary transition group-hover:scale-110 md:text-2xl">
                SUB-1
              </div>
              <div className="text-[10px] text-gray-400">{t("stats.record")}</div>
            </div>
            <div className="group">
              <div className="text-xl font-extrabold text-primary transition group-hover:scale-110 md:text-2xl">
                #1
              </div>
              <div className="text-[10px] text-gray-400">
                {t("stats.improvement")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="motion-safe:animate-[fade-up_0.6s_ease-out_1.2s_both] absolute bottom-4 left-0 right-0 z-30 flex flex-col items-center gap-1 text-[9px] uppercase tracking-widest text-gray-400">
        <span className="animate-pulse">Scroll</span>
        <div className="h-2.5 w-2.5 rotate-45 animate-bounce border-b-2 border-r-2 border-gray-400" />
      </div>
    </section>
  );
};

export default HeroSection;
