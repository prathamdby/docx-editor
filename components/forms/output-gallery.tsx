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
      <div className="flex justify-between items-center mb-2">
        <Label className="text-white">Output Screenshots (Max 3)</Label>
        <span className="text-sm text-gray-400">{outputs.length}/3</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {outputs.map((output, index) => (
          <div key={index} className="relative group">
            <div className="relative w-full h-24">
              <Image
                src={URL.createObjectURL(output)}
                alt={`Output ${index + 1}`}
                fill
                className="object-cover rounded-lg border border-white/10"
              />
            </div>
            <button
              type="button"
              onClick={() => onRemoveOutput(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
              className="w-full h-24 bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={() => document.getElementById("output-upload")?.click()}
            >
              <div className="flex flex-col items-center">
                <ImageIcon className="h-6 w-6 mb-1" />
                <span className="text-xs">Add Image</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
