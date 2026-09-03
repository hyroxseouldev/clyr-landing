"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CoachTabId,
  coachCareerItems,
  coachCertifications,
  coachCompetencies,
  coachRecords,
  coachResults,
  coachTabs,
} from "@/data/coach";

const englishCareerItems = [
  { period: "2012 - 2016", title: "Korea National Sport University", description: "Major in skating and coaching · Top admission, honors graduate" },
  { period: "2016 - 2026", title: "Republic of Korea Special Warfare Command", description: "Captain · Completed specialized training", details: ["UN Peacekeeping Force in Lebanon (Dongmyeong Unit, Aug 2020 - May 2021)"] },
  { period: "U-18", title: "Gwangyang Jecheol High School Football Team", description: "Elite athlete" },
  { period: "2013 - 2015", title: "Personal Trainer", description: "Program design based on movement patterns and body structure analysis, with performance and physique training" },
  { period: "2013 - 2015", title: "Spinning Instructor", description: "Led immersive group classes for dozens of participants using energy and music" },
  { period: "2025 - 2026", title: "Running Performance Coach", description: "Comfort 'Wild Horse' sessions · Running and lower-body strength coach", details: ["Comfort 'Strong Heart' half-marathon prep class A · Coach and pacer"] },
] as const;

const englishCoachResults = [
  { title: "2026", items: [
    { rank: "🥇 1st", event: "Bangkok HYROX MEN (58:28)", year: "2026.08.13" },
    { rank: "🥇 1st", event: "Chiba HYROX MEN (1:00:20)", year: "2026.08.06" },
    { rank: "🥇 1st", event: "Incheon HYROX DOUBLES MEN (with Seunghyun Noh, 52:34)", year: "2026.05.15" },
    { rank: "🥇 1st", event: "Korea Incheon HYROX Open Doubles", year: "2026" },
    { rank: "🥇 1st", event: "Japan Osaka HYROX Pro Doubles", year: "2026" },
    { rank: "🥉 3rd", event: "Taiwan HYROX Open Singles", year: "2026" },
    { rank: "🥉 3rd", event: "China Beijing HYROX Open Singles [Sub-1]", year: "2026" },
    { rank: "🏅 4th", event: "China Beijing HYROX Pro Singles", year: "2026" },
  ] },
  { title: "2025", items: [
    { rank: "🥇 1st", event: "China Shenzhen HYROX Open Singles [Sub-1]", year: "2025" },
    { rank: "🥇 1st", event: "China Shenzhen HYROX Pro Doubles", year: "2025" },
    { rank: "🥇 1st", event: "China Shanghai HYROX Open Singles", year: "2025" },
    { rank: "🥇 1st", event: "Hong Kong HYROX Open Singles", year: "2025" },
    { rank: "🥇 1st", event: "Korea Incheon HYROX Men Relay", year: "2025" },
    { rank: "🥈 2nd", event: "China Shanghai HYROX Open Doubles", year: "2025" },
    { rank: "🥈 2nd", event: "Korea Seoul HYROX Open Singles", year: "2025" },
    { rank: "🥈 2nd", event: "Korea Seoul HYROX Open Doubles", year: "2025" },
    { rank: "🥈 2nd", event: "Korea Seoul HYROX Men Relay", year: "2025" },
    { rank: "🥉 3rd", event: "Korea Incheon HYROX Open Doubles", year: "2025" },
    { rank: "🏅 4th", event: "China Shanghai HYROX Men Relay", year: "2025" },
  ] },
  { title: "Fitness competitions", items: [
    { rank: "🥈 2nd", event: "NPCA Goyang Sports Model" },
    { rank: "🥈 2nd", event: "NPCA Yongin Sports Model" },
    { rank: "🥈 2nd", event: "NABBA Sports Model" },
  ] },
] as const;

const englishCoachRecords = [
  { title: "HYROX Performance", columns: "grid-cols-2 sm:grid-cols-4", items: [
    { category: "Open Single", value: "58:28", label: "SUB-1" }, { category: "Pro Single", value: "1:05:25" }, { category: "Open Double", value: "52:34" }, { category: "Pro Double", value: "56:19" },
  ] },
  { title: "HYROX Korea official P'F&T fitness test", columns: "grid-cols-1", items: [{ category: "Korea ranking", value: "#1", label: "16:41" }] },
  { title: "Running Performance", columns: "grid-cols-3", items: [
    { category: "3km", value: "9:53" }, { category: "5km", value: "16:55" }, { category: "10km", value: "35:30" },
  ] },
] as const;

const englishCoachCompetencies = ["HYROX-specific running coaching", "Station-linked running strategy design", "Hybrid performance coaching", "HYROX race strategy design", "Integrated running and stretching programming", "Performance-based fitness improvement system", "Personalized coaching from beginners to athletes", "Sustainable fitness and performance planning", "Race feedback based on real competition experience", "Recovery, nutrition, and conditioning guidance"] as const;
const englishCoachCertifications = ["Sports Massage Therapist", "Body Shape Management", "Level 2 Sports Instructor (Soccer)", "Level 2 Sports Instructor (Badminton)", "Recreation Instructor", "Special Combat Martial Arts 2nd Dan", "Judo 1st Dan", "Taekwondo 1st Dan"] as const;

function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="motion-safe:animate-[fade-up_0.3s_ease-out_both] mt-5">
      {children}
    </div>
  );
}

