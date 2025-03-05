export interface Question {
  number: string;
  questionText: string;
  code: string;
}

export interface Practical {
  practicalNo: string;
  aim: string;
  questions: Question[];
  outputs: File[];
  conclusion: string;
}

export interface StudentData {
  name: string;
  rollNo: string;
  course: string;
}
