"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { assertPublicSupabaseEnv, supabaseUrl, tenantId } from "@/env";

type MessageType = "info" | "warning" | "error";

interface LookupMessage {
  type: MessageType;
  text: string;
}

interface GuestOrderPayload {
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
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [message, setMessage] = useState<LookupMessage>({
    type: "info",
    text: t("initialMessage"),
  });

  useEffect(() => {
    assertPublicSupabaseEnv();
  }, []);

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
      pending: { label: t("pending"), className: "badge-warning" },
      confirmed: { label: t("confirmed"), className: "badge-success" },
      canceled: { label: t("canceled"), className: "badge-error" },
    })[status] || { label: status || t("checkingStatus"), className: "badge-ghost" };

  const renderOrders = (ordersData: GuestOrder[]) => {
    if (!ordersData.length) {
      setMessage({
        type: "warning",
        text: t("notFound"),
      });
      setOrders([]);
      return;
    }

    setOrders(ordersData);
    setMessage({
      type: "info",
      text: t("found", { count: ordersData.length }),
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!buyerName.trim() || !buyerPhone.trim()) {
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
      const response = await fetch(
        `${supabaseUrl}/functions/v1/lookup-guest-orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tenantId,
            buyerName: buyerName.trim(),
            buyerPhone: buyerPhone.trim(),
          }),
        },
      );

      const result = (await response.json().catch(() => ({}))) as LookupResponse;
      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || result.message || t("lookupFailed"),
        );
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
      <div className="min-h-screen bg-base-100">
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
            <p className="text-base-content/60 text-sm max-w-sm">
              {t("description")}
            </p>
          </div>

          {/* Lookup Form */}
          <div className="card bg-base-200 border border-base-300 shadow-xl">
            <form onSubmit={handleSubmit} className="card-body gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">{t("buyerName")}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t("namePlaceholder")}
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">{t("buyerPhone")}</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="010-0000-0000"
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-control">
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {t("loading")}
                    </>
                  ) : (
                    t("submit")
                  )}
                </button>
              </div>
            </form>

            {/* Result Area */}
            <div className="card-body border-t border-base-300 pt-6">
              {message && (
                <div
                  role="alert"
                  className={`alert ${message.type === "error" ? "alert-error" : message.type === "warning" ? "alert-warning" : "alert-info"} shadow-lg`}
                >
                  <span>{message.text}</span>
                </div>
              )}

              {orders.length > 0 && (
                <div className="space-y-4 mt-6">
                  {orders.map((order) => {
                    const payload = order.order_payload || {};
                    const status = statusMeta(order.status);
                    const totalPrice =
                      payload.totalPriceKrw ||
                      (payload.monthlyPriceKrw || 0) *
                        (payload.durationMonths || 1);

                    return (
                      <div
                        key={order.id}
                        className="card bg-base-100 border border-base-300 shadow-md"
                      >
                        <div className="card-body p-4 sm:p-6">
                          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div>
                              <div className="text-primary font-black text-base sm:text-lg">
                                {payload.programName || t("defaultProgram")}
                              </div>
                              <div className="text-base-content/40 text-xs mt-1">
                                {t("orderNumber", { id: order.id || "-" })}
                              </div>
                            </div>
                            <div
                              className={`badge ${status.className} badge-lg font-bold border-0`}
                            >
                              {status.label}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-base-200 rounded-box p-3">
                              <div className="text-base-content/40 text-xs font-extrabold">
                                {t("paymentAmount")}
                              </div>
                              <div className="font-black text-sm">
                                {formatPrice(totalPrice)}
                              </div>
                            </div>
                            <div className="bg-base-200 rounded-box p-3">
                              <div className="text-base-content/40 text-xs font-extrabold">
                                {t("duration")}
                              </div>
                              <div className="font-black text-sm">
                                {payload.durationMonths ? t("months", { count: payload.durationMonths }) : "-"}
                              </div>
                            </div>
                            <div className="bg-base-200 rounded-box p-3">
                              <div className="text-base-content/40 text-xs font-extrabold">
                                {t("orderedAt")}
                              </div>
                              <div className="font-black text-sm">
                                {formatDate(order.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
