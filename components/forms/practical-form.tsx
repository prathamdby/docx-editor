"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { QuestionForm } from "./question-form";
import { OutputGallery } from "./output-gallery";
import { AnimatePresence } from "framer-motion";

interface Question {
  number: string;
  questionText: string;
  code: string;
}

interface Practical {
  practicalNo: string;
  aim: string;
  questions: Question[];
  outputs: File[];
  conclusion: string;
}

interface PracticalFormProps {
  practical: Practical;
  onPracticalChange: (
    field: keyof Practical,
    value: string | Question[] | File[],
  ) => void;
  onQuestionChange: (
    questionIndex: number,
    field: keyof Question,
    value: string,
  ) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (questionIndex: number) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveOutput: (outputIndex: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function PracticalForm({
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
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 space-y-4 bg-white/5 border-white/10">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            Practical {practical.practicalNo}
          </h3>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div>
          <Label htmlFor="practicalNo" className="text-white">
            Practical Number
          </Label>
          <Input
            id="practicalNo"
            value={practical.practicalNo}
            onChange={(e) => onPracticalChange("practicalNo", e.target.value)}
            required
            className="mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
          />
        </div>

        <div>
          <Label htmlFor="aim" className="text-white">
            Aim
          </Label>
          <Input
            id="aim"
            value={practical.aim}
            onChange={(e) => onPracticalChange("aim", e.target.value)}
            required
            className="mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
          />
        </div>

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-white">Questions & Code</Label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onAddQuestion}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Question
            </Button>
          </div>
          <AnimatePresence>
            {practical.questions.map((question, index) => (
              <QuestionForm
                key={index}
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

        {/* Outputs Section */}
        <OutputGallery
          outputs={practical.outputs}
          onFileChange={onFileChange}
          onRemoveOutput={onRemoveOutput}
        />

        {/* Conclusion Section */}
        <div>
          <Label htmlFor="conclusion" className="text-white">
            Conclusion
          </Label>
          <Textarea
            id="conclusion"
            value={practical.conclusion}
            onChange={(e) => onPracticalChange("conclusion", e.target.value)}
            className="min-h-[100px] mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
            required
          />
        </div>
      </Card>
    </motion.div>
  );
}
