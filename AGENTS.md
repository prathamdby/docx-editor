## Overview

This document describes how to work with the `docx-editor` codebase as a set of focused agents (roles). It encodes architectural patterns, implicit contracts, and conventions that are not visible in `README.md`.

Use this document when you:

- **Need a mental model**: Understand how UI state, domain objects, and DOCX generation connect.
- **Plan a change**: Identify which files and layers are safe to touch.
- **Coordinate agents**: Keep human and AI contributors aligned on the same invariants.

## System model

### Runtime model

- **Framework**: Next.js App Router (`app/`), React 19, TypeScript, Tailwind CSS, shadcn-style UI.
- **Client boundary**:
  - `app/page.tsx` (`DocumentEditor`) is a `"use client"` component.
  - All components under `components/` and hooks under `hooks/` are client-side.
- **Server boundary**:
  - `app/actions.ts` exports the server action `generateDocument` with `"use server"`.
  - DOCX generation runs on the Node.js runtime and uses `Buffer` and `docx` APIs.
- **Primary flow**:
  1. User edits metadata and practicals in the left sidebar (`StudentForm`, `PracticalForm`).
  2. Center editor mutates local React state (`DocumentEditor`).
  3. Right pane renders a WYSIWYG-ish preview (`DocumentPreview`).
  4. On compile, the client serializes state into `FormData` and calls `generateDocument`.
  5. Server builds a DOCX, returns a base64 string.
  6. Client reconstructs a `Blob` and triggers a download.

### Domain model

Defined in `app/types.ts` and `lib/factories.ts`:

- **StudentData**:
  - `name: string`
  - `rollNo: string`
  - `course: string`
- **Question**:
  - `id: string` (ephemeral UI identifier)
  - `number: string`
  - `questionText: string`
  - `code: string`
- **Practical**:
  - `practicalNo: string`
  - `aim: string`
  - `questions: Question[]` (at least one)
  - `outputs: File[]` (up to three from the UI)
  - `conclusion: string`
- **Factories** (`lib/factories.ts`):
  - `generateId()`:
    - Uses `crypto.randomUUID()` when available, falls back to `Math.random().toString(36)`.
    - IDs are **not stable** across reloads and are **not suitable** as database keys.
  - `createQuestion(number: string): Question`:
    - Initializes an empty question with generated `id`.
  - `createPractical(practicalNo: string): Practical`:
    - Initializes a practical with one `Question` numbered `"1"`, no outputs, and empty text fields.

### Visual and design system model

- **Design system**:
  - Tailwind-based theme defined in `tailwind.config.ts` and `app/globals.css`.
  - Shadcn-style primitives in `components/ui/`:
    - `Button`, `Card`, `Input`, `Textarea`, `Label`.
  - Utility function `cn` in `lib/utils.ts` merges Tailwind classes.
- **Layout**:
  - Root layout (`app/layout.tsx`) applies dark mode globally with Next.js fonts and Vercel analytics.
  - `DocumentEditor` (`app/page.tsx`) composes:
    - A fixed `Header`.
    - A three-pane desktop layout (sidebar editor, main form, preview).
    - A hard-coded mobile restriction screen (`lg:hidden`).
- **DOCX vs preview**:
  - `app/actions.ts` and `DocumentPreview` both render:
    - Header: student name, roll number, course.
    - Sections per practical: `PRACTICAL No.`, `AIM`, `Question N`, `Code`, `OUTPUT`, `CONCLUSION`.
  - Fonts:
    - DOCX: `"Times New Roman"` for text, `"Courier New"` for code.
    - Preview: `"Times New Roman"` CSS stack and monospace CSS stack for code.

## Module map

### app/

- **`layout.tsx`**:
  - Declares global fonts (`Space_Grotesk`, `JetBrains_Mono`) and sets `className="dark"` on `<html>`.
  - Wraps `children` and mounts `@vercel/analytics`.
  - Does **not** wrap with `ThemeProvider` (see `app/theme-provider.tsx`).
- **`page.tsx` (`DocumentEditor`)**:
  - Owns all client-side state for:
    - `StudentData`.
    - `Practical[]`.
    - `activePracticalIndex`.
    - `isGenerating`.
  - Wires:
    - Forms (`StudentForm`, `PracticalForm`).
    - Debounced state hooks (`useDebounced`).
    - Preview (`DocumentPreview`).
    - Compile action (`generateDocument`).
  - Encodes the `FormData` protocol used by `generateDocument`.
