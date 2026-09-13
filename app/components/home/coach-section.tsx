"use client";

import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  {
    period: "2012 - 2016",
    title: "Korea National Sport University",
    description:
      "Major in skating and coaching · Top admission, honors graduate",
  },
  {
    period: "2016 - 2026",
    title: "Republic of Korea Special Warfare Command",
    description: "Captain · Completed specialized training",
    details: [
      "UN Peacekeeping Force in Lebanon (Dongmyeong Unit, Aug 2020 - May 2021)",
    ],
  },
  {
    period: "U-18",
    title: "Gwangyang Jecheol High School Football Team",
    description: "Elite athlete",
  },
  {
    period: "2013 - 2015",
    title: "Personal Trainer",
    description:
      "Program design based on movement patterns and body structure analysis, with performance and physique training",
  },
  {
    period: "2013 - 2015",
    title: "Spinning Instructor",
    description:
      "Led immersive group classes for dozens of participants using energy and music",
  },
  {
    period: "2025 - 2026",
    title: "Running Performance Coach",
    description:
      "Comfort 'Wild Horse' sessions · Running and lower-body strength coach",
    details: [
      "Comfort 'Strong Heart' half-marathon prep class A · Coach and pacer",
    ],
  },
] as const;

const englishCoachResults = [
  {
    title: "2026",
    items: [
      {
        rank: "🥇 1st",
        event: "Bangkok HYROX MEN (58:28)",
        year: "2026.08.13",
      },
      {
        rank: "🥇 1st",
        event: "Chiba HYROX MEN (1:00:20)",
        year: "2026.08.06",
      },
      {
        rank: "🥇 1st",
        event: "Incheon HYROX DOUBLES MEN (with Seunghyun Noh, 52:34)",
        year: "2026.05.15",
      },
      {
        rank: "🥇 1st",
        event: "Korea Incheon HYROX Open Doubles",
        year: "2026",
      },
      { rank: "🥇 1st", event: "Japan Osaka HYROX Pro Doubles", year: "2026" },
      { rank: "🥉 3rd", event: "Taiwan HYROX Open Singles", year: "2026" },
      {
        rank: "🥉 3rd",
        event: "China Beijing HYROX Open Singles [Sub-1]",
        year: "2026",
      },
      {
        rank: "🏅 4th",
        event: "China Beijing HYROX Pro Singles",
        year: "2026",
      },
    ],
  },
  {
    title: "2025",
    items: [
      {
        rank: "🥇 1st",
        event: "China Shenzhen HYROX Open Singles [Sub-1]",
        year: "2025",
      },
      {
        rank: "🥇 1st",
        event: "China Shenzhen HYROX Pro Doubles",
        year: "2025",
      },
      {
        rank: "🥇 1st",
        event: "China Shanghai HYROX Open Singles",
        year: "2025",
      },
      { rank: "🥇 1st", event: "Hong Kong HYROX Open Singles", year: "2025" },
      { rank: "🥇 1st", event: "Korea Incheon HYROX Men Relay", year: "2025" },
      {
        rank: "🥈 2nd",
        event: "China Shanghai HYROX Open Doubles",
        year: "2025",
      },
      { rank: "🥈 2nd", event: "Korea Seoul HYROX Open Singles", year: "2025" },
      { rank: "🥈 2nd", event: "Korea Seoul HYROX Open Doubles", year: "2025" },
      { rank: "🥈 2nd", event: "Korea Seoul HYROX Men Relay", year: "2025" },
      {
        rank: "🥉 3rd",
        event: "Korea Incheon HYROX Open Doubles",
        year: "2025",
      },
      { rank: "🏅 4th", event: "China Shanghai HYROX Men Relay", year: "2025" },
    ],
  },
  {
    title: "Fitness competitions",
    items: [
      { rank: "🥈 2nd", event: "NPCA Goyang Sports Model" },
      { rank: "🥈 2nd", event: "NPCA Yongin Sports Model" },
      { rank: "🥈 2nd", event: "NABBA Sports Model" },
    ],
  },
] as const;

