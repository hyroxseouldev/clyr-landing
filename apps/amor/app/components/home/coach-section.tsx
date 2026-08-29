"use client";

import Image from "next/image";
import { useState } from "react";
import {
  CoachTabId,
  coachCareerItems,
  coachCertifications,
  coachCompetencies,
  coachRecords,
  coachResults,
  coachTabs,
} from "@/data/coach";

function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="motion-safe:animate-[fade-up_0.3s_ease-out_both] mt-5">
      {children}
    </div>
  );
}

function CareerPanel() {
  return (
    <PanelShell>
      <div className="grid gap-4 sm:grid-cols-2">
        {coachCareerItems.map((item) => (
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
  return (
    <PanelShell>
      <div className="space-y-5">
        {coachResults.map((group) => (
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
  return (
    <PanelShell>
      <div className="space-y-5">
        {coachRecords.map((group) => (
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
  return (
    <PanelShell>
      <div className="grid gap-5 sm:grid-cols-2">
        <ListPanel title="핵심 역량" items={coachCompetencies} />
        <ListPanel title="자격 사항" items={coachCertifications} />
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

  return (
    <section className="bg-[#080808] py-16 md:py-24" id="coach">
      <div className="container mx-auto max-w-7xl px-6">
        <div>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary">
            Authority
          </span>
          <h2 className="mt-2 text-3xl font-extrabold leading-[1.15] md:text-4xl lg:text-[46px]">
            실패를 겪어본 현역 선수가
            <br />
            가장 정확하게 가르칩니다.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div className="relative">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/5 bg-[#111]">
              <Image
                src="/assets/coach_profile.webp"
                alt="전준현 코치"
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent p-5 text-center">
                <div className="text-xl font-extrabold">전준현</div>
                <div className="text-xs font-semibold text-primary">
                  HYROX ELITE PERFORMANCE COACH
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[15px] text-gray-400 md:text-base">
              수많은 시행착오 끝에 찾아낸 하이록스 최적의 훈련 템포를
              <br />
              여러분께 그대로 이식해 드립니다.
            </p>

            <div className="mt-3">
              <span className="text-2xl font-extrabold">
                전준현{" "}
                <small className="text-sm font-medium text-gray-500">
                  | AMOR
                </small>
              </span>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                AMOR LAB - 대표 코치
              </div>
            </div>

            <div className="mt-4 rounded-xl border-l-4 border-primary bg-white/5 p-4">
              <p className="text-[14px] italic text-gray-300 md:text-[15px]">
                수많은 시행착오 끝에 찾아낸 하이록스 최적의 훈련 템포를 여러분께
                그대로 이식해 드립니다.
              </p>
              <span className="mt-1.5 block text-xs font-semibold text-primary not-italic">
                - 전준현, AMOR LAB 대표 코치
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="tabs tabs-boxed gap-3 bg-transparent p-0">
            {coachTabs.map((tab) => (
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
