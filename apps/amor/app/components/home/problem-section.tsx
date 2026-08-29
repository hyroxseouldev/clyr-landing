"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

const ProblemSection = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-[#0d0d0d] py-16 md:py-24" id="agitation">
      <div className="container mx-auto max-w-7xl px-6">
        <motion.div
          className="grid gap-12 lg:grid-cols-2 lg:gap-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Left Column */}
          <motion.div variants={itemVariants}>
            <motion.span
              className="inline-block text-[11px] font-semibold uppercase tracking-[3px] text-primary"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Problem
            </motion.span>

            <motion.h2
              className="mt-2 text-3xl font-extrabold leading-[1.15] md:text-4xl lg:text-[46px]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              달리기만 잘한다고,
              <br />
              힘만 세다고 해결되지 않습니다.
            </motion.h2>

            <motion.p
              className="mt-3 text-[15px] text-gray-400 md:text-base"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              하이록스는 다릅니다. 단순한 체력 싸움이 아닌
              <br className="hidden md:block" />
              철저한 &apos;전환 전략&apos;과 &apos;페이스 분배&apos;의
              과학입니다.
            </motion.p>

            <motion.div
              className="mt-6 space-y-3"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                "러닝 후 기능성 운동(Sled, Burpee 등)으로 전환할 때 페이스가 무너지나요?",
                "나에게 맞는 체계적인 하이록스 전용 루틴을 몰라 헤매고 계시나요?",
                "대회 후반부, Wall Ball Shots에서 유독 기록이 지체되나요?",
              ].map((text, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.02,
                    borderColor: "rgba(198,255,51,0.3)",
                    backgroundColor: "rgba(198,255,51,0.05)",
                    transition: { duration: 0.2 },
                  }}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4 text-[15px] transition hover:border-primary/20 hover:bg-primary/5"
                >
                  <motion.div
                    className="mt-1 h-5 w-5 flex-shrink-0 rounded border-2 border-white/20"
                    whileHover={{
                      borderColor: "#c6ff33",
                      backgroundColor: "#c6ff33",
                      scale: 1.1,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  <p className="text-gray-300">
                    {text.includes("무너지나요") && (
                      <>
                        러닝 후 기능성 운동(Sled, Burpee 등)으로 전환할 때{" "}
                        <strong className="text-white">
                          페이스가 무너지나요?
                        </strong>
                      </>
                    )}
                    {text.includes("루틴") && (
                      <>
                        나에게 맞는 체계적인{" "}
                        <strong className="text-white">
                          하이록스 전용 루틴
                        </strong>
                        을 몰라 헤매고 계시나요?
                      </>
                    )}
                    {text.includes("Wall Ball") && (
                      <>
                        대회 후반부,{" "}
                        <strong className="text-white">Wall Ball Shots</strong>
                        에서 유독 기록이 지체되나요?
                      </>
                    )}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="mt-7 flex items-center gap-4 rounded-r-xl border-l-4 border-primary bg-primary/10 p-4"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgba(198,255,51,0.15)",
                transition: { duration: 0.2 },
              }}
            >
              <p className="text-sm text-gray-300 md:text-[15px]">
                <strong className="text-primary">💡 핵심 인사이트</strong> —
                하이록스는 단순한 체력 싸움이 아닌, 철저한 &apos;전환
                전략&apos;과 &apos;페이스 분배&apos;의 과학입니다.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual Element */}
          <motion.div
            className="flex items-center justify-center rounded-2xl border border-white/5 bg-gradient-to-br from-[#141414] to-[#1a1a1a]"
            variants={itemVariants}
            whileHover={{
              scale: 1.02,
              borderColor: "rgba(198,255,51,0.2)",
              transition: { duration: 0.3 },
            }}
          >
            <motion.div
              className="p-10 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full border-2 border-primary/20"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2.5,
                  ease: "easeOut",
                  repeat: Infinity,
                }}
              >
                <motion.div
                  className="h-14 w-14 rounded-full border-2 border-primary bg-primary/10"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                />
              </motion.div>
              <motion.p
                className="text-sm text-gray-500"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
              >
                훈련 강도와 회복의 균형,
                <br />그 critical point가 당신의 기록을 결정합니다.
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
