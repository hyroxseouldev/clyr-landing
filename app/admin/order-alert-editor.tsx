"use client";
import { useCallback, useEffect, useState } from "react";
import { Bell, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { renderPaymentMessage } from "@/orders/message-template";
type Settings = {
  enabled: boolean;
  recipient: string;
  body: string;
  revision: string;
};
export function OrderAlertEditor() {
  const [settings, setSettings] = useState<Settings | null>(null),
    [saved, setSaved] = useState<Settings | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const load = useCallback(async (signal?: AbortSignal) => {
    setError("");
    setNotice("");
    try {
      const r = await fetch("/api/admin/order-alert", {
        cache: "no-store",
        signal,
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      setSettings(data.settings);
      setSaved(data.settings);
    } catch (e) {
      if (!signal?.aborted)
        setError(
          e instanceof Error ? e.message : "설정을 불러오지 못했습니다.",
        );
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  let preview = "";
  try {
    preview = renderPaymentMessage(settings?.body ?? "", {
      id: "AMOR-EXAMPLE",
      buyer_name: "김아모",
      order_payload: {
        programName: "HYROX 기초 프로그램",
        durationMonths: 1,
        totalPriceKrw: 150000,
      },
    });
  } catch {
    preview = "지원하는 치환 항목으로 문구를 작성해 주세요.";
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch("/api/admin/order-alert", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      setSettings(data.settings);
      setSaved(data.settings);
      setNotice("저장했습니다. 이후 접수되는 새 주문부터 적용됩니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="mb-5 rounded-2xl border border-border bg-card p-5">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-semibold">
          <Bell className="size-4 text-primary" />새 주문 관리자 알림
        </span>
        <span className="text-xs text-muted-foreground">
          {saved
            ? saved.enabled
              ? `사용 중 · ${saved.recipient}`
              : "알림 꺼짐"
            : "불러오는 중…"}{" "}
          · 펼치기
        </span>
      </summary>
      <form onSubmit={save} className="mt-6 space-y-5">
        <p className="text-sm leading-6 text-muted-foreground">
          새 주문이 접수되면 담당자에게 입금 확인 요청 문자를 보냅니다.
          주문자에게 보내는 입금 확인 문자와 별도로 관리됩니다.
        </p>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={settings?.enabled ?? false}
            disabled={!settings || busy}
            onChange={(e) =>
              settings &&
              setSettings({ ...settings, enabled: e.target.checked })
            }
          />
          새 주문 문자 알림 사용
        </label>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="order-alert-recipient">알림 받을 휴대폰 번호</Label>
            <Input
              id="order-alert-recipient"
              type="tel"
              autoComplete="off"
              value={settings?.recipient ?? ""}
              required
              disabled={!settings || busy}
              onChange={(e) =>
                settings &&
                setSettings({ ...settings, recipient: e.target.value })
              }
            />
            <Label htmlFor="order-alert-body">알림 문자 문구</Label>
            <p className="text-xs leading-6 text-muted-foreground">
              {
                "치환 항목: {{이름}}, {{프로그램}}, {{기간}}, {{금액}}, {{주문번호}}"
              }
            </p>
            <Textarea
              id="order-alert-body"
              className="min-h-52 leading-7"
              maxLength={600}
              required
              value={settings?.body ?? ""}
              disabled={!settings || busy}
              onChange={(e) =>
                settings && setSettings({ ...settings, body: e.target.value })
              }
            />
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">미리보기 · 예시 주문</p>
            <div className="rounded-2xl bg-muted p-5 text-sm leading-7 whitespace-pre-wrap">
              {preview}
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              설정 저장만으로 문자가 발송되지는 않습니다. 이미 접수된 알림은
              당시 수신번호와 문구를 유지합니다.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => load()}
          >
            저장된 설정 불러오기
          </Button>
          <Button
            disabled={
              !settings ||
              busy ||
              JSON.stringify(settings) === JSON.stringify(saved)
            }
          >
            <Save className="size-4" />
            {busy ? "저장 중…" : "알림 설정 저장"}
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm text-primary">
            {notice}
          </p>
        )}
      </form>
    </details>
  );
}
