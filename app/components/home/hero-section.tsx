"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const t = useTranslations("Home");
  const en = useLocale() === "en";
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (preference.matches) video.current?.pause();
      else void video.current?.play().catch(() => {});
    };
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  return (
    <section className="performance-hero" id="hero">
      <div className="hero-topline">
        <span>AMOR LAB / PERFORMANCE COACHING</span>
        <span>SEOUL, KR / ONLINE COACHING</span>
      </div>
      <div className="hero-stage">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" /> TRAIN WITH PURPOSE.
          </span>
          <h1 className="hero-display">
            BUILT
            <br />
            FOR <span>MORE.</span>
          </h1>
          <h2>
            {en
              ? "Your next level starts here."
              : "한계를 넘어, 다음 기록으로."}
          </h2>
          <p>{t("description")}</p>
          <div className="hero-actions">
            <Button asChild className="action-button">
              <a href="#pricing">
                {t("viewPrograms")}
                <ArrowUpRight />
              </a>
            </Button>
            <a className="text-link" href="#coach">
              {en ? "Meet your coach" : "코치 알아보기"}
              <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="hero-footnote">
            <span>01 — THE NEXT VERSION OF YOU</span>
            <a
              href="#agitation"
              aria-label={en ? "Discover our approach" : "훈련 방식 살펴보기"}
            >
              <ArrowDown size={18} />
            </a>
          </div>
        </div>
        <div className="hero-film">
          <video
            ref={video}
            src="/brand/hero-background.mp4"
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          <div className="film-shade" />
          <span className="film-label">IN THE WORK. / IN THE MOMENT.</span>
          <div className="film-caption">
            <span>
              EVERY REP.
              <br />
              EVERY RUN.
              <br />
              <strong>YOUR PROGRESS.</strong>
            </span>
            <Button
              variant="outline"
              size="icon"
              className="film-control"
              aria-label={
                playing
                  ? en
                    ? "Pause video"
                    : "영상 일시정지"
                  : en
                    ? "Play video"
                    : "영상 재생"
              }
              onClick={() => {
                if (playing) video.current?.pause();
                else void video.current?.play().catch(() => {});
              }}
            >
              {playing ? <Pause /> : <Play />}
            </Button>
          </div>
        </div>
      </div>
      <div className="training-strip">
        <span>RUNNING</span>
        <span aria-hidden="true">/</span>
        <span>STRENGTH</span>
        <span aria-hidden="true">/</span>
        <span>HYROX</span>
        <span aria-hidden="true">/</span>
        <span>YOUR NEXT PB</span>
        <ArrowUpRight aria-hidden="true" />
      </div>
    </section>
  );
}