function CareerPanel() {
  const locale = useLocale();
  const items = locale === "en" ? englishCareerItems : coachCareerItems;

  return (
    <PanelShell>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={`${item.period}-${item.title}`}
            className="rounded-xl border border-white/5 bg-white/5 p-5 transition hover:border-primary/15"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              {item.period}
            </div>
            <h4 className="mt-1.5 text-[15px] font-bold">{item.title}</h4>
            <p className="text-[13px] text-gray-500">{item.description}</p>
            {item.details ? (
              <ul className="mt-1.5 list-none space-y-0.5 text-[13px] text-gray-500">
                {item.details.map((detail) => (
                  <li
                    key={detail}
                    className="relative pl-3 before:absolute before:left-0 before:text-primary before:content-['-']"
                  >
                    {detail}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function ResultsPanel() {
  const locale = useLocale();
  const results = locale === "en" ? englishCoachResults : coachResults;

  return (
    <PanelShell>
      <div className="space-y-5">
        {results.map((group) => (
          <section key={group.title}>
            <h3 className="mb-2 text-base font-bold text-primary">
              {group.title}
            </h3>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <div
                  key={`${group.title}-${item.rank}-${item.event}`}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-2.5 text-sm text-gray-300 transition hover:border-primary/15 hover:bg-primary/5"
                >
                  <span className="min-w-[48px] text-xs font-bold text-primary">
                    {item.rank}
                  </span>
                  <span className="flex-1 text-[13px]">{item.event}</span>
                  {"year" in item ? (
                    <span className="text-[11px] text-gray-600">
                      {item.year}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PanelShell>
  );
}

function RecordsPanel() {
  const locale = useLocale();
  const records = locale === "en" ? englishCoachRecords : coachRecords;

  return (
    <PanelShell>
      <div className="space-y-5">
        {records.map((group) => (
          <section key={group.title}>
            <h4 className="mb-2.5 text-sm font-bold text-primary">
              {group.title}
            </h4>
            <div className={`grid gap-3 ${group.columns}`}>
              {group.items.map((item) => (
                <div
                  key={`${group.title}-${item.category}`}
                  className="rounded-xl border border-white/5 bg-white/5 p-4 text-center transition hover:border-primary/20"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {item.category}
                  </div>
                  <div className="my-1.5 text-2xl font-extrabold text-primary">
                    {item.value}
                  </div>
                  {item.label ? (
                    <div className="text-[11px] text-gray-500">
                      {item.label}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PanelShell>
  );
}

function ListPanel({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <div>
      <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-primary">
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-[13px] text-gray-300"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CertsPanel() {
  const locale = useLocale();
  const t = useTranslations("Coach");

  return (
    <PanelShell>
      <div className="grid gap-5 sm:grid-cols-2">
        <ListPanel
          title={t("competencies")}
          items={locale === "en" ? englishCoachCompetencies : coachCompetencies}
        />
        <ListPanel
          title={t("certifications")}
          items={locale === "en" ? englishCoachCertifications : coachCertifications}
        />
      </div>
    </PanelShell>
  );
}

function ActivePanel({ activeTab }: { activeTab: CoachTabId }) {
  if (activeTab === "career") return <CareerPanel />;
  if (activeTab === "results") return <ResultsPanel />;
  if (activeTab === "records") return <RecordsPanel />;
  return <CertsPanel />;
}

export default function CoachSection() {
  const [activeTab, setActiveTab] = useState<CoachTabId>("career");
  const t = useTranslations("Coach");
  const locale = useLocale();

  const tabs = locale === "en"
    ? coachTabs.map((tab, index) => ({
        ...tab,
        label: ["Career", "Race results", "Performance", "Credentials"][index],
      }))
    : coachTabs;

  return (
    <section className="bg-[#080808] py-16 md:py-24" id="coach">
      <div className="container mx-auto max-w-7xl px-6">
        <div>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary">
            Authority
          </span>
          <h2 className="mt-2 text-3xl font-extrabold leading-[1.15] md:text-4xl lg:text-[46px]">
            <span className="whitespace-pre-line">{t("title")}</span>
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div className="relative">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/5 bg-[#111]">
              <Image
                src="/assets/coach_profile.webp"
                alt={locale === "en" ? "Junhyun Jeon, HYROX coach" : "전준현 코치"}
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent p-5 text-center">
                <div className="text-xl font-extrabold">{locale === "en" ? "Junhyun Jeon" : "전준현"}</div>
                <div className="text-xs font-semibold text-primary">
                  HYROX ELITE PERFORMANCE COACH
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[15px] text-gray-400 md:text-base">
              <span className="whitespace-pre-line">{t("bio")}</span>
            </p>

            <div className="mt-3">
              <span className="text-2xl font-extrabold">
                {locale === "en" ? "Junhyun Jeon" : "전준현"}{" "}
                <small className="text-sm font-medium text-gray-500">
                  | AMOR
                </small>
              </span>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                {t("role")}
              </div>
            </div>

            <div className="mt-4 rounded-xl border-l-4 border-primary bg-white/5 p-4">
              <p className="text-[14px] italic text-gray-300 md:text-[15px]">
                {locale === "en"
                  ? "The HYROX pacing built through countless trials and errors, delivered directly to your training."
                  : "수많은 시행착오 끝에 찾아낸 하이록스 최적의 훈련 템포를 여러분께 그대로 이식해 드립니다."}
              </p>
              <span className="mt-1.5 block text-xs font-semibold text-primary not-italic">
                - {locale === "en" ? "Junhyun Jeon, AMOR LAB Head Coach" : "전준현, AMOR LAB 대표 코치"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="tabs tabs-boxed gap-3 bg-transparent p-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`tab tab-sm rounded-full px-5 py-2 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? "tab-active border border-primary/30 bg-primary/10 text-primary"
                    : "border border-white/10 bg-white/5 text-gray-500 hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                }`}
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={activeTab === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ActivePanel activeTab={activeTab} />
        </div>
      </div>
    </section>
  );
}
