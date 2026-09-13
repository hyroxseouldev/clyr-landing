"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, Smartphone } from "lucide-react";
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  useSession,
  signOut,
} from "@/auth/client";
import { toSolapiRecipient } from "@/auth/phone";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function PhoneVerification({ english = false }: { english?: boolean }) {
  const { data: session, isPending, refetch } = useSession();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sentAt, setSentAt] = useState(0);
  const [now, setNow] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const text = (ko: string, en: string) => (english ? en : ko);
  useEffect(() => {
    if (!sentAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [sentAt]);
  const remaining = Math.max(0, 180 - Math.floor((now - sentAt) / 1000));
  const cooldown = Math.max(0, 60 - Math.floor((now - sentAt) / 1000));
  async function send() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await sendPhoneOtp(phone);
      if (result.error) throw new Error(result.error.message);
      const time = Date.now();
      setSentAt(time);
      setNow(time);
      setCode("");
      setNotice(
        text(
          "인증번호를 보냈어요. 문자로 받은 6자리를 입력해 주세요.",
          "Enter the six-digit code sent to your phone.",
        ),
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : text("발송에 실패했습니다.", "Could not send code."),
      );
    } finally {
      setBusy(false);
    }
  }
  async function verify() {
    setBusy(true);
    setError("");
    try {
      const result = await verifyPhoneOtp(phone, code);
      if (result.error) throw new Error(result.error.message);
      await refetch();
      setCode("");
      setSentAt(0);
      setNotice("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : text("인증에 실패했습니다.", "Verification failed."),
      );
    } finally {
      setBusy(false);
    }
  }
  const verified =
    session?.user.phoneNumberVerified && session.user.phoneNumber;
  if (isPending)
    return (
      <p role="status" className="text-sm text-muted-foreground">
        {text("인증 상태 확인 중…", "Checking verification…")}
      </p>
    );
  if (verified)
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">
              {text("휴대폰 인증 완료", "Phone verified")}
            </p>
            <p className="mt-1 text-sm tabular-nums text-muted-foreground">
              {toSolapiRecipient(String(verified))}
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              const result = await signOut();
              if (result.error) throw new Error(result.error.message);
              await refetch();
            } catch {
              setError(text("로그아웃에 실패했습니다.", "Sign out failed."));
            } finally {
              setBusy(false);
            }
          }}
        >
          {text("다른 번호 인증", "Use another number")}
        </Button>
        {error && <p role="alert">{error}</p>}
      </div>
    );
  return (
    <section
      aria-label={text("휴대폰 인증", "Phone verification")}
      className="space-y-4 rounded-xl border border-border bg-background/50 p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 font-semibold">
        <Smartphone className="size-4 text-primary" />
        {text("휴대폰 인증", "Verify your phone")}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {text(
          "주문에 사용할 연락처를 확인하고 주문을 안전하게 조회하세요.",
          "Verify your Korean mobile number to place and view orders.",
        )}
      </p>
      <div className="space-y-2">
        <Label htmlFor="auth-phone">
          {text("휴대폰 번호", "Mobile number")}
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="auth-phone"
            type="tel"
            autoComplete="tel"
            placeholder="010-0000-0000"
            value={phone}
            disabled={busy || !!sentAt}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={busy || (sentAt > 0 && cooldown > 0)}
            onClick={send}
          >
            {sentAt && cooldown > 0
              ? `${cooldown}s`
              : text(
                  sentAt ? "재전송" : "인증번호 받기",
                  sentAt ? "Resend" : "Send code",
                )}
          </Button>
        </div>
      </div>
      {sentAt > 0 && (
        <div className="space-y-3">
          <p role="status" className="text-xs text-muted-foreground">
            {notice}
          </p>
          <Label htmlFor="auth-code">
            {text("인증번호 6자리", "Six-digit code")}
          </Label>
          <Input
            id="auth-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            disabled={busy}
            placeholder="000000"
            className="h-12 text-center text-lg tracking-[0.4em]"
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!busy && code.length === 6 && remaining > 0) void verify();
              }
            }}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {remaining > 0
                ? `${text("남은 시간", "Expires in")} ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
                : text(
                    "만료됐어요. 인증번호를 다시 받아주세요.",
                    "Code expired. Request another code.",
                  )}
            </span>
            <button
              type="button"
              className="underline underline-offset-4"
              disabled={busy}
              onClick={() => {
                setSentAt(0);
                setCode("");
                setError("");
                setNotice("");
              }}
            >
              {text("번호 수정", "Edit number")}
            </button>
          </div>
          <Button
            type="button"
            className="w-full"
            disabled={busy || code.length !== 6 || remaining <= 0}
            onClick={verify}
          >
            {busy
              ? text("확인 중…", "Verifying…")
              : text("인증하고 계속", "Verify and continue")}
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
