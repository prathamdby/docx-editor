"use client";

import { Terminal } from "lucide-react";
import { motion } from "framer-motion";

export const Header = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed left-0 right-0 top-0 z-40 border-b border-micro bg-background/80 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            <Terminal className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              DOCX_LAB
            </span>
            <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              v2.1.0
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-6 sm:flex">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span>SYSTEM_ONLINE</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
