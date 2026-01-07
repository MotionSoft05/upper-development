"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function BackgroundDecor({
  position = "top-right",
  variant = "default",
  opacity = 1,
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"],
  });

  // Parallax effect: blobs move at different speeds relative to scroll
  // "y" transform will make them move slower/faster than natural scroll
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 500]); // Moves down as you scroll
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -300]); // Moves up/slower

  // Balanced Palette: Visible but not overwhelming
  const variants = {
    default: {
      // Soft Royal Blue + Gentle Purple
      c1: "bg-blue-400/30",
      c2: "bg-purple-400/25",
      c3: "bg-cyan-300/30",
    },
    cool: {
      c1: "bg-blue-400/30",
      c2: "bg-cyan-300/30",
      c3: "bg-teal-300/20",
    },
    warm: {
      c1: "bg-orange-400/30",
      c2: "bg-rose-400/25",
      c3: "bg-amber-300/30",
    },
  };

  const currentVariant = variants[variant] || variants.default;
  const isInverted = position === "bottom-left";

  return (
    <div
      ref={ref}
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-${
        opacity * 100
      }`}
    >
      {/* Blob 1: Faster 'Breathing' & Movement */}
      <motion.div
        style={{ y: isInverted ? y2 : y1 }}
        animate={{
          scale: [1, 1.3, 0.9, 1], // More dynamic size change
          opacity: [0.3, 0.6, 0.3],
          x: [0, 150, -50, 0], // Larger horizontal travel
          rotate: [0, 45, -45, 0],
        }}
        transition={{
          duration: 10, // Much faster cycle (was 18)
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute w-[800px] h-[800px] rounded-full blur-[90px] mix-blend-multiply
        ${currentVariant.c1} 
        ${isInverted ? "bottom-[-20%] left-[-20%]" : "top-[-30%] right-[-20%]"}
      `}
      ></motion.div>

      {/* Blob 2: Counter-movement */}
      <motion.div
        style={{ y: isInverted ? y1 : y2 }}
        animate={{
          scale: [1.1, 0.9, 1.2, 1.1],
          opacity: [0.4, 0.7, 0.4],
          x: [0, -120, 40, 0],
          rotate: [0, -60, 30, 0],
        }}
        transition={{
          duration: 12, // Faster cycle (was 22)
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className={`absolute w-[600px] h-[600px] rounded-full blur-[80px] mix-blend-multiply
        ${currentVariant.c2}
        ${isInverted ? "top-[-10%] right-[-10%]" : "bottom-[-10%] left-[-10%]"}
      `}
      ></motion.div>

      {/* Blob 3: Roaming Highlight */}
      <motion.div
        animate={{
          scale: [1, 1.4, 0.8, 1],
          opacity: [0.2, 0.5, 0.2],
          x: [0, 100, -100, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          duration: 8, // Very active (was 12)
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className={`absolute w-[400px] h-[400px] rounded-full blur-[60px] mix-blend-multiply
        ${currentVariant.c3 || currentVariant.c1}
        ${isInverted ? "bottom-[10%] left-[10%]" : "top-[20%] right-[30%]"}
      `}
      ></motion.div>
    </div>
  );
}