- **`actions.ts`**:
  - Server action `generateDocument(formData: FormData): Promise<string>`:
    - Parses `StudentData` and `Practical[]` from flat `FormData` keys.
    - Builds a `Document` using the `docx` library.
    - Uses `Packer.toBuffer` and encodes the result as base64.
- **`theme-provider.tsx`**:
  - Thin wrapper over `next-themes` `ThemeProvider`.
  - Currently **unused** by `layout.tsx`.
- **`types.ts`**:
  - Defines the domain types used across the client and server.

### components/

- **Global layout**:
  - `header.tsx`:
    - Animated lab-style header with title, status indicator.
    - Version badge (`v2.1.0`) is hard-coded.
  - `footer.tsx`:
    - Social links (GitHub, Twitter, LinkedIn).
    - Not currently rendered anywhere.
  - `mobile-restricted.tsx`:
    - Standalone mobile restriction screen.
    - Not used by `DocumentEditor`, which inlines a simpler mobile-only screen.
- **Preview**:
  - `document-preview.tsx`:
    - Memoized preview component.
    - Accepts `studentData: StudentData` and `practicals: Practical[]`.
    - Renders a pseudo-A4 page with styling approximating the DOCX output.
    - Uses `useObjectUrls` to display `File` outputs as images.
- **Forms (`components/forms/`)**:
  - `student-form.tsx` (`StudentForm`):
    - Controlled inputs for `name`, `rollNo`, `course`.
    - Delegates state updates via `onChange` callback.
  - `practical-form.tsx` (`PracticalForm`):
    - Controlled form for a single `Practical`.
    - Delegates all mutations (`onPracticalChange`, `onQuestionChange`, file handlers).
    - Guarantees at least one `Question` is present (`canRemove` gate).
    - Composes:
      - `QuestionForm` (per question).
      - `OutputGallery` (for `outputs`).
  - `question-form.tsx` (`QuestionForm`):
    - Controlled form for a single `Question`.
    - Emits changes via `onQuestionChange(field, value)`.
  - `output-gallery.tsx` (`OutputGallery`):
    - Displays up to 3 images generated from `File[]`.
    - Uses hidden `<input type="file">` and a styled `Button` as the trigger.
- **UI primitives (`components/ui/`)**:
  - `button.tsx`:
    - `Button` and `buttonVariants` defined using `class-variance-authority`.
    - Encodes standard variants (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) and sizes.
  - `card.tsx`:
    - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
  - `input.tsx`:
    - Tailwind-styled monospace input with border, focus ring, and disabled states.
  - `textarea.tsx`:
    - Tailwind-styled monospace textarea with similar styling to `Input`.
  - `label.tsx`:
    - Radix `Label` wrapped with a `cva`-based style.
  - `field-label.tsx`:
    - Standardized label that composes `Label` with optional icon.
    - Used consistently across form components.
- **Visual helpers**:
  - `grid-pattern.tsx`:
    - Renders a CSS grid background overlay.
    - Currently unused; preview uses the `.bg-grid-pattern` class defined in `globals.css` instead.

### hooks/

- **`use-debounced.ts`**:
  - `useDebounced<T>(value: T, delay = 300): T`:
    - Returns the value after a delay.
    - Cancels pending timers on change or unmount.
    - Used to debounce heavy preview updates.
- **`use-object-urls.ts`**:
  - `useObjectUrls(files: File[]): string[]`:
    - Maps `File` objects to object URLs via `URL.createObjectURL`.
    - Registers cleanup to `URL.revokeObjectURL` on unmount or when `files` changes.

### lib/

- **`utils.ts`**:
  - `cn(...inputs: ClassValue[]): string`:
    - Wraps `clsx` and `tailwind-merge` to merge class names safely.
- **`factories.ts`**:
  - See the **Domain model** section above.

### Configuration and styling

- **`tailwind.config.ts`**:
  - Dark mode via class.
  - Content scanning for `pages/`, `components/`, and `app/`.
  - Extended theme:
    - Custom fonts wired to CSS variables from `layout.tsx`.
    - Brand colors (`background`, `primary`, `secondary`, `card`, etc.).
    - `borderRadius` tokens (`lg`, `md`, `sm`).
    - `borderColor.micro` for subtle separators.
    - `backgroundImage.noise` using `/noise.svg`.
  - Plugin: `tailwindcss-animate`.
