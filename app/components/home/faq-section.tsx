"use client";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
export default function FaqSection() {
  const t = useTranslations("Faq");
  const en = useLocale() === "en";
  return (
    <section className="editorial-section questions-section" id="faq">
      <div>
        <span className="eyebrow">05 / BEFORE YOU START</span>
        <h2>
          GOOD
          <br />
          <span>QUESTIONS.</span>
        </h2>
        <p>{t("description")}</p>
        <a
          className="text-link"
          href="https://www.instagram.com/amor_jh.special/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {en ? "Ask us anything" : "더 궁금한 점이 있다면"}
          <ArrowUpRight size={16} />
        </a>
      </div>
      <Accordion
        type="single"
        collapsible
        defaultValue="faq-0"
        className="questions-list"
      >
        {[0, 1, 2].map((i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="question-row">
            <AccordionTrigger className="question-trigger">
              <span className="question-number">0{i + 1}</span>
              <span>{t(`items.${i}.q`).replace(/^Q\.\s*/, "")}</span>
            </AccordionTrigger>
            <AccordionContent className="question-answer">
              {t(`items.${i}.a`)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
