export const EARLY_BIRD_END_AT_MS = Date.parse("2026-06-06T15:00:00.000Z");

export type ProgramPricing = {
  programId: string;
  regularPriceKrw: number;
  earlyBirdPriceKrw: number;
  earlyBirdDiscountLabel: string;
};

export const programPricing: Record<string, ProgramPricing> = {
  "06a42964-2aa4-4287-a724-32fb8526e2df": {
    programId: "06a42964-2aa4-4287-a724-32fb8526e2df",
    regularPriceKrw: 150000,
    earlyBirdPriceKrw: 105000,
    earlyBirdDiscountLabel: "얼리버드 30%",
  },
  "0d925d9f-bdb1-4e34-ae70-5609faa20983": {
    programId: "0d925d9f-bdb1-4e34-ae70-5609faa20983",
    regularPriceKrw: 300000,
    earlyBirdPriceKrw: 210000,
    earlyBirdDiscountLabel: "얼리버드 30%",
  },
  "8f81d9f1-8559-4fd8-bbe9-c49779770461": {
    programId: "8f81d9f1-8559-4fd8-bbe9-c49779770461",
    regularPriceKrw: 200000,
    earlyBirdPriceKrw: 160000,
    earlyBirdDiscountLabel: "얼리버드 20%",
  },
  "c881344f-267c-4aa4-ad49-008e4275ec1f": {
    programId: "c881344f-267c-4aa4-ad49-008e4275ec1f",
    regularPriceKrw: 200000,
    earlyBirdPriceKrw: 140000,
    earlyBirdDiscountLabel: "얼리버드 30%",
  },
};

export function isEarlyBirdActiveAt(nowMs: number) {
  return nowMs < EARLY_BIRD_END_AT_MS;
}

export function getPricingPhase(nowMs: number) {
  return isEarlyBirdActiveAt(nowMs) ? "early_bird" : "regular";
}
export function getProgramPricing(programId: string) {
  const pricing = programPricing[programId];
  if (!pricing) return null;

  const nowMs = Date.now();
  const earlyBirdActive = isEarlyBirdActiveAt(nowMs);

  return {
    ...pricing,
    pricingPhase: getPricingPhase(nowMs),
    finalPriceKrw: earlyBirdActive
      ? pricing.earlyBirdPriceKrw
      : pricing.regularPriceKrw,
  };
}
