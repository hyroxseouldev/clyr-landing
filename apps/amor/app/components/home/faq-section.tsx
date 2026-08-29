"use client";

import React, { useState } from "react";

const FaqSection = () => {
  const faqs = [
    {
      q: "Q. 하이록스 전용 장비가 없는 일반 헬스장에서도 가능한가요?",
      a: "네, 일반 헬스장의 덤벨, 바벨, 트레드밀을 활용하여 하이록스에 필요한 기능을 극대화할 수 있는 대체 와드 프로그램을 구성해 드립니다. 전용 장비가 없어도 전혀 문제없습니다.",
    },
    {
      q: "Q. 크로스핏이나 러닝을 해본 적 없는 완전 초보자도 따라갈 수 있나요?",
      a: "물론입니다. 개인의 현재 체력 수준(RPE)과 심박수를 기준으로 부상 없이 기초부터 차근차근 빌드업할 수 있도록 조절해 드립니다. 입문자용 기초 루틴부터 시작합니다.",
    },
    {
      q: "Q. 피드백은 어떤 방식으로 진행되나요?",
      a: "본인의 운동 후 느낌점을 업로드해 주시면, 코치가 직접 자세 교정 및 템포 조절 피드백을 48시간 이내에 텍스트로 제공합니다.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-[#0d0d0d] py-16 md:py-24" id="faq">
      <div className="container mx-auto max-w-2xl px-6">
        <div className="text-center">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary">
            FAQ
          </span>
          <h2 className="mt-2 text-3xl font-extrabold leading-[1.15] md:text-4xl lg:text-[46px]">
            자주 묻는 질문
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-gray-400 md:text-base">
            AMOR LAB에 대해 가장 많이 물어보시는 내용을 정리했습니다.
          </p>
        </div>

        <div className="mt-7 space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`collapse collapse-arrow rounded-xl border ${
                  isOpen
                    ? "border-primary/30 [&_.collapse-title]:text-primary"
                    : "border-white/10 hover:border-primary/20"
                } bg-white/5`}
              >
                <input
                  type="radio"
                  name="faq-accordion"
                  checked={isOpen}
                  onChange={() => setOpenIndex(isOpen ? null : index)}
                  className="peer"
                />
                <div className="collapse-title text-[14px] font-semibold text-gray-200 hover:text-primary md:text-[15px]">
                  {faq.q}
                </div>
                <div className="collapse-content text-[14px] text-gray-500">
                  <p>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
