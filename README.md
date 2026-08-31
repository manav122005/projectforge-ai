# ProjectForge AI — AI Project Intelligence & Execution Platform

> *"Turn your idea into an execution-ready project."*

ProjectForge AI is an enterprise-grade AI project intelligence and execution platform. It transforms natural-language software project concepts into structured, feasibility-assessed, architecture-mapped, and execution-ready project workspaces with real-time risk radars, deterministic health tracking, and an interactive Kanban execution suite.

---

## 📌 Problem Statement

Engineering teams, product leads, and hackathon participants frequently struggle with transitioning from a high-level software idea to an organized, actionable project blueprint:
1. **Unrealistic Timelines & Scopes**: Scope creep and inaccurate task hour estimations lead to project delays.
2. **Hidden Skill Gaps**: Missing technical capabilities among team members are discovered late in development.
3. **Unmitigated Risks**: Bottlenecks like blocked tasks, member overloading, and third-party dependencies derail execution.
4. **Disjointed Intelligence**: Architectural diagrams, workload distribution, and milestone tracking reside in siloed tools.

## 💡 Solution

ProjectForge AI bridges the gap between ideation and delivery by uniting multi-agent AI intelligence with a deterministic execution engine:
- **Intelligent Blueprint Decomposition**: Automated breakdown into architecture node graphs, technology stacks, required skills, and MVP features.
- **Deterministic Project Health Engine**: An authoritative 5-metric mathematical formula (Technical, Timeline, Skills, Scope, Capacity) with zero artificial drift.
- **Autonomous Risk Radar**: Continuous scanning for team overloading, circular dependencies, overdue milestones, and critical skill deficits.
- **Interactive Execution Workspace**: Drag-and-drop persistent Kanban board, milestone progress tracking, and capacity-aware team roster management.
- **Context-Aware AI Copilot**: Grounded assistant that answers queries strictly from real project state and database telemetry.

---

## ✨ Features (Phases 1–6)

### 1. Foundation & Authentication
- Secure JWT-based authentication with bcrypt password hashing.
- Role-based authorization (`operator`, `lead`, `admin`) protecting all project workspaces.
- Rate limiting, Helmet HTTP security headers, and CORS isolation.

### 2. Project Core & Workspace Management
- Full project CRUD with search, multi-factor filtering, sorting, and pagination.
- Project archiving, cloning/duplication, and role-enforced workspace access control.

### 3. Multi-Agent AI Intelligence & Cascading Resilience
- **Project Analyst Agent**: Feasibility scoring, complexity estimation, and MVP scoping.
- **Architecture Agent**: Visual node-edge architecture flowcharts and technology selection rationales.
- **Planning Agent**: Work breakdown structures, milestone sequencing, and required skill extraction.
- **Tri-Tier AI Provider Resilience**: OpenRouter (Primary) ➔ Gemini (Secondary) ➔ Deterministic Fallback (Offline Guaranteed).

### 4. Execution Workspace
- **Persistent Kanban Board**: Drag-and-drop task progression with optimistic UI updates and backend rollbacks.
- **Task & Milestone Engine**: Dependency cycle detection, start/due date validation, and completion timestamps.
- **Workload & Skill-Gap Analytics**: Capacity utilization calculations (under/near/over capacity) and normalized skill coverage analysis.

### 5. Risk Radar & Recovery Engine
- **Automated Risk Detection**: Continuous identification of timeline, capacity, blocker, and skill deficit risks.
- **AI Recovery Recommendations**: Actionable remediation strategies with an explicit human-in-the-loop approval workflow.
- **ProjectEvents Audit Trail**: Immutable log of project mutations, risk resolutions, and recovery applications.

### 6. Grounded AI Copilot & Polish
- Context-injected AI assistant with zero hallucination guarantee.
- Interactive college placement prediction demo dataset for one-click onboarding.
- Glassmorphic dark-mode design system with responsive layouts and accessible micro-interactions.

---

## 🏗 System Architecture

```
                                  ┌────────────────────────┐
                                  │   Next.js 14 Client    │
                                  │ (App Router + Tailwind)│
                                  └───────────┬────────────┘
                                              │ REST API / JWT
                                  ┌───────────▼────────────┐
                                  │ Express API Gateway    │
                                  │ (Security & Rate Limit)│
                                  └─────┬────────────┬─────┘
                                        │            │
             ┌──────────────────────────┴────┐   ┌───┴─────────────────────────┐
             │ Deterministic Business Logic  │   │  Tri-Tier AI Orchestrator   │
             │ - Health Engine (5 Weights)   │   │  1. OpenRouter API          │
             │ - Workload & Capacity Math    │   │  2. Gemini API              │
             │ - Risk Radar & Cycle Detector │   │  3. Deterministic Fallback  │
             └──────────────┬────────────────┘   └──────────────┬──────────────┘
                            │                                   │
                            └─────────────────┬─────────────────┘
                                              │
                                  ┌───────────▼────────────┐
                                  │     MongoDB Atlas      │
                                  │ (Mongoose Data Models) │
                                  └────────────────────────┘
```

---

## 🧠 Multi-Agent Architecture

