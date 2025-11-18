"use client";

import { Monitor, AlertTriangle } from "lucide-react";

export function MobileRestricted() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-6 text-center text-foreground">
      {/* Grid Background */}
      <div className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-[0_0_30px_-10px_rgba(204,255,0,0.3)]">
          <Monitor className="h-10 w-10" />
        </div>

        <h1 className="mb-4 font-sans text-3xl font-bold uppercase tracking-widest text-foreground">
          Desktop Terminal Required
        </h1>

        <p className="mb-10 max-w-sm font-mono text-sm leading-relaxed text-muted-foreground">
          <span className="text-primary">SYSTEM_ERROR:</span> Viewport
          dimensions insufficient for laboratory operations.
          <br />
          <br />
          Please access this secure environment from a desktop workstation
          (width &ge; 1024px).
        </p>

        <div className="flex items-center gap-3 rounded-full border border-red-500/20 bg-red-500/5 px-6 py-3 font-mono text-xs uppercase tracking-wider text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span>Mobile_Access_Denied</span>
        </div>
      </div>
    </div>
  );
}
