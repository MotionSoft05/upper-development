"use client";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function ServiceCard({
  title,
  description,
  icon: Icon,
  className = "",
  color = "blue",
  children,
}) {
  const colorSchemes = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
    green: "bg-green-50 text-green-600 group-hover:bg-green-100",
    orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-100",
    pink: "bg-pink-50 text-pink-600 group-hover:bg-pink-100",
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3 rounded-2xl transition-colors duration-300 ${scheme}`}
          >
            <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors" />
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#0080FF] transition-colors">
          {title}
        </h3>

        <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6 font-medium">
          {description}
        </p>

        <div className="mt-auto rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative min-h-[140px] sm:min-h-[180px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 z-20 pointer-events-none"></div>
          {children}
        </div>
      </div>
      <div
        className={`absolute -right-20 -bottom-20 w-64 h-64 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-3xl ${color === "blue" ? "bg-blue-500" : color === "purple" ? "bg-purple-500" : color === "green" ? "bg-green-500" : "bg-gray-200"}`}
      />
    </motion.div>
  );
}
