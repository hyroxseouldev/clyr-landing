"use client";

import React, { useState } from "react";
import { TestimonialAuthor, featuredTestimonials } from "@/data/testimonials";
import Image from "next/image";

function renderFeaturedReviewAuthor(author: TestimonialAuthor) {
  const title = author.title ? (
    <span className="ml-2 text-xs font-medium text-gray-500">
      {author.title}
    </span>
  ) : null;

  if (author.instagramHandle) {
    return (
      <a
        className="font-semibold text-primary transition hover:underline hover:underline-offset-4"
        href={`https://www.instagram.com/${author.instagramHandle}/`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {author.name}
        {title}
      </a>
    );
  }

  return (
    <span className="font-semibold text-primary">
      {author.name}
      {title}
    </span>
  );
}

const FeatureReviewSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (featuredTestimonials.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? featuredTestimonials.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === featuredTestimonials.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <section className="bg-[#0d0d0d] py-16 md:py-24" id="featured-review">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-10">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary">
            Featured Review
          </span>
          <h2 className="mt-2 text-2xl font-extrabold leading-[1.15] md:text-3xl lg:text-[40px]">
            {featuredTestimonials[currentIndex]?.headline || "실제 후기"}
          </h2>
        </div>

        {/* ====== 슬라이드 영역 ====== */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              key={currentIndex}
              className="motion-safe:animate-[fade-up_0.35s_ease-out_both] w-full"
            >
              {featuredTestimonials.map((testimonial, index) => {
                if (index !== currentIndex) return null;

                const quoteBlocks = testimonial.quotes.map((quote, qi) => (
                  <div key={qi} className="space-y-3">
                    {quote.body.map((paragraph, pi) => (
                      <p key={pi} className="text-[15px] text-gray-300">
                        {paragraph}
                      </p>
                    ))}
                    <div className="flex flex-wrap items-baseline gap-2">
                      {renderFeaturedReviewAuthor(quote.author)}
                    </div>
                  </div>
                ));

                return (
                  <div key={testimonial.id} className="px-0.5">
                    <div className="grid h-full grid-cols-1 items-center gap-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-white/5 p-6 md:grid-cols-2 md:p-8">
                      <div className="relative min-w-0">
                          <Image
                            src={testimonial.imageSrc}
                            alt={testimonial.imageAlt}
                            width={600}
                            height={800}
                            className="aspect-[3/4] w-full rounded-xl border border-white/5 object-cover object-center"
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>

                        <div className="min-w-0">
                          <span className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary">
                            Featured Review
                          </span>
                          <h2 className="mt-2 text-2xl font-extrabold leading-[1.15] md:text-3xl lg:text-[40px]">
                            {testimonial.headline}
                          </h2>
                          <div className="mt-5 space-y-5">{quoteBlocks}</div>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
          </div>

          {/* ====== 네비게이션 버튼 ====== */}
          {featuredTestimonials.length > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xl text-white transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                onClick={handlePrev}
                aria-label="이전 피쳐 리뷰 보기"
              >
                ‹
              </button>
              <div className="flex items-center gap-2">
                {featuredTestimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-6 bg-primary"
                        : "w-2 bg-white/30"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`${index + 1}번째 피쳐 리뷰 보기`}
                    aria-current={index === currentIndex ? "true" : "false"}
                  />
                ))}
              </div>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xl text-white transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                onClick={handleNext}
                aria-label="다음 피쳐 리뷰 보기"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeatureReviewSection;
