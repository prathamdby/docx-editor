"use client";

import Image from "next/image";

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

interface StudentData {
  name: string;
  rollNo: string;
  course: string;
}

interface DocumentPreviewProps {
  studentData: StudentData;
  practicals: Practical[];
}

export function DocumentPreview({
  studentData,
  practicals,
}: DocumentPreviewProps) {
  return (
    <div className="relative bg-white rounded-lg shadow-2xl mx-6 mt-6 mb-6 overflow-y-auto flex-grow">
      <div className="relative p-8">
        <div className="max-w-[8.5in] mx-auto space-y-6 font-['Times_New_Roman'] text-black">
          <div className="text-right">
            <p>{studentData.name}</p>
            <p>Roll no. {studentData.rollNo}</p>
            <p>{studentData.course}</p>
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
                        src={URL.createObjectURL(output)}
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
  );
}
