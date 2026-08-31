# ProjectForge AI

> An AI-powered technical project manager combined with a lightweight engineering workspace.

ProjectForge AI transforms a natural-language software idea into a structured, feasibility-checked, execution-ready project plan.

It combines AI-assisted project analysis with deterministic engineering intelligence to help users understand, design, plan, organize, execute, monitor, and recover software projects from a single unified workspace.

---

## 1. Problem Statement

Planning and managing software projects can be difficult, especially when deciding:

- Whether an idea is technically feasible
- What technologies should be used
- What the MVP should contain
- How long development may take
- What skills the team needs
- How work should be divided
- Whether the project is currently healthy
- What risks are affecting progress
- How to recover when a project falls behind

Traditional project management tools primarily help teams track tasks after planning has already been completed.

ProjectForge AI addresses this gap by combining AI-powered project intelligence with a structured engineering workspace.

A user can provide a project idea in natural language, and ProjectForge AI can transform it into:

**IDEA → UNDERSTAND → ANALYZE → DESIGN → PLAN → ORGANIZE → EXECUTE → MONITOR → RECOVER**

---

## 2. Features

### AI Project Intelligence

- Natural-language project idea analysis
- Technical feasibility analysis
- MVP and post-MVP feature identification
- Technology stack recommendations
- Project duration estimation
- Team-size estimation
- Structured project blueprint generation

### Multi-Agent AI Architecture

ProjectForge AI uses specialized AI agents for different project-management tasks:

- **Project Analyst Agent**: Feasibility assessment, complexity scoring, and MVP scoping.
- **Architecture Agent**: Visual node-edge architecture diagrams and technology stack rationale.
- **Planning Agent**: Work breakdown structure, milestone sequencing, and required skill extraction.
- **Risk Agent**: Continuous project risk detection and severity classification.
- **Recovery Agent**: Tactical recovery strategies with human-in-the-loop approval.
- **Monitoring Agent**: Telemetry auditing and health trend analysis.
- **Project Copilot**: Grounded assistant answering questions strictly from live project state.

AI responses are strictly validated before being persisted.

The system includes a tri-tier provider cascade with a deterministic fallback layer so that core functionality continues even when an external AI provider is unavailable.

### Deterministic Project Health Intelligence

Project health is calculated using a deterministic backend health engine.

The health score uses the following weighted factors:

- Technical — 25%
- Timeline — 20%
- Skills — 20%
- Scope — 20%
- Team Capacity — 15%

The authoritative health score and breakdown are calculated and persisted to MongoDB by the backend and are used consistently throughout the application (Dashboard, Project Cards, Detail View, and Health Widgets).

### Architecture Visualization

- Interactive React Flow architecture diagrams
- Component-based system visualization
- Directional dependency relationships
- AI-generated architecture representation

### Execution Workspace

- Milestone management
- Task management
- Task dependencies
- Dependency cycle detection
- Automatic task completion tracking
- Milestone progress calculation
- Six-column Kanban board:
  - Backlog
  - Todo
  - In Progress
  - Blocked
  - Review
  - Completed
- Drag-and-drop task progression with optimistic UI updates and rollback

### Team & Resource Management

- Team member management
- Task assignment
- Workload calculation
- Capacity classification:
  - Under Capacity
  - Near Capacity
  - Over Capacity
- Deterministic skill-gap analysis
- Required-skill coverage analysis

### Risk Radar

ProjectForge AI automatically detects project risks such as:

- Team workload overload
- Blocked dependency bottlenecks
- Missing critical skills
- Milestone deadline proximity

The Risk Radar provides:

- Severity classification
- Category filtering
- Severity filtering
- Manual risk creation
- Risk resolution
- Risk history

### AI Recovery Intelligence

The Recovery Agent generates tactical recovery strategies such as:

- Descoping non-MVP work
- Reassigning tasks from overloaded members
- Unblocking dependencies
- Adjusting milestone timelines

Recovery actions use a human-in-the-loop workflow. AI recommendations do not silently modify project data; users must explicitly approve recovery actions before they are applied.

### Project Copilot

The ProjectForge Copilot provides project-context-aware assistance.

It can answer questions about:

- Project health
- Current tasks
- Milestones
- Team workload
- Skill gaps
- Open risks
- Project priorities

The Copilot is grounded in live project data and avoids inventing nonexistent tasks, members, or project information.

### Notifications & Activity Timeline

- Global notification system
- Unread notification count
- Health-change notifications
- Risk notifications
- Mark-as-read functionality
- Project activity timeline
- Lifecycle event auditing

Tracked events include:

- `PROJECT_CREATED`
- `AI_ANALYSIS_COMPLETED`
- `RISK_DETECTED`
- `RECOVERY_APPLIED`
- `TASK_COMPLETED`
- `HEALTH_SCORE_CHANGED`
- `COPILOT_QUERY`

### Health Trend History

ProjectForge AI stores historical health scores to visualize project health over time.

Example:

72 → 76 → 81 → 78

### Demo Showcase

The application includes a one-click interactive demo project containing:

- 5 team members
- 5 milestones
- 21 tasks
- Multiple Kanban states
- 4 project risks
- Architecture visualization
- Health history
- Project telemetry

---

## 3. Technology Stack

### Frontend

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Zustand
- Axios
- React Flow (`reactflow`)
- Recharts
- Lucide React
- `@hello-pangea/dnd`

### Backend

- Node.js
- Express.js
- Mongoose
- MongoDB Atlas / MongoMemoryServer fallback
- JWT (JSON Web Tokens)
- bcryptjs
- express-validator
- Helmet
- CORS
- express-rate-limit
- Morgan
- Compression

### AI Services

