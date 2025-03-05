"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudentFormData {
  name: string;
  rollNo: string;
  course: string;
}

interface StudentFormProps {
  formData: StudentFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function StudentForm({ formData, onChange }: StudentFormProps) {
  return (
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
            onChange={onChange}
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
            onChange={onChange}
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
          onChange={onChange}
          required
          className="mt-1.5 bg-white/[0.07] border-white/10 text-white focus:bg-white/10"
        />
      </div>
    </div>
  );
}
