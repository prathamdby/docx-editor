"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { memo } from "react";
import type { Practical, StudentData } from "@/app/types";
import { useObjectUrls } from "@/hooks/use-object-urls";

interface DocumentPreviewProps {
  studentData: StudentData;
  practicals: Practical[];
}

export const DocumentPreview = memo(function DocumentPreview({
  studentData,
  practicals,
}: DocumentPreviewProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-background p-4 sm:p-8">
      {/* Grid Background */}
      <div className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto min-h-[29.7cm] max-w-[21cm] origin-top bg-white transition-all duration-500 lg:shadow-[4px_4px_0_0_#262626,8px_8px_0_0_#171717]"
      >
        <div
          className="p-[2.54cm] text-black"
          style={{ fontFamily: '"Times New Roman", Times, serif' }}
        >
          <div className="space-y-1 text-right leading-tight">
            <p className="text-lg">{studentData.name || "Name"}</p>
            <p className="text-lg">
              {studentData.rollNo
                ? `Roll no. ${studentData.rollNo}`
                : "Roll Number"}
            </p>
            <p className="text-lg">{studentData.course || "Course"}</p>
          </div>

          {practicals.map((practical, index) => (
            <PracticalPreviewSection
              key={`${practical.practicalNo}-${index}`}
              practical={practical}
              showPageBreak={index < practicals.length - 1}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
});

interface PracticalPreviewSectionProps {
  practical: Practical;
  showPageBreak: boolean;
}

const PracticalPreviewSection = memo(function PracticalPreviewSection({
  practical,
  showPageBreak,
}: PracticalPreviewSectionProps) {
  const outputUrls = useObjectUrls(practical.outputs);

  return (
    <div className="mt-12 space-y-8">
      <div className="text-center">
        <h1
          className="text-xl font-bold uppercase underline underline-offset-4"
          style={{ fontFamily: '"Times New Roman", Times, serif' }}
        >
          PRACTICAL No. {practical.practicalNo}
        </h1>
      </div>

      <div className="space-y-2">
        <p className="text-lg">
          <span className="font-bold underline underline-offset-2">AIM:</span>{" "}
          {practical.aim}
        </p>
      </div>

      {practical.questions.map((question) => (
        <div key={question.id} className="space-y-4">
          <div>
            <p className="text-lg font-bold underline underline-offset-2">
              Question {question.number}:
            </p>
            <p className="mt-2 text-lg">{question.questionText}</p>
          </div>
          <div>
            <p className="text-lg font-bold">Code:</p>
            <div className="mt-2 rounded border border-gray-300 bg-gray-50 p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                {question.code}
              </pre>
            </div>
          </div>
        </div>
      ))}

      <div>
        <p className="text-lg font-bold underline underline-offset-2">
          OUTPUT:
        </p>
        <div className="mt-4 grid grid-cols-2 gap-6">
          {outputUrls.map((url, oIndex) => (
            <div
              key={`${practical.practicalNo}-${oIndex}`}
              className="relative aspect-[4/3] overflow-hidden rounded border border-gray-300"
            >
              <Image
                src={url}
                alt={`Output ${oIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-lg font-bold underline underline-offset-2">
          CONCLUSION:
        </p>
        <p className="mt-2 text-lg leading-relaxed">{practical.conclusion}</p>
      </div>

      {/* Page Break Indicator for Preview */}
      {showPageBreak && (
        <div className="my-8 border-b border-dashed border-gray-300 py-4 text-center">
          <span
            className="bg-white px-2 font-mono text-xs uppercase text-gray-400"
            style={{ fontFamily: "monospace" }}
          >
            Page Break
          </span>
        </div>
      )}
    </div>
  );
});
