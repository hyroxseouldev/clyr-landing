import React from "react";
import Image from "next/image";

const ColaboSection = () => {
  return (
    <section
      className="border-y border-white/5 bg-base-100 py-16 md:py-24"
      id="collaboration"
    >
      <div className="container mx-auto max-w-4xl px-6">
        <div className="card bg-base-200/50 backdrop-blur-sm border border-white/10 shadow-2xl">
          <div className="card-body items-center text-center p-8 md:p-12">
            {/* 로고 */}
            <div className="mb-4 max-w-[200px] md:max-w-[240px] relative">
              <Image
                src="/assets/medalist-logo.png"
                alt="MEDALIST KR 로고"
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
              <span className="badge badge-outline badge-primary px-6 py-4 text-sm font-black uppercase tracking-widest">
                Official Ambassador
              </span>
            </div>

            {/* 타이틀 */}
            <h2 className="mt-4 text-3xl font-extrabold leading-[1.08] md:text-4xl lg:text-[44px]">
              AMOR LAB <span className="text-primary">×</span>
              <br />
              MEDALIST KR
            </h2>

            {/* 설명 */}
            <p className="mx-auto mt-3 max-w-2xl text-[15px] text-gray-300 leading-relaxed">
              전준현 코치는 MEDALIST KR 앰버서더로 함께합니다. 하이록스 훈련 후
              무너진 컨디션을 다시 끌어올리는 무카페인 회복 에너지 루틴을 AMOR
              LAB의 훈련 철학과 함께 소개합니다.
            </p>

            {/* 버튼 */}
            <div className="card-actions mt-6">
              <a
                href="https://themedalist.co.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-primary gap-2 px-8 py-3 normal-case text-sm font-semibold"
              >
                MEDALIST KR 방문하기
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ColaboSection;
