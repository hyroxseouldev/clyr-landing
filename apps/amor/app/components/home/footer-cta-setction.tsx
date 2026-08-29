import React from "react";

const FooterCTASection = () => {
  return (
    <section className="bg-[#080808] py-20 text-center md:py-28" id="footer">
      <div className="container mx-auto max-w-7xl px-6">
        <span className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary">
          Finally
        </span>
        <h2 className="mt-2 text-3xl font-extrabold leading-[1.15] md:text-4xl lg:text-[46px]">
          더 나은 기록,
          <br />더 강력해진 나를 만날 시간.
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-[15px] text-gray-400 md:text-base">
          지금 바로 AMOR LAB 크루에 합류하고
          <br />
          당신의 하이록스 기록을 새로 쓰세요.
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/order"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-black transition hover:bg-[#d4ff5a] hover:shadow-[0_0_30px_rgba(198,255,51,0.25)] hover:-translate-y-0.5"
          >
            지금 AMOR LAB 크루 합류하기 →
          </a>
          <a
            href="/lookup"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-primary hover:text-primary"
          >
            주문 확인하기
          </a>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-[13px] text-gray-500 sm:flex-row">
          <div className="flex flex-wrap gap-5">
            <a href="#" className="transition hover:text-primary">
              이용약관
            </a>
            <a href="#" className="transition hover:text-primary">
              개인정보처리방침
            </a>
            <a href="#" className="transition hover:text-primary">
              사업자 정보
            </a>
          </div>
          <div>&copy; 2026 AMOR LAB. All rights reserved.</div>
        </div>
      </div>
    </section>
  );
};

export default FooterCTASection;
