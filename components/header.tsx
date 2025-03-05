"use client";

import { PenLine } from "lucide-react";
import { motion } from "framer-motion";

export const Header = () => {
  return (
    <>
      <div className="mb-10 flex items-center justify-center gap-3 sm:mb-16">
        <PenLine className="h-8 w-8 text-white/90" />
        <span className="text-gradient text-xl font-semibold">Editor</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center"
      >
        <h1 className="text-gradient mb-2 text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:mb-4 lg:text-[72px] lg:leading-[1.15]">
          Make practicals like never before
        </h1>
        <p className="text-gradient mx-auto max-w-2xl text-lg font-medium sm:text-xl">
          Create and export documents with ease using our powerful editor
        </p>
      </motion.div>
    </>
  );
};
