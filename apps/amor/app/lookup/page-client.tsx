'use client';

import { useEffect } from 'react';
import { assertPublicSupabaseEnv, supabaseUrl, tenantId } from '@/env';

const pageStyles = "*,\n    *::before,\n    *::after {\n      box-sizing: border-box;\n      margin: 0;\n      padding: 0\n    }\n\n    :root {\n      --accent: #C6FF33;\n      --surface: #121212;\n      --surface-2: #181818;\n      --line: rgba(255, 255, 255, .1);\n      --muted: #9a9a9a;\n      --text: #fff\n    }\n\n    body {\n      min-height: 100vh;\n      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;\n      background: #080808;\n      color: var(--text);\n      line-height: 1.6;\n      -webkit-font-smoothing: antialiased\n    }\n\n    a {\n      color: inherit;\n      text-decoration: none\n    }\n\n    button,\n    input {\n      font: inherit\n    }\n\n    .container {\n      width: min(920px, calc(100% - 40px));\n      margin: 0 auto\n    }\n\n    .topbar {\n      position: sticky;\n      top: 0;\n      z-index: 10;\n      background: rgba(8, 8, 8, .86);\n      backdrop-filter: blur(16px);\n      border-bottom: 1px solid rgba(255, 255, 255, .06)\n    }\n\n    .topbar-inner {\n      height: 72px;\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      gap: 20px\n    }\n\n    .brand {\n      font-size: 15px;\n      font-weight: 900;\n      letter-spacing: 2px\n    }\n\n    .top-links {\n      display: flex;\n      align-items: center;\n      gap: 18px;\n      color: #bdbdbd;\n      font-size: 13px;\n      font-weight: 700\n    }\n\n    .top-links a {\n      transition: color .25s\n    }\n\n    .top-links a:hover {\n      color: var(--accent)\n    }\n\n    main {\n      padding: 56px 0 84px\n    }\n\n    .page-head {\n      display: grid;\n      grid-template-columns: minmax(0, 1fr) minmax(260px, 360px);\n      align-items: end;\n      gap: 28px;\n      margin-bottom: 28px\n    }\n\n    .eyebrow {\n      display: inline-block;\n      color: var(--accent);\n      font-size: 12px;\n      font-weight: 800;\n      letter-spacing: 3px;\n      text-transform: uppercase;\n      margin-bottom: 10px\n    }\n\n    h1 {\n      font-size: clamp(32px, 5vw, 56px);\n      line-height: 1.05;\n      letter-spacing: 0;\n      font-weight: 900\n    }\n\n    .head-copy {\n      color: var(--muted);\n      font-size: 15px\n    }\n\n    .panel {\n      background: linear-gradient(145deg, var(--surface-2), var(--surface));\n      border: 1px solid var(--line);\n      border-radius: 8px;\n      overflow: hidden\n    }\n\n    .lookup-form {\n      display: grid;\n      grid-template-columns: 1fr 1fr auto;\n      gap: 14px;\n      align-items: end;\n      padding: 28px;\n      border-bottom: 1px solid rgba(255, 255, 255, .07)\n    }\n\n    .field {\n      display: flex;\n      flex-direction: column;\n      gap: 8px\n    }\n\n    label {\n      color: #cfcfcf;\n      font-size: 13px;\n      font-weight: 700\n    }\n\n    input {\n      width: 100%;\n      border: 1px solid rgba(255, 255, 255, .12);\n      border-radius: 8px;\n      background: rgba(255, 255, 255, .05);\n      color: #fff;\n      padding: 14px 15px;\n      outline: none;\n      transition: border-color .2s, box-shadow .2s\n    }\n\n    input:focus {\n      border-color: var(--accent);\n      box-shadow: 0 0 0 3px rgba(198, 255, 51, .12)\n    }\n\n    .lookup-button {\n      border: 0;\n      border-radius: 60px;\n      background: var(--accent);\n      color: #080808;\n      cursor: pointer;\n      font-size: 14px;\n      font-weight: 900;\n      padding: 15px 24px;\n      min-height: 51px;\n      white-space: nowrap;\n      transition: transform .25s, box-shadow .25s, background .25s\n    }\n\n    .lookup-button:hover {\n      background: #d4ff5a;\n      box-shadow: 0 0 30px rgba(198, 255, 51, .24);\n      transform: translateY(-2px)\n    }\n\n    .lookup-button:disabled {\n      cursor: wait;\n      opacity: .68;\n      transform: none;\n      box-shadow: none\n    }\n\n    .result-area {\n      padding: 28px;\n      display: grid;\n      gap: 14px\n    }\n\n    .empty,\n    .error,\n    .hint {\n      border-radius: 8px;\n      padding: 18px;\n      font-size: 14px\n    }\n\n    .hint {\n      color: #d6d6d6;\n      background: rgba(255, 255, 255, .04);\n      border: 1px solid rgba(255, 255, 255, .07)\n    }\n\n    .empty {\n      color: #e6ff9a;\n      background: rgba(198, 255, 51, .08);\n      border: 1px solid rgba(198, 255, 51, .22)\n    }\n\n    .error {\n      color: #ffb4b4;\n      background: rgba(255, 75, 75, .08);\n      border: 1px solid rgba(255, 75, 75, .22)\n    }\n\n    .order-card {\n      border: 1px solid rgba(255, 255, 255, .09);\n      border-radius: 8px;\n      background: rgba(255, 255, 255, .035);\n      padding: 20px\n    }\n\n    .order-top {\n      display: flex;\n      justify-content: space-between;\n      align-items: flex-start;\n      gap: 16px;\n      margin-bottom: 16px\n    }\n\n    .program-name {\n      color: var(--accent);\n      font-size: 15px;\n      font-weight: 900;\n      line-height: 1.4\n    }\n\n    .order-id {\n      color: #777;\n      font-size: 12px;\n      margin-top: 4px\n    }\n\n    .status {\n      flex: 0 0 auto;\n      border-radius: 999px;\n      border: 1px solid rgba(255, 255, 255, .12);\n      padding: 7px 12px;\n      color: #fff;\n      font-size: 12px;\n      font-weight: 900\n    }\n\n    .status.pending {\n      border-color: rgba(198, 255, 51, .35);\n      color: var(--accent);\n      background: rgba(198, 255, 51, .08)\n    }\n\n    .status.confirmed {\n      border-color: rgba(92, 255, 158, .35);\n      color: #8cffb9;\n      background: rgba(92, 255, 158, .08)\n    }\n\n    .status.canceled {\n      border-color: rgba(255, 75, 75, .28);\n      color: #ffb4b4;\n      background: rgba(255, 75, 75, .08)\n    }\n\n    .meta-grid {\n      display: grid;\n      grid-template-columns: repeat(3, minmax(0, 1fr));\n      gap: 10px\n    }\n\n    .meta {\n      border: 1px solid rgba(255, 255, 255, .07);\n      border-radius: 8px;\n      background: rgba(255, 255, 255, .035);\n      padding: 12px\n    }\n\n    .meta-label {\n      color: #777;\n      font-size: 11px;\n      font-weight: 800;\n      margin-bottom: 4px\n    }\n\n    .meta-value {\n      color: #fff;\n      font-size: 13px;\n      font-weight: 800;\n      word-break: keep-all\n    }\n\n    @media(max-width:800px) {\n      .page-head,\n      .lookup-form {\n        grid-template-columns: 1fr\n      }\n\n      .lookup-button {\n        width: 100%\n      }\n\n      .meta-grid {\n        grid-template-columns: 1fr\n      }\n    }\n\n    @media(max-width:640px) {\n      .container {\n        width: min(100% - 28px, 920px)\n      }\n\n      main {\n        padding-top: 36px\n      }\n\n      .topbar-inner {\n        height: 64px\n      }\n\n      .top-links {\n        gap: 12px\n      }\n\n      .lookup-form,\n      .result-area {\n        padding: 22px\n      }\n    }";
const pageMarkup = "<header class=\"topbar\">\n    <div class=\"container topbar-inner\">\n      <a class=\"brand\" href=\"/\">AMOR LAB</a>\n      <nav class=\"top-links\" aria-label=\"상단 이동\">\n        <a href=\"/order\">주문하기</a>\n        <a href=\"/#pricing\">프로그램 보기</a>\n      </nav>\n    </div>\n  </header>\n\n  <main>\n    <div class=\"container\">\n      <div class=\"page-head\">\n        <div>\n          <span class=\"eyebrow\">Order Lookup</span>\n          <h1>주문 확인</h1>\n        </div>\n        <p class=\"head-copy\">주문할 때 입력한 이름과 연락처로 신청 내역을 확인할 수 있습니다.</p>\n      </div>\n\n      <section class=\"panel\" aria-labelledby=\"lookupTitle\">\n        <form class=\"lookup-form\" id=\"lookupForm\">\n          <div class=\"field\">\n            <label for=\"buyerName\">이름</label>\n            <input id=\"buyerName\" name=\"buyerName\" autocomplete=\"name\" required placeholder=\"홍길동\" />\n          </div>\n          <div class=\"field\">\n            <label for=\"buyerPhone\">핸드폰 번호</label>\n            <input id=\"buyerPhone\" name=\"buyerPhone\" autocomplete=\"tel\" required placeholder=\"010-0000-0000\" />\n          </div>\n          <button class=\"lookup-button\" type=\"submit\" id=\"lookupButton\">조회하기</button>\n        </form>\n\n        <div class=\"result-area\" id=\"resultArea\">\n          <div class=\"hint\" id=\"lookupTitle\">주문자 이름과 핸드폰 번호를 입력한 뒤 조회해 주세요.</div>\n        </div>\n      </section>\n    </div>\n  </main>";

