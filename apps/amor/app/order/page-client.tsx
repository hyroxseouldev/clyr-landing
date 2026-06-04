'use client';

import { useEffect } from 'react';
import { programs } from '@/data/programs';
import { assertPublicSupabaseEnv, supabaseAnonKey, supabaseUrl, tenantId } from '@/env';
import { EARLY_BIRD_END_AT_MS, getProgramPricing } from '@/pricing';

const pageStyles = "*,\n    *::before,\n    *::after {\n      box-sizing: border-box;\n      margin: 0;\n      padding: 0\n    }\n\n    :root {\n      --accent: #C6FF33;\n      --surface: #121212;\n      --surface-2: #181818;\n      --line: rgba(255, 255, 255, .1);\n      --muted: #9a9a9a;\n      --text: #fff\n    }\n\n    body {\n      min-height: 100vh;\n      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;\n      background: #080808;\n      color: var(--text);\n      line-height: 1.6;\n      -webkit-font-smoothing: antialiased\n    }\n\n    a {\n      color: inherit;\n      text-decoration: none\n    }\n\n    img {\n      display: block;\n      max-width: 100%\n    }\n\n    button,\n    input,\n    select,\n    textarea {\n      font: inherit\n    }\n\n    .container {\n      width: min(1120px, calc(100% - 40px));\n      margin: 0 auto\n    }\n\n    .topbar {\n      position: sticky;\n      top: 0;\n      z-index: 10;\n      background: rgba(8, 8, 8, .86);\n      backdrop-filter: blur(16px);\n      border-bottom: 1px solid rgba(255, 255, 255, .06)\n    }\n\n    .topbar-inner {\n      height: 72px;\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      gap: 20px\n    }\n\n    .brand {\n      font-size: 15px;\n      font-weight: 900;\n      letter-spacing: 2px\n    }\n\n    .back-link {\n      color: #bdbdbd;\n      font-size: 13px;\n      font-weight: 700;\n      transition: color .25s\n    }\n\n    .back-link:hover {\n      color: var(--accent)\n    }\n\n    .top-links {\n      display: flex;\n      align-items: center;\n      gap: 18px\n    }\n\n    main {\n      padding: 56px 0 84px\n    }\n\n    .page-head {\n      display: grid;\n      grid-template-columns: minmax(0, 1fr) auto;\n      align-items: end;\n      gap: 28px;\n      margin-bottom: 28px\n    }\n\n    .eyebrow {\n      display: inline-block;\n      color: var(--accent);\n      font-size: 12px;\n      font-weight: 800;\n      letter-spacing: 3px;\n      text-transform: uppercase;\n      margin-bottom: 10px\n    }\n\n    h1 {\n      font-size: clamp(32px, 5vw, 56px);\n      line-height: 1.05;\n      letter-spacing: 0;\n      font-weight: 900\n    }\n\n    .head-copy {\n      max-width: 420px;\n      color: var(--muted);\n      font-size: 15px\n    }\n\n    .order-grid {\n      display: grid;\n      grid-template-columns: minmax(0, 1fr) 380px;\n      gap: 24px;\n      align-items: start\n    }\n\n    .panel {\n      background: linear-gradient(145deg, var(--surface-2), var(--surface));\n      border: 1px solid var(--line);\n      border-radius: 8px;\n      overflow: hidden\n    }\n\n    .panel-section {\n      padding: 28px;\n      border-bottom: 1px solid rgba(255, 255, 255, .07)\n    }\n\n    .panel-section:last-child {\n      border-bottom: 0\n    }\n\n    .section-title {\n      font-size: 18px;\n      font-weight: 900;\n      margin-bottom: 18px\n    }\n\n    .program-card {\n      display: grid;\n      grid-template-columns: 1fr;\n      gap: 22px\n    }\n\n    .program-thumb {\n      aspect-ratio: 1 / 1;\n      min-height: 0;\n      max-height: 520px;\n      border-radius: 8px;\n      overflow: hidden;\n      background: #222\n    }\n\n    .program-thumb img {\n      width: 100%;\n      height: 100%;\n      object-fit: cover\n    }\n\n    .program-meta {\n      display: flex;\n      flex-direction: column;\n      min-width: 0\n    }\n\n    .program-title {\n      color: var(--accent);\n      font-size: 15px;\n      font-weight: 900;\n      letter-spacing: 1px;\n      text-transform: uppercase;\n      margin-bottom: 8px\n    }\n\n    .program-desc {\n      color: #cfcfcf;\n      font-size: 14px;\n      white-space: pre-line;\n      margin-bottom: 18px\n    }\n\n    .facts {\n      display: grid;\n      grid-template-columns: repeat(3, minmax(0, 1fr));\n      gap: 10px;\n      margin-top: auto\n    }\n\n    .fact {\n      background: rgba(255, 255, 255, .04);\n      border: 1px solid rgba(255, 255, 255, .07);\n      border-radius: 8px;\n      padding: 12px\n    }\n\n    .fact-label {\n      color: #777;\n      font-size: 11px;\n      font-weight: 700;\n      margin-bottom: 4px\n    }\n\n    .fact-value {\n      color: #fff;\n      font-size: 13px;\n      font-weight: 800\n    }\n\n    .form-grid {\n      display: grid;\n      grid-template-columns: 1fr 1fr;\n      gap: 16px\n    }\n\n    .field {\n      display: flex;\n      flex-direction: column;\n      gap: 8px\n    }\n\n    .field.full {\n      grid-column: 1 / -1\n    }\n\n    label {\n      color: #cfcfcf;\n      font-size: 13px;\n      font-weight: 700\n    }\n\n    input,\n    select,\n    textarea {\n      width: 100%;\n      border: 1px solid rgba(255, 255, 255, .12);\n      border-radius: 8px;\n      background: rgba(255, 255, 255, .05);\n      color: #fff;\n      padding: 14px 15px;\n      outline: none;\n      transition: border-color .2s, box-shadow .2s\n    }\n\n    select option {\n      color: #111\n    }\n\n    textarea {\n      min-height: 112px;\n      resize: vertical\n    }\n\n    input:focus,\n    select:focus,\n    textarea:focus {\n      border-color: var(--accent);\n      box-shadow: 0 0 0 3px rgba(198, 255, 51, .12)\n    }\n\n    .payment-list {\n      display: grid;\n      gap: 10px\n    }\n\n    .pay-option {\n      display: flex;\n      align-items: center;\n      gap: 12px;\n      border: 1px solid rgba(255, 255, 255, .1);\n      border-radius: 8px;\n      padding: 15px;\n      background: rgba(255, 255, 255, .035);\n      cursor: pointer\n    }\n\n    .pay-option:has(input:disabled) {\n      opacity: .42;\n      cursor: not-allowed\n    }\n\n    .pay-option input {\n      width: 18px;\n      height: 18px;\n      accent-color: var(--accent)\n    }\n\n    .pay-main {\n      font-size: 14px;\n      font-weight: 800\n    }\n\n    .pay-sub {\n      color: #777;\n      font-size: 12px\n    }\n\n    .bank-account {\n      margin-top: 14px;\n      border: 1px solid rgba(198, 255, 51, .2);\n      border-radius: 8px;\n      background: rgba(198, 255, 51, .07);\n      padding: 14px 15px\n    }\n\n    .bank-account-label {\n      color: #aebd75;\n      font-size: 12px;\n      font-weight: 800;\n      margin-bottom: 4px\n    }\n\n    .bank-account-number {\n      color: #fff;\n      font-size: 16px;\n      font-weight: 900\n    }\n\n    .summary {\n      position: sticky;\n      top: 96px\n    }\n\n    .summary-head {\n      padding: 24px;\n      border-bottom: 1px solid rgba(255, 255, 255, .07)\n    }\n\n    .summary-program {\n      color: var(--accent);\n      font-size: 13px;\n      font-weight: 900;\n      text-transform: uppercase;\n      line-height: 1.5;\n      margin-bottom: 10px\n    }\n\n    .summary-desc {\n      color: #999;\n      font-size: 13px\n    }\n\n    .summary-lines {\n      padding: 22px 24px;\n      display: grid;\n      gap: 12px\n    }\n\n    .summary-line {\n      display: flex;\n      justify-content: space-between;\n      gap: 20px;\n      color: #bdbdbd;\n      font-size: 14px\n    }\n\n    .summary-line strong {\n      color: #fff\n    }\n\n    .total {\n      padding-top: 16px;\n      border-top: 1px solid rgba(255, 255, 255, .08);\n      align-items: baseline\n    }\n\n    .total strong {\n      color: var(--accent);\n      font-size: 28px;\n      font-weight: 900\n    }\n\n    .agree {\n      display: flex;\n      align-items: flex-start;\n      gap: 10px;\n      padding: 0 24px 18px;\n      color: #9d9d9d;\n      font-size: 12px\n    }\n\n    .agree input {\n      width: 16px;\n      height: 16px;\n      margin-top: 2px;\n      accent-color: var(--accent);\n      flex: 0 0 auto\n    }\n\n    .order-button {\n      width: calc(100% - 48px);\n      margin: 0 24px 24px;\n      border: 0;\n      border-radius: 60px;\n      background: var(--accent);\n      color: #080808;\n      cursor: pointer;\n      font-size: 15px;\n      font-weight: 900;\n      padding: 17px 20px;\n      transition: transform .25s, box-shadow .25s, background .25s\n    }\n\n    .order-button:hover {\n      background: #d4ff5a;\n      box-shadow: 0 0 30px rgba(198, 255, 51, .24);\n      transform: translateY(-2px)\n    }\n\n    .order-button:disabled {\n      cursor: wait;\n      opacity: .68;\n      transform: none;\n      box-shadow: none\n    }\n\n    .notice {\n      display: none;\n      margin: 18px 24px 0;\n      border: 1px solid rgba(198, 255, 51, .26);\n      border-radius: 8px;\n      background: rgba(198, 255, 51, .09);\n      color: #e6ff9a;\n      padding: 14px;\n      font-size: 13px\n    }\n\n    .error {\n      padding: 28px;\n      color: #ffb4b4;\n      background: rgba(255, 75, 75, .08);\n      border: 1px solid rgba(255, 75, 75, .22);\n      border-radius: 8px\n    }\n\n    @media(max-width:900px) {\n      .page-head,\n      .order-grid {\n        grid-template-columns: 1fr\n      }\n\n      .summary {\n        position: static\n      }\n    }\n\n    @media(max-width:640px) {\n      .container {\n        width: min(100% - 28px, 1120px)\n      }\n\n      main {\n        padding-top: 36px\n      }\n\n      .topbar-inner {\n        height: 64px\n      }\n\n      .program-card,\n      .form-grid,\n      .facts {\n        grid-template-columns: 1fr\n      }\n\n      .program-thumb {\n        max-height: none\n      }\n\n      .panel-section {\n        padding: 22px\n      }\n    }";
const pageMarkup = "<header class=\"topbar\">\n    <div class=\"container topbar-inner\">\n      <a class=\"brand\" href=\"/\">AMOR LAB</a>\n      <nav class=\"top-links\" aria-label=\"상단 이동\">\n        <a class=\"back-link\" href=\"/lookup\">주문 확인</a>\n        <a class=\"back-link\" href=\"/#pricing\">프로그램 다시 보기</a>\n      </nav>\n    </div>\n  </header>\n\n  <main>\n    <div class=\"container\">\n      <div class=\"page-head\">\n        <div>\n          <span class=\"eyebrow\">Program Order</span>\n          <h1>프로그램 주문</h1>\n        </div>\n        <p class=\"head-copy\">선택한 코칭 프로그램 정보를 확인하고 주문자 정보와 결제 방법을 입력해 주세요.</p>\n      </div>\n\n      <form class=\"order-grid\" id=\"orderForm\">\n        <div class=\"panel\">\n          <section class=\"panel-section\">\n            <h2 class=\"section-title\">프로그램 정보</h2>\n            <div id=\"programArea\">\n              <div class=\"error\">프로그램 정보를 불러오는 중입니다.</div>\n            </div>\n          </section>\n\n          <section class=\"panel-section\">\n            <h2 class=\"section-title\">주문자 정보</h2>\n            <div class=\"form-grid\">\n              <div class=\"field\">\n                <label for=\"buyerName\">이름</label>\n                <input id=\"buyerName\" name=\"buyerName\" autocomplete=\"name\" required placeholder=\"홍길동\" />\n              </div>\n              <div class=\"field\">\n                <label for=\"buyerPhone\">연락처</label>\n                <input id=\"buyerPhone\" name=\"buyerPhone\" autocomplete=\"tel\" required placeholder=\"010-0000-0000\" />\n              </div>\n              <div class=\"field full\">\n                <label for=\"buyerEmail\">이메일</label>\n                <input id=\"buyerEmail\" name=\"buyerEmail\" type=\"email\" autocomplete=\"email\" required\n                  placeholder=\"amor@example.com\" />\n              </div>\n              <div class=\"field full\">\n                <label for=\"goal\">목표 및 참고 사항</label>\n                <textarea id=\"goal\" name=\"goal\" placeholder=\"현재 기록, 목표 대회, 개선하고 싶은 부분을 적어주세요.\"></textarea>\n              </div>\n            </div>\n          </section>\n\n          <section class=\"panel-section\">\n            <h2 class=\"section-title\">결제 방법</h2>\n            <div class=\"payment-list\">\n              <label class=\"pay-option\">\n                <input type=\"radio\" name=\"paymentMethod\" value=\"card\" disabled />\n                <span>\n                  <span class=\"pay-main\">신용/체크카드</span><br />\n                  <span class=\"pay-sub\">카드 결제 연동 예정</span>\n                </span>\n              </label>\n              <label class=\"pay-option\">\n                <input type=\"radio\" name=\"paymentMethod\" value=\"kakao\" disabled />\n                <span>\n                  <span class=\"pay-main\">카카오페이</span><br />\n                  <span class=\"pay-sub\">간편 결제 연동 예정</span>\n                </span>\n              </label>\n              <label class=\"pay-option\">\n                <input type=\"radio\" name=\"paymentMethod\" value=\"bank\" checked />\n                <span>\n                  <span class=\"pay-main\">무통장 입금</span><br />\n                  <span class=\"pay-sub\">국민은행 824001-04-091290 · 전준현</span>\n                </span>\n              </label>\n              <div class=\"bank-account\">\n                <div class=\"bank-account-label\">입금 계좌</div>\n                <div class=\"bank-account-number\">국민은행 824001-04-091290</div>\n                <div class=\"pay-sub\">예금주 전준현</div>\n              </div>\n            </div>\n          </section>\n        </div>\n\n        <aside class=\"panel summary\" aria-label=\"주문 요약\">\n          <div class=\"summary-head\">\n            <div class=\"summary-program\" id=\"summaryTitle\">프로그램 선택 중</div>\n            <p class=\"summary-desc\" id=\"summaryDesc\">선택된 프로그램의 주문 금액을 확인해 주세요.</p>\n          </div>\n          <div class=\"summary-lines\">\n            <div class=\"summary-line\">\n              <span>수강 기간</span>\n              <strong id=\"summaryDuration\">-</strong>\n            </div>\n            <div class=\"summary-line\">\n              <span>담당 코치</span>\n              <strong id=\"summaryCoach\">-</strong>\n            </div>\n            <div class=\"summary-line\">\n              <span>입금 계좌</span>\n              <strong>국민 824001-04-091290 · 전준현</strong>\n            </div>\n            <div class=\"summary-line total\">\n              <span>결제 금액</span>\n              <strong id=\"summaryPrice\">-</strong>\n            </div>\n          </div>\n          <label class=\"agree\">\n            <input type=\"checkbox\" id=\"agree\" required />\n            <span>주문 정보와 결제 진행 안내를 확인했습니다.</span>\n          </label>\n          <button class=\"order-button\" type=\"submit\" id=\"orderButton\">주문하기</button>\n        </aside>\n      </form>\n    </div>\n  </main>";
const durationOptions = [1, 2, 3].map(months => ({
  duration_months: months,
  price_krw: 0,
  is_enabled: true,
}));
const bankAccount = {
  bankName: '국민은행',
  accountNumber: '824001-04-091290',
  holderName: '전준현',
};

