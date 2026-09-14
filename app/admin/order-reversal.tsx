"use client";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { OrderRow } from "@/orders/policy";
const eventLabels: Record<string, string> = {
  confirmed: "입금 확인",
  canceled: "주문 취소",
  undo_requested: "입금 확인 취소 요청",
  refund_requested: "환불 완료 처리 요청",
  confirmation_undone: "입금 확인 취소 완료",
  refunded: "환불 완료",
};
export function OrderReversal({
  order,
  onChanged,
}: {
  order: OrderRow;
  onChanged: () => Promise<void>;
}) {
  const [kind, setKind] = useState<"undo" | "refund" | null>(null);
  const [reason, setReason] = useState("");
  const [transferred, setTransferred] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const job = order.reversals?.[0];
  const label = kind === "refund" ? "환불 완료 처리" : "입금 확인 취소";
  async function submit(retry = false) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/reversal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          retry
            ? { retry: true }
            : {
                kind,
                reason,
                refundTransferred: transferred,
                manualAccessReviewed: reviewed,
              },
        ),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "처리하지 못했습니다.");
      setKind(null);
      setNotice(
        data.reversalStatus === "done"
          ? "처리를 완료했습니다."
          : data.reversalStatus === "failed"
            ? "앱 이용권 회수를 완료하지 못했습니다. 회수 재시도를 눌러 주세요."
            : "이용권 회수 처리 중입니다. 잠시 후 목록을 새로고침해 주세요.",
      );
      await onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "처리하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-4 space-y-3">
      {order.status === "reversing" && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm">
          <p>
            {job?.kind === "refund" ? "환불" : "입금 확인 취소"} · 앱 이용권
            회수 {job?.status === "failed" ? "실패" : "처리 중"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            회수가 완료되면 주문 상태가 변경됩니다. 같은 요청을 재시도해도 중복
            회수되지 않습니다.
          </p>
          <Button
            className="mt-3"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => submit(true)}
          >
            {busy ? "처리 중…" : "회수 재시도"}
          </Button>
        </div>
      )}
      {order.status === "confirmed" && (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => {
              setKind("undo");
              setReason("");
              setReviewed(false);
              setTransferred(false);
              setError("");
            }}
          >
            입금 확인 취소
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => {
              setKind("refund");
              setReason("");
              setReviewed(false);
              setTransferred(false);
              setError("");
            }}
          >
            환불 완료 처리
          </Button>
        </div>
      )}
      {!!order.events?.length && (
        <details className="text-xs text-muted-foreground">
          <summary className="w-fit cursor-pointer">처리 이력</summary>
          <ol className="mt-3 space-y-3">
            {order.events.map((event) => (
              <li key={event.id}>
                <p>
                  {eventLabels[event.status] || event.status} ·{" "}
                  {new Date(event.created_at).toLocaleString("ko-KR", {
                    timeZone: "Asia/Seoul",
                  })}
                </p>
                {event.reason && (
                  <p className="mt-1 whitespace-pre-wrap break-words text-foreground">
                    사유: {event.reason}
                  </p>
                )}
                <p className="mt-1 break-all">처리자 ID: {event.actor_id}</p>
              </li>
            ))}
          </ol>
        </details>
      )}
      {notice && (
        <p role="status" className="text-sm">
          {notice}
        </p>
      )}
      {error && !kind && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Dialog.Root
        open={!!kind}
        onOpenChange={(open) => {
          if (!open && !busy) setKind(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card p-6">
            <Dialog.Title className="text-xl font-bold">{label}</Dialog.Title>
            <Dialog.Description className="mt-4 text-sm leading-6 text-muted-foreground">
              {order.buyer_name} ·{" "}
              {new Intl.NumberFormat("ko-KR").format(
                order.order_payload.totalPriceKrw || 0,
              )}
              원<br />
              {kind === "refund"
                ? "실제 계좌 환불을 완료한 뒤 기록하는 기능입니다. 자동 송금은 하지 않습니다."
                : "입금 확인을 취소하고 주문을 입금 대기로 되돌립니다. 이후 다시 입금 확인할 수 있습니다."}
              <br />
              해당 주문으로 지급한 이용권의 남은 기간만 회수합니다. 이미 사용한
              기간과 다른 주문의 이용권은 유지됩니다.
            </Dialog.Description>
            {!order.grant && (
              <label className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/30 p-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={reviewed}
                  disabled={busy}
                  onChange={(e) => setReviewed(e.target.checked)}
                />
                <span>
                  이관 주문으로 자동 회수할 발급 이력이 없습니다. 앱 이용권을
                  직접 확인·회수했거나 회수 대상이 없음을 확인했습니다.
                </span>
              </label>
            )}
            {kind === "refund" && (
              <label className="mt-4 flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={transferred}
                  disabled={busy}
                  onChange={(e) => setTransferred(e.target.checked)}
                />
                <span>고객에게 주문 금액 전액의 환불 송금을 완료했습니다.</span>
              </label>
            )}
            <div className="mt-4 space-y-2">
              <Label htmlFor={`reason-${order.id}`}>처리 사유</Label>
              <textarea
                id={`reason-${order.id}`}
                className="min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm"
                value={reason}
                maxLength={500}
                disabled={busy}
                onChange={(e) => setReason(e.target.value)}
                placeholder="취소 또는 환불 사유를 입력해 주세요."
              />
            </div>
            {error && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setKind(null)}
              >
                돌아가기
              </Button>
              <Button
                disabled={
                  busy ||
                  !reason.trim() ||
                  (kind === "refund" && !transferred) ||
                  (!order.grant && !reviewed)
                }
                onClick={() => submit()}
              >
                {busy ? "처리 중…" : label}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
