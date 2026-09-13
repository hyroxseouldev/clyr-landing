"use client";
import { useEffect, useState } from "react";
import { MessageSquare, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { renderPaymentMessage } from "@/orders/message-template";
export function MessageTemplateEditor() {
  const [body, setBody] = useState("");
  const [savedBody, setSavedBody] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/message-template", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setBody(result.body);
        setSavedBody(result.saved ? result.body : null);
        setReady(true);
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e.message || "템플릿을 불러오지 못했습니다.");
      });
    return () => controller.abort();
  }, []);
  let preview = "";
  try {
    preview = renderPaymentMessage(body, {
      id: "AMOR-EXAMPLE",
      buyer_name: "김아모",
      order_payload: {
        programName: "HYROX 기초 프로그램",
        durationMonths: 1,
        totalPriceKrw: 150000,
      },
    });
  } catch {
    preview = "지원하는 치환 항목으로 템플릿을 작성해 주세요.";
  }
  async function save() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/message-template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setSavedBody(body);
      setNotice("템플릿을 저장했습니다. 이후 입금 확인 주문부터 적용됩니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="mb-7 rounded-2xl border border-border bg-card p-5">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-semibold">
          <MessageSquare className="size-4 text-primary" />
          입금 확인 자동 문자
        </span>
        <span className="text-xs text-muted-foreground">
          {!ready
            ? "불러오는 중…"
            : savedBody === null
              ? "첫 발송 전 템플릿 저장 필요"
              : savedBody !== body
                ? "저장하지 않은 변경사항"
                : "저장된 템플릿 사용"}{" "}
          · 펼치기
        </span>
      </summary>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="message-template">문자 템플릿</Label>
          <p className="text-xs leading-6 text-muted-foreground">
            입금 확인 시 주문자에게 자동 발송됩니다. 최대 600자.
            <br />
            {
              "치환 항목: {{이름}}, {{프로그램}}, {{기간}}, {{금액}}, {{주문번호}}"
            }
          </p>
          <Textarea
            id="message-template"
            className="min-h-52 leading-7"
            value={body}
            maxLength={600}
            disabled={!ready || busy}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {body.length} / 600
            </span>
            <Button disabled={!ready || busy || !body.trim()} onClick={save}>
              <Save className="size-4" />
              {busy ? "저장 중…" : "템플릿 저장"}
            </Button>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-medium">미리보기 · 예시 주문</p>
          <div className="rounded-2xl rounded-tl-sm bg-muted p-5 text-sm leading-7 whitespace-pre-wrap">
            {preview}
          </div>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            장문 문자(LMS)로 발송되며 SOLAPI 발송 요금이 적용됩니다. 템플릿
            저장만으로 문자가 발송되지는 않습니다.
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-4 text-sm text-primary" role="status">
          {notice}
        </p>
      )}
    </details>
  );
}
