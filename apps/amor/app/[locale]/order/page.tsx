"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { sortedPrograms } from "@/data/program-catalog";
import type { Program } from "@/data/programs";
import { assertPublicSupabaseEnv, supabaseUrl, tenantId } from "@/env";
import { EARLY_BIRD_END_AT_MS, getProgramPricing } from "@/pricing";

interface Duration {
  duration_months: number;
  price_krw: number;
  is_enabled: boolean;
  pricingPhase?: string;
  regularPriceKrw?: number;
  finalPriceKrw?: number;
  regular_total_price_krw?: number;
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

interface OrderResponse {
  ok?: boolean;
  error?: string;
  message?: string;
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

const formatPrice = (value: number, locale: string) =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value || 0);

const englishProgramCopy: Record<
  string,
  { title: string; description: string }
> = {
  "06a42964-2aa4-4287-a724-32fb8526e2df": {
    title: "Fundamentals: 4 weeks",
    description:
      "A foundational running and station-integrated class. Includes one in-person meeting and lesson in the final week.",
  },
  "0d925d9f-bdb1-4e34-ae70-5609faa20983": {
    title: "Race preparation",
    description:
      "A four-week class with four running and station sessions each week, plus two in-person training sessions and meetings.",
  },
  "8f81d9f1-8559-4fd8-bbe9-c49779770461": {
    title: "Running class",
    description:
      "A four-week class with three or four sessions each week, adjusted to your running level and training intensity.",
  },
  "c881344f-267c-4aa4-ad49-008e4275ec1f": {
    title: "HYROX stations",
    description:
      "A four-week class with three sessions each week, using station-specific training to strengthen your weaker areas.",
  },
};

const localizeProgram = (program: Program, locale: string) =>
  locale === "en" ? { ...program, ...englishProgramCopy[program.id] } : program;

const enabledDurations = (program: Program) => {
  const pricing = getProgramPricing(program.id);
  const monthlyPrice =
    pricing?.finalPriceKrw ||
    program.products.find((item) => item.is_active)?.price_krw ||
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

const displayValue = (value?: string | number) => {
  if (value === undefined || value === null) return "-";
  return value.toString();
};

export default function OrderPageClient() {
  const locale = useLocale();
  const t = useTranslations("Order");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Duration | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleProgramChange = (programId: string) => {
    const program = sortedPrograms.find((p) => p.id === programId);
    if (!program) return;
    setSelectedProgram(program);
    const durations = enabledDurations(program);
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
      alert(t("programUnavailable"));
      return;
    }

    setIsLoading(true);

    try {
      const monthlyPriceKrw = Math.round(
        duration.price_krw / duration.duration_months,
      );

      const orderPayload: OrderPayload = {
        programId: program.id,
        programName: localizeProgram(program, locale).title,
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

      const result = (await response.json().catch(() => ({}))) as OrderResponse;
      if (!response.ok || !result.ok) {
        throw new Error(result.error || result.message || t("createFailed"));
      }

      alert(t("completedAlert", bankAccount));
      window.location.href = `/${locale}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("unknownError");
      alert(`${t("error")}\n${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    assertPublicSupabaseEnv();
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("program");
    const program =
      sortedPrograms.find((item) => item.id === requestedId) ||
      sortedPrograms[0];
    if (program) {
      setSelectedProgram(program);
      const durations = enabledDurations(program);
      setSelectedDuration(durations[0]);
    }

    const nowMs = Date.now();
    const msUntilEarlyBirdEnds = EARLY_BIRD_END_AT_MS - nowMs;
    const timer =
      msUntilEarlyBirdEnds > 0
        ? setTimeout(() => {
            if (program) {
              const durations = enabledDurations(program);
              setSelectedDuration(durations[0]);
            }
          }, msUntilEarlyBirdEnds + 1000)
        : null;

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!selectedProgram || !selectedDuration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin size-8 text-primary"
        />
      </div>
    );
  }

  const durations = enabledDurations(selectedProgram);
  const summaryProgram = localizeProgram(selectedProgram, locale);
  const summaryDuration = selectedDuration;
  const difficultyLabel = (difficulty?: Program["difficulty"]) => {
    const labels = {
      beginner: t("difficultyBeginner"),
      intermediate: t("difficultyIntermediate"),
      advanced: t("difficultyAdvanced"),
    };
    return labels[difficulty || ""] || difficulty || "-";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
              Program Order
            </span>
            <h1 className="text-3xl md:text-4xl font-bold">{t("title")}</h1>
          </div>
          <p className="text-sm text-foreground/60 max-w-md">
            {t("description")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Program Selection */}
            <Card className="bg-card shadow-xl border border-muted">
              <CardContent>
                <h2 className="flex items-center gap-2 font-semibold text-lg">
                  {t("programInfo")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <figure className="aspect-square rounded-xl overflow-hidden bg-muted relative">
                      <Image
                        src={selectedProgram.thumbnail_url}
                        alt={summaryProgram.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </figure>
                  </div>

                  <div className="space-y-4">
                    {/* Program Select */}
                    <div className="flex flex-col">
                      <Label
                        htmlFor="program"
                        className="flex items-center py-2 pb-2"
                      >
                        <span className="text-sm font-semibold">
                          {t("programSelect")}
                        </span>
                      </Label>
                      <NativeSelect
                        id="program"
                        className="w-full"
                        value={selectedProgram.id}
                        onChange={(e) => handleProgramChange(e.target.value)}
                      >
                        {sortedPrograms.map((p) => (
                          <NativeSelectOption key={p.id} value={p.id}>
                            {localizeProgram(p, locale).title}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </div>

                    <div>
                      <h3 className="text-primary font-bold text-sm tracking-wide uppercase">
                        {summaryProgram.title}
                      </h3>
                      <p className="text-sm text-foreground/70 mt-1 whitespace-pre-line">
                        {summaryProgram.description}
                      </p>
                    </div>

                    {/* Duration Select */}
                    <div className="flex flex-col">
                      <Label
                        htmlFor="duration"
                        className="flex items-center py-2 pb-2"
                      >
                        <span className="text-sm font-semibold">
                          {t("duration")}
                        </span>
                      </Label>
                      <NativeSelect
                        id="duration"
                        className="w-full"
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
                          <NativeSelectOption key={idx} value={idx}>
                            {t("months", { count: d.duration_months })} ·{" "}
                            {formatPrice(d.price_krw, locale)}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-muted/30 rounded-xl p-3 text-center">
                        <div className="text-xs text-foreground/50 font-semibold">
                          {t("difficulty")}
                        </div>
                        <div className="text-sm font-bold">
                          {difficultyLabel(selectedProgram.difficulty)}
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-xl p-3 text-center">
                        <div className="text-xs text-foreground/50 font-semibold">
                          {t("weeklyTraining")}
                        </div>
                        <div className="text-sm font-bold">
                          {t("weeklyValue", {
                            count: displayValue(selectedProgram.days_per_week),
                          })}
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-xl p-3 text-center">
                        <div className="text-xs text-foreground/50 font-semibold">
                          {t("dailyDuration")}
                        </div>
                        <div className="text-sm font-bold">
                          {t("minutes", {
                            count: displayValue(
                              selectedProgram.daily_workout_minutes,
                            ),
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buyer Information */}
            <Card className="bg-card shadow-xl border border-muted">
              <CardContent>
                <h2 className="flex items-center gap-2 font-semibold text-lg">
                  {t("buyerInfo")}
                </h2>

                <div className="space-y-5">
                  <div className="flex flex-col">
                    <Label
                      htmlFor="buyerName"
                      className="flex items-center py-2 pb-2"
                    >
                      <span className="text-sm font-semibold">
                        {t("buyerName")}
                      </span>
                    </Label>
                    <Input
                      type="text"
                      id="buyerName"
                      name="buyerName"
                      className="w-full"
                      placeholder={t("namePlaceholder")}
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className="flex flex-col">
                    <Label
                      htmlFor="buyerPhone"
                      className="flex items-center py-2 pb-2"
                    >
                      <span className="text-sm font-semibold">
                        {t("buyerPhone")}
                      </span>
                    </Label>
                    <Input
                      type="tel"
                      id="buyerPhone"
                      name="buyerPhone"
                      className="w-full"
                      placeholder="010-0000-0000"
                      required
                      autoComplete="tel"
                    />
                  </div>

                  <div className="flex flex-col">
                    <Label
                      htmlFor="buyerEmail"
                      className="flex items-center py-2 pb-2"
                    >
                      <span className="text-sm font-semibold">
                        {t("email")}
                      </span>
                    </Label>
                    <Input
                      type="email"
                      id="buyerEmail"
                      name="buyerEmail"
                      className="w-full"
                      placeholder="amor@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="flex flex-col">
                    <Label
                      htmlFor="goal"
                      className="flex items-center py-2 pb-2"
                    >
                      <span className="text-sm font-semibold">{t("goal")}</span>
                    </Label>
                    <Textarea
                      id="goal"
                      name="goal"
                      className="w-full min-h-[100px]"
                      placeholder={t("goalPlaceholder")}
                    ></Textarea>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-card shadow-xl border border-muted">
              <CardContent>
                <h2 className="flex items-center gap-2 font-semibold text-lg">
                  {t("paymentMethod")}
                </h2>

                <RadioGroup
                  name="paymentMethod"
                  defaultValue="bank"
                  className="space-y-3"
                >
                  <Label
                    htmlFor="payment-card"
                    className="flex items-center gap-4 p-4 border border-muted rounded-xl bg-muted/20 hover:bg-muted/30 transition cursor-pointer"
                  >
                    <RadioGroupItem
                      id="payment-card"
                      value="card"
                      disabled
                      className="size-5"
                    />
                    <div>
                      <div className="font-bold">{t("card")}</div>
                      <div className="text-xs text-foreground/50">
                        {t("cardComingSoon")}
                      </div>
                    </div>
                  </Label>

                  <Label
                    htmlFor="payment-kakao"
                    className="flex items-center gap-4 p-4 border border-muted rounded-xl bg-muted/20 hover:bg-muted/30 transition cursor-pointer"
                  >
                    <RadioGroupItem
                      id="payment-kakao"
                      value="kakao"
                      disabled
                      className="size-5"
                    />
                    <div>
                      <div className="font-bold">{t("kakaoPay")}</div>
                      <div className="text-xs text-foreground/50">
                        {t("kakaoPayComingSoon")}
                      </div>
                    </div>
                  </Label>

                  <Label
                    htmlFor="payment-bank"
                    className="flex items-center gap-4 p-4 border-2 border-primary/30 rounded-xl bg-primary/5 hover:bg-primary/10 transition cursor-pointer"
                  >
                    <RadioGroupItem
                      id="payment-bank"
                      value="bank"
                      className="size-5"
                    />
                    <div>
                      <div className="font-bold">{t("bankTransfer")}</div>
                      <div className="text-xs text-foreground/50">
                        {bankAccount.bankName} {bankAccount.accountNumber} ·{" "}
                        {bankAccount.holderName}
                      </div>
                    </div>
                  </Label>
                </RadioGroup>

                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <div className="text-xs font-bold text-primary/70">
                    {t("account")}
                  </div>
                  <div className="font-bold text-base">
                    {bankAccount.bankName} {bankAccount.accountNumber}
                  </div>
                  <div className="text-xs text-foreground/50">
                    {t("accountHolder", { name: bankAccount.holderName })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary - 1 column */}
          <div className="lg:col-span-1">
            <Card className="bg-card shadow-xl border border-muted sticky top-24">
              <CardContent>
                <h2 className="flex items-center gap-2 font-semibold text-lg">
                  {t("summary")}
                </h2>

                <div className="space-y-2 text-sm">
                  <div className="text-primary font-bold tracking-wide uppercase">
                    {summaryProgram.title}
                  </div>
                  <p className="text-foreground/60 text-xs">
                    {summaryProgram.description}
                  </p>
                </div>

                <Separator className="my-4"></Separator>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">{t("duration")}</span>
                    <span className="font-bold">
                      {t("months", { count: summaryDuration.duration_months })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">{t("coach")}</span>
                    <span className="font-bold">
                      {locale === "en"
                        ? "Junhyun Jeon"
                        : summaryProgram.coach_name || "전준현"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">{t("account")}</span>
                    <span className="font-bold text-xs">
                      {bankAccount.bankName} {bankAccount.accountNumber}
                    </span>
                  </div>
                </div>

                <Separator className="my-4"></Separator>

                <div className="flex justify-between items-center">
                  <span className="text-foreground/60">
                    {t("paymentAmount")}
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(summaryDuration.price_krw, locale)}
                  </span>
                </div>

                <div className="flex flex-col mt-2">
                  <Label
                    htmlFor="agreement"
                    className="flex items-center py-2 cursor-pointer justify-start gap-3"
                  >
                    <Checkbox
                      id="agreement"
                      name="agreement"
                      required
                      className="size-5"
                    />
                    <span className="text-sm text-xs">{t("agreement")}</span>
                  </Label>
                </div>

                <Button
                  variant="default"
                  size="default"
                  type="submit"
                  className="w-full rounded-full font-bold mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle
                        aria-hidden="true"
                        className="animate-spin size-4"
                      />
                      {t("processing")}
                    </>
                  ) : (
                    t("submit")
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
