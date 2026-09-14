"use client";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PhoneVerification } from "@/components/auth/phone-verification";
import { useSession } from "@/auth/client";

type MessageType = "info" | "warning" | "error";

interface LookupMessage {
  type: MessageType;
  text: string;
}

interface GuestOrderPayload {
  bankAccount?: import("@/orders/bank-account").BankAccount;
  programName?: string;
  totalPriceKrw?: number;
  monthlyPriceKrw?: number;
  durationMonths?: number;
}

interface GuestOrder {
  id: string;
  status?: "pending" | "confirmed" | "canceled" | string;
  created_at?: string;
  order_payload?: GuestOrderPayload;
}

interface LookupResponse {
  ok?: boolean;
  error?: string;
  message?: string;
  orders?: GuestOrder[];
}

export default function LookUpPage() {
  const locale = useLocale();
  const t = useTranslations("Lookup");
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [resultsFor, setResultsFor] = useState("");
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [message, setMessage] = useState<LookupMessage>({
    type: "info",
    text: t("initialMessage"),
  });

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale === "en" ? "en-US" : "ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const statusMeta = (status?: GuestOrder["status"]) =>
    ({
      pending: { label: t("pending"), className: "bg-warning text-background" },
      confirmed: {
        label: t("confirmed"),
        className: "bg-success text-background",
      },
      reversing: { label: t("reversing"), className: "bg-muted text-foreground" },
      refunded: { label: t("refunded"), className: "bg-muted text-foreground" },
      canceled: { label: t("canceled"), className: "bg-error text-background" },
    })[status || ""] || {
      label: status || t("checkingStatus"),
      className: "bg-muted text-foreground",
    };

  const renderOrders = (ordersData: GuestOrder[]) => {
    if (!ordersData.length) {
      setMessage({
        type: "warning",
        text: t("notFound"),
      });
      setOrders([]);
      return;
    }

    setResultsFor(session?.user.id || "");
    setOrders(ordersData);
    setMessage({
      type: "info",
      text: t("found", { count: ordersData.length }),
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user.phoneNumberVerified) {
      setMessage({
        type: "error",
        text: t("missingFields"),
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "info", text: t("searching") });
    setOrders([]);

    try {
      const response = await fetch("/api/orders", { cache: "no-store" });

      const result = (await response
        .json()
        .catch(() => ({}))) as LookupResponse;
      if (!response.ok || !result.ok) {
        throw new Error(result.error || result.message || t("lookupFailed"));
      }

      renderOrders(result.orders || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("unknownError");
      setMessage({
        type: "error",
        text: t("lookupError", { errorMessage }),
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
          {/* Page Head */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-primary text-xs font-extrabold tracking-widest uppercase">
                Order Lookup
              </span>
              <h1 className="text-3xl sm:text-5xl font-black leading-tight">
                {t("title")}
              </h1>
            </div>
            <p className="text-foreground/60 text-sm max-w-sm">
              {t("description")}
            </p>
          </div>

          {/* Lookup Form */}
          <Card className="bg-card border border-muted shadow-xl">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-2 p-8 gap-6"
            >
              <PhoneVerification english={locale === "en"} />
              <div className="flex flex-col">
                <Button
                  variant="default"
                  size="default"
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !session?.user.phoneNumberVerified}
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle
                        aria-hidden="true"
                        className="animate-spin size-4"
                      />
                      {t("loading")}
                    </>
                  ) : (
                    t("submit")
                  )}
                </Button>
              </div>
            </form>

            {/* Result Area */}
            <CardContent className="border-t border-muted pt-6">
              {message && (
                <Alert
                  role="alert"
                  className={`${message.type === "error" ? "border-error/30 bg-error/10 text-error" : message.type === "warning" ? "border-warning/30 bg-warning/10 text-warning" : "border-info/30 bg-info/10 text-info"} shadow-lg`}
                >
                  <AlertDescription className="text-inherit">
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {session?.user.phoneNumberVerified &&
                resultsFor === session.user.id &&
                orders.length > 0 && (
                  <div className="space-y-4 mt-6">
                    {orders.map((order) => {
                      const payload = order.order_payload || {};
                      const status = statusMeta(order.status);
                      const totalPrice =
                        payload.totalPriceKrw ||
                        (payload.monthlyPriceKrw || 0) *
                          (payload.durationMonths || 1);

                      return (
                        <Card
                          key={order.id}
                          className="bg-background border border-muted shadow-md"
                        >
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                              <div>
                                <div className="text-primary font-black text-base sm:text-lg">
                                  {payload.programName || t("defaultProgram")}
                                </div>
                                <div className="text-foreground/40 text-xs mt-1">
                                  {t("orderNumber", { id: order.id || "-" })}
                                </div>
                              </div>
                              <Badge
                                className={`${status.className} px-3 py-1 text-sm font-bold border-0`}
                              >
                                {status.label}
                              </Badge>
                            </div>

                            {payload.bankAccount && (
                              <p className="mb-4 text-sm text-muted-foreground">
                                {locale === "en" ? "Bank account" : "입금 계좌"}{" "}
                                · {payload.bankAccount.bankName}{" "}
                                {payload.bankAccount.accountNumber} ·{" "}
                                {payload.bankAccount.holderName}
                              </p>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="bg-card rounded-lg p-3">
                                <div className="text-foreground/40 text-xs font-extrabold">
                                  {t("paymentAmount")}
                                </div>
                                <div className="font-black text-sm">
                                  {formatPrice(totalPrice)}
                                </div>
                              </div>
                              <div className="bg-card rounded-lg p-3">
                                <div className="text-foreground/40 text-xs font-extrabold">
                                  {t("duration")}
                                </div>
                                <div className="font-black text-sm">
                                  {payload.durationMonths
                                    ? t("months", {
                                        count: payload.durationMonths,
                                      })
                                    : "-"}
                                </div>
                              </div>
                              <div className="bg-card rounded-lg p-3">
                                <div className="text-foreground/40 text-xs font-extrabold">
                                  {t("orderedAt")}
                                </div>
                                <div className="font-black text-sm">
                                  {formatDate(order.created_at)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