export default function OrderPageClient({ initialNowMs }: { initialNowMs: number }) {
  useEffect(() => {
    assertPublicSupabaseEnv();

    const state = {
      programs: [...programs],
      selectedProgram: null,
      selectedDuration: null,
      nowMs: initialNowMs,
    };

    const formatPrice = value => new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(value || 0);

    const difficultyLabel = difficulty => ({
      beginner: '입문',
      intermediate: '중급',
      advanced: '상급',
    }[difficulty] || difficulty || '-');

    const enabledDurations = program => {
      const pricing = getProgramPricing(program.id, state.nowMs);
      const monthlyPrice = pricing?.finalPriceKrw || program.products?.find(item => item.is_active)?.price_krw || 99000;
      const regularMonthlyPrice = pricing?.regularPriceKrw || monthlyPrice;
      return durationOptions.map(option => ({
        ...option,
        pricingPhase: pricing?.pricingPhase || 'regular',
        regularPriceKrw: regularMonthlyPrice,
        finalPriceKrw: monthlyPrice,
        regular_total_price_krw: regularMonthlyPrice * option.duration_months,
        price_krw: monthlyPrice * option.duration_months,
      }));
    };

    function renderSummary() {
      const program = state.selectedProgram;
      const duration = state.selectedDuration;
      if (!program || !duration) return;

      document.getElementById('summaryTitle').textContent = program.title;
      document.getElementById('summaryDesc').textContent = program.description || '선택된 프로그램입니다.';
      document.getElementById('summaryDuration').textContent = `${duration.duration_months}개월`;
      document.getElementById('summaryCoach').textContent = program.coach_name || '전준현';
      document.getElementById('summaryPrice').textContent = formatPrice(duration.price_krw);
    }

    function renderProgram(program) {
      const durations = enabledDurations(program);
      state.selectedProgram = program;
      state.selectedDuration = durations[0];

      document.getElementById('programArea').innerHTML = `
        <div class="program-card">
          <div class="program-thumb">
            <img src="${program.thumbnail_url || '/assets/record.png'}" alt="${program.title}" />
          </div>
          <div class="program-meta">
            <label for="programSelect">선택 프로그램</label>
            <select id="programSelect" name="programId" style="margin:8px 0 14px">
              ${state.programs.map(item => `<option value="${item.id}" ${item.id === program.id ? 'selected' : ''}>${item.title}</option>`).join('')}
            </select>
            <div class="program-title">${program.title}</div>
            <p class="program-desc">${program.description || ''}</p>
            <div class="field" style="margin-bottom:16px">
              <label for="durationSelect">수강 기간</label>
              <select id="durationSelect" name="duration">
                ${durations.map((item, index) => `<option value="${index}">${item.duration_months}개월 · ${formatPrice(item.price_krw)}</option>`).join('')}
              </select>
            </div>
            <div class="facts">
              <div class="fact">
                <div class="fact-label">난이도</div>
                <div class="fact-value">${difficultyLabel(program.difficulty)}</div>
              </div>
              <div class="fact">
                <div class="fact-label">주간 훈련</div>
                <div class="fact-value">주 ${program.days_per_week || '-'}회</div>
              </div>
              <div class="fact">
                <div class="fact-label">일일 시간</div>
                <div class="fact-value">${program.daily_workout_minutes || '-'}분</div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.getElementById('programSelect')?.addEventListener('change', event => {
        const target = event.target as HTMLSelectElement;
        const nextProgram = state.programs.find(item => item.id === target.value);
        if (nextProgram) {
          const url = new URL(window.location.href);
          url.searchParams.set('program', nextProgram.id);
          window.history.replaceState({}, '', url);
          renderProgram(nextProgram);
        }
      });

      document.getElementById('durationSelect')?.addEventListener('change', event => {
        const target = event.target as HTMLSelectElement;
        state.selectedDuration = durations[Number(target.value)];
        renderSummary();
      });

      renderSummary();
    }

    function loadPrograms() {
      state.programs = [...programs].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      const params = new URLSearchParams(window.location.search);
      const requestedId = params.get('program');
      const program = state.programs.find(item => item.id === requestedId) || state.programs[0];

      if (!program) {
        document.getElementById('programArea').innerHTML = '<div class="error">표시할 프로그램이 없습니다.</div>';
        return;
      }

      renderProgram(program);
    }

    const form = document.getElementById('orderForm') as HTMLFormElement | null;
    if (!form) return;

    const handleSubmit = async event => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;

      const orderButton = document.getElementById('orderButton') as HTMLButtonElement | null;
      if (!orderButton) return;

      const formData = new FormData(event.currentTarget);
      const program = state.selectedProgram;
      const duration = state.selectedDuration;

      if (!program || !duration) {
        alert('프로그램 정보를 확인할 수 없습니다. 다시 시도해 주세요.');
        return;
      }

      orderButton.disabled = true;
      orderButton.textContent = '주문 처리 중...';

      try {
        const monthlyPriceKrw = Math.round(duration.price_krw / duration.duration_months);
        const response = await fetch(`${supabaseUrl}/functions/v1/create-guest-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            tenantId,
            buyerName: formData.get('buyerName'),
            buyerPhone: formData.get('buyerPhone'),
            orderPayload: {
              programId: program.id,
              programName: program.title,
              storeName: 'AMOR LAB 랜딩',
              buyerEmail: formData.get('buyerEmail'),
              buyerGoal: formData.get('goal'),
              paymentMethod: formData.get('paymentMethod'),
              pricingPhase: duration.pricingPhase,
              regularPriceKrw: duration.regularPriceKrw,
              finalPriceKrw: duration.finalPriceKrw,
              regularTotalPriceKrw: duration.regular_total_price_krw,
              monthlyPriceKrw,
              durationMonths: duration.duration_months,
              totalPriceKrw: duration.price_krw,
              bankAccount,
            },
          }),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) {
          throw new Error(result.error || result.message || '주문 생성에 실패했습니다.');
        }

        alert(`주문이 완료되었습니다.\n입금 계좌: ${bankAccount.bankName} ${bankAccount.accountNumber}\n예금주: ${bankAccount.holderName}`);
        window.location.href = '/';
      } catch (error) {
        alert(`주문 처리 중 오류가 발생했습니다.\n${error.message}`);
        orderButton.disabled = false;
        orderButton.textContent = '주문하기';
      }
    };

    form.addEventListener('submit', handleSubmit);
    loadPrograms();

    const msUntilEarlyBirdEnds = EARLY_BIRD_END_AT_MS - state.nowMs;
    const earlyBirdTimer = msUntilEarlyBirdEnds > 0
      ? window.setTimeout(() => {
        state.nowMs = Date.now();
        if (state.selectedProgram) renderProgram(state.selectedProgram);
      }, msUntilEarlyBirdEnds + 1000)
      : null;

    return () => {
      form.removeEventListener('submit', handleSubmit);
      if (earlyBirdTimer) window.clearTimeout(earlyBirdTimer);
    };
  }, [initialNowMs]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <div dangerouslySetInnerHTML={{ __html: pageMarkup }} />
    </>
  );
}
