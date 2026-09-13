import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const ColaboSection = () => {
  const t = useTranslations("Collaboration");
  return (
    <section
      className="border-y border-white/5 bg-background py-16 md:py-24"
      id="collaboration"
    >
      <div className="container mx-auto max-w-4xl px-6">
        <Card className="bg-card/50 backdrop-blur-sm border border-white/10 shadow-2xl">
          <CardContent className="items-center text-center p-8 md:p-12">
            {/* 로고 */}
            <div className="mb-4 max-w-[200px] md:max-w-[240px] relative">
              <Image
                src="/assets/medalist-logo.png"
                alt="MEDALIST KR logo"
                width={240}
                height={80}
                className="w-full h-auto"
              />
            </div>

            {/* 배지 - 두 줄 */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[3px] text-primary">
                Collaboration
              </span>
              <Badge className="border-primary bg-transparent text-primary bg-primary text-primary-foreground px-6 py-4 text-sm font-black uppercase tracking-widest">
                Official Ambassador
              </Badge>
            </div>

            {/* 타이틀 */}
            <h2 className="mt-4 text-3xl font-extrabold leading-[1.08] md:text-4xl lg:text-[44px]">
              AMOR LAB <span className="text-primary">×</span>
              <br />
              MEDALIST KR
            </h2>

            {/* 설명 */}
            <p className="mx-auto mt-3 max-w-2xl text-[15px] text-gray-300 leading-relaxed">
              {t("description")}
            </p>

            {/* 버튼 */}
            <div className="flex flex-wrap items-start gap-2 mt-6">
              <Button
                asChild
                variant="outline"
                size="default"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2 px-8 py-3 normal-case text-sm font-semibold"
              >
                <a
                  href="https://themedalist.co.kr/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("visit")}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ColaboSection;