const englishCoachRecords = [
  {
    title: "HYROX Performance",
    columns: "grid-cols-2 sm:grid-cols-4",
    items: [
      { category: "Open Single", value: "58:28", label: "SUB-1" },
      { category: "Pro Single", value: "1:05:25" },
      { category: "Open Double", value: "52:34" },
      { category: "Pro Double", value: "56:19" },
    ],
  },
  {
    title: "HYROX Korea official P'F&T fitness test",
    columns: "grid-cols-1",
    items: [{ category: "Korea ranking", value: "#1", label: "16:41" }],
  },
  {
    title: "Running Performance",
    columns: "grid-cols-3",
    items: [
      { category: "3km", value: "9:53" },
      { category: "5km", value: "16:55" },
      { category: "10km", value: "35:30" },
    ],
  },
] as const;

const englishCoachCompetencies = [
  "HYROX-specific running coaching",
  "Station-linked running strategy design",
  "Hybrid performance coaching",
  "HYROX race strategy design",
  "Integrated running and stretching programming",
  "Performance-based fitness improvement system",
  "Personalized coaching from beginners to athletes",
  "Sustainable fitness and performance planning",
  "Race feedback based on real competition experience",
  "Recovery, nutrition, and conditioning guidance",
] as const;
const englishCoachCertifications = [
  "Sports Massage Therapist",
  "Body Shape Management",
  "Level 2 Sports Instructor (Soccer)",
  "Level 2 Sports Instructor (Badminton)",
  "Recreation Instructor",
  "Special Combat Martial Arts 2nd Dan",
  "Judo 1st Dan",
  "Taekwondo 1st Dan",
] as const;

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
          items={
            locale === "en" ? englishCoachCertifications : coachCertifications
          }
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
  const t = useTranslations("Coach");
  const locale = useLocale();

  const tabs =
    locale === "en"
      ? coachTabs.map((tab, index) => ({
          ...tab,
          label: ["Career", "Race results", "Performance", "Credentials"][
            index
          ],
        }))
      : coachTabs;

  return (
    <section className="editorial-section coach-section" id="coach">
      <div className="section-index">
        <span>02 / MEET YOUR COACH</span>
        <span>EXPERIENCE, IN EVERY SESSION.</span>
      </div>
      <div className="coach-intro">
        <div className="coach-portrait">
          <Image
            src="/assets/coach_profile.webp"
            alt={
              locale === "en"
                ? "Coach Junhyun Jeon on the HYROX Shenzhen podium"
                : "하이록스 선전 시상대 위의 전준현 코치"
            }
            fill
            className="object-cover"
            sizes="(max-width: 760px) 100vw, 50vw"
          />
          <span>
            THE WORK.
            <br />
            THE PROOF.
          </span>
        </div>
        <div className="coach-story">
          <span className="eyebrow">ATHLETE FIRST. COACH ALWAYS.</span>
          <h2>
            {locale === "en" ? (
              <>
                In the arena.
                <br />
                <span>In your corner.</span>
              </>
            ) : (
              <>
                직접 뛰는 선수.
                <br />
                <span>함께 뛰는 코치.</span>
              </>
            )}
          </h2>
          <p>{t("bio")}</p>
          <div className="coach-signature">
            <strong>{locale === "en" ? "Junhyun Jeon" : "전준현"}</strong>
            <span>HEAD COACH / AMOR LAB</span>
          </div>
          <div className="coach-evidence">
            <div>
              <strong>59:25</strong>
              <span>HYROX SHENZHEN</span>
            </div>
            <div>
              <strong>01</strong>
              <span>MEN 30–34 / PODIUM</span>
            </div>
          </div>
        </div>
      </div>
      <Tabs defaultValue="career" className="coach-tabs">
        <TabsList className="coach-tab-list group-data-[orientation=horizontal]/tabs:h-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="coach-tab">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <ActivePanel activeTab={tab.id} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
