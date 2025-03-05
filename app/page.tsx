"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import GridPattern from "@/components/grid-pattern";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { generateDocument } from "./actions";
import { StudentForm } from "@/components/forms/student-form";
import { PracticalForm } from "@/components/forms/practical-form";
import { DocumentPreview } from "@/components/document-preview";
import { Question, Practical, StudentData } from "./types";

export default function DocumentEditor() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<StudentData>({
    name: "",
    rollNo: "",
    course: "",
  });
  const [practicals, setPracticals] = useState<Practical[]>([
    {
      practicalNo: "1",
      aim: "",
      questions: [{ number: "1", questionText: "", code: "" }],
      outputs: [],
      conclusion: "",
    },
  ]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `practicals.docx`);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePracticalChange = (
    index: number,
    field: keyof Practical,
    value: string | Question[] | File[]
  ) => {
    setPracticals((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleQuestionChange = (
    practicalIndex: number,
    questionIndex: number,
    field: keyof Question,
    value: string
  ) => {
    setPracticals((prev) =>
      prev.map((p, i) => {
        if (i === practicalIndex) {
          const newQuestions = [...p.questions];
          newQuestions[questionIndex] = {
            ...newQuestions[questionIndex],
            [field]: value,
          };
          return { ...p, questions: newQuestions };
        }
        return p;
      })
    );
  };

  const addQuestion = (practicalIndex: number) => {
    setPracticals((prev) =>
      prev.map((p, i) => {
        if (i === practicalIndex) {
          return {
            ...p,
            questions: [
              ...p.questions,
              {
                number: String(p.questions.length + 1),
                questionText: "",
                code: "",
              },
            ],
          };
        }
        return p;
      })
    );
  };

  const removeQuestion = (practicalIndex: number, questionIndex: number) => {
    setPracticals((prev) =>
      prev.map((p, i) => {
        if (i === practicalIndex) {
          return {
            ...p,
            questions: p.questions.filter(
              (_, qIndex) => qIndex !== questionIndex
            ),
          };
        }
        return p;
      })
    );
  };

  const handleFileChange = (
    practicalIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    setPracticals((prev) =>
      prev.map((p, i) => {
        if (i === practicalIndex) {
          const newOutputs = [...p.outputs, ...files].slice(0, 3);
          return { ...p, outputs: newOutputs };
        }
        return p;
      })
    );
  };

  const removeOutput = (practicalIndex: number, outputIndex: number) => {
    setPracticals((prev) =>
      prev.map((p, i) => {
        if (i === practicalIndex) {
          return {
            ...p,
            outputs: p.outputs.filter((_, oIndex) => oIndex !== outputIndex),
          };
        }
        return p;
      })
    );
  };

  const addPractical = () => {
    setPracticals((prev) => [
      ...prev,
      {
        practicalNo: String(prev.length + 1),
        aim: "",
        questions: [{ number: "1", questionText: "", code: "" }],
        outputs: [],
        conclusion: "",
      },
    ]);
  };

  const removePractical = (index: number) => {
    setPracticals((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <GridPattern />
      <div className="relative flex flex-1 flex-col">
        <div className="relative px-6 pt-8 sm:px-8 sm:pt-12 lg:px-4">
          <Header />
        </div>

        <div className="mx-auto mt-16 max-w-[1400px] px-6 pb-24 sm:px-8 lg:px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-10">
              {/* Editor Section */}
              <div className="xl:col-span-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="h-full border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <StudentForm
                        formData={formData}
                        onChange={handleChange}
                      />
                      <div className="space-y-4">
                        {practicals.map((practical, pIndex) => (
                          <PracticalForm
                            key={pIndex}
                            practical={practical}
                            onPracticalChange={(field, value) =>
                              handlePracticalChange(pIndex, field, value)
                            }
                            onQuestionChange={(questionIndex, field, value) =>
                              handleQuestionChange(
                                pIndex,
                                questionIndex,
                                field,
                                value
                              )
                            }
                            onAddQuestion={() => addQuestion(pIndex)}
                            onRemoveQuestion={(questionIndex) =>
                              removeQuestion(pIndex, questionIndex)
                            }
                            onFileChange={(e) => handleFileChange(pIndex, e)}
                            onRemoveOutput={(outputIndex) =>
                              removeOutput(pIndex, outputIndex)
                            }
                            onRemove={() => removePractical(pIndex)}
                            canRemove={practicals.length > 1}
                          />
                        ))}
                        <Button
                          type="button"
                          onClick={addPractical}
                          className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                          variant="secondary"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Practical
                        </Button>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-white/10 text-white hover:bg-white/20"
                        disabled={isGenerating}
                      >
                        {isGenerating
                          ? "Generating Document..."
                          : "Generate Document"}
                      </Button>
                    </form>
                  </Card>
                </motion.div>
              </div>

              {/* Preview Section */}
              <div className="xl:col-span-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="flex flex-col border border-white/10 bg-white/5 backdrop-blur-xl lg:h-[800px]">
                    <div className="sticky top-0 z-10 border-b border-white/10 bg-black/20 p-4 backdrop-blur">
                      <h2 className="text-sm font-medium text-white">
                        Preview
                      </h2>
                    </div>
                    <DocumentPreview
                      studentData={formData}
                      practicals={practicals}
                    />
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
