# Kairos

> *καιρός* — The ancient Greek word for the right moment. Not just time passing. The opportune instant where action makes a difference.

**Kairos finds yours.**

🌐 **Live:** [kairos-production-5dd9.up.railway.app](https://kairos-production-5dd9.up.railway.app) &nbsp;|&nbsp; 💻 **Repo:** [github.com/tachiiB/Kirothon-The-FINALE-AWS-Comm-PK](https://github.com/tachiiB/Kirothon-The-FINALE-AWS-Comm-PK)

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat-square&logo=openai)
![Railway](https://img.shields.io/badge/Deployed-Railway-0B0D0E?style=flat-square&logo=railway)
![Kiro](https://img.shields.io/badge/Built%20with-Kiro%20AI-blueviolet?style=flat-square)

---

## Who It's For

Kairos is specifically designed for university students currently enrolled in a **bachelor's program in a technical field** — Computer Science, Software Engineering, Artificial Intelligence, Data Science, Electrical Engineering, Electronics, Telecom, Mechatronics, and related disciplines.

It is not designed for postgraduate students, non-technical fields, or general email management.

---

## The Problem

Every week, Pakistani students receive dozens of forwarded emails — HEC scholarships, Google fellowships, local internships, research positions. Most get buried between promotional emails and university newsletters. Deadlines pass. The moments are lost.

A CGPA 3.2 CS student in Lahore should not miss the MLH Fellowship because it was sandwiched between a Udemy flash sale and a course announcement.

**Kairos solves this.**

---

## What It Does

Paste your inbox. Fill your profile. Kairos does the rest.

| Step | What Happens |
|------|-------------|
| 1 | Paste emails, connect Gmail, or upload a PDF |
| 2 | GPT-4o-mini extracts deadlines, eligibility, requirements, and links from raw text |
| 3 | A deterministic TypeScript scoring engine ranks every opportunity against your profile |
| 4 | You get a prioritized list — with evidence, action checklists, and urgency alerts |
| 5 | One click drafts a tailored cover letter or adds the deadline to Google Calendar |
| 6 | Ask the bilingual AI Career Advisor anything — in English or Roman Urdu |

---

## Architecture

```mermaid
flowchart TD
    A[User Input\nEmails / Gmail / PDF] --> B[Next.js App Router]
    B --> C[/api/analyze]
    C --> D{Input valid?}
    D -- No --> E[400 error]
    D -- Yes --> F[lib/extractor.ts\nGPT-4o-mini extraction]
    F --> G{JSON valid?}
    G -- No --> H[3-attempt repair chain\nstrip fences → retry → strict prompt]
    H --> I[lib/scoringEngine.ts\nDeterministic 4-factor scoring]
    G -- Yes --> I
    I --> J[Ranked RankedOpportunity[]]
    J --> K[ResultsPanel\nOpportunityCard]
    K --> L[Add to Calendar\nGoogle Calendar deeplink]
    K --> M[Cover Letter\n/api/cover-letter → GPT-4o-mini]
    K --> N[Career Roadmap\n/api/roadmap → GPT-4o-mini]
    B --> O[/api/chat\nEdge Runtime SSE]
    O --> P[Bilingual AI Advisor\nRoman Urdu / English streaming]
    C --> Q{API timeout?}
    Q -- Yes --> R[lib/demoResult.json\nInstant precomputed fallback]
```

---

## Scoring Formula

```
Score = Fit × 0.45 + Urgency × 0.30 + Completeness × 0.15 + Prestige × 0.10
```

No LLM guesswork. Same inputs always produce the same output. Every score comes with human-readable evidence chips so you know exactly why an opportunity ranked where it did.

| Factor | Weight | Logic |
|--------|--------|-------|
| **Fit** | 45% | Skills overlap (+5 each, max 20), CGPA match (+15), type preference (+30), location (+10), financial need (+15), degree blocker (−40) |
| **Urgency** | 30% | ≤3 days → 100 · 4–7 → 80 · 8–14 → 60 · 15–30 → 40 · 31–60 → 20 · >60 → 10 |
| **Completeness** | 15% | Starts at 100, −15 per missing critical field (deadline, link, eligibility, docs) |
| **Prestige** | 10% | Fulbright/MIT/Stanford/Harvard → 90 · HEC/NUST/Google/Tintash → 70 · default → 50 |

---

## Features

| Feature | Description |
|---------|-------------|
| **AI Email Extraction** | GPT-4o-mini extracts 17 structured fields from raw email text |
| **Deterministic Scoring** | 4-factor TypeScript engine — reproducible, explainable, no hallucinations |
| **Bilingual AI Advisor** | Streaming chat in Roman Urdu or English. Pakistan-aware: real companies, real salaries, real programs |
| **Career Roadmap** | Pick a target role → get a 4-phase, Pakistan-specific roadmap with salary ranges and company names |
| **Google Calendar** | One-tap deadline add — no OAuth, pre-filled event with link and details |
| **Cover Letter Generator** | AI drafts a personalized cover letter per opportunity in under 10 seconds |
| **Gmail Integration** | Connect inbox via Google OAuth — Primary inbox, last 20 emails |
| **PDF Upload** | Drag-and-drop PDF parsing for forwarded email batches |
| **Demo Mode** | Instant pre-analyzed results for demos — no API call, no timeout risk |
| **Error Transparency** | If live analysis fails, a clear error is shown — no silent fallback to demo data |
| **Evidence Chips** | Every score factor is explained in plain English |
| **Urgency Alerts** | Red banner for deadlines within 3 days, amber for within 7 |
| **Action Checklists** | Auto-generated per opportunity: docs to prepare, links to open, deadlines to mark |
| **Persistent Storage** | Profile and results saved in localStorage across sessions |
| **Mobile Responsive** | Full feature parity on mobile |

---

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Development Environment** | **Kiro AI** | AI-assisted development, intelligent code generation, 3x faster development |
| Framework | Next.js 14 App Router | SSR, API routes, edge runtime in one package |
| Language | TypeScript (97.9% of codebase) | Type safety across scoring engine and API contracts |
| AI Model | OpenAI GPT-4o-mini | Fast, cheap, accurate JSON extraction at low latency |
| AI Chat | OpenAI GPT-4o-mini (streaming SSE) | Edge runtime streaming — no timeout, instant tokens |
| Auth | NextAuth.js v4 + Google OAuth | Gmail read access with token refresh |
| Scoring | Custom deterministic TypeScript engine | Reproducible results, no AI variance |
| Styling | Tailwind CSS + glass morphism | No component library dependency |
| Deployment | Railway | Auto deploy on push to main |

---

## Resilience Design

Kairos is built to never show a broken state during a live demo:

1. **JSON Repair Chain** — if GPT returns malformed JSON, 3 recovery attempts before graceful degradation
2. **Client-side Fallback** — if the API returns 502/504, the client automatically retries against precomputed demo results
3. **Demo Mode Toggle** — skip the API entirely for instant results, mutual exclusivity enforced with real email input
4. **Timeout Wrapper** — `withTimeout(55000)` prevents indefinite hangs at the server level

---

## Run Locally

```bash
git clone https://github.com/tachiiB/Kirothon-The-FINALE-AWS-Comm-PK.git
cd Kirothon-The-FINALE-AWS-Comm-PK
npm install

# Required
echo "OPENAI_API_KEY=sk-your-key" >> .env.local

# Optional — for Gmail integration
echo "GOOGLE_CLIENT_ID=your-client-id" >> .env.local
echo "GOOGLE_CLIENT_SECRET=your-secret" >> .env.local
echo "NEXTAUTH_SECRET=any-random-32-char-string" >> .env.local
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) · Click **Load Samples** · Click **Analyze Inbox**

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | **Yes** | OpenAI API key — powers extraction, cover letters, roadmap, advisor |
| `GOOGLE_CLIENT_ID` | Gmail only | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Gmail only | Google OAuth client secret |
| `NEXTAUTH_SECRET` | Gmail only | Any random 32-character string |
| `NEXTAUTH_URL` | Gmail only | Your deployed URL |

---

## Development

This project was built using **Kiro AI Development Environment**, which accelerated development through:

- **Intelligent Code Generation** — Rapid prototyping of complex TypeScript algorithms
- **Context-Aware Suggestions** — Smart completions for Next.js App Router patterns
- **Automated Refactoring** — Type-safe code improvements across multiple files
- **Real-time Error Detection** — Immediate feedback on TypeScript issues
- **AI-Assisted Debugging** — Quick identification and resolution of edge cases

For a detailed development journey, see [DEVLOG.md](./DEVLOG.md).

---

## Privacy

Emails are processed transiently by OpenAI's API for analysis. Nothing is stored on our servers. All results are saved only in your browser's localStorage.

---

Built with [Kiro AI Development Environment](https://kiro.ai) by [Taha Jamshed](https://github.com/tachiiB) · UET Lahore
