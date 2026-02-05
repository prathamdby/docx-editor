"use server";

import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  UnderlineType,
  Header,
  ImageRun,
  convertInchesToTwip,
  PageBreak,
} from "docx";
import { Packer } from "docx";
import officeParser from "officeparser";
import type { Practical, Question } from "./types";

export type ImportResult = {
  success: boolean;
  practicals: Array<Omit<Practical, "outputs"> & { outputs: never[] }>;
  warnings: string[];
  error?: string;
};

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function createFallbackPractical(
  text: string
): Omit<Practical, "outputs"> & { outputs: never[] } {
  return {
    practicalNo: "1",
    aim: text.slice(0, 500).trim(),
    questions: [
      {
        id: generateId(),
        number: "1",
        questionText: "",
        code: text.length > 500 ? text.slice(500).trim() : "",
      },
    ],
    outputs: [],
    conclusion: "Imported document — please edit and organize content.",
  };
}

function parseDocumentText(text: string): ImportResult {
  const practicals: Array<Omit<Practical, "outputs"> & { outputs: never[] }> =
    [];
  const warnings: string[] = [];

  // Split by PRACTICAL No. to get individual practicals
  const practicalRegex = /PRACTICAL\s+No\.?\s*(\d+)/gi;
  const practicalMatches = [...text.matchAll(practicalRegex)];

  if (practicalMatches.length === 0) {
    return {
      success: true,
      practicals: [createFallbackPractical(text)],
      warnings: [
        "Could not detect document structure. Imported as raw text — please reorganize.",
      ],
    };
  }

  // Extract each practical section
  for (let i = 0; i < practicalMatches.length; i++) {
    const match = practicalMatches[i];
    const practicalNo = match[1];
    const startIdx = match.index!;
    const endIdx =
      i < practicalMatches.length - 1
        ? practicalMatches[i + 1].index!
        : text.length;
    const practicalText = text.slice(startIdx, endIdx);

    // Extract AIM
    const aimMatch = practicalText.match(
      /AIM:\s*([\s\S]*?)(?=Question\s+\d+:|OUTPUT:|CONCLUSION:|$)/i
    );
    const aim = aimMatch ? aimMatch[1].trim() : "";

    // Extract CONCLUSION
    const conclusionMatch = practicalText.match(
      /CONCLUSION:\s*([\s\S]*?)(?=PRACTICAL\s+No\.?\s*\d+|$)/i
    );
    const conclusion = conclusionMatch ? conclusionMatch[1].trim() : "";

    // Extract questions
    const questions: Question[] = [];
    const questionRegex =
      /Question\s+(\d+):\s*([\s\S]*?)(?=Code:|Question\s+\d+:|OUTPUT:|CONCLUSION:|$)/gi;
    const questionMatches = [...practicalText.matchAll(questionRegex)];

    for (const qMatch of questionMatches) {
      const questionNumber = qMatch[1];
      const questionText = qMatch[2].trim();

      // Extract code for this question - look for Code: after the question
      let codeBlock = "";
      const questionEndIdx = qMatch.index! + qMatch[0].length;
      const nextQuestionMatch = practicalText
        .slice(questionEndIdx)
        .match(/Question\s+\d+:/i);
      const codeSectionEnd = nextQuestionMatch
        ? questionEndIdx + nextQuestionMatch.index!
        : practicalText.length;
      const codeSection = practicalText.slice(questionEndIdx, codeSectionEnd);

      const codeMatch = codeSection.match(
        /Code:\s*([\s\S]*?)(?=Question\s+\d+:|OUTPUT:|CONCLUSION:|$)/i
      );
      if (codeMatch) {
        codeBlock = codeMatch[1].trim();
      }

      questions.push({
        id: generateId(),
        number: questionNumber,
        questionText,
        code: codeBlock,
      });
    }

    // If no questions found, add a default empty one
    if (questions.length === 0) {
      questions.push({
        id: generateId(),
        number: "1",
        questionText: "",
        code: "",
      });
      warnings.push(
        `Practical ${practicalNo}: No questions detected, added empty question.`
      );
    }

    practicals.push({
      practicalNo,
      aim,
      questions,
      outputs: [],
      conclusion,
    });
  }

  return {
    success: true,
    practicals,
    warnings,
  };
}

export async function importDocument(
  formData: FormData
): Promise<ImportResult> {
  try {
    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
      return {
        success: false,
        practicals: [],
        warnings: [],
        error: "No file provided",
      };
    }

    // Size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        practicals: [],
        warnings: [],
        error: "File too large (max 10MB)",
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Use callback-based API to get text directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = await new Promise<string>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (officeParser as any).parseOffice(
        buffer,
        (data: string, err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });

    const result = parseDocumentText(text);

    // Validation: ensure we got meaningful content
    if (
      result.practicals.length === 0 ||
      result.practicals.every(
        (p) => !p.aim && p.questions.every((q) => !q.questionText && !q.code)
      )
    ) {
      // Fallback: import as raw text
      return {
        success: true,
        practicals: [createFallbackPractical(text)],
        warnings: [
          "Could not detect document structure. Imported as raw text — please reorganize.",
        ],
      };
    }

    return result;
  } catch (err) {
    return {
      success: false,
      practicals: [],
      warnings: [],
      error: `Failed to parse file: ${
        err instanceof Error ? err.message : "Unknown error"
      }`,
    };
  }
}

