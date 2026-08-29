"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { programs } from "@/data/programs";
import { assertPublicSupabaseEnv, supabaseUrl, tenantId } from "@/env";
import { EARLY_BIRD_END_AT_MS, getProgramPricing } from "@/pricing";

// Define types with readonly support and flexible types
interface Product {
  is_active: boolean;
  price_krw: number;
  duration_options?: ReadonlyArray<{
    duration_months: number;
    price_krw: number;
    is_enabled: boolean;
  }>;
}

interface Program {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  difficulty?: string;
  days_per_week?: string | number; // Changed to accept both string and number
  daily_workout_minutes?: string | number; // Changed to accept both string and number
  coach_name?: string;
  display_order?: number;
  products?: ReadonlyArray<Product>;
}

interface Duration {
  duration_months: number;
  price_krw: number;
  is_enabled: boolean;
  pricingPhase?: string;
  regularPriceKrw?: number;
  finalPriceKrw?: number;
  regular_total_price_krw?: number;
}

interface PricingResult {
  finalPriceKrw?: number;
  regularPriceKrw?: number;
  pricingPhase?: string;
}

interface OrderPayload {
  programId: string;
  programName: string;
  storeName: string;
  buyerEmail: string;
  buyerGoal: string;
  paymentMethod: string;
  pricingPhase: string;
  regularPriceKrw: number;
  finalPriceKrw: number;
  regularTotalPriceKrw: number;
  monthlyPriceKrw: number;
  durationMonths: number;
  totalPriceKrw: number;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    holderName: string;
  };
}

const durationOptions: Duration[] = [1, 2, 3].map((months) => ({
  duration_months: months,
  price_krw: 0,
  is_enabled: true,
}));

const bankAccount = {
  bankName: "국민은행",
  accountNumber: "824001-04-091290",
  holderName: "전준현",
};

