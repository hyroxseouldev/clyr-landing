"use client";

import { useEffect, useState } from "react";
import { assertPublicSupabaseEnv, supabaseUrl, tenantId } from "@/env";

export default function LookUpPage() {
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState({
    type: "info",
    text: "주문자 이름과 핸드폰 번호를 입력한 뒤 조회해 주세요.",
  });

  useEffect(() => {
    assertPublicSupabaseEnv();
  }, []);

  const formatPrice = (value) =>
    new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const statusMeta = (status) =>
    ({
      pending: { label: "입금 확인 대기", className: "badge-warning" },
      confirmed: { label: "확인 완료", className: "badge-success" },
      canceled: { label: "취소됨", className: "badge-error" },
    })[status] || { label: status || "상태 확인 중", className: "badge-ghost" };

  const renderOrders = (ordersData) => {
    if (!ordersData.length) {
      setMessage({
        type: "warning",
        text: "일치하는 주문 내역이 없습니다. 이름과 핸드폰 번호를 다시 확인해 주세요.",
      });
      setOrders([]);
      return;
    }

    setOrders(ordersData);
    setMessage({
      type: "info",
      text: `${ordersData.length}개의 주문 내역을 찾았습니다.`,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!buyerName.trim() || !buyerPhone.trim()) {
      setMessage({
        type: "error",
        text: "이름과 핸드폰 번호를 모두 입력해 주세요.",
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "info", text: "주문 내역을 조회하고 있습니다." });
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

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || result.message || "주문 조회에 실패했습니다.",
        );
      }

      renderOrders(result.orders || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: `주문 조회 중 오류가 발생했습니다. ${error.message}`,
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
                주문 확인
              </h1>
            </div>
            <p className="text-base-content/60 text-sm max-w-sm">
              주문할 때 입력한 이름과 연락처로 신청 내역을 확인할 수 있습니다.
            </p>
          </div>

          {/* Lookup Form */}
          <div className="card bg-base-200 border border-base-300 shadow-xl">
            <form onSubmit={handleSubmit} className="card-body gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">이름</span>
                  </label>
                  <input
                    type="text"
                    placeholder="홍길동"
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">핸드폰 번호</span>
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
                      조회 중...
                    </>
                  ) : (
                    "조회하기"
                  )}
                </button>
              </div>
            </form>

            {/* Result Area */}
            <div className="card-body border-t border-base-300 pt-6">
              {message && (
                <div
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
                                {payload.programName || "AMOR 프로그램"}
                              </div>
                              <div className="text-base-content/40 text-xs mt-1">
                                주문번호 {order.id || "-"}
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
                                결제 금액
                              </div>
                              <div className="font-black text-sm">
                                {formatPrice(totalPrice)}
                              </div>
                            </div>
                            <div className="bg-base-200 rounded-box p-3">
                              <div className="text-base-content/40 text-xs font-extrabold">
                                수강 기간
                              </div>
                              <div className="font-black text-sm">
                                {payload.durationMonths || "-"}개월
                              </div>
                            </div>
                            <div className="bg-base-200 rounded-box p-3">
                              <div className="text-base-content/40 text-xs font-extrabold">
                                주문 일시
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
