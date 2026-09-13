"use client";
import { useCallback, useEffect, useState } from "react";
import { Landmark, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BankAccount } from "@/orders/bank-account";
type Account = BankAccount & { revision: string };
export function BankAccountEditor() {
  const [account, setAccount] = useState<Account | null>(null);
  const [saved, setSaved] = useState<Account | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async (signal?: AbortSignal) => {
    setError("");
    try {
      const response = await fetch("/api/bank-account", {
        cache: "no-store",
        signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setAccount(data.bankAccount);
      setSaved(data.bankAccount);
    } catch (e) {
      if (!signal?.aborted)
        setError(
          e instanceof Error ? e.message : "계좌를 불러오지 못했습니다.",
        );
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/bank-account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setAccount(data.bankAccount);
      setSaved(data.bankAccount);
      setNotice("저장했습니다. 주문 화면과 새 주문에 반영됩니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }
  const changed = JSON.stringify(account) !== JSON.stringify(saved);
  return (
    <details className="mb-5 rounded-2xl border border-border bg-card p-5">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-semibold">
          <Landmark className="size-4 text-primary" />
          무통장 입금 정보
        </span>
        <span className="text-xs text-muted-foreground">
          {saved
            ? `${saved.bankName} · ${saved.holderName}`
            : "계좌 불러오는 중…"}{" "}
          · {changed ? "저장 전" : "펼치기"}
        </span>
      </summary>
      <form onSubmit={save} className="mt-6 space-y-5">
        <p className="text-sm leading-6 text-muted-foreground">
          주문자에게 안내할 입금 계좌를 관리합니다. 기존 주문에는 주문 당시의
          계좌 정보가 유지됩니다.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              ["bankName", "은행명", "국민은행", 40],
              ["accountNumber", "계좌번호", "숫자와 하이픈", 40],
              ["holderName", "예금주", "예금주명", 80],
            ] as const
          ).map(([key, label, placeholder, maxLength]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`bank-${key}`}>{label}</Label>
              <Input
                id={`bank-${key}`}
                required
                autoComplete="off"
                maxLength={maxLength}
                placeholder={placeholder}
                value={account?.[key] ?? ""}
                disabled={!account || busy}
                onChange={(e) => {
                  if (account)
                    setAccount({ ...account, [key]: e.target.value });
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => load()}
          >
            저장된 정보 불러오기
          </Button>
          <Button disabled={!account || busy || !changed}>
            <Save className="size-4" />
            {busy ? "저장 중…" : "입금 정보 저장"}
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
