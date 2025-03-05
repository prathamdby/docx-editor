"use client"; // This component uses hooks and browser APIs

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateDocument } from "./actions";
import { Plus, Minus, X, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BokehBackground } from "@/components/bokeh-background";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

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

export default function DocumentEditor() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
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
        practical.conclusion,
      );

      practical.questions.forEach((question, qIndex) => {
        formDataObj.append(
          `practical_${pIndex}_question_${qIndex}_number`,
          question.number,
        );
        formDataObj.append(
          `practical_${pIndex}_question_${qIndex}_questionText`,
          question.questionText,
        );
        formDataObj.append(
          `practical_${pIndex}_question_${qIndex}_code`,
          question.code,
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
        },
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePracticalChange = (
    index: number,
    field: keyof Practical,
    value: string | Question[] | File[],
  ) => {
    setPracticals((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const handleQuestionChange = (
    practicalIndex: number,
    questionIndex: number,
    field: keyof Question,
    value: string,
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
      }),
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
      }),
    );
  };

  const removeQuestion = (practicalIndex: number, questionIndex: number) => {
    setPracticals((prev) =>
      prev.map((p, i) => {
        if (i === practicalIndex) {
          return {
            ...p,
            questions: p.questions.filter(
              (_, qIndex) => qIndex !== questionIndex,
            ),
          };
        }
        return p;
      }),
    );
  };

  const handleFileChange = (
    practicalIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    setPracticals((prev) =>
      prev.map((p, i) => {
        if (i === practicalIndex) {
          const newOutputs = [...p.outputs, ...files].slice(0, 3);
          return { ...p, outputs: newOutputs };
        }
        return p;
      }),
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
      }),
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
    <div className="min-h-screen bg-[#0A0B14] text-white relative overflow-hidden flex flex-col">
      <BokehBackground />
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:24px_24px]"
        style={{ opacity: 0.5 }}
      />

      <div className="relative flex-1 flex flex-col">
        <div className="pt-8 sm:pt-12 relative">
          <Header />
        </div>

        <div className="max-w-[1400px] mx-auto pb-20 px-4 mt-16 sm:mt-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6 xl:grid-cols-5">
              {/* Editor Section */}
              <Card className="p-6 border border-white/10 bg-white/5 backdrop-blur-xl xl:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-white">
                          Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rollNo" className="text-white">
                          Roll Number
                        </Label>
                        <Input
                          id="rollNo"
                          name="rollNo"
                          value={formData.rollNo}
                          onChange={handleChange}
                          required
                          className="mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="course" className="text-white">
                        Course
                      </Label>
                      <Input
                        id="course"
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        required
                        className="mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
                      />
                    </div>
                    <AnimatePresence>
                      {practicals.map((practical, pIndex) => (
                        <motion.div
                          key={pIndex}
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
                              {practicals.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removePractical(pIndex)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div>
                              <Label
                                htmlFor={`practicalNo-${pIndex}`}
                                className="text-white"
                              >
                                Practical Number
                              </Label>
                              <Input
                                id={`practicalNo-${pIndex}`}
                                value={practical.practicalNo}
                                onChange={(e) =>
                                  handlePracticalChange(
                                    pIndex,
                                    "practicalNo",
                                    e.target.value,
                                  )
                                }
                                required
                                className="mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`aim-${pIndex}`}
                                className="text-white"
                              >
                                Aim
                              </Label>
                              <Input
                                id={`aim-${pIndex}`}
                                value={practical.aim}
                                onChange={(e) =>
                                  handlePracticalChange(
                                    pIndex,
                                    "aim",
                                    e.target.value,
                                  )
                                }
                                required
                                className="mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
                              />
                            </div>

                            {/* Questions Section */}
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <Label className="text-white">
                                  Questions & Code
                                </Label>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => addQuestion(pIndex)}
                                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Question
                                </Button>
                              </div>
                              <AnimatePresence>
                                {practical.questions.map((question, qIndex) => (
                                  <motion.div
                                    key={qIndex}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                  >
                                    <Card className="p-3 bg-white/5 border-white/10">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="w-full mr-2">
                                          <Label
                                            htmlFor={`question-${pIndex}-${qIndex}`}
                                            className="text-white"
                                          >
                                            Question Number
                                          </Label>
                                          <Input
                                            id={`question-${pIndex}-${qIndex}`}
                                            value={question.number}
                                            onChange={(e) =>
                                              handleQuestionChange(
                                                pIndex,
                                                qIndex,
                                                "number",
                                                e.target.value,
                                              )
                                            }
                                            required
                                            className="mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
                                          />
                                        </div>
                                        {practical.questions.length > 1 && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="mt-7 text-white hover:bg-white/5 backdrop-blur-sm"
                                            onClick={() =>
                                              removeQuestion(pIndex, qIndex)
                                            }
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                      <div className="space-y-3">
                                        <div>
                                          <Label
                                            htmlFor={`questionText-${pIndex}-${qIndex}`}
                                            className="text-white"
                                          >
                                            Question
                                          </Label>
                                          <Textarea
                                            id={`questionText-${pIndex}-${qIndex}`}
                                            value={question.questionText}
                                            onChange={(e) =>
                                              handleQuestionChange(
                                                pIndex,
                                                qIndex,
                                                "questionText",
                                                e.target.value,
                                              )
                                            }
                                            className="mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
                                            required
                                            placeholder="Write your question here..."
                                          />
                                        </div>
                                        <div>
                                          <Label
                                            htmlFor={`code-${pIndex}-${qIndex}`}
                                            className="text-white"
                                          >
                                            Code
                                          </Label>
                                          <Textarea
                                            id={`code-${pIndex}-${qIndex}`}
                                            value={question.code}
                                            onChange={(e) =>
                                              handleQuestionChange(
                                                pIndex,
                                                qIndex,
                                                "code",
                                                e.target.value,
                                              )
                                            }
                                            className="font-mono min-h-[200px] mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
                                            required
                                            placeholder="Write your code here..."
                                          />
                                        </div>
                                      </div>
                                    </Card>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>

                            {/* Outputs Section */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <Label className="text-white">
                                  Output Screenshots (Max 3)
                                </Label>
                                <span className="text-sm text-gray-400">
                                  {practical.outputs.length}/3
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 mb-2">
                                {practical.outputs.map((output, oIndex) => (
                                  <div key={oIndex} className="relative group">
                                    <div className="relative w-full h-24">
                                      <Image
                                        src={
                                          URL.createObjectURL(output) ||
                                          "/placeholder.svg"
                                        }
                                        alt={`Output ${oIndex + 1}`}
                                        fill
                                        className="object-cover rounded-lg border border-white/10"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeOutput(pIndex, oIndex)
                                      }
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                                {practical.outputs.length < 3 && (
                                  <div>
                                    <Input
                                      id={`output-${pIndex}`}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleFileChange(pIndex, e)
                                      }
                                      className="hidden"
                                      multiple
                                    />
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      className="w-full h-24 bg-white/5 border-white/10 text-white hover:bg-white/10"
                                      onClick={() =>
                                        document
                                          .getElementById(`output-${pIndex}`)
                                          ?.click()
                                      }
                                    >
                                      <div className="flex flex-col items-center">
                                        <ImageIcon className="h-6 w-6 mb-1" />
                                        <span className="text-xs">
                                          Add Image
                                        </span>
                                      </div>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Conclusion Section */}
                            <div>
                              <Label
                                htmlFor={`conclusion-${pIndex}`}
                                className="text-white"
                              >
                                Conclusion
                              </Label>
                              <Textarea
                                id={`conclusion-${pIndex}`}
                                value={practical.conclusion}
                                onChange={(e) =>
                                  handlePracticalChange(
                                    pIndex,
                                    "conclusion",
                                    e.target.value,
                                  )
                                }
                                className="min-h-[100px] mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
                                required
                              />
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <Button
                      type="button"
                      onClick={addPractical}
                      className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
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

              {/* Preview Section */}
              <Card className="lg:h-[800px] border border-white/10 bg-white/5 backdrop-blur-xl xl:col-span-3 flex flex-col">
                <div className="sticky top-0 z-10 p-4 border-b border-white/10 bg-black/20 backdrop-blur">
                  <h2 className="text-sm font-medium text-white">Preview</h2>
                </div>
                <div className="relative bg-white rounded-lg shadow-2xl mx-6 mt-6 mb-6 overflow-y-auto flex-grow">
                  <div className="relative p-8">
                    <div className="max-w-[8.5in] mx-auto space-y-6 font-['Times_New_Roman'] text-black">
                      <div className="text-right">
                        <p>{formData.name}</p>
                        <p>Roll no. {formData.rollNo}</p>
                        <p>{formData.course}</p>
                      </div>

                      {practicals.map((practical, pIndex) => (
                        <div key={pIndex} className="space-y-6 mt-8">
                          <div className="text-center">
                            <h1 className="text-xl font-bold underline">
                              PRACTICAL No. {practical.practicalNo}
                            </h1>
                          </div>

                          <div>
                            <p>
                              <span className="font-bold underline">AIM:</span>{" "}
                              {practical.aim}
                            </p>
                          </div>

                          {practical.questions.map((question, qIndex) => (
                            <div key={qIndex} className="space-y-4">
                              <div>
                                <p className="font-bold underline">
                                  Question {question.number}:
                                </p>
                                <p className="mt-2">{question.questionText}</p>
                              </div>
                              <div>
                                <p className="font-bold">Code:</p>
                                <pre className="font-mono text-sm whitespace-pre-wrap mt-2 bg-gray-50 p-4 rounded-lg">
                                  {question.code}
                                </pre>
                              </div>
                            </div>
                          ))}

                          <div>
                            <p className="font-bold underline">OUTPUT:</p>
                            <div className="grid grid-cols-3 gap-4 mt-2">
                              {practical.outputs.map((output, oIndex) => (
                                <div key={oIndex} className="relative h-48">
                                  <Image
                                    src={
                                      URL.createObjectURL(output) ||
                                      "/placeholder.svg"
                                    }
                                    alt={`Output ${oIndex + 1}`}
                                    fill
                                    className="object-contain border rounded-lg"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="font-bold underline">CONCLUSION:</p>
                            <p className="mt-2">{practical.conclusion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
