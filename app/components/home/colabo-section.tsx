import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
export default function ColaboSection() {
  const t = useTranslations("Collaboration");
  return (
    <section className="partner-section" id="collaboration">
      <div>
        <span className="eyebrow">OFFICIAL AMBASSADOR</span>
        <h2>BETTER. TOGETHER.</h2>
        <p>{t("description")}</p>
      </div>
      <a
        href="https://themedalist.co.kr/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("visit")}
      >
        <Image
          src="/assets/medalist-logo.png"
          alt="MEDALIST KR"
          width={180}
          height={60}
          className="object-contain"
        />
        <ArrowUpRight size={24} />
      </a>
    </section>
  );
}
