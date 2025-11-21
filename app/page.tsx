"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Terminal,
  LayoutTemplate,
  FileCode2,
  Settings,
  ChevronRight,
  Trash2,
  MonitorOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/header";
import { generateDocument } from "./actions";
import { StudentForm } from "@/components/forms/student-form";
import { PracticalForm } from "@/components/forms/practical-form";
import { DocumentPreview } from "@/components/document-preview";
import { Question, Practical, StudentData } from "./types";
import { useDebounced } from "@/hooks/use-debounced";
import { createQuestion, createPractical } from "@/lib/factories";

export default function DocumentEditor() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePracticalIndex, setActivePracticalIndex] = useState(0);

  const [formData, setFormData] = useState<StudentData>({
    name: "",
    rollNo: "",
    course: "",
  });

  const [practicals, setPracticals] = useState<Practical[]>([
    createPractical("1"),
  ]);

  const debouncedFormData = useDebounced(formData, 150);
  const debouncedPracticals = useDebounced(practicals, 150);

  async function handleGenerate() {
    setIsGenerating(true);

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });

    practicals.forEach((practical, pIndex) => {
      formDataObj.append(`practical_${pIndex}_no`, practical.practicalNo);
      formDataObj.append(`practical_${pIndex}_aim`, practical.aim);
      formDataObj.append(
        `practical_${pIndex}_conclusion`,
        practical.conclusion
      );

      practical.questions.forEach((question, qIndex) => {
        formDataObj.append(
          `practical_${pIndex}_question_${qIndex}_number`,
          question.number
        );
        formDataObj.append(
          `practical_${pIndex}_question_${qIndex}_questionText`,
          question.questionText
        );
        formDataObj.append(
          `practical_${pIndex}_question_${qIndex}_code`,
          question.code
        );
      });

      practical.outputs.forEach((output, oIndex) => {
        formDataObj.append(`practical_${pIndex}_output_${oIndex}`, output);
      });
    });

    try {
      const base64 = await generateDocument(formDataObj);

      const blob = new Blob(
        [Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))],
        {
          type: "application/msword",
        }
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `practicals.doc`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating document:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    },
    []
  );

  const updatePractical = useCallback(
    (index: number, updater: (p: Practical) => Practical) => {
      setPracticals((prev) =>
        prev.map((p, i) => (i === index ? updater(p) : p))
      );
    },
    []
  );

  const handlePracticalChange = useCallback(
    (
      index: number,
      field: keyof Practical,
      value: string | Question[] | File[]
    ) => {
      updatePractical(index, (p) => ({ ...p, [field]: value }));
    },
    [updatePractical]
  );

  const handleQuestionChange = useCallback(
    (
      practicalIndex: number,
      questionIndex: number,
      field: keyof Omit<Question, "id">,
      value: string
    ) => {
      updatePractical(practicalIndex, (p) => ({
        ...p,
        questions: p.questions.map((q, i) =>
          i === questionIndex ? { ...q, [field]: value } : q
        ),
      }));
    },
    [updatePractical]
  );

  const addQuestion = useCallback(
    (practicalIndex: number) => {
      updatePractical(practicalIndex, (p) => ({
        ...p,
        questions: [
          ...p.questions,
          createQuestion(String(p.questions.length + 1)),
        ],
      }));
    },
    [updatePractical]
  );

  const removeQuestion = useCallback(
    (practicalIndex: number, questionIndex: number) => {
      updatePractical(practicalIndex, (p) => ({
        ...p,
        questions: p.questions.filter((_, qIndex) => qIndex !== questionIndex),
      }));
    },
    [updatePractical]
  );

  const handleFileChange = useCallback(
    (practicalIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      updatePractical(practicalIndex, (p) => ({
        ...p,
        outputs: [...p.outputs, ...files].slice(0, 3),
      }));
    },
    [updatePractical]
  );

  const removeOutput = useCallback(
    (practicalIndex: number, outputIndex: number) => {
      updatePractical(practicalIndex, (p) => ({
        ...p,
        outputs: p.outputs.filter((_, oIndex) => oIndex !== outputIndex),
      }));
    },
    [updatePractical]
  );

  const addPractical = useCallback(() => {
    setPracticals((prev) => {
      const newPractical = createPractical(String(prev.length + 1));
      setActivePracticalIndex(prev.length);
      return [...prev, newPractical];
    });
  }, []);

  const removePractical = useCallback((index: number) => {
    setPracticals((prev) => {
      const newPracticals = prev.filter((_, i) => i !== index);
      setActivePracticalIndex((activeIdx) =>
        activeIdx >= newPracticals.length
          ? Math.max(0, newPracticals.length - 1)
          : activeIdx
      );
      return newPracticals;
    });
  }, []);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background font-sans text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* MOBILE RESTRICTION SCREEN */}
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-6 text-center lg:hidden">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MonitorOff className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-2xl font-bold uppercase tracking-widest text-foreground">
          Desktop Restricted
        </h1>
        <p className="max-w-xs font-mono text-sm text-muted-foreground">
          This laboratory environment requires a larger viewport for precision
          operations.
        </p>
        <div className="mt-8 flex items-center gap-2 rounded border border-border bg-secondary/30 px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
          <Terminal className="h-3 w-3" />
          <span>ERR_VIEWPORT_TOO_SMALL</span>
        </div>
      </div>

      {/* DESKTOP APP (HIDDEN ON MOBILE) */}
      <div className="hidden h-full flex-col lg:flex">
        <Header />

        {/* Main Workspace */}
        <main className="flex flex-1 overflow-hidden pt-14">
          {/* LEFT SIDEBAR: Project Explorer */}
          <aside className="flex w-80 flex-col border-r border-border bg-card/30 backdrop-blur-sm">
            <div className="flex-1 space-y-8 overflow-y-auto p-4">
              {/* Student Config Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2 text-muted-foreground">
                  <Settings className="h-4 w-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Config
                  </h3>
                </div>
                <StudentForm formData={formData} onChange={handleChange} />
              </div>

              {/* Practicals Navigation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <LayoutTemplate className="h-4 w-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Modules
                    </h3>
                  </div>
                  <span className="rounded bg-secondary px-1.5 font-mono text-[10px]">
                    {practicals.length}
                  </span>
                </div>

                <div className="space-y-1">
                  {practicals.map((p, i) => (
                    <div
                      key={i}
                      className={`group relative flex w-full items-center gap-3 rounded-md p-2 text-left transition-all ${
                        activePracticalIndex === i
                          ? "border border-primary/20 bg-primary/10 text-primary"
                          : "border border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      }`}
                    >
                      <button
                        onClick={() => setActivePracticalIndex(i)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-xs font-bold ${
                            activePracticalIndex === i
                              ? "bg-primary text-black"
                              : "bg-secondary text-muted-foreground group-hover:bg-secondary/80"
                          }`}
                        >
                          {p.practicalNo}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-bold">
                            {p.aim || "Untitled Module"}
                          </div>
                          <div className="truncate font-mono text-[10px] opacity-60">
                            Questions: {p.questions.length}
                          </div>
                        </div>
                        {activePracticalIndex === i && (
                          <ChevronRight className="h-3 w-3 flex-shrink-0" />
                        )}
                      </button>

                      {/* Delete Button */}
                      {practicals.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePractical(i);
                          }}
                          className={`rounded p-1 opacity-0 transition-all hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100 ${
                            activePracticalIndex === i
                              ? "text-primary opacity-50"
                              : "text-muted-foreground"
                          }`}
                          title="Delete Module"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={addPractical}
                  variant="outline"
                  className="h-9 w-full border-dashed border-border text-xs uppercase tracking-wider hover:border-primary hover:text-primary"
                >
                  <Plus className="mr-2 h-3 w-3" />
                  New Module
                </Button>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="border-t border-border bg-card/50 p-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full font-bold uppercase tracking-wider"
              >
                {isGenerating ? "Compiling..." : "Compile Artifact"}
              </Button>
            </div>
          </aside>

          {/* CENTER PANE: Editor */}
          <section className="relative z-10 flex min-w-0 flex-1 flex-col bg-background">
            {/* Editor Toolbar */}
            <div className="flex h-12 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileCode2 className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Editor / Module_
                  {practicals[activePracticalIndex]?.practicalNo || "?"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  Live
                </span>
              </div>
            </div>

            {/* Editor Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
              <div className="mx-auto max-w-3xl pb-24">
                {practicals[activePracticalIndex] && (
                  <motion.div
                    key={activePracticalIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PracticalForm
                      practical={practicals[activePracticalIndex]}
                      onPracticalChange={(field, value) =>
                        handlePracticalChange(
                          activePracticalIndex,
                          field,
                          value
                        )
                      }
                      onQuestionChange={(qIndex, field, value) =>
                        handleQuestionChange(
                          activePracticalIndex,
                          qIndex,
                          field,
                          value
                        )
                      }
                      onAddQuestion={() => addQuestion(activePracticalIndex)}
                      onRemoveQuestion={(qIndex) =>
                        removeQuestion(activePracticalIndex, qIndex)
                      }
                      onFileChange={(e) =>
                        handleFileChange(activePracticalIndex, e)
                      }
                      onRemoveOutput={(oIndex) =>
                        removeOutput(activePracticalIndex, oIndex)
                      }
                      onRemove={() => removePractical(activePracticalIndex)}
                      canRemove={practicals.length > 1}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </section>

          {/* RIGHT PANE: Preview */}
          <aside className="flex w-full flex-col border-l border-border bg-secondary/10 lg:w-[45%] xl:w-[40%]">
            <div className="flex h-12 items-center justify-between border-b border-border bg-secondary/20 px-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Terminal className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Preview_Render
                </span>
              </div>
            </div>
            <div className="relative flex-1 overflow-hidden">
              <DocumentPreview
                studentData={debouncedFormData}
                practicals={debouncedPracticals}
              />
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