```
User Project Idea
      │
      ▼
┌────────────────────────────────────────────────────────┐
│               AI Provider Orchestrator                 │
│      (Centralized Fallback & Structured Validation)    │
└───────┬───────────────────┬───────────────────┬────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│Project Analyst│   │ Architecture  │   │Planning Agent │
│     Agent     │   │     Agent     │   │ (WBS & Skills)│
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
              ┌───────────────────────────┐
              │ Authoritative Health Math │
              │      (0-100% Score)       │
              └─────────────┬─────────────┘
                            ▼
              ┌───────────────────────────┐
              │    MongoDB Persistence    │
              └───────────────────────────┘
```

---

## 🧮 Authoritative Project Health Formula

Project health is deterministically computed by the backend engine using the following weighted metric formula:

$$\text{Health Score} = 0.25 \times \text{Technical} + 0.20 \times \text{Timeline} + 0.20 \times \text{Skills} + 0.20 \times \text{Scope} + 0.15 \times \text{Team Capacity} - \text{Risk Penalties}$$

- **Technical Feasibility (25%)**: Architecture clarity, technology stack validation, complexity balance.
- **Timeline Feasibility (20%)**: Milestone progress, overdue items, completed task ratio.
- **Skill Readiness (20%)**: Normalized coverage of project-required skills against team member capabilities.
- **Scope Execution (20%)**: Task completion percentage, blocked task deduction.
- **Team Capacity (15%)**: Workload allocation ratio vs available hours; overloaded member penalties.

---

## 🛠 Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Zustand, @hello-pangea/dnd, Lucide React, Axios.
- **Backend**: Node.js, Express, Mongoose, MongoDB Atlas / MongoMemoryServer fallback, JSON Web Tokens, bcryptjs, Helmet, express-rate-limit.
- **AI & LLM**: OpenRouter API, Google Gemini API, Zod schema validation, Deterministic heuristic fallback engine.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher
- MongoDB instance (or rely on automated memory server fallback)

### 1. Clone & Configure Backend

```bash
cd backend
npm install
cp .env.example .env
```

Configure `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/projectforge
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
OPENROUTER_API_KEY=your_openrouter_key_optional
GEMINI_API_KEY=your_gemini_key_optional
```

Start the backend server:
```bash
npm run dev
# Server will run at http://localhost:5000
```

### 2. Configure & Launch Frontend

```bash
cd ../frontend
npm install
```

Configure `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Run frontend in development mode:
```bash
npm run dev
# App will run at http://localhost:3000
```

Or build for production:
```bash
npm run build
npm start
```

---

## 🧪 Testing Strategy

Run the complete backend test suite:
```bash
cd backend
npm test
```

This executes:
1. `test_api.js` — Phase 1 Auth, JWT, Security, and Route Protection.
2. `test_project_api.js` — Phase 2 Project CRUD, Access Control, and Duplication.
3. `test_ai_phase3.js` — Phase 3 Provider Fallbacks, Agent Intelligence, and Validation.
4. `test_phase4.js` — Phase 4 Kanban, Workload Math, Cycles, and Skill Gap Analysis.
5. `test_phase5_phase6.js` — Phase 5 Risk Radar, Recovery Workflow, Audit Log, and Copilot.
6. `test_health_audit.js` — Global Health Score Consistency across all views.

---

## 📋 API Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new account | No |
| `POST` | `/api/auth/login` | Login & issue JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/projects` | List authorized projects with search/filters | Yes |
| `POST` | `/api/projects` | Create new project workspace | Yes |
| `GET` | `/api/projects/:id` | Fetch project details & live health | Yes |
| `PUT` | `/api/projects/:id` | Update project metadata | Yes |
| `POST` | `/api/projects/:id/analyze` | Run Project Analyst AI Agent | Yes |
| `POST` | `/api/projects/:id/generate-architecture` | Generate Architecture Node Graph | Yes |
| `POST` | `/api/projects/:id/generate-plan` | Generate Milestones & Tasks | Yes |
| `GET` | `/api/projects/:id/tasks` | Get project tasks | Yes |
| `POST` | `/api/projects/:id/tasks` | Create task with dependency checks | Yes |
| `PUT` | `/api/tasks/:id` | Update task / Kanban status | Yes |
| `GET` | `/api/projects/:id/members` | Get team members & workload analytics | Yes |
| `POST` | `/api/projects/:id/members` | Add member to team roster | Yes |
| `GET` | `/api/projects/:id/skill-gap` | Calculate deterministic skill gap | Yes |
| `GET` | `/api/projects/:id/risks` | Fetch active risks with auto-detection | Yes |
| `POST` | `/api/projects/:id/recovery` | Generate recovery recommendations | Yes |
| `POST` | `/api/projects/:id/recovery/apply` | Apply recovery plan action | Yes |
| `POST` | `/api/projects/:id/copilot` | Ask grounded AI Copilot | Yes |
| `POST` | `/api/projects/demo/seed` | Seed interactive demo project | Yes |

---

## 🔒 Security & Privacy

- **Zero Secret Exposure**: No credentials or private API tokens in tracked code or logs.
- **Fail-Safe Fallbacks**: System operates completely even without active external LLM credentials.
- **Role Isolation**: Strict project boundary validation prevents cross-tenant access.

---

## 📄 License

MIT License — Copyright (c) 2026 ProjectForge AI Contributors.
