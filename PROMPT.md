# Cameroon Lesson Planner -- Comprehensive AI Prompt

Use this prompt with any AI coding assistant (Claude, Gemini, GPT, Copilot, Kiro, etc.) to build or continue building this project.

---

## Project Overview

Build a **Progressive Web App (PWA)** called **"Lesson Planner"** that helps Cameroonian secondary school teachers generate, organize, and track lesson plans aligned to government syllabi. It works **offline in the classroom** and connects to **free AI APIs** (Gemini, Groq) when online to help draft lesson notes and activities.

### Who is it for?
- Secondary school teachers in Cameroon (rural and urban)
- They teach subjects like Physics, Chemistry, Math, Biology
- They use laptops and Android phones
- Internet access is intermittent -- the app must work offline for core features
- Teachers can share the app with colleagues who teach different subjects

### Education System Context (Cameroon)
- **Class levels:** Form 1, Form 2, Form 3, Form 4, Form 5, Lower Sixth, Upper Sixth
- **School year:** September to end of May
- **Structure:** 3 terms, but divided into **6 sequences** (each 6 weeks long)
- **Evaluations:** Students are evaluated at the end of each sequence (weeks 6, 12, 18, 24, 30, 36)
- **Holidays:** Christmas break after ~week 12, Easter break after ~week 24
- **Period durations:** 45 minutes (single period) or 90 minutes (double period)
- **Periods per week:** Varies by subject -- typically 2-5 periods per week per class
- **Pedagogy:** Competence-Based Approach (CBA) -- learner-centered teaching, real-life situations, hands-on activities

### Syllabus Structure (Government Standard)
The Cameroon government syllabus uses a matrix format:
- **Contextual Framework:** Families of situations, real-life examples
- **Competencies:** Categories of actions, examples of actions
- **Resources:** Core knowledge (content), Aptitudes (skills), Attitudes, Other resources (materials)

Syllabi are organized into **Modules** (e.g., "Optics", "Energy", "Waves"). Each module contains topics and subtopics with the competency matrix.

### Progression Sheet Structure
The government provides a **National Harmonized Progression** per subject per class level:
- Organized by: Term > Week (1-36) > Module > Chapter > Lesson Title > Duration (periods)
- Includes integration/evaluation weeks at the end of each 6-week sequence
- Teachers follow this as-is (though modifications are allowed with inspector approval)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18+ with TypeScript | UI framework |
| UI Components | Tailwind CSS + shadcn/ui | Responsive, clean design |
| Offline Storage | Dexie.js (IndexedDB wrapper) | Store all data locally in browser |
| AI Integration | Google Gemini API (free tier) + Groq API (free tier) | Generate lesson content |
| PDF Export | jsPDF | Export lesson plans as PDF |
| Word Export | docx (npm package) | Export lesson plans as .docx |
| PWA | vite-plugin-pwa | Offline support, installable |
| Build Tool | Vite | Fast dev server and builds |
| Routing | React Router v6 | Page navigation |
| State | React Context + hooks | Simple state management |

**No backend server is needed.** All data lives in the browser's IndexedDB. AI features require internet but are optional.

---

## Data Model

### Subject
```typescript
interface Subject {
  id: string;
  name: string;             // e.g., "Physics", "Chemistry"
  classLevels: ClassLevel[]; // Which class levels this subject covers
  periodsPerWeek: Record<ClassLevel, number>; // e.g., { "Form 1": 2, "Form 4": 3 }
  createdAt: Date;
  updatedAt: Date;
}
```

### ClassLevel (enum)
```typescript
type ClassLevel = 
  | "Form 1" | "Form 2" | "Form 3" | "Form 4" | "Form 5" 
  | "Lower Sixth" | "Upper Sixth";
```

### SyllabusModule
```typescript
interface SyllabusModule {
  id: string;
  subjectId: string;
  classLevel: ClassLevel;
  moduleNumber: number;         // e.g., 1, 2, 3...
  name: string;                 // e.g., "The World of Science"
  duration: string;             // e.g., "8 hours"
  familiesOfSituations: string; // Contextual framework text
  topics: SyllabusTopic[];
}
```

