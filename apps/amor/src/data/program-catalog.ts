import { programs } from "./programs";

export const landingProgramDetails: Record<
  string,
  {
    features: readonly string[];
    isFeatured?: boolean;
  }
> = {
  "06a42964-2aa4-4287-a724-32fb8526e2df": {
    features: [
      "4주 클래스",
      "러닝 + 스테이션 통합 구성",
      "4주 마지막 대면 미팅 및 레슨 1회",
      "개인 수준에 맞춘 기본 훈련 방향 제공",
    ],
  },
  "0d925d9f-bdb1-4e34-ae70-5609faa20983": {
    features: [
      "4주 클래스",
      "일주일에 4회 프로그램 제공",
      "러닝 + 스테이션 통합 훈련",
      "2주 간격 대면 훈련 및 미팅, 총 2회 진행",
    ],
    isFeatured: true,
  },
  "8f81d9f1-8559-4fd8-bbe9-c49779770461": {
    features: [
      "4주 클래스",
      "일주일에 3회 또는 4회",
      "러닝 수준과 강도에 따른 프로그램 제공",
      "개인별 페이스와 목표에 맞춘 러닝 보완",
    ],
  },
  "c881344f-267c-4aa4-ad49-008e4275ec1f": {
    features: [
      "4주 클래스",
      "일주일에 3회 프로그램 제공",
      "스테이션별 목적 훈련 프로그래밍",
      "부족한 구간을 보완하는 근지구력 훈련",
    ],
  },
};

export const sortedPrograms = [...programs].sort(
  (a, b) => a.display_order - b.display_order,
);

export const landingProgramCards = sortedPrograms.map((program) => ({
  programId: program.id,
  name: program.title,
  description: program.description,
  features: landingProgramDetails[program.id]?.features ?? [],
  href: `/order?program=${program.id}`,
  isFeatured: landingProgramDetails[program.id]?.isFeatured,
}));
