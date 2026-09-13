import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function FooterCTASection() {
  const t = useTranslations("Footer");
  const en = useLocale() === "en";
  return (
    <footer className="performance-footer" id="footer">
      <div className="footer-invite">
        <span className="eyebrow">YOUR NEXT CHAPTER STARTS WITH ONE STEP.</span>
        <h2>
          READY FOR
          <br />
          <span>YOUR NEXT?</span>
        </h2>
        <div className="footer-action-row">
          <p>
            {en
              ? "One goal. A plan that’s yours. Let’s get to work."
              : "하나의 목표, 나를 위한 훈련. 이제 시작해 볼까요."}
          </p>
          <Button asChild className="footer-button">
            <Link href="/order">
              {en ? "Start your training" : "나의 훈련 시작하기"}
              <ArrowUpRight size={22} />
            </Link>
          </Button>
        </div>
      </div>
      <div className="footer-bottom">
        <Link href="/" className="footer-wordmark">
          AMOR LAB<span>PERFORMANCE, WITH PURPOSE.</span>
        </Link>
        <div>
          <Link href="/lookup">{t("lookup")}</Link>
          <a
            href="https://www.instagram.com/amor_jh.special/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="AMOR LAB Instagram"
          >
            <MessageCircle size={18} />
          </a>
        </div>
        <span>© 2026 AMOR LAB</span>
      </div>
    </footer>
  );
}
