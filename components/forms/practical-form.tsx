"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Book, Target, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";
import { QuestionForm } from "./question-form";
import { OutputGallery } from "./output-gallery";
import type { Practical, Question } from "@/app/types";

interface PracticalFormProps {
  practical: Practical;
  onPracticalChange: (
    field: keyof Practical,
    value: string | Question[] | File[]
  ) => void;
  onQuestionChange: (
    questionIndex: number,
    field: keyof Omit<Question, "id">,
    value: string
  ) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (questionIndex: number) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveOutput: (outputIndex: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const PracticalForm = memo(function PracticalForm({
  practical,
  onPracticalChange,
  onQuestionChange,
  onAddQuestion,
  onRemoveQuestion,
  onFileChange,
  onRemoveOutput,
  onRemove,
  canRemove,
}: PracticalFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden p-0">
        {/* Header Stripe */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-black">
              {practical.practicalNo}
            </div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              Experiment_Module
            </h3>
          </div>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-6 sm:grid-cols-4">
            <div className="sm:col-span-1">
              <Label
                htmlFor="practicalNo"
                className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                <Book className="h-3 w-3" />
                ID
              </Label>
              <Input
                id="practicalNo"
                value={practical.practicalNo}
                onChange={(e) =>
                  onPracticalChange("practicalNo", e.target.value)
                }
                required
                className="font-mono font-bold"
              />
            </div>
            <div className="sm:col-span-3">
              <Label
                htmlFor="aim"
                className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                <Target className="h-3 w-3" />
                Objective
              </Label>
              <Input
                id="aim"
                value={practical.aim}
                onChange={(e) => onPracticalChange("aim", e.target.value)}
                required
                placeholder="Define experimental objective..."
                className="font-mono"
              />
            </div>
          </div>

          {/* Questions Section */}
          <div className="space-y-4 rounded-md border border-dashed border-border bg-secondary/20 p-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Query_Stack
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddQuestion}
                className="h-7 text-[10px] uppercase tracking-wider"
              >
                <Plus className="mr-1.5 h-3 w-3" />
                Append Query
              </Button>
            </div>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {practical.questions.map((question, index) => (
                  <QuestionForm
                    key={question.id}
                    question={question}
                    onQuestionChange={(field, value) =>
                      onQuestionChange(index, field, value)
                    }
                    onRemove={() => onRemoveQuestion(index)}
                    canRemove={practical.questions.length > 1}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Outputs Section */}
          <OutputGallery
            outputs={practical.outputs}
            onFileChange={onFileChange}
            onRemoveOutput={onRemoveOutput}
          />

          {/* Conclusion Section */}
          <div>
            <Label
              htmlFor="conclusion"
              className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <FileText className="h-3 w-3" />
              Analysis
            </Label>
            <Textarea
              id="conclusion"
              value={practical.conclusion}
              onChange={(e) => onPracticalChange("conclusion", e.target.value)}
              className="min-h-[80px] font-mono text-xs"
              required
              placeholder="Synthesize findings..."
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
});
