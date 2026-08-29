export type CoachTabId = "career" | "results" | "records" | "certs";

interface CoachCareerItem {
  period: string;
  title: string;
  description: string;
  details?: readonly string[];
}

export const coachTabs = [
  { id: "career", label: "경력" },
  { id: "results", label: "대회 성적" },
  { id: "records", label: "퍼포먼스" },
  { id: "certs", label: "자격사항" },
] as const satisfies readonly { id: CoachTabId; label: string }[];

export const coachCareerItems: readonly CoachCareerItem[] = [
  {
    period: "2012 - 2016",
    title: "한국체육대학교",
    description: "빙상 및 지도전공 · 수석입학, 우수졸업",
  },
  {
    period: "2016 - 2026",
    title: "대한민국 특수전 사령부",
    description: "대위 전역 · 각종 특수교육 이수",
    details: ["해외파병 레바논 UN 평화유지단 (동명부대, 2020.08-2021.05)"],
  },
  {
    period: "U-18",
    title: "광양제철고등학교 축구단",
    description: "엘리트 선수",
  },
  {
    period: "2013 - 2015",
    title: "퍼스널 트레이너",
    description:
      "움직임 패턴 및 신체 구조 분석 기반 프로그램 설계, 퍼포먼스 향상 및 체형 개선 트레이닝 운영",
  },
  {
    period: "2013 - 2015",
    title: "스피닝 강사",
    description: "수십 명 규모 그룹 수업 리딩, 에너지와 음악을 활용한 몰입형 수업 운영",
  },
  {
    period: "2025 - 2026",
    title: "러닝 퍼포먼스 코치",
    description: "컴포트 '야생마' 세션 - 러닝 및 하체 근력 강화 코치",
    details: ["컴포트 '강심장' 하프 마라톤 대비반 A조 - 코치 및 페이서"],
  },
] as const;

export const coachResults = [
  {
    title: "2026",
    items: [
      { rank: "1위", event: "방콕 HYROX MEN (58:28)", year: "2026.08.13" },
      { rank: "1위", event: "치바 HYROX MEN (1:00:20)", year: "2026.08.06" },
      {
        rank: "1위",
        event: "인천 HYROX DOUBLES MEN (with 승현 노, 52:34)",
        year: "2026.05.15",
      },
      { rank: "1위", event: "한국 인천 HYROX 오픈 더블", year: "2026" },
      { rank: "1위", event: "일본 오사카 HYROX 프로 더블", year: "2026" },
      { rank: "3위", event: "대만 HYROX 오픈 싱글", year: "2026" },
      { rank: "3위", event: "중국 베이징 HYROX 오픈 싱글 [Sub-1]", year: "2026" },
      { rank: "4위", event: "중국 베이징 HYROX 프로 싱글", year: "2026" },
    ],
  },
  {
    title: "2025",
    items: [
      { rank: "1위", event: "중국 선전 HYROX 오픈 싱글 [Sub-1]", year: "2025" },
      { rank: "1위", event: "중국 선전 HYROX 프로 더블", year: "2025" },
      { rank: "1위", event: "중국 상하이 HYROX 오픈 싱글", year: "2025" },
      { rank: "1위", event: "홍콩 HYROX 오픈 싱글", year: "2025" },
      { rank: "1위", event: "한국 인천 HYROX 맨 릴레이", year: "2025" },
      { rank: "2위", event: "중국 상하이 HYROX 오픈 더블", year: "2025" },
      { rank: "2위", event: "한국 서울 HYROX 오픈 싱글", year: "2025" },
      { rank: "2위", event: "한국 서울 HYROX 오픈 더블", year: "2025" },
      { rank: "2위", event: "한국 서울 HYROX 맨 릴레이", year: "2025" },
      { rank: "3위", event: "한국 인천 HYROX 오픈 더블", year: "2025" },
      { rank: "4위", event: "중국 상하이 HYROX 맨 릴레이", year: "2025" },
    ],
  },
  {
    title: "피트니스 대회",
    items: [
      { rank: "2위", event: "NPCA 고양 스포츠모델" },
      { rank: "2위", event: "NPCA 용인 스포츠모델" },
      { rank: "2위", event: "NABBA 스포츠모델" },
    ],
  },
] as const;

export const coachRecords = [
  {
    title: "HYROX 퍼포먼스",
    columns: "grid-cols-2 sm:grid-cols-4",
    items: [
      { category: "Open Single", value: "58:28", label: "SUB-1" },
      { category: "Pro Single", value: "1:05:25" },
      { category: "Open Double", value: "52:34" },
      { category: "Pro Double", value: "56:19" },
    ],
  },
  {
    title: "하이록스 코리아 공식 체력능력 테스트 P'F&T",
    columns: "grid-cols-1",
    items: [{ category: "한국 랭킹", value: "#1", label: "16:41" }],
  },
  {
    title: "러닝 퍼포먼스",
    columns: "grid-cols-3",
    items: [
      { category: "3km", value: "9:53" },
      { category: "5km", value: "16:55" },
      { category: "10km", value: "35:30" },
    ],
  },
] as const;

export const coachCompetencies = [
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
] as const;

export const coachCertifications = [
  "스포츠 마사지사 자격증",
  "체형관리사 자격증",
  "생활체육 지도사 2급 (축구)",
  "생활체육 지도사 2급 (배드민턴)",
  "레크레이션 자격증",
  "특공무술 2단",
  "유도 1단",
  "태권도 1단",
] as const;