### SyllabusTopic
```typescript
interface SyllabusTopic {
  id: string;
  moduleId: string;
  name: string;                // e.g., "Basic equipment in a science laboratory"
  coreKnowledge: string;       // Essential knowledge text
  competencies: string;        // Categories of actions and examples
  aptitudes: string;           // Skills
  attitudes: string;           // Attitudes to develop
  otherResources: string;      // Materials needed
}
```

### ProgressionEntry
```typescript
interface ProgressionEntry {
  id: string;
  subjectId: string;
  classLevel: ClassLevel;
  term: 1 | 2 | 3;
  weekNumber: number;          // 1-36
  sequence: 1 | 2 | 3 | 4 | 5 | 6; // Derived: ceil(weekNumber / 6)
  moduleName: string;          // Module reference
  chapter: string;             // Chapter name
  lessonTitle: string;         // What to teach
  duration: number;            // Number of periods
  isEvaluation: boolean;       // Is this an evaluation week?
  isHoliday: boolean;          // Is this a holiday week?
}
```

### SchoolCalendar
```typescript
interface SchoolCalendar {
  id: string;
  academicYear: string;        // e.g., "2025/2026"
  startDate: Date;             // September
  endDate: Date;               // May
  holidays: Holiday[];
  sequences: Sequence[];       // 6 sequences of 6 weeks
}

interface Holiday {
  name: string;
  startWeek: number;
  endWeek: number;
}

interface Sequence {
  number: 1 | 2 | 3 | 4 | 5 | 6;
  startWeek: number;
  endWeek: number;
  evaluationWeek: number;      // Last week of each sequence
}
```

### LessonPlan
```typescript
interface LessonPlan {
  id: string;
  subjectId: string;
  classLevel: ClassLevel;
  weekNumber: number;
  date?: string;               // Optional specific date
  term: 1 | 2 | 3;
  sequence: number;

  // Content (pre-filled from progression, editable)
  module: string;
  topic: string;
  subtopics: string[];
  
  // CBA-aligned fields
  objectives: string[];        // "By the end of the lesson, the learner should..."
  activities: string[];        // Learner-centered activities
  materials: string[];         // Available materials (flashlight, tennis ball, etc.)
  
  // Logistics
  duration: 45 | 90;          // Minutes
  periodType: "single" | "double";
  
  // Tracking
  status: "planned" | "completed" | "skipped" | "partial";
  teacherNotes: string;
  
  // Metadata
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### AISettings
```typescript
interface AISettings {
  geminiApiKey?: string;
  groqApiKey?: string;
  preferredProvider: "gemini" | "groq";
  autoGenerate: boolean;       // Auto-generate when creating new lesson plan
}
```

---

## App Pages / Screens

### 1. Dashboard
- Overview of upcoming lessons for the current week
- Progress summary per class level (completed vs. planned)
- Quick actions: "Create Lesson Plan", "View This Week"
- Current sequence indicator (e.g., "Sequence 3 - Week 14")

### 2. Subjects
- List of subjects (pre-loaded: Physics)
- Add new subject with class levels and periods per week
- Click subject to manage its syllabus and progression

### 3. Syllabus Editor
- Tree view: Module > Topic with expandable details
- View competency matrix for each topic
- Add/edit/delete modules and topics
- Import syllabus from JSON file

### 4. Progression Grid
- Calendar-style grid: Weeks (rows) x Lesson details (columns)
- Color-coded by sequence (6 different colors for 6 sequences)
- Evaluation weeks highlighted
- Holiday weeks marked
- Click a week to create/view lesson plan for that week
- Filter by class level

### 5. Lesson Plan Editor (Main Workspace)
- Form with all LessonPlan fields
- **Pre-fill** from progression sheet when selecting week + class
- **"Generate with AI"** button for each field (objectives, activities, materials)
- Rich text areas for each field
- Save/auto-save to IndexedDB
- Duration toggle: 45 min / 90 min
- Status selector: planned / completed / skipped / partial

### 6. Progress Tracker
- Visual dashboard per subject and class level
- Progress bar: lessons completed vs total planned
- Sequence-by-sequence breakdown
- Alerts for being behind schedule
- Comparison: current week vs actual progress

### 7. Export Center
- Select: Subject > Class Level > Date Range (or Sequence/Term)
- Preview lesson plan
- Export as PDF (print-ready format)
- Export as Word (.docx) for further editing
- Batch export option

### 8. Settings
- AI API key configuration (Gemini, Groq) with setup instructions
- School calendar customization
- Period duration defaults
- Theme (light/dark)
- About and help

---

## AI Integration Details

### API Configuration
- Users enter their own API keys in Settings
- Keys stored locally in IndexedDB (never sent to any server)
- Support for free tiers: Gemini (gemini-2.0-flash) and Groq (llama-3.3-70b-versatile or deepseek-r1-distill-llama-70b)

### Generation Prompt Template
When the teacher clicks "Generate with AI", send a prompt like:

```
You are an expert Cameroonian secondary school teacher using the Competence-Based Approach (CBA).

