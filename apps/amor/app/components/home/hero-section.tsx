"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

const HeroSection = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const badgeVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const statsVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const statItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <section
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[#080808] py-12 md:min-h-[75vh] md:py-16 lg:min-h-[80vh] border-x border-base-content/10"
      id="hero"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        src="/brand/hero-background.mp4"
        autoPlay
        muted
        loop
        playsInline
        poster="/assets/record.png"
      />

      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#080808]/90 via-[#080808]/70 to-[#080808]/40 lg:from-[#080808]/92 lg:via-[#080808]/72 lg:to-[#080808]/36" />

      <div className="container relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:pl-12">
        <motion.div
          className="flex max-w-3xl flex-col items-start text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={badgeVariants}>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary backdrop-blur-sm">
              🔥 현역 HYROX 선수 · 전준현 코치 직강
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mt-4 text-3xl font-black leading-[1.1] tracking-tight md:text-4xl lg:text-5xl xl:text-[52px]"
          >
            최고의 하이록스 <br />
            퍼포먼스를 위한다면,
            <br />
            <span className="bg-gradient-to-r from-primary to-[#d4ff5a] bg-clip-text text-transparent">
              AMOR LAB
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-3 max-w-md text-[14px] text-gray-300 md:text-[15px]"
          >
            현역 엘리트 선수가 직접 설계한 1:1 맞춤형 피드백과
            <br className="hidden sm:block" />
            과학적인 페이싱 전략. 당신의 기록을 증명하세요.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
          >
            <motion.a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-primary/20 transition-all hover:bg-[#d4ff5a] hover:shadow-[0_0_40px_rgba(198,255,51,0.35)] hover:-translate-y-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              지금 내 한계 시험하기 (무료 상담) →
            </motion.a>
            <motion.a
              href="#proof"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-primary hover:text-primary hover:bg-primary/5"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              실제 후기 보기
            </motion.a>
          </motion.div>

          <motion.div
            variants={statsVariants}
            className="mt-8 flex flex-wrap gap-6 sm:gap-8"
          >
            <motion.div variants={statItemVariants} className="group">
              <div className="text-xl font-extrabold text-primary transition group-hover:scale-110 md:text-2xl">
                20+
              </div>
              <div className="text-[10px] text-gray-400">
                HYROX 입상 (국제대회)
              </div>
            </motion.div>
            <motion.div variants={statItemVariants} className="group">
              <div className="text-xl font-extrabold text-primary transition group-hover:scale-110 md:text-2xl">
                SUB-1
              </div>
              <div className="text-[10px] text-gray-400">Open Single 58:28</div>
            </motion.div>
            <motion.div variants={statItemVariants} className="group">
              <div className="text-xl font-extrabold text-primary transition group-hover:scale-110 md:text-2xl">
                #1
              </div>
              <div className="text-[10px] text-gray-400">
                HYROX P&apos;F&apos;T 한국 랭킹
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-4 left-0 right-0 z-30 flex flex-col items-center gap-1 text-[9px] uppercase tracking-widest text-gray-400"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 1.2,
          duration: 0.6,
          ease: "easeOut",
        }}
      >
        <span className="animate-pulse">Scroll</span>
        <motion.div
          className="h-2.5 w-2.5 rotate-45 border-b-2 border-r-2 border-gray-400"
          animate={{
            y: [0, 6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
