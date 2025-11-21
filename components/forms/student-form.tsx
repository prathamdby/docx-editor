"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
          <Label
            htmlFor="name"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            <User className="h-3 w-3" />
            Full Name
          </Label>
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
          <Label
            htmlFor="rollNo"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            <Hash className="h-3 w-3" />
            Roll Number
          </Label>
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
        <Label
          htmlFor="course"
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          <BookOpen className="h-3 w-3" />
          Course ID
        </Label>
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