export async function generateDocument(formData: FormData) {
  const name = formData.get("name") as string;
  const rollNo = formData.get("rollNo") as string;
  const course = formData.get("course") as string;

  const practicals = [];
  let pIndex = 0;
  while (formData.has(`practical_${pIndex}_no`)) {
    const practicalNo = formData.get(`practical_${pIndex}_no`) as string;
    const aim = formData.get(`practical_${pIndex}_aim`) as string;
    const conclusion = formData.get(`practical_${pIndex}_conclusion`) as string;

    // Get questions with question text
    const questions = [];
    let qIndex = 0;
    while (formData.has(`practical_${pIndex}_question_${qIndex}_number`)) {
      questions.push({
        number: formData.get(
          `practical_${pIndex}_question_${qIndex}_number`
        ) as string,
        questionText: formData.get(
          `practical_${pIndex}_question_${qIndex}_questionText`
        ) as string,
        code: formData.get(
          `practical_${pIndex}_question_${qIndex}_code`
        ) as string,
      });
      qIndex++;
    }

    // Get outputs
    const outputs = [];
    let oIndex = 0;
    while (formData.has(`practical_${pIndex}_output_${oIndex}`)) {
      const outputFile = formData.get(
        `practical_${pIndex}_output_${oIndex}`
      ) as File;
      const arrayBuffer = await outputFile.arrayBuffer();
      outputs.push(Buffer.from(arrayBuffer));
      oIndex++;
    }

    practicals.push({ practicalNo, aim, questions, outputs, conclusion });
    pIndex++;
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: name,
                    size: 28,
                    font: { name: "Times New Roman" },
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `Roll no. ${rollNo}`,
                    size: 28,
                    font: { name: "Times New Roman" },
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: course,
                    size: 28,
                    font: { name: "Times New Roman" },
                  }),
                ],
              }),
            ],
          }),
        },
        children: practicals.flatMap((practical, index) => [
          // Practical Number
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "PRACTICAL No. ",
                size: 28,
                bold: true,
                underline: { type: UnderlineType.SINGLE },
                font: { name: "Times New Roman" },
              }),
              new TextRun({
                text: practical.practicalNo,
                size: 28,
                bold: true,
                underline: { type: UnderlineType.SINGLE },
                font: { name: "Times New Roman" },
              }),
            ],
            spacing: { after: 400 },
          }),

          // Aim
          new Paragraph({
            children: [
              new TextRun({
                text: "AIM: ",
                size: 28,
                bold: true,
                underline: { type: UnderlineType.SINGLE },
                font: { name: "Times New Roman" },
              }),
              new TextRun({
                text: practical.aim,
                size: 28,
                font: { name: "Times New Roman" },
              }),
            ],
            spacing: { after: 400 },
          }),

          // Questions and Code
          ...practical.questions.flatMap((question) => [
            // Question Number and Text
            new Paragraph({
              children: [
                new TextRun({
                  text: `Question ${question.number}:`,
                  size: 28,
                  bold: true,
                  underline: { type: UnderlineType.SINGLE },
                  font: { name: "Times New Roman" },
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: question.questionText,
                  size: 28,
                  font: { name: "Times New Roman" },
                }),
              ],
              spacing: { after: 200 },
            }),
            // Code
            new Paragraph({
              children: [
                new TextRun({
                  text: "Code:",
                  size: 28,
                  bold: true,
                  font: { name: "Times New Roman" },
                }),
              ],
              spacing: { after: 200 },
            }),
            ...question.code.split("\n").map(
              (line) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      size: 28,
                      font: { name: "Courier New" },
                    }),
                  ],
                })
            ),
          ]),

          // Output
          new Paragraph({
            children: [
              new TextRun({
                text: "OUTPUT:",
                size: 28,
                bold: true,
                underline: { type: UnderlineType.SINGLE },
                font: { name: "Times New Roman" },
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),
          ...practical.outputs.map(
            (output) =>
              new Paragraph({
                children: [
                  new ImageRun({
                    data: output,
                    transformation: {
                      width: 600,
                      height: 400,
                    },
                    type: "png",
                  }),
                ],
              })
          ),

          // Conclusion
          new Paragraph({
            children: [
              new TextRun({
                text: "CONCLUSION:",
                size: 28,
                bold: true,
                underline: { type: UnderlineType.SINGLE },
                font: { name: "Times New Roman" },
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: practical.conclusion,
                size: 28,
                font: { name: "Times New Roman" },
              }),
            ],
          }),

          // Modify the page break logic
          ...(index < practicals.length - 1
            ? [
                // Page break after conclusion (only if it's not the last practical)
                new Paragraph({
                  children: [new PageBreak()],
                }),
              ]
            : []),
        ]),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const base64 = buffer.toString("base64");
  return base64;
}
