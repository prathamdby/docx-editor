"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface Question {
  number: string;
  questionText: string;
  code: string;
}

interface QuestionFormProps {
  question: Question;
  onQuestionChange: (field: keyof Question, value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function QuestionForm({
  question,
  onQuestionChange,
  onRemove,
  canRemove,
}: QuestionFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2"
    >
      <Card className="p-3 bg-white/5 border-white/10">
        <div className="flex justify-between items-start mb-2">
          <div className="w-full mr-2">
            <Label htmlFor="question-number" className="text-white">
              Question Number
            </Label>
            <Input
              id="question-number"
              value={question.number}
              onChange={(e) => onQuestionChange("number", e.target.value)}
              required
              className="mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
            />
          </div>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-7 text-white hover:bg-white/5 backdrop-blur-sm"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="question-text" className="text-white">
              Question
            </Label>
            <Textarea
              id="question-text"
              value={question.questionText}
              onChange={(e) => onQuestionChange("questionText", e.target.value)}
              className="mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
              required
              placeholder="Write your question here..."
            />
          </div>
          <div>
            <Label htmlFor="question-code" className="text-white">
              Code
            </Label>
            <Textarea
              id="question-code"
              value={question.code}
              onChange={(e) => onQuestionChange("code", e.target.value)}
              className="font-mono min-h-[200px] mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
              required
              placeholder="Write your code here..."
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
