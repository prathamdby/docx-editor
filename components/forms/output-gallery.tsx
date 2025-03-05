"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";

interface OutputGalleryProps {
  outputs: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveOutput: (index: number) => void;
}

export function OutputGallery({
  outputs,
  onFileChange,
  onRemoveOutput,
}: OutputGalleryProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-white">Output Screenshots (Max 3)</Label>
        <span className="text-sm text-gray-400">{outputs.length}/3</span>
      </div>
      <div className="mb-2 grid grid-cols-3 gap-2">
        {outputs.map((output, index) => (
          <div key={index} className="group relative">
            <div className="relative h-24 w-full">
              <Image
                src={URL.createObjectURL(output)}
                alt={`Output ${index + 1}`}
                fill
                className="rounded-lg border border-white/10 object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => onRemoveOutput(index)}
              className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {outputs.length < 3 && (
          <div>
            <Input
              id="output-upload"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
              multiple
            />
            <Button
              type="button"
              variant="secondary"
              className="h-24 w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={() => document.getElementById("output-upload")?.click()}
            >
              <div className="flex flex-col items-center">
                <ImageIcon className="mb-1 h-6 w-6" />
                <span className="text-xs">Add Image</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