export default function LookupPageClient() {
  useEffect(() => {
    assertPublicSupabaseEnv();

    const formatPrice = value => new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

    const formatDate = value => {
      if (!value) return '-';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    };

    const statusMeta = status => ({
      pending: { label: '입금 확인 대기', className: 'pending' },
      confirmed: { label: '확인 완료', className: 'confirmed' },
      canceled: { label: '취소됨', className: 'canceled' },
    }[status] || { label: status || '상태 확인 중', className: '' });

    function renderOrders(orders) {
      const resultArea = document.getElementById('resultArea');

      if (!orders.length) {
        resultArea.innerHTML = '<div class="empty">일치하는 주문 내역이 없습니다. 이름과 핸드폰 번호를 다시 확인해 주세요.</div>';
        return;
      }

      resultArea.innerHTML = orders.map(order => {
        const payload = order.order_payload || {};
        const status = statusMeta(order.status);
        const totalPrice = payload.totalPriceKrw || ((payload.monthlyPriceKrw || 0) * (payload.durationMonths || 1));

        return `
          <article class="order-card">
            <div class="order-top">
              <div>
                <div class="program-name">${payload.programName || 'AMOR 프로그램'}</div>
                <div class="order-id">주문번호 ${order.id || '-'}</div>
              </div>
              <span class="status ${status.className}">${status.label}</span>
            </div>
            <div class="meta-grid">
              <div class="meta">
                <div class="meta-label">결제 금액</div>
                <div class="meta-value">${formatPrice(totalPrice)}</div>
              </div>
              <div class="meta">
                <div class="meta-label">수강 기간</div>
                <div class="meta-value">${payload.durationMonths || '-'}개월</div>
              </div>
              <div class="meta">
                <div class="meta-label">주문 일시</div>
                <div class="meta-value">${formatDate(order.created_at)}</div>
              </div>
            </div>
          </article>
        `;
      }).join('');
    }

    const form = document.getElementById('lookupForm') as HTMLFormElement | null;
    if (!form) return;

    const handleSubmit = async event => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;

      const formData = new FormData(event.currentTarget);
      const lookupButton = document.getElementById('lookupButton') as HTMLButtonElement | null;
      const resultArea = document.getElementById('resultArea') as HTMLElement | null;
      if (!lookupButton || !resultArea) return;

      lookupButton.disabled = true;
      lookupButton.textContent = '조회 중...';
      resultArea.innerHTML = '<div class="hint">주문 내역을 조회하고 있습니다.</div>';

      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/lookup-guest-orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenantId,
            buyerName: String(formData.get('buyerName') || '').trim(),
            buyerPhone: String(formData.get('buyerPhone') || '').trim(),
          }),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) {
          throw new Error(result.error || result.message || '주문 조회에 실패했습니다.');
        }

        renderOrders(result.orders || []);
      } catch (error) {
        resultArea.innerHTML = `<div class="error">주문 조회 중 오류가 발생했습니다.<br />${error.message}</div>`;
      } finally {
        lookupButton.disabled = false;
        lookupButton.textContent = '조회하기';
      }
    };

    form.addEventListener('submit', handleSubmit);
    return () => form.removeEventListener('submit', handleSubmit);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <div dangerouslySetInnerHTML={{ __html: pageMarkup }} />
    </>
  );
}
