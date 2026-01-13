"use client";

import { motion } from "framer-motion";

interface SuccessAnimationProps {
  isCrimeline: boolean;
}

export function SuccessAnimation({ isCrimeline }: SuccessAnimationProps) {
  const checkmarkColor = isCrimeline ? "#a855f7" : "#14b8a6";
  const circleColor = isCrimeline ? "#7c3aed" : "#0d9488";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-8"
    >
      <div className="relative w-20 h-20">
        {/* Circle */}
        <motion.svg viewBox="0 0 100 100" className="w-full h-full">
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={circleColor}
            strokeWidth="4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </motion.svg>

        {/* Checkmark */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
        >
          <motion.path
            d="M30 50 L45 65 L70 35"
            fill="none"
            stroke={checkmarkColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          />
        </motion.svg>

        {/* Burst particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: checkmarkColor,
              left: "50%",
              top: "50%",
            }}
            initial={{ scale: 0, x: "-50%", y: "-50%" }}
            animate={{
              scale: [0, 1, 0],
              x: `calc(-50% + ${Math.cos((i * Math.PI) / 4) * 50}px)`,
              y: `calc(-50% + ${Math.sin((i * Math.PI) / 4) * 50}px)`,
            }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`mt-4 text-lg font-semibold ${
          isCrimeline ? "text-purple-400" : "text-teal-600"
        }`}
      >
        Submitted Successfully!
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`mt-1 text-sm ${
          isCrimeline ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Thank you for your contribution
      </motion.p>
    </motion.div>
  );
}
