"use client";

import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/ui/field-label";
import { User, Hash, BookOpen } from "lucide-react";
import { memo } from "react";
import type { StudentData } from "@/app/types";

interface StudentFormProps {
  formData: StudentData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const StudentForm = memo(function StudentForm({
  formData,
  onChange,
}: StudentFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="name" icon={User}>
            Full Name
          </FieldLabel>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            placeholder="JOHN DOE"
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="rollNo" icon={Hash}>
            Roll Number
          </FieldLabel>
          <Input
            id="rollNo"
            name="rollNo"
            value={formData.rollNo}
            onChange={onChange}
            required
            placeholder="000000"
            className="font-mono"
          />
        </div>
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor="course" icon={BookOpen}>
          Course ID
        </FieldLabel>
        <Input
          id="course"
          name="course"
          value={formData.course}
          onChange={onChange}
          required
          placeholder="CS-2024-A"
          className="font-mono"
        />
      </div>
    </div>
  );
});
