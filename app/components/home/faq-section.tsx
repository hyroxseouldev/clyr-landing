"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

const FaqSection = () => {
  const t = useTranslations("Faq");
  const faqs = [0, 1, 2].map((index) => ({
    q: t(`items.${index}.q`),
    a: t(`items.${index}.a`),
  }));

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

        <Accordion
          type="single"
          collapsible
          defaultValue="faq-0"
          className="mt-7 space-y-2"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="rounded-xl border last:border-b border-white/10 bg-white/5 px-4 data-[state=open]:border-primary/30 hover:border-primary/20"
            >
              <AccordionTrigger className="text-[14px] font-semibold text-gray-200 hover:text-primary hover:no-underline data-[state=open]:text-primary md:text-[15px]">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-[14px] text-gray-500">
                <p>{faq.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
