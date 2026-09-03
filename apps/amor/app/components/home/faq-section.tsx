"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

const FaqSection = () => {
  const t = useTranslations("Faq");
  const faqs = [0, 1, 2].map((index) => ({
    q: t(`items.${index}.q`),
    a: t(`items.${index}.a`),
  }));

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-[#0d0d0d] py-16 md:py-24" id="faq">
      <div className="container mx-auto max-w-2xl px-6">
        <div className="text-center">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary">
            FAQ
          </span>
          <h2 className="mt-2 text-3xl font-extrabold leading-[1.15] md:text-4xl lg:text-[46px]">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-gray-400 md:text-base">
            {t("description")}
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