export default function OrderPageClient() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Duration | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const difficultyLabel = (difficulty?: string) =>
    ({
      beginner: "입문",
      intermediate: "중급",
      advanced: "상급",
    })[difficulty || ""] ||
    difficulty ||
    "-";

  const enabledDurations = (program: Program) => {
    const pricing = getProgramPricing(program.id) as PricingResult | undefined;
    const monthlyPrice =
      pricing?.finalPriceKrw ||
      program.products?.find((item) => item.is_active)?.price_krw ||
      99000;
    const regularMonthlyPrice = pricing?.regularPriceKrw || monthlyPrice;

    return durationOptions.map((option) => ({
      ...option,
      pricingPhase: pricing?.pricingPhase || "regular",
      regularPriceKrw: regularMonthlyPrice,
      finalPriceKrw: monthlyPrice,
      regular_total_price_krw: regularMonthlyPrice * option.duration_months,
      price_krw: monthlyPrice * option.duration_months,
    }));
  };

  const handleProgramChange = (programId: string) => {
    const program = programs.find((p) => p.id === programId);
    if (!program) return;
    setSelectedProgram(program as Program);
    const durations = enabledDurations(program as Program);
    setSelectedDuration(durations[0]);
  };

  const handleDurationChange = (index: number) => {
    if (!selectedProgram) return;
    const durations = enabledDurations(selectedProgram);
    setSelectedDuration(durations[index]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) return;

    const formData = new FormData(form);
    const program = selectedProgram;
    const duration = selectedDuration;

    if (!program || !duration) {
      alert("프로그램 정보를 확인할 수 없습니다. 다시 시도해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const monthlyPriceKrw = Math.round(
        duration.price_krw / duration.duration_months,
      );

      const orderPayload: OrderPayload = {
        programId: program.id,
        programName: program.title,
        storeName: "AMOR LAB 랜딩",
        buyerEmail: formData.get("buyerEmail") as string,
        buyerGoal: formData.get("goal") as string,
        paymentMethod: formData.get("paymentMethod") as string,
        pricingPhase: duration.pricingPhase || "regular",
        regularPriceKrw: duration.regularPriceKrw || duration.price_krw,
        finalPriceKrw: duration.finalPriceKrw || duration.price_krw,
        regularTotalPriceKrw:
          duration.regular_total_price_krw || duration.price_krw,
        monthlyPriceKrw,
        durationMonths: duration.duration_months,
        totalPriceKrw: duration.price_krw,
        bankAccount,
      };

      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-guest-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tenantId,
            buyerName: formData.get("buyerName"),
            buyerPhone: formData.get("buyerPhone"),
            orderPayload,
          }),
        },
      );

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || result.message || "주문 생성에 실패했습니다.",
        );
      }

      alert(
        `주문이 완료되었습니다.\n입금 계좌: ${bankAccount.bankName} ${bankAccount.accountNumber}\n예금주: ${bankAccount.holderName}`,
      );
      window.location.href = "/";
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      alert(`주문 처리 중 오류가 발생했습니다.\n${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    assertPublicSupabaseEnv();
    const sortedPrograms = [...programs].sort(
      (a, b) => (a.display_order || 0) - (b.display_order || 0),
    );
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("program");
    const program =
      sortedPrograms.find((item) => item.id === requestedId) ||
      sortedPrograms[0];
    if (program) {
      setSelectedProgram(program as Program);
      const durations = enabledDurations(program as Program);
      setSelectedDuration(durations[0]);
    }

    const nowMs = Date.now();
    const msUntilEarlyBirdEnds = EARLY_BIRD_END_AT_MS - nowMs;
    const timer =
      msUntilEarlyBirdEnds > 0
        ? setTimeout(() => {
            if (selectedProgram) {
              const durations = enabledDurations(selectedProgram);
              setSelectedDuration(durations[0]);
            }
          }, msUntilEarlyBirdEnds + 1000)
        : null;

    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to display values safely
  const displayValue = (value?: string | number) => {
    if (value === undefined || value === null) return "-";
    return value.toString();
  };

  if (!selectedProgram || !selectedDuration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const durations = enabledDurations(selectedProgram);
  const summaryProgram = selectedProgram;
  const summaryDuration = selectedDuration;

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
              Program Order
            </span>
            <h1 className="text-3xl md:text-4xl font-bold">프로그램 주문</h1>
          </div>
          <p className="text-sm text-base-content/60 max-w-md">
            선택한 코칭 프로그램 정보를 확인하고 주문자 정보와 결제 방법을
            입력해 주세요.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Program Selection */}
            <div className="card bg-base-200 shadow-xl border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-lg">프로그램 정보</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <figure className="aspect-square rounded-xl overflow-hidden bg-base-300 relative">
                      <Image
                        src={
                          selectedProgram.thumbnail_url || "/assets/record.png"
                        }
                        alt={selectedProgram.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </figure>
                  </div>

                  <div className="space-y-4">
                    {/* Program Select */}
                    <div className="form-control">
                      <label className="label pb-2">
                        <span className="label-text font-semibold">
                          프로그램 선택
                        </span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={selectedProgram.id}
                        onChange={(e) => handleProgramChange(e.target.value)}
                      >
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <h3 className="text-primary font-bold text-sm tracking-wide uppercase">
                        {selectedProgram.title}
                      </h3>
                      <p className="text-sm text-base-content/70 mt-1 whitespace-pre-line">
                        {selectedProgram.description}
                      </p>
                    </div>

                    {/* Duration Select */}
                    <div className="form-control">
                      <label className="label pb-2">
                        <span className="label-text font-semibold">
                          수강 기간
                        </span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={durations.findIndex(
                          (d) =>
                            d.duration_months ===
                            selectedDuration.duration_months,
                        )}
                        onChange={(e) =>
                          handleDurationChange(Number(e.target.value))
                        }
                      >
                        {durations.map((d, idx) => (
                          <option key={idx} value={idx}>
                            {d.duration_months}개월 · {formatPrice(d.price_krw)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-base-300/30 rounded-xl p-3 text-center">
                        <div className="text-xs text-base-content/50 font-semibold">
                          난이도
                        </div>
                        <div className="text-sm font-bold">
                          {difficultyLabel(selectedProgram.difficulty)}
                        </div>
                      </div>
                      <div className="bg-base-300/30 rounded-xl p-3 text-center">
                        <div className="text-xs text-base-content/50 font-semibold">
                          주간 훈련
                        </div>
                        <div className="text-sm font-bold">
                          주 {displayValue(selectedProgram.days_per_week)}회
                        </div>
                      </div>
                      <div className="bg-base-300/30 rounded-xl p-3 text-center">
                        <div className="text-xs text-base-content/50 font-semibold">
                          일일 시간
                        </div>
                        <div className="text-sm font-bold">
                          {displayValue(selectedProgram.daily_workout_minutes)}
                          분
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buyer Information */}
            <div className="card bg-base-200 shadow-xl border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-lg">주문자 정보</h2>

                <div className="space-y-5">
                  <div className="form-control">
                    <label className="label pb-2">
                      <span className="label-text font-semibold">이름</span>
                    </label>
                    <input
                      type="text"
                      id="buyerName"
                      name="buyerName"
                      className="input input-bordered w-full"
                      placeholder="홍길동"
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label pb-2">
                      <span className="label-text font-semibold">연락처</span>
                    </label>
                    <input
                      type="tel"
                      id="buyerPhone"
                      name="buyerPhone"
                      className="input input-bordered w-full"
                      placeholder="010-0000-0000"
                      required
                      autoComplete="tel"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label pb-2">
                      <span className="label-text font-semibold">이메일</span>
                    </label>
                    <input
                      type="email"
                      id="buyerEmail"
                      name="buyerEmail"
                      className="input input-bordered w-full"
                      placeholder="amor@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label pb-2">
                      <span className="label-text font-semibold">
                        목표 및 참고 사항
                      </span>
                    </label>
                    <textarea
                      id="goal"
                      name="goal"
                      className="textarea textarea-bordered w-full min-h-[100px]"
                      placeholder="현재 기록, 목표 대회, 개선하고 싶은 부분을 적어주세요."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card bg-base-200 shadow-xl border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-lg">결제 방법</h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-4 border border-base-300 rounded-xl bg-base-300/20 hover:bg-base-300/30 transition cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      disabled
                      className="radio radio-primary"
                    />
                    <div>
                      <div className="font-bold">신용/체크카드</div>
                      <div className="text-xs text-base-content/50">
                        카드 결제 연동 예정
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-4 border border-base-300 rounded-xl bg-base-300/20 hover:bg-base-300/30 transition cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="kakao"
                      disabled
                      className="radio radio-primary"
                    />
                    <div>
                      <div className="font-bold">카카오페이</div>
                      <div className="text-xs text-base-content/50">
                        간편 결제 연동 예정
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-4 border-2 border-primary/30 rounded-xl bg-primary/5 hover:bg-primary/10 transition cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      defaultChecked
                      className="radio radio-primary"
                    />
                    <div>
                      <div className="font-bold">무통장 입금</div>
                      <div className="text-xs text-base-content/50">
                        국민은행 824001-04-091290 · 전준현
                      </div>
                    </div>
                  </label>

                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                    <div className="text-xs font-bold text-primary/70">
                      입금 계좌
                    </div>
                    <div className="font-bold text-base">
                      국민은행 824001-04-091290
                    </div>
                    <div className="text-xs text-base-content/50">
                      예금주 전준현
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary - 1 column */}
          <div className="lg:col-span-1">
            <div className="card bg-base-200 shadow-xl border border-base-300 sticky top-24">
              <div className="card-body">
                <h2 className="card-title text-lg">주문 요약</h2>

                <div className="space-y-2 text-sm">
                  <div className="text-primary font-bold tracking-wide uppercase">
                    {summaryProgram.title}
                  </div>
                  <p className="text-base-content/60 text-xs">
                    {summaryProgram.description}
                  </p>
                </div>

                <div className="divider"></div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">수강 기간</span>
                    <span className="font-bold">
                      {summaryDuration.duration_months}개월
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">담당 코치</span>
                    <span className="font-bold">
                      {summaryProgram.coach_name || "전준현"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">입금 계좌</span>
                    <span className="font-bold text-xs">
                      국민 824001-04-091290
                    </span>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="flex justify-between items-center">
                  <span className="text-base-content/60">결제 금액</span>
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(summaryDuration.price_krw)}
                  </span>
                </div>

                <div className="form-control mt-2">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      required
                    />
                    <span className="label-text text-xs">
                      주문 정보와 결제 진행 안내를 확인했습니다.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full rounded-full font-bold mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      주문 처리 중...
                    </>
                  ) : (
                    "주문하기"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
