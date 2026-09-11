# Lesson Planner — How to Use Guide

For Cameroonian secondary school teachers following the MINESEC Competence-Based Approach (CBA).

**Website:** https://oc-lesson-planner.netlify.app

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Onboarding — Setting Up Your Profile](#2-onboarding--setting-up-your-profile)
3. [Getting a Free AI Key](#3-getting-a-free-ai-key)
4. [Configuring Settings](#4-configuring-settings)
5. [Choosing Your Subject and Class Level](#5-choosing-your-subject-and-class-level)
6. [The Progression Grid](#6-the-progression-grid)
7. [Creating a Lesson Plan](#7-creating-a-lesson-plan)
8. [Following Up (Planned → Done)](#8-following-up-planned--done)
9. [Exporting Lesson Plans (PDF / Word)](#9-exporting-lesson-plans-pdf--word)
10. [Sharing Subject Templates](#10-sharing-subject-templates)
11. [Tips & Frequently Asked Questions](#11-tips--frequently-asked-questions)

---

## 1. Getting Started

Lesson Planner is an **offline-first web app**. It works on any phone, tablet or computer with a modern browser (Chrome, Edge, Safari, Firefox). You do not need to install anything or create an account.

### Opening the app

1. Open your browser and go to: **https://oc-lesson-planner.netlify.app**
2. The first time, you will see the "Welcome to Lesson Planner" screen.
3. Tap **Get Started** to begin the one-time setup (see Section 2).

### Installing it as an app (recommended)

Add it to your home screen so it opens like a normal app and works with no internet connection:

- **Android / Chrome:** tap the ⋮ menu → **Install app** or **Add to Home screen**.
- **iPhone / Safari:** tap the **Share** icon → **Add to Home Screen**.
- **Desktop Chrome/Edge:** click the install icon in the address bar (a monitor with a ↓ arrow).

> **Note:** Once installed, the app stores everything on your device. AI generation is the only feature that needs internet.

---

## 2. Onboarding — Setting Up Your Profile

The first time you open the app you set up your profile. This takes less than a minute and happens only once.

1. On the welcome screen, tap **Get Started**.
2. On the "Your Profile" screen, fill in:
   - **Your name** — e.g. Ndukong Emmanuel Ngeh
   - **School** — e.g. Government High School Dumbu
   - **Region** — e.g. North-West
3. Tap **Continue**.
4. You will see the "Subjects" screen showing that **12 national syllabuses are already pre-loaded** (Biology, Human Biology, Chemistry, Citizenship Education, Computer Science, Economics, Geography, Geology, History, Literature in English, Mathematics and Physics — all Form 1 to Form 5).
5. Tap **Start Planning**. You are now on the Dashboard.

> **Note:** You can change your name, school or region later in Settings → Profile. These appear on your exported lesson plans.

---

## 3. Getting a Free AI Key

AI generation is **optional**. You can write every lesson by hand if you prefer. To let the app draft lessons for you, you need a free key from one of the two supported providers. The free tiers are more than enough for a single teacher.

### Option A — Gemini (Google AI Studio) *(recommended)*

1. Go to **https://aistudio.google.com/apikey**
2. Sign in with any Google account.
3. Click **Create API key** (accept the terms).
4. Copy the key — it looks like `AIza…`

### Option B — Groq

1. Go to **https://console.groq.com/keys**
2. Create a free account or sign in.
3. Click **Create API Key**.
4. Copy the key — it looks like `gsk_…`

### Option C — OpenRouter

One free account gives you many models to choose from (the app lists only the currently free ones). Free models are rate-limited (about 20 requests/minute) — plenty for planning a few lessons.

1. Go to **https://openrouter.ai/keys**
2. Create a free account (no credit card needed).
3. Click **Keys** → **Create Key**, name it e.g. "lesson-planner", then copy it.
4. Copy the key — it looks like `sk-or-…`

### Option D — Mistral

Mistral's free tier offers a very generous monthly token allowance.

1. Go to **https://console.mistral.ai**
2. Sign up (no credit card needed).
3. Open **API Keys** → **Create new key**, then copy it.

> **Note:** Your API key is stored **only on your own device** and is sent only to the AI provider when you generate. Keep it private, like a password. Free models (e.g. some on OpenRouter) may use your prompts to improve their services, so avoid typing students' names or phone numbers into AI-generated fields.

---

## 4. Configuring Settings

Open **Settings** from the left menu (on a phone, open the menu first). Settings are grouped into cards.

### Profile

Update your name, school and region, then tap **Save Profile**.

### AI Configuration

| Setting | What to do |
|---------|------------|
| Gemini API key | Paste your Gemini key (from Section 3, Option A). |
| Groq API key | Paste your Groq key (from Section 3, Option B). |
| Preferred provider | Choose Gemini, Groq, OpenRouter or Mistral (the one whose key you entered). |
| Model | Tap the **⟳ refresh** button to load the current list of free-tier models, then pick one. |
| Auto-generate | Optional: tick this to auto-draft a full lesson whenever you open a new week. |

1. Paste your API key(s).
2. Choose your **Preferred provider**.
3. Tap the **⟳ refresh** button next to **Model** — the app fetches the current list of available free-tier models from the provider using your key, so you always see up-to-date choices.
4. Pick a model from the dropdown.
5. Tap **Save AI Settings**.
6. Tap **Test Connection** to confirm your key works. A green "Connection successful" message means you are ready.

> **Note:** Models change over time. If generation ever fails with a model error, return here and tap **⟳ refresh** to load the latest available models.

### Calendar

School weeks run **Monday to Friday** across a 36-week year. Set these once per school year:

| Setting | What to do |
|---------|------------|
| Academic year | Pick from the dropdown, e.g. 2025/2026. |
| Year start date | The first Monday of the school year. |
| Christmas / New Year | Set the start and end dates of the 2-week end-of-year break. |
| Easter | Set the start and end dates of the 2-week Easter break. |

1. Tap **Save Calendar**.

> **Note:** Holiday dates change every year in Cameroon — update these each new school year. The progression grid updates automatically when you save.

### Display

- **Theme** — Light, Dark, or System (follows your device).
- **Font size** — drag the slider to make text bigger or smaller.

### Data (backup)

- **Export All Data (Backup)** — downloads a backup file. Keep this safe!
- **Import Backup** — restores your data from a backup file.
- **Clear All Data** — erases everything and resets the app. Use with care.

> **Note:** Back up regularly (e.g. once a month) so you never lose your lesson plans.

---

## 5. Choosing Your Subject and Class Level

1. Use the **Subject** dropdown in the left sidebar to pick your subject.
2. Use the **Class Level** dropdown to pick Form 1, 2, 3, 4 or 5.

Only the class levels that exist for that subject are shown. For example, Human Biology and Geology only have Forms 4–5, and Economics only has Forms 3–5.

---

## 6. The Progression Grid

Open **Progression** from the menu. This is your map for the whole school year — a 36-week plan for your subject and class.

- **Week** — the week of the school year (1–36).
- **Seq** — the sequence number (1–6). Each sequence ends with an evaluation.
- **Module / Chapter / Lesson** — the topic to teach that week.
- **Dur** — how many periods that lesson needs.
- Holiday weeks show a party icon 🎉; evaluation weeks show a sword icon ⚔.

1. Tap any week to open (or create) its lesson plan.
2. Tap **Plan Next** to jump straight to your next unplanned week.

You can filter by term (Term 1, 2, 3) or view the whole year with **All**.

---

## 7. Creating a Lesson Plan

1. From the Progression grid or Dashboard, tap the week you want to plan (or **Plan Next**).
2. The Lesson Plan editor opens, already filled with that week's topic, module and chapter.
3. Complete each section. You can type manually, or use the AI to help (see below).

### The sections

| Section | What it is |
|---------|------------|
| Previous Knowledge | What learners should already know from earlier lessons. |
| Objectives | 3–5 measurable goals starting "By the end of the lesson, the learner should be able to…" |
| Introduction (5 min) | A short hook — a question, story or demonstration. |
| Activities | Learner-centred tasks (individual, group, practical, discussion). |
| Materials | Items available in your school/community (e.g. chalk, string, bottles, stones). |
| Lesson Notes | The full content learners copy into their exercise books. |
| Conclusion | Key takeaway and link to the next lesson. |
| Homework | 1–2 practical assignments (no internet needed). |
| Evaluation Criteria | How you will know the objectives were met. |
| Cross-Cutting Competencies | Tick relevant ones: Communication, Problem-solving, Citizenship, ICT, Creativity, Cooperation. |
| Differentiation | How you support slower and faster learners. |

4. At the bottom, set the **Status** (Planned, In Progress, Completed, Partial or Skipped).

> **Note:** Everything auto-saves as you type — there is no separate Save button for the lesson.

### Using AI to generate content

1. Tap **Generate Full Lesson** to have the AI draft the whole lesson from the syllabus context, then review and tap **Accept All**.
2. Or tap **Generate with AI** next to any single section to fill just that one section.

The AI works best when you have set an API key (Section 3), picked a model (Section 4) and are connected to the internet. Always review AI content before teaching.

---

## 8. Following Up (Planned → Done)

Track your progress so you always know where you are in the school year.

### Dashboard

- Shows **this week's lesson**, your overall completion %, and alerts if you are falling behind.

### Progress Tracker

Open **Progress** from the menu. It shows:

- **Overall progress** — how many lessons you have completed.
- **Sequence breakdown** — progress within each of the 6 sequences.
- **Calendar heatmap** — a colour-coded view of all 36 weeks (green = completed, red = skipped, amber = evaluation).
- **Export Report** — downloads a text summary you can share with your HOD.

### Updating a lesson's status

1. Open the lesson (tap its week in the Progression grid).
2. Scroll to **Status** and tap the current state: Planned → In Progress → Completed.
3. Add a note in **Teacher's Reflection** after teaching (what went well, what to improve).

> **Note:** Marking lessons as Completed keeps your Dashboard and Progress Tracker accurate.

---

## 9. Exporting Lesson Plans (PDF / Word)

### Single lesson

1. Open the lesson.
2. Scroll to the bottom and tap **Export PDF** or **Export Word**.

This downloads a print-ready document you can print or send to your Head of Department or inspector.

### Batch export (multiple lessons)

1. Open **Export** from the menu.
2. Choose a **range**: Week, Sequence, Term, or Custom (start/end week).
3. Tick the lessons you want (or leave unticked to export all in range).
4. Tap **Export as PDF** or **Export as Word (.docx)**.

---

## 10. Sharing Subject Templates

You can share a whole subject (its syllabus + progression + calendar) with a colleague, and import theirs.

1. Open **Sharing** from the menu.
2. Tap **Export {subject} Template** to download a JSON file.
3. Send that file to a colleague (WhatsApp, email, etc.).
4. A colleague imports it from the onboarding "Subjects" screen or the Sharing page via **Choose template file**.

> **Note:** This is a handy way for a department to share a carefully-edited progression across teachers.

---

## 11. Tips & Frequently Asked Questions

### Do I need internet?

No. The app and all your lessons work fully offline. Internet is only needed to install the app once and to use AI generation.

### Is my data safe?

Yes. Everything is stored on your own device. There is no account and no cloud. Use **Settings → Export All Data (Backup)** to make your own backup.

### How much does the AI cost?

Nothing, within the free tier. Gemini and Groq both give free usage that is plenty for one teacher generating a few lessons per week.

### Can I use it on my phone?

Yes. It is designed to work on phones in the classroom, with no internet. Install it to your home screen for the best experience.

### What if I change schools or subjects?

Just switch subject/class in the sidebar, or update your profile in Settings. Your previous data stays on your device.

### What if my model stops working?

AI models change over time. Open **Settings → AI Configuration** and tap the **⟳ refresh** button next to Model to load the latest available models, then save.

### What if a new subject syllabus comes out?

You can import a subject template shared by a colleague, or the author can add new syllabuses to future versions.

> **Remember:** holiday dates change every year — update your Calendar in Settings at the start of each school year.
