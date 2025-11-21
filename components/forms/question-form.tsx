"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Code, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { memo } from "react";
import type { Question } from "@/app/types";

interface QuestionFormProps {
  question: Question;
  onQuestionChange: (field: keyof Omit<Question, "id">, value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const QuestionForm = memo(function QuestionForm({
  question,
  onQuestionChange,
  onRemove,
  canRemove,
}: QuestionFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-border bg-card/50 p-4 transition-colors hover:bg-card/80">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="w-full max-w-[120px]">
            <Label
              htmlFor="question-number"
              className="mb-1.5 block text-[10px] font-bold uppercase text-muted-foreground"
            >
              ID
            </Label>
            <Input
              id="question-number"
              value={question.number}
              onChange={(e) => onQuestionChange("number", e.target.value)}
              required
              className="h-8 text-center font-mono text-xs"
            />
          </div>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="question-text"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <HelpCircle className="h-3 w-3" />
              Problem Statement
            </Label>
            <Textarea
              id="question-text"
              value={question.questionText}
              onChange={(e) => onQuestionChange("questionText", e.target.value)}
              className="min-h-[80px] resize-none font-mono text-xs"
              required
              placeholder="Enter problem statement..."
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="question-code"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <Code className="h-3 w-3" />
              Implementation
            </Label>
            <Textarea
              id="question-code"
              value={question.code}
              onChange={(e) => onQuestionChange("code", e.target.value)}
              className="min-h-[150px] bg-black/40 font-mono text-xs leading-relaxed text-text-lime"
              required
              placeholder="// void implementation() {...}"
              spellCheck={false}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
});
