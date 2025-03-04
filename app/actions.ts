"use server"

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  UnderlineType,
  Header,
  ImageRun,
  convertInchesToTwip,
  PageBreak,
} from "docx"
import { Packer } from "docx"

export async function generateDocument(formData: FormData) {
  const name = formData.get("name") as string
  const rollNo = formData.get("rollNo") as string
  const course = formData.get("course") as string

  const practicals = []
  let pIndex = 0
  while (formData.has(`practical_${pIndex}_no`)) {
    const practicalNo = formData.get(`practical_${pIndex}_no`) as string
    const aim = formData.get(`practical_${pIndex}_aim`) as string
    const conclusion = formData.get(`practical_${pIndex}_conclusion`) as string

    // Get questions with question text
    const questions = []
    let qIndex = 0
    while (formData.has(`practical_${pIndex}_question_${qIndex}_number`)) {
      questions.push({
        number: formData.get(`practical_${pIndex}_question_${qIndex}_number`) as string,
        questionText: formData.get(`practical_${pIndex}_question_${qIndex}_questionText`) as string,
        code: formData.get(`practical_${pIndex}_question_${qIndex}_code`) as string,
      })
      qIndex++
    }

    // Get outputs
    const outputs = []
    let oIndex = 0
    while (formData.has(`practical_${pIndex}_output_${oIndex}`)) {
      const outputFile = formData.get(`practical_${pIndex}_output_${oIndex}`) as File
      const arrayBuffer = await outputFile.arrayBuffer()
      outputs.push(Buffer.from(arrayBuffer))
      oIndex++
    }

    practicals.push({ practicalNo, aim, questions, outputs, conclusion })
    pIndex++
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
                }),
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
                    type: 'png',
                  }),
                ],
              }),
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
  })

  const buffer = await Packer.toBuffer(doc)
  const base64 = buffer.toString("base64")
  return base64
}
