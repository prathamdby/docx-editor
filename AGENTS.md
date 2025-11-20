# AGENTS: Technical Onboarding Manual

**Version:** 2.1.0  
**Last Updated:** 2024-11-20  
**Target:** New contributors seeking architectural context and first-contribution paths

---

## Table of Contents

1. [System Architecture Scan](#1-system-architecture-scan)
2. [Pattern Recognition](#2-pattern-recognition)
3. [Mental Models](#3-mental-models)
4. [First Contribution Paths](#4-first-contribution-paths)

---

## 1. System Architecture Scan

### 1.1 Project Overview

**Project Name:** `docx-editor` (Display: "DocX Lab")  
**Type:** Next.js 15.2.1 (App Router) + React 19  
**Purpose:** Browser-based DOCX document generator for academic practical reports  
**Architecture:** Server-client hybrid with server actions

### 1.2 Technology Stack

| Layer               | Technology                   | Version | Purpose                          |
| ------------------- | ---------------------------- | ------- | -------------------------------- |
| Framework           | Next.js                      | 15.2.1  | App Router, SSR, Server Actions  |
| Runtime             | React                        | 19.0.0  | UI composition                   |
| Styling             | Tailwind CSS                 | 3.4.1   | Utility-first styling            |
| UI Components       | Radix UI                     | Latest  | Accessible primitives            |
| Document Generation | docx                         | 9.2.0   | DOCX file creation (server-side) |
| Animation           | Framer Motion                | 12.4.10 | UI transitions                   |
| Typography          | Google Fonts                 | -       | Space Grotesk, JetBrains Mono    |
| Analytics           | Vercel Analytics             | 1.5.0   | Usage tracking                   |
| Tooling             | TypeScript, ESLint, Prettier | Latest  | Type safety, linting, formatting |

### 1.3 Directory Structure

```
/home/engine/project/
├── app/                          # Next.js App Router directory
│   ├── actions.ts                # Server actions for DOCX generation
│   ├── layout.tsx                # Root layout (dark mode, fonts)
│   ├── page.tsx                  # Main application page (client component)
│   ├── types.ts                  # Core data type definitions
│   ├── globals.css               # Global styles and CSS variables
│   ├── theme-provider.tsx        # next-themes wrapper (unused in current impl)
│   └── fonts/                    # Custom font files
├── components/                   # React components
│   ├── forms/                    # Form-specific components
│   │   ├── student-form.tsx      # Student metadata input
│   │   ├── practical-form.tsx    # Practical module editor
│   │   ├── question-form.tsx     # Individual question editor
│   │   └── output-gallery.tsx    # Image upload/preview
│   ├── ui/                       # Reusable UI primitives (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   ├── document-preview.tsx      # Real-time document preview
│   ├── header.tsx                # Application header bar
│   ├── footer.tsx                # Footer component
│   ├── mobile-restricted.tsx     # Mobile viewport blocker
│   └── grid-pattern.tsx          # Background decoration
├── lib/                          # Utility functions
│   └── utils.ts                  # cn() helper for className merging
├── public/                       # Static assets
├── tailwind.config.ts            # Tailwind configuration (custom theme)
├── tsconfig.json                 # TypeScript configuration
├── components.json               # shadcn/ui configuration
└── package.json                  # Dependencies and scripts
```

### 1.4 Data Flow Architecture

```
User Input (Form)
    ↓
React State (page.tsx)
    ↓
FormData Serialization
    ↓
Server Action (actions.ts)
    ↓
docx Library Processing
    ↓
Base64 Encoded Buffer
    ↓
Client-Side Blob Download
```

### 1.5 Core Dependencies

**Critical:**

- `docx@9.2.0`: DOCX generation (server-only)
- `next@15.2.1`: Framework
- `react@19.0.0`: UI library

**UI/UX:**

- `@radix-ui/*`: Component primitives
- `framer-motion@12.4.10`: Animations
- `lucide-react@0.477.0`: Icons
- `tailwindcss@3.4.1`: Styling

**Utilities:**

- `clsx`, `tailwind-merge`: Conditional class handling
- `class-variance-authority`: Component variant system

---

## 2. Pattern Recognition

### 2.1 File Naming Conventions

| Pattern                | Example            | Usage                |
| ---------------------- | ------------------ | -------------------- |
| `kebab-case.tsx`       | `student-form.tsx` | Component files      |
| `kebab-case.ts`        | `utils.ts`         | Utility modules      |
| `PascalCase`           | `StudentForm`      | Component names      |
| `camelCase`            | `handleChange`     | Functions, variables |
| `SCREAMING_SNAKE_CASE` | `DOCX_LAB`         | Constants (rare)     |

### 2.2 Component Architecture Patterns

#### **Pattern 1: Compound Form Components**

**Location:** `components/forms/*`

Forms are decomposed into:

1. **Container** (`practical-form.tsx`): Owns section state, delegates to children
2. **Field Groups** (`question-form.tsx`): Encapsulate related fields
3. **Media Handlers** (`output-gallery.tsx`): File upload/preview logic

**Ghost Watch:** Form components receive prop drilling—no context API. This is intentional to maintain explicit data flow for debugging.

#### **Pattern 2: Server Action Protocol**

**Location:** `app/actions.ts`

```typescript
// Signature pattern
export async function functionName(formData: FormData) {
  // 1. Extract scalar fields
  // 2. Parse indexed arrays (while loop pattern)
  // 3. Process Files to Buffers
  // 4. Generate document
  // 5. Return base64 string
}
```

**Ghost Watch: Array Serialization Contract**

FormData arrays use numeric indexing with field prefixes:

```
practical_0_no
practical_0_aim
practical_0_question_0_number
practical_0_question_0_code
practical_1_no
...
```

This pattern is **brittle by design**—index gaps break parsing. The while loop terminates on first missing index. Must maintain contiguous indices.

#### **Pattern 3: State Management Strategy**

**Location:** `app/page.tsx`

- **No external state library** (Redux, Zustand)
- **Single-source-of-truth:** `useState` in root page component
- **State shape:** Mirrors domain model exactly (`types.ts`)
- **Update pattern:** Immutable updates via `map()` and spread operators

```typescript
// Canonical update pattern
setPracticals((prev) =>
  prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
);
```

**Ghost Watch:** This pattern scales poorly beyond 5-10 practicals. No performance optimization (React.memo, useMemo) applied. Future refactor candidate.

### 2.3 Styling Conventions

#### **Design System: "Midnight Lab"**

**Location:** `tailwind.config.ts`

| Token              | Value                 | Usage              |
| ------------------ | --------------------- | ------------------ |
| `background`       | `#0a0a0a` (Obsidian)  | Page background    |
| `foreground`       | `#ededed`             | Primary text       |
| `primary`          | `#ccff00` (Acid Lime) | Accent color, CTAs |
| `card`             | `#171717` (Graphite)  | Card surfaces      |
| `border`           | `#262626`             | Dividers, outlines |
| `muted-foreground` | `#a1a1aa`             | Secondary text     |

**Typography:**

- Sans: `Space Grotesk` (UI text)
- Mono: `JetBrains Mono` (code, technical labels)

**Ghost Watch:** All components assume dark mode. `dark` class is hard-coded in `layout.tsx`. Theme switching infrastructure exists (`next-themes`) but is **non-functional** by design choice.

#### **Component Styling Patterns**

1. **Variant-based:** UI primitives use `class-variance-authority`
2. **Composition:** `cn()` utility merges Tailwind classes with conflict resolution
3. **Semantic spacing:** Use Tailwind spacing scale, never arbitrary values
4. **Responsive:** Mobile-first, but desktop-only UX (`lg:` breakpoint enforced)

### 2.4 Type System Patterns

**Location:** `app/types.ts`

```typescript
// Core domain types
interface Question {
  number: string; // Display ID (not numeric for flexibility)
  questionText: string; // Problem statement
  code: string; // Implementation (plain text)
}

interface Practical {
  practicalNo: string; // Module identifier
  aim: string; // Objective
  questions: Question[]; // Nested questions
  outputs: File[]; // Screenshot uploads (max 3)
  conclusion: string; // Analysis
}

interface StudentData {
  name: string;
  rollNo: string;
  course: string;
}
```

**Ghost Watch: Type Duplication**

Types are **duplicated** in form components (`components/forms/*.tsx`) instead of imported from `app/types.ts`. This is technical debt from rapid prototyping. Refactor to single source of truth.

### 2.5 Client-Server Boundary

| Directive      | Location                       | Purpose                                           |
| -------------- | ------------------------------ | ------------------------------------------------- |
| `"use client"` | `app/page.tsx`, all components | Enable client-side React features (hooks, events) |
| `"use server"` | `app/actions.ts`               | Mark server-only functions (security boundary)    |

**Ghost Watch:** Server actions must serialize data via FormData (not JSON). This forces the indexed naming pattern. Alternative: tRPC or API routes (not implemented).

### 2.6 Animation Patterns

**Location:** Components using `framer-motion`

**Standard Transition:**

```typescript
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.2 }}
```

**List Animations:**

- Use `<AnimatePresence mode="popLayout">` for staggered exits
- Apply `layout` prop for position transitions
- Key by index (caution: causes re-mount on reorder)

---

## 3. Mental Models

### 3.1 Document Generation Pipeline

**Model:** Four-stage transformation

```
Stage 1: User Input (React Forms)
  └─ Managed in: app/page.tsx
     State: { StudentData, Practical[] }

Stage 2: Serialization (FormData)
  └─ Managed in: handleGenerate()
     Transform: Object → FormData with indexed keys

Stage 3: Server Processing (docx Library)
  └─ Managed in: app/actions.ts
     Transform: FormData → Document AST → Buffer

Stage 4: Client Download (Blob API)
  └─ Managed in: handleGenerate() callback
     Transform: Base64 → Blob → Download
```

**Critical Path:** Changes to data shape require updates in **three** locations:

1. `types.ts` (type definition)
2. `page.tsx` (serialization logic)
3. `actions.ts` (deserialization + document generation)

### 3.2 Component Responsibility Matrix

| Component              | Responsibilities                                                         | Owns State               | Receives Props              |
| ---------------------- | ------------------------------------------------------------------------ | ------------------------ | --------------------------- |
| `page.tsx`             | - State management<br>- Form orchestration<br>- Server action invocation | ✅ All application state | ❌ None (root)              |
| `student-form.tsx`     | - Student metadata input<br>- Field validation (HTML)                    | ❌                       | `formData`, `onChange`      |
| `practical-form.tsx`   | - Practical section layout<br>- Question orchestration                   | ❌                       | `practical`, callbacks (6)  |
| `question-form.tsx`    | - Question/code input<br>- Inline actions                                | ❌                       | `question`, callbacks (2)   |
| `output-gallery.tsx`   | - File upload UI<br>- Image preview<br>- File limit enforcement          | ❌                       | `outputs`, callbacks (2)    |
| `document-preview.tsx` | - Real-time render<br>- WYSIWYG preview                                  | ❌                       | `studentData`, `practicals` |
| `header.tsx`           | - Branding<br>- Status indicators                                        | ❌                       | None                        |

**Ghost Watch:** Preview component (`document-preview.tsx`) does **not** use the actual document generation logic. It's a separate HTML-based approximation. Visual discrepancies are expected (fonts, spacing).

### 3.3 Data Mutation Patterns

**Immutable Updates (Required for React State)**

```typescript
// ❌ WRONG: Direct mutation
practicals[0].aim = "New aim";

// ✅ CORRECT: Immutable update
setPracticals((prev) =>
  prev.map((p, i) => (i === 0 ? { ...p, aim: "New aim" } : p))
);
```

**Nested Updates:**

```typescript
// Updating question in practical
setPracticals((prev) =>
  prev.map((p, pIdx) => {
    if (pIdx === practicalIndex) {
      const newQuestions = [...p.questions];
      newQuestions[qIdx] = { ...newQuestions[qIdx], code: newCode };
      return { ...p, questions: newQuestions };
    }
    return p;
  })
);
```

**Ghost Watch:** No helper libraries (Immer, Immutable.js). Raw JavaScript only. This increases boilerplate but reduces bundle size.

### 3.4 File Handling Contract

**Upload Flow:**

1. User selects files via `<input type="file">`
2. Files stored as `File[]` in state (native browser API)
3. Preview: `URL.createObjectURL(file)` (client-side, temporary URL)
4. Generation: Files serialized to FormData, transmitted to server
5. Server: `await file.arrayBuffer()` → `Buffer.from()` → docx ImageRun

**Ghost Watch: Memory Leak Risk**

Object URLs created by `URL.createObjectURL()` **must** be revoked via `URL.revokeObjectURL()`. Current implementation:

- ✅ Revoked in `handleGenerate()` after download
- ❌ **NOT** revoked in preview (potential memory leak on long sessions)

**Fix Location:** `components/document-preview.tsx` needs cleanup effect.

### 3.5 Viewport Restriction Model

**Location:** `app/page.tsx` lines 242-257

Desktop-only enforcement via CSS:

```tsx
// Mobile: Show blocker
<div className="... lg:hidden">...</div>

// Desktop: Show app
<div className="hidden ... lg:flex">...</div>
```

**Breakpoint:** `lg` = 1024px (Tailwind default)

**Rationale:** Complex multi-pane layout incompatible with mobile interaction patterns. Not a limitation—a design constraint.

---

## 4. First Contribution Paths

### 4.1 Pre-Contribution Checklist

**Before making changes:**

- [ ] Run `npm install` or `bun install`
- [ ] Verify development server: `npm run dev` → [http://localhost:3000](http://localhost:3000)
- [ ] Check existing issues/PRs for duplicate work
- [ ] Branch naming: `feature/<description>` or `fix/<description>`

### 4.2 Quick Win Tasks (Low Risk)

#### **Task A: Fix Type Duplication**

**Problem:** Types defined in `app/types.ts` are duplicated in form components.

**Files to modify:**

1. `components/forms/practical-form.tsx` (lines 13-25)
2. `components/forms/question-form.tsx` (lines 11-15)
3. `components/document-preview.tsx` (lines 6-24)

**Solution:**

```typescript
// Replace local interfaces with:
import { Question, Practical, StudentData } from "@/app/types";
```

**Validation:**

- TypeScript compiles without errors
- No runtime behavior changes

---

#### **Task B: Add Memory Leak Fix**

**Problem:** Object URLs not cleaned up in preview component.

**File:** `components/document-preview.tsx`

**Solution:**

```typescript
// Add useEffect hook
useEffect(() => {
  const urls = practicals.flatMap((p) =>
    p.outputs.map((f) => URL.createObjectURL(f))
  );
  return () => urls.forEach((url) => URL.revokeObjectURL(url));
}, [practicals]);
```

**Validation:**

- Check browser DevTools → Memory tab
- Upload images → verify no URL retention after component unmount

---

#### **Task C: Add Loading State Feedback**

**Problem:** No visual feedback during document generation (2-5 second operation).

**File:** `app/page.tsx`

**Current state:**

```typescript
{
  isGenerating ? "Compiling..." : "Compile Artifact";
}
```

**Enhancement:** Add progress indicator or disable form during generation.

**Example:**

```typescript
// In return JSX, wrap forms:
<fieldset disabled={isGenerating}>
  {/* Existing form components */}
</fieldset>
```

---

### 4.3 Medium Complexity Tasks

#### **Task D: Implement Question Reordering**

**Current limitation:** Questions cannot be reordered via drag-and-drop.

**Files:**

1. `components/forms/practical-form.tsx`
2. `app/page.tsx` (add reorder handler)

**Dependencies:** Consider `@dnd-kit/core` or `framer-motion`'s `Reorder` component.

**Ghost Watch:** Changing question order requires updating `key` prop strategy. Current `key={index}` will cause full re-mount. Switch to stable IDs.

---

#### **Task E: Add Form Validation**

**Current state:** Only HTML5 validation (`required` attribute).

**Enhancement:** Add client-side validation with error messages.

**Recommended library:** `zod` + `react-hook-form` (requires refactor) OR manual validation utilities.

**Files:**

- Create `lib/validation.ts`
- Update all form components to display errors

---

### 4.4 Architecture Evolution Tasks (High Impact)

#### **Task F: Migrate to React Context**

**Problem:** 15+ props drilled through component tree.

**Solution:** Create `FormContext` to provide state and updaters.

**Files:**

- Create `app/context/form-context.tsx`
- Refactor `page.tsx` to use Provider
- Update form components to use `useFormContext()`

**Risk:** Large refactor—thorough testing required.

---

#### **Task G: Add Document Templates**

**Feature:** Allow users to select from pre-configured document styles.

**Architecture:**

1. Create `lib/templates/` directory
2. Define template schemas
3. Add template selector UI in sidebar
4. Update `actions.ts` to accept template parameter

**Files:**

- New: `lib/templates/academic.ts`, `lib/templates/industrial.ts`
- Modify: `app/actions.ts`, `app/page.tsx`, `components/forms/`

---

### 4.5 Testing Strategy

**Current state:** No tests implemented.

**Recommended additions:**

1. **Unit tests:** Utility functions (`lib/utils.ts`)

   - Tool: Vitest or Jest

2. **Component tests:** Form validation, user interactions

   - Tool: React Testing Library + Vitest

3. **Integration tests:** Server action behavior

   - Tool: Playwright or Cypress

4. **E2E tests:** Full document generation flow
   - Tool: Playwright

**Setup:**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

---

### 4.6 Common Pitfalls

| Pitfall                      | Symptom                    | Solution                                          |
| ---------------------------- | -------------------------- | ------------------------------------------------- |
| **Mutating state directly**  | UI not updating            | Use immutable patterns (see 3.3)                  |
| **Missing `"use client"`**   | Hydration errors           | Add directive to components using hooks           |
| **FormData index gaps**      | Server action missing data | Ensure contiguous array indices                   |
| **Large file uploads**       | Timeout/crash              | Add file size validation (recommend 5MB limit)    |
| **Framer Motion key misuse** | Janky animations           | Use stable keys, not array indices                |
| **Tailwind class conflicts** | Styles not applying        | Always use `cn()` utility for conditional classes |

---

### 4.7 Development Workflow

**Standard contribution flow:**

1. **Setup:**

   ```bash
   git checkout -b feature/your-feature
   npm install
   npm run dev
   ```

2. **Develop:**

   - Make changes
   - Test in browser (localhost:3000)
   - Check TypeScript: `npx tsc --noEmit`

3. **Format:**

   ```bash
   npm run format        # Auto-fix
   npm run format:check  # Verify
   ```

4. **Lint:**

   ```bash
   npm run lint
   ```

5. **Commit:**

   ```bash
   git add .
   git commit -m "feat: add feature description"
   ```

6. **Push & PR:**
   ```bash
   git push origin feature/your-feature
   # Open PR on GitHub
   ```

---

### 4.8 Code Review Guidelines

**When submitting PRs:**

- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Prettier formatted (`npm run format:check`)
- [ ] ESLint passing (`npm run lint`)
- [ ] Manual testing performed (describe in PR)
- [ ] Screenshots/video for UI changes
- [ ] Breaking changes documented in PR description

**Reviewers will check for:**

- Immutable state updates
- Proper `"use client"` directives
- Consistent naming conventions
- No console.log/debugger statements
- Accessible UI (semantic HTML, ARIA where needed)

---

### 4.9 Performance Optimization Opportunities

**Current bottlenecks (profiling data not available, empirical observations):**

1. **Large practical lists (>10 items):**

   - Solution: Virtualize list with `react-window` or `@tanstack/react-virtual`

2. **Framer Motion re-renders:**

   - Solution: Memoize animated components with `React.memo`

3. **Preview re-renders on every keystroke:**

   - Solution: Debounce preview updates (300ms delay)

4. **Large file uploads:**
   - Solution: Client-side image compression before upload

---

### 4.10 Debugging Strategies

**Common issues:**

**Issue:** Document generation fails silently

- **Check:** Browser console for errors
- **Check:** Network tab for server action failures
- **Fix:** Add try-catch logging in `actions.ts`

**Issue:** Preview doesn't match generated document

- **Root cause:** Preview is HTML approximation, not docx rendering
- **Workaround:** Always test with actual generated file

**Issue:** Animations janky or not firing

- **Check:** Ensure parent has `<AnimatePresence>`
- **Check:** Keys are stable
- **Tool:** React DevTools → Components → `<motion.*>` props

**Issue:** State updates not reflecting

- **Check:** Mutation vs. immutability (see 3.3)
- **Tool:** React DevTools → Components → State inspection

---

### 4.11 External Resources

**Official Documentation:**

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion)
- [docx Library](https://docx.js.org)

**Design System:**

- [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [shadcn/ui](https://ui.shadcn.com/)

**TypeScript:**

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## Appendix A: Ghost Contracts

**Hidden architectural decisions requiring historical context:**

### A.1 Why No Backend/Database?

**Decision:** Single-page application, no data persistence.

**Rationale:** Use case is "fill form → generate document → download." No user accounts, no document storage, no sync. Adding backend would increase complexity without user benefit.

**Implication:** All state is ephemeral. Page refresh = data loss. Future feature: localStorage persistence.

---

### A.2 Why FormData Instead of JSON?

**Decision:** Server actions use FormData serialization.

**Rationale:** Next.js server actions support FormData natively. File uploads require FormData (multipart/form-data). JSON would require separate handling for files (base64 encoding client-side = bloat).

**Implication:** Cumbersome array serialization. Trade-off accepted for simpler file handling.

---

### A.3 Why Desktop-Only?

**Decision:** Hard-coded mobile restriction.

**Rationale:** Three-pane layout (sidebar + editor + preview) requires 1440px+ for usable UX. Mobile version would require separate responsive design (2x development cost). Target users (students/academics) have desktop access.

**Implication:** Mobile users blocked entirely (not degraded gracefully). Future: Consider simplified mobile-first version OR warn but allow access.

---

### A.4 Why Duplicate Preview Logic?

**Decision:** Preview component reimplements document structure in HTML/CSS.

**Rationale:** `docx` library runs on server only (uses Node.js APIs). Client-side preview requires separate rendering. Options:

1. Generate actual DOCX on every change (too slow)
2. Use browser DOCX renderer (none exist with acceptable quality)
3. HTML approximation (chosen)

**Implication:** Preview accuracy not guaranteed. Users must verify final document.

---

### A.5 Why No Authentication?

**Decision:** Public, unauthenticated access.

**Rationale:** Tool is utility, not SaaS. No sensitive data (documents generated locally, not stored). Adding auth reduces accessibility.

**Implication:** No usage analytics per-user. Rate limiting infeasible. Vercel serverless limits apply (10s timeout).

---

## Appendix B: File Dependency Graph

**Critical files and their dependencies:**

```
app/page.tsx
  ├─ @/components/header
  ├─ @/components/forms/student-form
  ├─ @/components/forms/practical-form
  ├─ @/components/document-preview
  ├─ @/components/ui/button
  ├─ ./actions (generateDocument)
  └─ ./types (Question, Practical, StudentData)

app/actions.ts
  └─ docx (Document, Paragraph, Packer, etc.)

components/forms/practical-form.tsx
  ├─ @/components/forms/question-form
  ├─ @/components/forms/output-gallery
  ├─ @/components/ui/* (button, card, input, label, textarea)
  └─ framer-motion

components/ui/button.tsx
  ├─ @radix-ui/react-slot
  ├─ class-variance-authority
  └─ @/lib/utils (cn)

lib/utils.ts
  ├─ clsx
  └─ tailwind-merge
```

---

## Appendix C: Keyboard Shortcuts & Accessibility

**Current state:** No custom keyboard shortcuts implemented.

**Accessibility audit:**

- ✅ Semantic HTML (labels, inputs, buttons)
- ✅ Focus states (Tailwind focus-visible)
- ⚠️ Keyboard navigation (partial—modal focus trap missing)
- ❌ Screen reader testing (not performed)
- ❌ ARIA landmarks (not implemented)

**Improvement tasks:**

1. Add ARIA landmarks (`role="main"`, `role="navigation"`)
2. Implement keyboard shortcuts (e.g., `Cmd+S` to generate)
3. Test with screen readers (NVDA, JAWS, VoiceOver)

---

## Appendix D: Environment Variables

**Current state:** No environment variables required.

**Future needs:**

- Analytics API keys (if expanding beyond Vercel Analytics)
- Feature flags (e.g., enable experimental templates)
- API rate limits

**Setup (when needed):**

1. Create `.env.local` (gitignored by default)
2. Access via `process.env.NEXT_PUBLIC_*` (client) or `process.env.*` (server)

---

## Document Changelog

| Version | Date       | Changes                    |
| ------- | ---------- | -------------------------- |
| 1.0.0   | 2024-11-20 | Initial AGENTS.md creation |

---

**End of Technical Onboarding Manual**

For questions or improvements, open an issue or PR in the repository.