- **`app/globals.css`**:
  - Base CSS variables for colors.
  - Global `body` styling with background, typography, and `noise` overlay.
  - Custom scrollbar.
  - `.glass` and `.bg-grid-pattern` utility classes.
- **`next.config.mjs`**:
  - `experimental.turbo` enabled.
  - ESLint disabled during builds (`eslint.ignoreDuringBuilds: true`).
  - Image domains configured for `localhost` and `avatars.githubusercontent.com`.
- **`components.json`**:
  - shadcn UI configuration:
    - Style: `new-york`.
    - Aliases: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`.

## Implicit contracts and invariants

### FormData schema for `generateDocument`

`DocumentEditor` and `generateDocument` communicate via a **stringly-typed** `FormData` contract. These keys are **API-level invariants**:

- **Student fields**:
  - `name`
  - `rollNo`
  - `course`
- **Practicals**:
  - Index is zero-based: `pIndex = 0, 1, 2, ...`.
  - Loop terminates when `formData.has("practical_${pIndex}_no")` is false.
- **Per practical** (index `pIndex`):
  - `practical_${pIndex}_no`
  - `practical_${pIndex}_aim`
  - `practical_${pIndex}_conclusion`
- **Questions** (index `qIndex`, zero-based):
  - Loop terminates when `formData.has("practical_${pIndex}_question_${qIndex}_number")` is false.
  - Keys:
    - `practical_${pIndex}_question_${qIndex}_number`
    - `practical_${pIndex}_question_${qIndex}_questionText`
    - `practical_${pIndex}_question_${qIndex}_code`
- **Outputs** (index `oIndex`, zero-based):
  - Loop terminates when `formData.has("practical_${pIndex}_output_${oIndex}")` is false.
  - Key:
    - `practical_${pIndex}_output_${oIndex}` (value type: `File`)

When you:

- **Rename a field** in `StudentForm`, `PracticalForm`, or `QuestionForm`:
  - Ensure `name` and `id` attributes still match the expected `FormData` keys or update **both** sides of the contract.
- **Add a new field** to the DOCX:
  - Add it to the domain types.
  - Add it to the client state and form components.
  - Append it to `FormData` in `DocumentEditor.handleGenerate`.
  - Parse it in `generateDocument` and render it into the `Document`.

### Practical and question lifecycle

- **Practical constraints**:
  - There is always at least one practical in `practicals`:
    - Initialization in `DocumentEditor` is `[createPractical("1")]`.
    - UI prevents deleting the last practical (`canRemove` checks length).
  - `practicalNo` is user-editable and must stay unique enough for preview keys and user understanding.
- **Question constraints**:
  - Each practical always has at least one question:
    - `createPractical` seeds `questions` with one `Question`.
    - `QuestionForm` only allows removal if `questions.length > 1`.
  - `Question.id`:
    - Used as React `key` in lists and stable anchor for UI operations.
    - Never sent to the server; DOCX is keyed by `number` and order.

### Outputs and files

- The UI enforces `outputs.length <= 3`:
  - `OutputGallery` displays a `[current/3]` counter.
  - New files are appended and then sliced to length 3.
- The server does **not** enforce this limit:
  - `generateDocument` loops until `formData.has("practical_${pIndex}_output_${oIndex}")` is false.
  - Server trusts the client to enforce the constraint.
- `useObjectUrls` assumes all `outputs` entries are `File` instances:
  - Do not introduce non-`File` types into `outputs` without updating the hook.

### Preview–export alignment

- DOCX and preview share a structural contract:
  - Header: name, roll number, course.
  - Sections per practical:
    - Title: `PRACTICAL No. X`.
    - `AIM:`.
    - `Question N:`.
    - Question text.
    - `Code:` followed by block-level code.
    - `OUTPUT:` followed by images.
    - `CONCLUSION:` followed by text.
- Changes to:
  - Section order,
  - Section labels,
  - Formatting semantics (e.g., underlines, page breaks)
    must be reflected in **both**:
  - `app/actions.ts` (DOCX generation).
  - `components/document-preview.tsx` (on-screen preview).

### Performance patterns

- **Debouncing**:
  - `useDebounced` wraps `formData` and `practicals` before passing to `DocumentPreview`.
  - Contract: preview components should treat props as immutable snapshots and not mutate them.
- **Memoization**:
  - `DocumentPreview`, `PracticalPreviewSection`, `OutputGallery`, `PracticalForm`, `QuestionForm`, and `StudentForm` use `React.memo`.
  - Upstream callers must pass **stable function references** when possible (hence the use of `useCallback` in `DocumentEditor`).

### Runtime assumptions

- `generateDocument` uses `Buffer` and `File`:
  - This action must run on the Node.js runtime, not Edge (unless polyfilled).
- `generateId` uses `crypto.randomUUID`:
  - Called only in the browser (via `createQuestion` / `createPractical`).
  - Avoid calling it in Node-only contexts unless `globalThis.crypto` is available.

## Agents and responsibilities

This section defines recommended agent roles. You can assign them to people or tools.

### UI agent

Scope:

- Components under `components/` and `components/ui/`.
- Layout and interaction patterns in `app/page.tsx`.

Responsibilities:

- Maintain visual consistency using:
  - Design tokens from `tailwind.config.ts`.
  - Shared primitives (`Button`, `Card`, `Input`, `Textarea`, `FieldLabel`).
- Keep the three-pane layout usable:
  - Desktop-only viewport assumptions (`lg:flex`, `lg:hidden`).
  - Keep forms and preview readable at common resolutions.
- Avoid introducing inline styles when a Tailwind class or design token exists.

Change entry points:

- Layout changes: `app/page.tsx`, `components/header.tsx`, `components/document-preview.tsx`.
- New controls: extend `components/forms/` and reuse primitives under `components/ui/`.

### Domain agent

Scope:

- `app/types.ts`
- `lib/factories.ts`
- Any domain-level validation or transformation you add later.

Responsibilities:

- Keep the domain model minimal and explicit.
- Ensure factories initialize values that are safe for both:
  - Preview rendering.
  - DOCX generation.
- When introducing new concepts (e.g., grading, metadata, timestamps):
  - Add them to domain types.
  - Provide factory defaults.

Change entry points:

- New domain field: `app/types.ts` and `lib/factories.ts`.
- Derived data: create separate pure functions (e.g., `lib/derived.ts`) rather than inlining logic in UI components.

### DOCX-generation agent

Scope:

- `app/actions.ts`
- DOCX-specific formatting rules and structure.

Responsibilities:

- Maintain the `FormData` parsing logic and ensure it stays aligned with client state.
- Preserve document layout invariants:
  - Margins, fonts, alignment, underlines.
  - Section ordering.
  - Page break behavior.
- Keep performance acceptable:
  - Avoid quadratic loops over practicals/questions.
  - Avoid loading huge images without resizing or compression logic (future optimization).

Change entry points:

- New section in DOCX:
  - Add parsing for the data in `generateDocument`.
  - Insert new `Paragraph` or `ImageRun` sequences.
- Formatting changes:
  - Adjust `TextRun` properties (font, size, underline, bold).
  - Adjust margins and `PageBreak` usage.

### Experience and performance agent

Scope:

- Hooks under `hooks/`.
- High-frequency rendering paths (`DocumentEditor`, `DocumentPreview`, forms).

Responsibilities:

- Manage rendering cost by:
  - Using `useDebounced` and memoization strategically.
  - Avoiding prop churn that invalidates memoization.
- Ensure file handling is safe and leak-free:
  - Confirm `useObjectUrls` is used for any new `File`-backed media.

Change entry points:

- Add new performance-sensitive flows:
  - Prefer small, well-scoped hooks in `hooks/`.
  - Keep them generic where possible.

### Theming and design-system agent

Scope:

- `tailwind.config.ts`
- `app/globals.css`
- `components/ui/*`
- `components.json`

Responsibilities:

- Guard the global visual language:
  - Colors, typography, spacing, radii.
- Ensure new UI components:
  - Use design tokens instead of hard-coded colors or radii.
  - Prefer composition over duplication.

Change entry points:

- New global utility class: add to `app/globals.css` under `@layer components`.
- New design token: extend `theme.extend` in `tailwind.config.ts`.

## Contribution playbooks

### Add a new student-level field and render it in DOCX

1. **Domain**:
   - Add the field to `StudentData` in `app/types.ts`.
2. **Factories**:
   - If it needs a default, extend factory functions or create a new helper.
3. **UI**:
   - Add a control for the field in `StudentForm`.
   - Ensure `name` and `id` are set consistently.
4. **State**:
   - Extend `formData` state in `DocumentEditor`.
   - Update `handleChange` to include the new field (it already spreads by `name`, so new fields should work automatically if `name` matches).
5. **FormData**:
   - Ensure `handleGenerate` appends the new field to `FormData` if you diverge from the default key approach.
6. **Server**:
   - Parse the field in `generateDocument`.
   - Render it in the desired location using `Paragraph` and `TextRun`.
7. **Preview**:
   - Reflect the new field visually in `DocumentPreview`.

### Change practical layout or labels

1. Update labels and ordering in `DocumentPreview`.
2. Mirror those changes in `app/actions.ts`:
   - Keep section order and labeling aligned.
3. Verify:
   - Preview looks correct for multiple practicals.
   - Generated DOCX reflects the same structure.

### Adjust maximum number of outputs per practical

1. Update `OutputGallery`:
   - Change the limit constant (`3`) in:
     - Counter display.
     - Slicing logic when pushing new files.
2. Optionally add server-side enforcement:
   - In `generateDocument`, ignore outputs after the desired maximum.
3. Verify:
   - More than the new max cannot be added from the UI.
   - DOCX renders the expected number of images.

### Introduce domain validation

1. Create dedicated validation utilities (e.g., `lib/validation.ts`).
2. Use them in:
   - `DocumentEditor` before calling `generateDocument`.
   - Optionally, in `generateDocument` to guard against malformed `FormData`.
3. Surface validation errors in the UI using:
   - Inline messages near fields.
   - A toast or banner pattern if introduced later.

## Legacy and unused components (architectural ghosts)

These elements reflect previous iterations and implicit decisions. Treat them as **technical debt** or **extension points**, not authoritative patterns.

- **`components/mobile-restricted.tsx`**:
  - Full-screen mobile restriction view.
  - Currently unused; `DocumentEditor` implements its own simpler mobile screen.
  - Before reusing, decide whether to:
    - Consolidate on this component, or
    - Remove it to reduce confusion.
- **`components/footer.tsx`**:
  - Not mounted in `layout.tsx` or `page.tsx`.
  - Decide whether the product deliberately omits a footer:
    - If yes, delete or document as deprecated.
    - If no, mount in `layout.tsx` or `DocumentEditor`.
- **`components/grid-pattern.tsx`**:
  - Overlaps with `.bg-grid-pattern` in CSS.
  - Prefer one approach:
    - Use the component where appropriate, or
    - Remove it if the CSS class is the standard.
- **`app/theme-provider.tsx`**:
  - Provides theme switching via `next-themes`.
  - Currently unused; dark theme is hard-coded via `className="dark"`.
  - If you plan to support multiple themes:
    - Wrap `children` in `ThemeProvider` in `layout.tsx`.
    - Update Tailwind and CSS to support variants.

## First 48 hours checklist

Use this section to quickly build a mental model and ship an initial, low-risk change.

### Orientation (low cognitive load)

- [ ] Skim:
  - `app/page.tsx` (overall flow).
  - `app/actions.ts` (DOCX generation).
  - `components/forms/*` (editing model).
  - `components/document-preview.tsx` (preview).
- [ ] Confirm you understand:
  - `StudentData`, `Practical`, `Question`.
  - How `FormData` is built and parsed.

### Pattern recognition

- [ ] Identify:
  - How `FieldLabel` and `Button` are used.
  - Where memoization and `useDebounced` are applied.
  - Where `outputs` are handled end-to-end.
- [ ] Note:
  - Preview–export alignment constraints.
  - UI-only vs server-only code paths.

### First meaningful contribution (pick one)

- [ ] Add or refine a small UI element:
  - Example: improve labels or placeholders in `StudentForm` or `QuestionForm`.
- [ ] Improve preview–export parity:
  - Example: adjust styling or text to better match the DOCX structure.
- [ ] Tighten an invariant:
  - Example: centralize validation in a new helper and use it before calling `generateDocument`.
- [ ] Resolve a legacy ghost:
  - Example: delete or integrate `Footer`, `GridPattern`, or `MobileRestricted` after making a clear decision.

Each of these changes should:

- Touch a small, well-defined surface area.
- Respect the contracts listed in this document.
- Be straightforward to test manually in the app.
