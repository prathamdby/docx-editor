"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, X, UploadCloud } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { memo, useRef } from "react";
import { useObjectUrls } from "@/hooks/use-object-urls";

interface OutputGalleryProps {
  outputs: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveOutput: (index: number) => void;
}

export const OutputGallery = memo(function OutputGallery({
  outputs,
  onFileChange,
  onRemoveOutput,
}: OutputGalleryProps) {
  const outputUrls = useObjectUrls(outputs);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <ImageIcon className="h-3 w-3" />
          Artifacts
        </Label>
        <span className="font-mono text-[10px] text-muted-foreground">
          [{outputs.length}/3]
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {outputUrls.map((url, index) => (
            <motion.div
              key={`output-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative aspect-square overflow-hidden rounded-md border border-border bg-black/40"
            >
              <Image
                src={url}
                alt={`Output ${index + 1}`}
                fill
                className="object-cover opacity-80 grayscale transition-opacity duration-300 hover:grayscale-0 group-hover:opacity-100"
              />
              <button
                type="button"
                onClick={() => onRemoveOutput(index)}
                className="absolute right-1 top-1 rounded-sm border border-white/20 bg-black p-1 text-white opacity-0 transition-all hover:bg-destructive group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {outputs.length < 3 && (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
              multiple
            />
            <Button
              type="button"
              variant="secondary"
              className="h-full w-full flex-col gap-2 rounded-md border border-dashed border-border bg-transparent text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary"
              onClick={() => inputRef.current?.click()}
            >
              <UploadCloud className="h-4 w-4" />
              <span className="font-mono text-[10px] uppercase">Upload</span>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
});