- **Primary Provider**: OpenRouter API
- **Secondary Provider**: Google Gemini API
- **Fallback**: Deterministic rule-based engine

### Development & Deployment

- GitHub
- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Database)

---

## 4. System Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Next.js Frontend  │
                    │   React + Tailwind  │
                    └──────────┬──────────┘
                               │
                               │ REST API / JWT
                               ▼
                    ┌─────────────────────┐
                    │   Express Backend   │
                    │ Authentication      │
                    │ Validation          │
                    │ Business Logic      │
                    └──────┬───────┬──────┘
                           │       │
                ┌──────────┘       └──────────┐
                ▼                             ▼
       ┌─────────────────┐          ┌──────────────────┐
       │ MongoDB Atlas   │          │   AI Services    │
       │                 │          │                  │
       │ Projects        │          │ OpenRouter       │
       │ Tasks           │          │ Gemini           │
       │ Milestones      │          │ Deterministic    │
       │ Team            │          │ Fallback         │
       │ Risks           │          └──────────────────┘
       │ Events          │
       │ Notifications   │
       └─────────────────┘
```

---

## 5. Security

ProjectForge AI implements defense-in-depth security measures:

### Authentication

- JWT-based authentication
- Protected API routes
- Bearer token authentication
- bcrypt password hashing

### Authorization

- Project ownership verification
- Project-member authorization
- Protected project resources
- Cross-project assignment validation

### Input Protection

- express-validator validation
- Input sanitization
- Mutation validation
- Dependency validation
- Centralized error handling middleware

### API Security

- Helmet HTTP security headers
- CORS configuration
- Rate limiting on authentication endpoints
- Environment-variable based configuration

### Secret Protection

Sensitive configuration is never stored in the repository. The following files remain ignored:

```text
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

API keys, database credentials, JWT secrets, and other private credentials are provided exclusively through environment variables.

---

## 6. Database Structure

ProjectForge AI uses MongoDB Atlas for persistent data storage.

Major collections/models include:

```text
Users
Projects
AI Analyses
Milestones
Tasks
Project Members
Risks
Project Events
Notifications
```

Relationships between project entities are validated by the backend:

```text
Project
 ├── AI Analysis
 ├── Milestones
 │    └── Tasks
 ├── Team Members
 ├── Risks
 ├── Notifications
 ├── Project Events
 └── Health History
```

---

## 7. Testing

The backend includes automated test suites covering all platform phases:

### Test Suites

```text
test_api.js
test_project_api.js
test_ai_phase3.js
test_phase4.js
test_phase5_phase6.js
test_health_audit.js
```

### Current Verification

```text
6 / 6 test suites passed
42 / 42 test cases passed
0 failures
```

The tests cover:

- Authentication
- Project CRUD
- Authorization
- AI analysis
- Architecture generation
- Planning
- Milestone management
- Task management
- Dependency validation
- Cycle detection
- Kanban updates
- Team capacity
- Skill-gap analysis
- Risk detection
- Risk resolution
- Recovery execution
- Notifications
- Project events
- AI Copilot
- Demo project seeding
- Health-score consistency

---

## 8. Live Demo

- **Frontend**: https://projectforge-ai-gamma.vercel.app/
- **Backend API**: https://projectforge-ai-b7ai.onrender.com/
- **Backend Health Check**: https://projectforge-ai-b7ai.onrender.com/api/health

---

## 9. Screenshots

### Dashboard

![Dashboard](image.png)

### Project Detail & Health Score

![Project Detail](image-1.png)

### Kanban Task Board

![Kanban Task Board](image-2.png)

---

## 10. Running Locally

### Prerequisites

- Node.js 18.0 or higher
- npm 9.0 or higher
- MongoDB instance (or automated memory server fallback)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/manav122005/projectforge-ai.git
cd projectforge-ai
```

### 2. Configure the Backend

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key

CLIENT_URL=http://localhost:3000
```

### 3. Install Backend Dependencies & Start

```bash
cd backend
npm install
npm run dev
```

Backend server runs at `http://localhost:5000`.

### 4. Configure the Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 5. Install Frontend Dependencies & Start

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend application runs at `http://localhost:3000`.

---

## 11. Environment Variables

### Backend

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `NODE_ENV` | Application environment |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | JWT expiration duration |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `GEMINI_API_KEY` | Gemini API key |
| `CLIENT_URL` | Frontend origin |

### Frontend

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

---

## 12. Health Score Architecture

ProjectForge AI uses a deterministic backend health engine as the authoritative source of project health.

The score is calculated from:

```text
Technical       → 25%
Timeline        → 20%
Skills          → 20%
Scope           → 20%
Team Capacity   → 15%
```

The calculated health score and breakdown are persisted to the Project document in MongoDB.

All project views use the persisted backend health state, including:

- Dashboard
- Project cards
- Project detail
- Health widgets
- Health history

---

## 13. AI Provider Resilience

ProjectForge AI uses a multi-tier AI provider strategy:

```text
OpenRouter (Primary)
    ↓
Gemini (Secondary)
    ↓
Deterministic Fallback (Offline Guaranteed)
```

If the primary provider is unavailable, the system automatically falls back to Gemini. If external AI providers are unavailable or fail, deterministic fallback logic ensures core analysis, architecture, and planning operations succeed without crashing.

---

## 14. Human-in-the-Loop Safety

AI-generated recovery recommendations do not automatically modify project data.

The workflow is:

```text
AI analyzes project
        ↓
Recovery strategy generated
        ↓
User reviews recommendation
        ↓
User approves action
        ↓
Backend validates action
        ↓
Project mutation executed
        ↓
Event recorded in audit trail
```

---

## 15. License

MIT License — Copyright (c) 2026 ProjectForge AI Contributors.
