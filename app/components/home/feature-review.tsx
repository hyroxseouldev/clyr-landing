"use client";

import React, { useState } from "react";
import {
  Testimonial,
  TestimonialAuthor,
  featuredTestimonials,
} from "@/data/testimonials";
import Image from "next/image";
import { useLocale } from "next-intl";

const englishFeaturedTestimonials = [
  {
    id: "hyun-sta-sweat-monday",
    headline: "Coaching that set the standard",
    imageSrc: "/assets/testimonials/hyun-sta-hyrox.webp",
    imageAlt: "hyun.sta and athletes at the HYROX Champions photo wall",
    featured: true,
    quotes: [{
      author: { name: "@hyun.sta", title: "Sweat Monday founder", instagramHandle: "hyun.sta" },
      body: [
        "After more than 20 years as an elite athlete, I still feel a wall whenever I start a new sport. After meeting countless coaches and directors, I have also learned what makes a coach truly good.",
        "People who have always been good at something can have limits when it comes to understanding those who are struggling. But I believe people who have gone through that process themselves can understand the feelings behind it too.",
        "That is why I chose to work with Coach Junhyun Jeon. It was the right choice, and I still believe my judgment was right.",
      ],
    }],
  },
  {
    id: "im-yubin-lee-gyuri-hyrox",
    headline: "Seven lessons that changed race day",
    imageSrc: "/assets/testimonials/im-yubin-lee-gyuri-hyrox.webp",
    imageAlt: "Im Yubin, Lee Gyuri, and Coach Junhyun Jeon at the HYROX Champions photo wall",
    featured: true,
    quotes: [{
      author: { name: "Im Yubin" },
      body: [
        "Before our HYROX race, my partner and I shared workouts from YouTube and Instagram and followed them without a clear plan. When we started wondering whether we were training correctly, we found Coach Junhyun.",
        "With less than a month left before the race and our training space suddenly gone, we were anxious. Even with our conflicting schedules and limited availability, he worked with us in Seoul and Incheon.",
        "In only seven lessons, he took us from struggling to hold a 5:30 pace to a 3:50 pace. He kept checking our condition and the situation on each day, helping us grow through every session and record.",
        "He filled the gaps in our preparation, managed our mindset through race day, and reminded us that we were the best team. We plan to follow Coach Junhyun wherever he teaches next.",
      ],
    }, {
      author: { name: "Lee Gyuri" },
      body: [
        "I was confident in the stations, but with the race approaching I struggled to maintain my running pace after each station. After training with Coach Junhyun, he filled exactly the gaps we had and helped us achieve a strong result.",
        "Rather than delivering the same class to everyone, he uses his own experience to identify precisely what each athlete needs. The sessions were incredibly efficient and practical.",
      ],
    }],
  },
] as const satisfies readonly Testimonial[];

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
  const locale = useLocale();
  const reviews = locale === "en" ? englishFeaturedTestimonials : featuredTestimonials;

  if (reviews.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? reviews.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === reviews.length - 1 ? 0 : prev + 1,
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
            {reviews[currentIndex]?.headline || (locale === "en" ? "Featured review" : "실제 후기")}
          </h2>
        </div>

        {/* ====== 슬라이드 영역 ====== */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              key={currentIndex}
              className="motion-safe:animate-[fade-up_0.35s_ease-out_both] w-full"
            >
              {reviews.map((testimonial, index) => {
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
          {reviews.length > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xl text-white transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                onClick={handlePrev}
                aria-label="이전 피쳐 리뷰 보기"
              >
                ‹
              </button>
              <div className="flex items-center gap-2">
                {reviews.map((_, index) => (
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
