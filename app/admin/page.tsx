"use client";
import { useCallback, useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import { BankAccountEditor } from "./bank-account-editor";
import { MessageTemplateEditor } from "./message-template-editor";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { authClient, useSession, signOut } from "@/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrderRow } from "@/orders/policy";

const grantLabels = {
  pending: "발급 대기",
  sending: "발급 처리 중",
  waiting: "앱 가입·인증 대기",
  claimed: "앱 이용권 지급 완료",
  failed: "발급 실패 · 재시도 필요",
};
const messageLabels = {
  pending: "발송 대기",
  sending: "접수 중 · 지연 시 SOLAPI 확인 필요",
  accepted: "발송 접수 완료",
  failed: "발송 실패",
  unknown: "결과 불명 · SOLAPI 확인 필요",
};
const labels = {
  pending: "입금 대기",
  confirmed: "입금 확인",
  canceled: "주문 취소",
};
const money = (value = 0) =>
  new Intl.NumberFormat("ko-KR").format(value) + "원";
const date = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
export default function MasterPage() {
  const { data: session, isPending, refetch } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authorizedFor, setAuthorizedFor] = useState("");
  const [action, setAction] = useState<{
    order: OrderRow;
    status: "confirmed" | "canceled";
  } | null>(null);
  const [notice, setNotice] = useState("");
  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!session?.user.id) return;
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/admin/orders?${new URLSearchParams({ status, q: query, page: String(page) })}`,
          { cache: "no-store", signal },
        );
        const result = await response.json();
        if (!response.ok) {
          setAuthorizedFor("");
          setRows([]);
          throw new Error(result.message || "목록 조회에 실패했습니다.");
        }
        setRows(result.orders);
        setTotal(result.total);
        setAuthorizedFor(session.user.id);
      } catch (e) {
        if (!signal?.aborted)
          setError(
            e instanceof Error ? e.message : "목록 조회에 실패했습니다.",
          );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [session?.user.id, status, query, page],
  );
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error)
        throw new Error("이메일 또는 비밀번호를 확인해 주세요.");
      setPassword("");
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "로그인하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }
  async function update() {
    if (!action) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/orders/${action.order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action.status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setNotice(
        `${action.order.buyer_name}님의 주문을 ${labels[action.status]} 처리했습니다.${result.grantStatus ? ` 이용권: ${grantLabels[result.grantStatus as keyof typeof grantLabels]}` : ""}${result.messageStatus ? ` 문자: ${messageLabels[result.messageStatus as keyof typeof messageLabels] || "상태 확인 필요"}` : ""}`,
      );
      setAction(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "상태 변경에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }
  if (isPending)
    return (
      <main className="grid min-h-screen place-items-center">
        <p role="status" className="flex gap-2">
          <LoaderCircle className="size-5 animate-spin" />
          로그인 확인 중…
        </p>
      </main>
    );
  if (!session)
    return (
      <main className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden border-r border-border bg-card p-16 lg:flex lg:flex-col lg:justify-between">
          <Link href="/ko" className="text-lg font-black tracking-[.18em]">
            AMOR LAB<span className="text-primary">.</span>
          </Link>
          <div>
            <p className="mb-6 text-xs font-bold tracking-[.3em] text-primary">
              OPERATIONS / 01
            </p>
            <h1 className="text-7xl font-black leading-[.95] tracking-tighter">
              EVERY ORDER.
              <br />
              <span className="text-muted-foreground">ONE PLACE.</span>
            </h1>
            <p className="mt-8 max-w-sm leading-7 text-muted-foreground">
              새로운 시작을 준비하는 회원들.
              <br />
              주문 접수부터 입금 확인까지 한곳에서 관리하세요.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            AMOR LAB · MASTER CONSOLE
          </p>
        </section>
        <section className="flex items-center justify-center px-6 py-16">
          <form onSubmit={login} className="w-full max-w-sm space-y-6">
            <div className="mb-10">
              <ShieldCheck className="mb-6 size-9 text-primary" />
              <p className="text-xs font-bold tracking-[.2em] text-primary">
                MASTER ACCESS
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                주문 마스터 로그인
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                관리자 계정으로 로그인해 주세요.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@amorlab.kr"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button className="h-12 w-full" disabled={busy}>
              {busy ? "로그인 중…" : "로그인"}
              <ArrowUpRight className="size-4" />
            </Button>
            <Link
              href="/ko"
              className="block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              사이트로 돌아가기
            </Link>
          </form>
        </section>
      </main>
    );
  const authorized = authorizedFor === session.user.id;
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5">
          <Link href="/admin" className="text-lg font-black tracking-[.1em]">
            AMOR LAB<span className="text-primary">.</span>{" "}
            <span className="ml-3 text-xs font-medium tracking-normal text-muted-foreground">
              MASTER
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-muted-foreground sm:block">
              {session.user.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const result = await signOut();
                  if (result.error) throw new Error();
                  setRows([]);
                  setAuthorizedFor("");
                  setAction(null);
                  await refetch();
                } catch {
                  setError("로그아웃에 실패했습니다.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <LogOut className="size-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[.25em] text-primary">
              ORDER MANAGEMENT
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              주문 확인
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              입금 확인 시 앱 이용권을 발급하고 안내 문자를 보냅니다.
            </p>
          </div>
          <Button variant="outline" onClick={() => load()} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
        </div>
        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mb-5 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm"
          >
            {notice}
          </p>
        )}
        {authorized && (
          <>
            <BankAccountEditor />
            <MessageTemplateEditor />
            <section className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
              <div>
                <p className="text-xs text-muted-foreground">
                  {status ? labels[status as keyof typeof labels] : "전체 주문"}{" "}
                  · 검색 결과
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums">
                  {total}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    건
                  </span>
                </p>
              </div>
              <ClipboardList className="size-8 text-primary" />
            </section>
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row">
              <div
                role="group"
                aria-label="주문 상태 필터"
                className="flex flex-wrap gap-2"
              >
                {[["", "전체"], ...Object.entries(labels)].map(
                  ([value, label]) => (
                    <Button
                      key={value}
                      variant={status === value ? "default" : "outline"}
                      size="sm"
                      aria-pressed={status === value}
                      onClick={() => {
                        setStatus(value);
                        setPage(1);
                      }}
                    >
                      {label}
                    </Button>
                  ),
                )}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setQuery(search);
                  setPage(1);
                }}
              >
                <Input
                  aria-label="주문자 이름 또는 휴대폰 검색"
                  placeholder="이름 또는 휴대폰 번호"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button type="submit" variant="outline" aria-label="검색">
                  <Search className="size-4" />
                </Button>
              </form>
            </div>
            <div aria-busy={loading} className="space-y-3">
              {!rows.length ? (
                <div className="rounded-2xl border border-dashed border-border py-20 text-center">
                  <ClipboardList className="mx-auto mb-4 size-8 text-muted-foreground" />
                  <p className="font-semibold">
                    {query || status
                      ? "조건에 맞는 주문이 없어요."
                      : "아직 접수된 주문이 없어요."}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    새 주문이 접수되면 이곳에서 확인할 수 있습니다.
                  </p>
                </div>
              ) : (
                rows.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-border bg-card p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-bold">
                            {order.buyer_name}
                          </h2>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${order.status === "pending" ? "bg-amber-400/10 text-amber-300" : order.status === "confirmed" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                          >
                            {labels[order.status]}
                          </span>
                          {order.order_payload.phoneVerified && (
                            <span className="text-xs text-muted-foreground">
                              휴대폰 인증
                            </span>
                          )}
                        </div>
                        <a
                          className="mt-2 inline-block text-sm tabular-nums text-muted-foreground hover:text-primary"
                          href={`tel:${order.buyer_phone.replace(/[^\d+]/g, "")}`}
                        >
                          {order.buyer_phone}
                        </a>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold tabular-nums">
                          {money(order.order_payload.totalPriceKrw)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {date(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 border-t border-border pt-4">
                      <p className="font-medium">
                        {order.order_payload.programName || "프로그램 주문"}{" "}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {order.order_payload.durationMonths || 1}개월
                        </span>
                      </p>
                      {order.order_payload.bankAccount && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          입금 계좌 · {order.order_payload.bankAccount.bankName}{" "}
                          {order.order_payload.bankAccount.accountNumber} ·{" "}
                          {order.order_payload.bankAccount.holderName}
                        </p>
                      )}
                      <details className="mt-3 text-sm">
                        <summary className="w-fit cursor-pointer text-muted-foreground">
                          주문 상세
                        </summary>
                        <dl className="mt-3 grid gap-2 break-words text-muted-foreground">
                          <div>
                            <dt className="inline">주문번호 · </dt>
                            <dd className="inline">{order.id}</dd>
                          </div>
                          <div>
                            <dt className="inline">이메일 · </dt>
                            <dd className="inline">
                              {order.order_payload.buyerEmail || "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="inline">운동 목표 · </dt>
                            <dd className="inline whitespace-pre-wrap">
                              {order.order_payload.buyerGoal || "—"}
                            </dd>
                          </div>
                          {order.confirmed_at && (
                            <div>입금 확인 · {date(order.confirmed_at)}</div>
                          )}
                          {order.canceled_at && (
                            <div>주문 취소 · {date(order.canceled_at)}</div>
                          )}
                        </dl>
                      </details>
                    </div>
                    {order.grant?.status && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3 text-xs">
                        <div>
                          <p>
                            모바일 이용권 · {grantLabels[order.grant.status]}
                          </p>
                          {order.grant.startsAt && order.grant.endsAt && (
                            <p className="mt-1 text-muted-foreground">
                              {date(order.grant.startsAt)} ~{" "}
                              {date(order.grant.endsAt)}
                            </p>
                          )}
                        </div>
                        {order.grant.status !== "claimed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={async () => {
                              setBusy(true);
                              setError("");
                              try {
                                const response = await fetch(
                                  `/api/admin/orders/${order.id}/grant`,
                                  { method: "POST" },
                                );
                                const result = await response.json();
                                if (!response.ok)
                                  throw new Error(result.message);
                                setNotice(
                                  `이용권: ${grantLabels[result.grantStatus as keyof typeof grantLabels]}`,
                                );
                                await load();
                              } catch (e) {
                                setError(
                                  e instanceof Error
                                    ? e.message
                                    : "발급 상태를 확인하지 못했습니다.",
                                );
                              } finally {
                                setBusy(false);
                              }
                            }}
                          >
                            {order.grant.status === "waiting"
                              ? "수령 상태 확인"
                              : "발급 재시도"}
                          </Button>
                        )}
                      </div>
                    )}
                    {order.message?.status && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-background/60 p-3 text-xs">
                        <span>
                          입금 안내 문자 · {messageLabels[order.message.status]}
                        </span>
                        {["failed", "pending"].includes(
                          order.message.status,
                        ) && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={async () => {
                              setBusy(true);
                              setError("");
                              try {
                                const response = await fetch(
                                  `/api/admin/orders/${order.id}/message`,
                                  { method: "POST" },
                                );
                                const result = await response.json();
                                if (!response.ok)
                                  throw new Error(result.message);
                                setNotice(
                                  `문자: ${messageLabels[result.messageStatus as keyof typeof messageLabels]}`,
                                );
                                await load();
                              } catch (e) {
                                setError(
                                  e instanceof Error
                                    ? e.message
                                    : "재발송에 실패했습니다.",
                                );
                              } finally {
                                setBusy(false);
                              }
                            }}
                          >
                            문자 재발송
                          </Button>
                        )}
                      </div>
                    )}
                    {order.status === "pending" && (
                      <div className="mt-5 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() =>
                            setAction({ order, status: "canceled" })
                          }
                        >
                          <X className="size-4" />
                          주문 취소
                        </Button>
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            setAction({ order, status: "confirmed" })
                          }
                        >
                          <Check className="size-4" />
                          입금 확인
                        </Button>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
            <nav
              aria-label="주문 페이지"
              className="mt-6 flex items-center justify-between"
            >
              <p className="text-xs text-muted-foreground">
                {page} / {Math.max(1, Math.ceil(total / 25))} 페이지 · 최신
                주문순
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="이전 페이지"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="다음 페이지"
                  disabled={page * 25 >= total || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </nav>
          </>
        )}
        {loading && !authorized && (
          <p role="status" className="text-muted-foreground">
            주문 목록을 불러오는 중…
          </p>
        )}
        {action && authorized && (
          <Dialog.Root
            open
            onOpenChange={(open) => {
              if (!open && !busy) setAction(null);
            }}
          >
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
              <Dialog.Content
                aria-describedby={undefined}
                className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6"
              >
                <Dialog.Title className="text-xl font-bold">
                  {labels[action.status]} 처리
                </Dialog.Title>
                <p className="mt-4 leading-7 text-muted-foreground">
                  {action.order.buyer_name} ·{" "}
                  {money(action.order.order_payload.totalPriceKrw)}
                  <br />
                  {action.status === "confirmed"
                    ? "실제 입금 금액을 확인하셨나요? 확인하면 저장된 템플릿으로 주문자에게 안내 문자가 발송됩니다."
                    : "입금 대기 주문을 취소합니다. 결제 환불은 처리되지 않습니다."}
                </p>
                {error && (
                  <p role="alert" className="mt-3 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    autoFocus
                    variant="outline"
                    disabled={busy}
                    onClick={() => setAction(null)}
                  >
                    돌아가기
                  </Button>
                  <Button disabled={busy} onClick={update}>
                    {busy ? "처리 중…" : labels[action.status]}
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </main>
    </div>
  );
}