Subject: {subject}
Class Level: {classLevel}
Module: {moduleName}
Topic: {topicName}
Subtopics: {subtopics}
Duration: {duration} minutes ({periodType} period)
Core Knowledge from Syllabus: {coreKnowledge}
Competencies from Syllabus: {competencies}

Generate a lesson plan with:
1. **Objectives** (3-5 specific, measurable objectives starting with "By the end of the lesson, the learner should be able to...")
2. **Activities** (3-4 learner-centered activities using CBA methodology. Include group work, demonstrations, and hands-on tasks. Use locally available materials.)
3. **Materials** (list specific, commonly available materials like flashlights, tennis balls, cardboard, markers, string, rulers, etc.)
4. **Lesson Flow** (step-by-step timing breakdown for the {duration}-minute lesson)

Keep activities practical and achievable in a rural Cameroonian classroom setting. Avoid requiring expensive or hard-to-find equipment.
```

### Offline Behavior
- AI buttons show a tooltip: "Requires internet connection" when offline
- All other features work normally offline
- Previously generated content is saved locally and accessible offline

---

## Project Structure

```
OC-lesson-planner/
├── public/
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── offline.html
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # Main layout with sidebar/nav
│   │   │   ├── Sidebar.tsx
│   │   │   └── MobileNav.tsx      # Bottom nav for mobile
│   │   ├── dashboard/
│   │   │   ├── WeekOverview.tsx
│   │   │   ├── ProgressSummary.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── syllabus/
│   │   │   ├── ModuleTree.tsx
│   │   │   ├── TopicEditor.tsx
│   │   │   └── SyllabusImport.tsx
│   │   ├── progression/
│   │   │   ├── ProgressionGrid.tsx
│   │   │   └── WeekCard.tsx
│   │   ├── lesson-plan/
│   │   │   ├── LessonPlanForm.tsx
│   │   │   ├── ObjectivesEditor.tsx
│   │   │   ├── ActivitiesEditor.tsx
│   │   │   └── AIGenerateButton.tsx
│   │   ├── progress/
│   │   │   ├── ProgressDashboard.tsx
│   │   │   └── SequenceProgress.tsx
│   │   └── export/
│   │       ├── ExportCenter.tsx
│   │       ├── PDFPreview.tsx
│   │       └── ExportOptions.tsx
│   ├── db/
│   │   ├── database.ts            # Dexie.js database definition
│   │   ├── seed.ts                # Seed data (Physics syllabus + progression)
│   │   └── hooks.ts               # Custom hooks for DB operations
│   ├── services/
│   │   ├── ai.ts                  # Gemini & Groq API integration
│   │   ├── export-pdf.ts          # jsPDF export logic
│   │   └── export-docx.ts         # docx export logic
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── SubjectsPage.tsx
│   │   ├── SyllabusPage.tsx
│   │   ├── ProgressionPage.tsx
│   │   ├── LessonPlanPage.tsx
│   │   ├── ProgressPage.tsx
│   │   ├── ExportPage.tsx
│   │   └── SettingsPage.tsx
│   ├── contexts/
│   │   └── AppContext.tsx          # Global state (selected subject, class, etc.)
│   ├── types/
│   │   └── index.ts               # All TypeScript interfaces
│   ├── utils/
│   │   ├── calendar.ts            # Date/week/sequence helpers
│   │   └── constants.ts           # Class levels, default values
│   ├── data/
│   │   ├── physics-syllabus-f1f2.ts
│   │   ├── physics-syllabus-f3f5.ts
│   │   ├── physics-progression.ts
│   │   └── school-calendar.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                  # Tailwind imports
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── components.json                # shadcn/ui config
└── PROMPT.md                      # This file
```

---

## Build Order

Build in this exact order. Each step should result in a working app.

### Step 1: Project Scaffolding
- Initialize Vite + React + TypeScript project
- Install and configure Tailwind CSS
- Install and configure shadcn/ui
- Set up React Router with all page routes
- Create the main layout (sidebar + content area)
- Configure vite-plugin-pwa (basic)
- Verify: App loads with navigation between empty pages

### Step 2: Database Layer
- Install Dexie.js
- Define the database schema with all tables
- Create TypeScript interfaces in types/index.ts
- Write seed data files with Physics syllabus and progression data
- Create custom hooks for CRUD operations
- Verify: Data persists in IndexedDB, survives page refresh

### Step 3: Syllabus Manager
- Build the Module tree view component
- Build the Topic detail/editor component
- Implement add/edit/delete for modules and topics
- Import syllabus from JSON file
- Pre-load Physics syllabus data
- Verify: Can browse Physics syllabus, add a new subject, edit topics

### Step 4: School Calendar & Progression Grid
- Build the calendar configuration (academic year, sequences, holidays)
- Build the Progression Grid component (week-by-week table)
- Pre-load Physics progression data for all class levels
- Color-code by sequence, highlight evaluations and holidays
- Click week to navigate to lesson plan
- Verify: Can see full year progression for Physics Form 1-5

### Step 5: Lesson Plan Editor
- Build the lesson plan form with all fields
- Pre-fill from progression when selecting week + class
- Auto-save to IndexedDB
- Duration and period type toggles
- Status tracking (planned/completed/skipped/partial)
- Verify: Can create, edit, save, and retrieve lesson plans

### Step 6: AI Integration
- Build Settings page with API key input
- Implement Gemini API client
- Implement Groq API client
- Build "Generate with AI" button component
- Generate objectives, activities, materials from syllabus context
- Offline detection and graceful fallback
- Verify: Can generate lesson content with AI, edit it, save it

### Step 7: Progress Tracker
- Build progress dashboard with bars/charts
- Sequence-by-sequence breakdown
- Behind-schedule alerts
- Current week indicator
- Verify: Dashboard shows accurate progress based on lesson plan statuses

### Step 8: Export (PDF + Word)
- Build PDF export with clean layout (jsPDF)
- Build Word export (docx package)
- Single lesson and batch export
- Print-friendly formatting
- Verify: Exported files open correctly and look professional

### Step 9: PWA Polish
- Service worker for full offline support
- Install prompt on mobile
- Offline indicator in UI
- Cache strategies for static assets
- Verify: App works fully offline, installable on Android

### Step 10: Sharing
- Export syllabus + progression as JSON
- Import JSON from colleague
- Instructions for sharing via WhatsApp/email
- Verify: Can export from one browser, import in another

---

## UI/UX Guidelines

- **Mobile-first responsive design** -- many teachers will use Android phones
- Sidebar navigation on desktop, bottom tab bar on mobile
- Clean, readable typography (teachers may use this in poor lighting)
- Minimal data entry -- pre-fill as much as possible from syllabus and progression
- Large touch targets for mobile use
- Color scheme: Professional, education-themed (blues and greens)
- English language only (for now)

---

## Important Notes for AI Assistants

1. **This is a local-first app.** All data must be stored in IndexedDB via Dexie.js. There is no backend server.
2. **Offline is critical.** The app must work without internet for all core features (browsing syllabus, creating lesson plans, viewing progression, tracking progress, exporting).
3. **AI features are optional enhancements.** They require internet and user-provided API keys. The app must be fully functional without them.
4. **Pre-load Physics data.** The app should come pre-loaded with the complete Physics syllabus and progression for all class levels (Form 1 through Upper Sixth), extracted from the government PDF documents.
5. **CBA methodology matters.** All lesson plan templates and AI prompts must align with Cameroon's Competence-Based Approach: learner-centered, practical activities, real-life situations, locally available materials.
6. **Keep materials realistic.** Suggested materials should be things available in a rural Cameroonian school: flashlights, string, rulers, tennis balls, cardboard, markers, bottles, stones, etc. Avoid suggesting lab equipment unless the syllabus specifically requires it.
7. **The progression is national and standardized.** Teachers follow the National Harmonized Progression as-is. The app should pre-load this and make it easy to follow week by week.
