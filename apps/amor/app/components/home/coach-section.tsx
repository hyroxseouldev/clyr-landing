import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image"; // Image 컴포넌트 import

const CoachSection = () => {
  const [activeTab, setActiveTab] = useState("career");

  const tabs = [
    { id: "career", label: "경력" },
    { id: "results", label: "대회 성적" },
    { id: "records", label: "퍼포먼스" },
    { id: "certs", label: "자격사항" },
  ];

  // 컨테이너 애니메이션
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  // 개별 아이템 애니메이션
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // 인용구 박스 애니메이션
  const quoteVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, delay: 0.3 },
    },
  };

  // 탭 콘텐츠 애니메이션
  const tabVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  return (
    <section className="bg-[#080808] py-16 md:py-24" id="coach">
      <div className="container mx-auto max-w-7xl px-6">
        {/* ====== 상단 영역 ====== */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.span
            variants={itemVariants}
            className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary"
          >
            Authority
          </motion.span>
          <motion.h2
            variants={itemVariants}
            className="mt-2 text-3xl font-extrabold leading-[1.15] md:text-4xl lg:text-[46px]"
          >
            실패를 겪어본 현역 선수가
            <br />
            가장 정확하게 가르칩니다.
          </motion.h2>
        </motion.div>

        {/* ====== 프로필 & 소개 영역 ====== */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-10"
        >
          {/* 좌측 프로필 이미지 */}
          <motion.div variants={itemVariants} className="relative">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/5 bg-[#111]">
              <Image
                src="/assets/coach_profile.jpeg"
                alt="전준현 코치"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent p-5 text-center">
                <div className="text-xl font-extrabold">전준현</div>
                <div className="text-xs font-semibold text-primary">
                  HYROX ELITE PERFORMANCE COACH
                </div>
              </div>
            </div>
          </motion.div>

          {/* 우측 텍스트 정보 */}
          <motion.div variants={itemVariants}>
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
                AMOR LAB — 대표 코치
              </div>
            </div>

            <motion.div
              variants={quoteVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-4 rounded-xl border-l-4 border-primary bg-white/5 p-4"
            >
              <p className="text-[14px] italic text-gray-300 md:text-[15px]">
                수많은 시행착오 끝에 찾아낸 하이록스 최적의 훈련 템포를 여러분께
                그대로 이식해 드립니다.
              </p>
              <span className="mt-1.5 block text-xs font-semibold text-primary not-italic">
                — 전준현, AMOR LAB 대표 코치
              </span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ====== 탭 영역 ====== */}
        <div className="mt-12">
          {/* 탭 버튼 */}
          <div className="tabs tabs-boxed gap-3 bg-transparent p-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab tab-sm rounded-full px-5 py-2 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? "tab-active border border-primary/30 bg-primary/10 text-primary"
                    : "border border-white/10 bg-white/5 text-gray-500 hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ====== 탭 콘텐츠 ====== */}
          <AnimatePresence mode="wait">
            {/* Career Panel */}
            {activeTab === "career" && (
              <motion.div
                key="career"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-white/5 p-5 transition hover:border-primary/15">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      2012 — 2016
                    </div>
                    <h4 className="mt-1.5 text-[15px] font-bold">
                      한국체육대학교
                    </h4>
                    <p className="text-[13px] text-gray-500">
                      빙상 및 지도전공 · 수석입학, 우수졸업
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-5 transition hover:border-primary/15">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      2016 — 2026
                    </div>
                    <h4 className="mt-1.5 text-[15px] font-bold">
                      대한민국 특수전 사령부
                    </h4>
                    <p className="text-[13px] text-gray-500">
                      대위 전역 · 각종 특수교육 이수
                    </p>
                    <ul className="mt-1.5 list-none space-y-0.5 text-[13px] text-gray-500">
                      <li className="relative pl-3 before:absolute before:left-0 before:text-primary before:content-['-']">
                        해외파병 레바논 UN 평화유지단 (동명부대,
                        2020.08-2021.05)
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-5 transition hover:border-primary/15">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      U-18
                    </div>
                    <h4 className="mt-1.5 text-[15px] font-bold">
                      광양제철고등학교 축구단
                    </h4>
                    <p className="text-[13px] text-gray-500">엘리트 선수</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-5 transition hover:border-primary/15">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      2013 — 2015
                    </div>
                    <h4 className="mt-1.5 text-[15px] font-bold">
                      퍼스널 트레이너
                    </h4>
                    <p className="text-[13px] text-gray-500">
                      움직임 패턴 및 신체 구조 분석 기반 프로그램 설계, 퍼포먼스
                      향상 및 체형 개선 트레이닝 운영
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-5 transition hover:border-primary/15">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      2013 — 2015
                    </div>
                    <h4 className="mt-1.5 text-[15px] font-bold">
                      스피닝 강사
                    </h4>
                    <p className="text-[13px] text-gray-500">
                      수십 명 규모 그룹 수업 리딩, 에너지와 음악을 활용한 몰입형
                      수업 운영
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-5 transition hover:border-primary/15">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      2025 — 2026
                    </div>
                    <h4 className="mt-1.5 text-[15px] font-bold">
                      러닝 퍼포먼스 코치
                    </h4>
                    <p className="text-[13px] text-gray-500">
                      컴포트 &apos;야생마&apos; 세션 — 러닝 및 하체 근력 강화
                      코치
                    </p>
                    <p className="text-[13px] text-gray-500">
                      컴포트 &apos;강심장&apos; 하프 마라톤 대비반 A조 — 코치 및
                      페이서
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Results Panel */}
            {activeTab === "results" && (
              <motion.div
                key="results"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-5"
              >
                <h3 className="mb-2 text-base font-bold text-primary">2026</h3>
                <div className="space-y-1.5">
                  {[
                    {
                      rank: "🥇 1위",
                      event: "방콕 HYROX MEN (58:28)",
                      year: "2026.08.13",
                    },
                    {
                      rank: "🥇 1위",
                      event: "치바 HYROX MEN (1:00:20)",
                      year: "2026.08.06",
                    },
                    {
                      rank: "🥇 1위",
                      event: "인천 HYROX DOUBLES MEN (with 승현 노, 52:34)",
                      year: "2026.05.15",
                    },
                    {
                      rank: "🥇 1위",
                      event: "한국 인천 HYROX 오픈 더블",
                      year: "2026",
                    },
                    {
                      rank: "🥇 1위",
                      event: "일본 오사카 HYROX 프로 더블",
                      year: "2026",
                    },
                    {
                      rank: "🥉 3위",
                      event: "대만 HYROX 오픈 싱글",
                      year: "2026",
                    },
                    {
                      rank: "🥉 3위",
                      event: "중국 베이징 HYROX 오픈 싱글 [Sub-1]",
                      year: "2026",
                    },
                    {
                      rank: "🏅 4위",
                      event: "중국 베이징 HYROX 프로 싱글",
                      year: "2026",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-2.5 text-sm text-gray-300 transition hover:border-primary/15 hover:bg-primary/5"
                    >
                      <span className="min-w-[48px] text-xs font-bold text-primary">
                        {item.rank}
                      </span>
                      <span className="flex-1 text-[13px]">{item.event}</span>
                      <span className="text-[11px] text-gray-600">
                        {item.year}
                      </span>
                    </div>
                  ))}
                </div>

                <h3 className="mb-2 mt-5 text-base font-bold text-primary">
                  2025
                </h3>
                <div className="space-y-1.5">
                  {[
                    {
                      rank: "🥇 1위",
                      event: "중국 선전 HYROX 오픈 싱글 [Sub-1]",
                      year: "2025",
                    },
                    {
                      rank: "🥇 1위",
                      event: "중국 선전 HYROX 프로 더블",
                      year: "2025",
                    },
                    {
                      rank: "🥇 1위",
                      event: "중국 상하이 HYROX 오픈 싱글",
                      year: "2025",
                    },
                    {
                      rank: "🥇 1위",
                      event: "홍콩 HYROX 오픈 싱글",
                      year: "2025",
                    },
                    {
                      rank: "🥇 1위",
                      event: "한국 인천 HYROX 맨 릴레이",
                      year: "2025",
                    },
                    {
                      rank: "🥈 2위",
                      event: "중국 상하이 HYROX 오픈 더블",
                      year: "2025",
                    },
                    {
                      rank: "🥈 2위",
                      event: "한국 서울 HYROX 오픈 싱글",
                      year: "2025",
                    },
                    {
                      rank: "🥈 2위",
                      event: "한국 서울 HYROX 오픈 더블",
                      year: "2025",
                    },
                    {
                      rank: "🥈 2위",
                      event: "한국 서울 HYROX 맨 릴레이",
                      year: "2025",
                    },
                    {
                      rank: "🥉 3위",
                      event: "한국 인천 HYROX 오픈 더블",
                      year: "2025",
                    },
                    {
                      rank: "🏅 4위",
                      event: "중국 상하이 HYROX 맨 릴레이",
                      year: "2025",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-2.5 text-sm text-gray-300 transition hover:border-primary/15 hover:bg-primary/5"
                    >
                      <span className="min-w-[48px] text-xs font-bold text-primary">
                        {item.rank}
                      </span>
                      <span className="flex-1 text-[13px]">{item.event}</span>
                      <span className="text-[11px] text-gray-600">
                        {item.year}
                      </span>
                    </div>
                  ))}
                </div>

                <h3 className="mb-2 mt-5 text-base font-bold text-primary">
                  🏆 피트니스 대회
                </h3>
                <div className="space-y-1.5">
                  {[
                    { rank: "🥈 2위", event: "NPCA 고양 스포츠모델" },
                    { rank: "🥈 2위", event: "NPCA 용인 스포츠모델" },
                    { rank: "🥈 2위", event: "NABBA 스포츠모델" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-2.5 text-sm text-gray-300 transition hover:border-primary/15 hover:bg-primary/5"
                    >
                      <span className="min-w-[48px] text-xs font-bold text-primary">
                        {item.rank}
                      </span>
                      <span className="flex-1 text-[13px]">{item.event}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Records Panel */}
            {activeTab === "records" && (
              <motion.div
                key="records"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-5"
              >
                <div className="mb-5">
                  <h4 className="mb-2.5 text-sm font-bold text-primary">
                    HYROX 퍼포먼스
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { cat: "Open Single", val: "58:28", label: "SUB-1" },
                      { cat: "Pro Single", val: "1:05:25", label: "" },
                      { cat: "Open Double", val: "52:34", label: "" },
                      { cat: "Pro Double", val: "56:19", label: "" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-white/5 bg-white/5 p-4 text-center transition hover:border-primary/20"
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                          {item.cat}
                        </div>
                        <div className="my-1.5 text-2xl font-extrabold text-primary">
                          {item.val}
                        </div>
                        {item.label && (
                          <div className="text-[11px] text-gray-500">
                            {item.label}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <h4 className="mb-2.5 text-sm font-bold text-primary">
                    하이록스 코리아 공식 체력능력 테스트 P&apos;F&T
                  </h4>
                  <div className="grid grid-cols-1">
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-center transition hover:border-primary/20">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        한국 랭킹
                      </div>
                      <div className="my-1.5 text-2xl font-extrabold text-primary">
                        #1
                      </div>
                      <div className="text-[11px] text-gray-500">16:41</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2.5 text-sm font-bold text-primary">
                    러닝 퍼포먼스
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { cat: "3km", val: "9:53" },
                      { cat: "5km", val: "16:55" },
                      { cat: "10km", val: "35:30" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-white/5 bg-white/5 p-4 text-center transition hover:border-primary/20"
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                          {item.cat}
                        </div>
                        <div className="my-1.5 text-2xl font-extrabold text-primary">
                          {item.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Certs Panel */}
            {activeTab === "certs" && (
              <motion.div
                key="certs"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-primary">
                      핵심 역량
                    </h4>
                    <ul className="space-y-1.5">
                      {[
                        "HYROX 특화 러닝 코칭",
                        "스테이션 연계 러닝 전략 설계",
                        "하이브리드 퍼포먼스 코칭",
                        "HYROX 레이스 전략 설계",
                        "러닝 & 스트레칭 통합 프로그래밍",
                        "퍼포먼스 기반 체력 향상 시스템",
                        "초보자부터 선수까지 맞춤 코칭",
                        "지속 가능한 체력과 수행능력 설계",
                        "실전 경험 기반 레이스 피드백",
                        "회복 · 영양 · 컨디셔닝 가이드",
                      ].map((item) => (
                        <li
                          key={item}
                          className="rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-[13px] text-gray-300"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-primary">
                      자격 사항
                    </h4>
                    <ul className="space-y-1.5">
                      {[
                        "스포츠 마사지사 자격증",
                        "체형관리사 자격증",
                        "생활체육 지도사 2급 (축구)",
                        "생활체육 지도사 2급 (배드민턴)",
                        "레크레이션 자격증",
                        "특공무술 2단",
                        "유도 1단",
                        "태권도 1단",
                      ].map((item) => (
                        <li
                          key={item}
                          className="rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-[13px] text-gray-300"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default CoachSection;
