ProjectForge AI

An AI-powered technical project manager combined with a lightweight engineering workspace.

ProjectForge AI transforms a natural-language software idea into a structured, feasibility-checked, execution-ready project plan. It combines AI-assisted project analysis with deterministic engineering intelligence to help users understand, design, plan, organize, execute, monitor, and recover software projects from a single workspace.

1. Project Name

ProjectForge AI

2. Problem Statement

Planning and managing software projects can be difficult. Teams often need to determine:

Whether an idea is technically feasible

Which technologies should be used

What the MVP should contain

How long development may take

What skills the team needs

How work should be divided

Whether the project is healthy

What risks are affecting progress

How to recover when a project falls behind

Traditional project-management tools mainly help teams track work after planning has already been completed.

ProjectForge AI addresses this gap by combining AI-powered project intelligence with a structured engineering workspace.

IDEA → UNDERSTAND → ANALYZE → DESIGN → PLAN → ORGANIZE → EXECUTE → MONITOR → RECOVER

3. Features

AI Project Intelligence

Natural-language project idea analysis

Technical feasibility analysis

MVP and post-MVP feature identification

Technology-stack recommendations

Project-duration estimation

Team-size estimation

Structured project blueprint generation

Multi-Agent AI Architecture

ProjectForge AI uses specialized AI agents:

Project Analyst Agent — feasibility, complexity, and MVP analysis

Architecture Agent — system architecture and technology rationale

Planning Agent — work breakdown, milestones, and required skills

Risk Agent — project-risk detection and severity classification

Recovery Agent — tactical recovery strategies

Monitoring Agent — health and project telemetry analysis

Project Copilot — assistance grounded in live project state

AI responses are validated before being persisted. The system uses a multi-tier AI-provider strategy with a deterministic fallback.

Deterministic Project Health

Project health is calculated by a backend health engine using:

Factor

Weight

Technical

25%

Timeline

20%

Skills

20%

Scope

20%

Team Capacity

15%

The backend is the authoritative source for the health score and breakdown.

Architecture Visualization

Interactive React Flow architecture diagrams

Component-based system visualization

Directional dependency relationships

AI-generated architecture representation

Execution Workspace

Milestone management

Task management

Task dependencies

Dependency-cycle detection

Automatic task-completion tracking

Milestone progress calculation

Six-column Kanban board:

Backlog

Todo

In Progress

Blocked

Review

Completed

Drag-and-drop task progression with optimistic UI updates and rollback

Team & Resource Management

Team-member management

Task assignment

Workload calculation

Capacity classification

Deterministic skill-gap analysis

Required-skill coverage analysis

Risk Radar

Automatically detects risks such as:

Team workload overload

Blocked dependency bottlenecks

Missing critical skills

Milestone deadline proximity

Includes:

Severity classification

Category and severity filtering

Manual risk creation

Risk resolution

Risk history

AI Recovery Intelligence

Generates tactical recovery strategies such as:

Descoping non-MVP work

Reassigning overloaded tasks

Unblocking dependencies

Adjusting milestone timelines

Recovery uses a human-in-the-loop workflow. AI recommendations require explicit user approval before project data is modified.

Project Copilot

The Copilot can answer questions about:

Project health

Tasks

Milestones

Team workload

Skill gaps

Open risks

Project priorities

It is grounded in live project data and is designed to avoid inventing nonexistent project information.

Notifications & Activity Timeline

Global notifications

Unread notification count

Health-change notifications

Risk notifications

Mark-as-read functionality

Project activity timeline

Lifecycle-event auditing

Health Trend History

Historical health scores are stored to visualize project health over time.

Example:

72 → 76 → 81 → 78

Interactive Demo

The application includes a one-click demo project containing:

5 team members

5 milestones

21 tasks

Multiple Kanban states

4 project risks

Architecture visualization

Health history

Project telemetry

4. Technology Stack

Frontend

Next.js 14 (App Router)

React 18

Tailwind CSS

Zustand

Axios

React Flow

Recharts

Lucide React

@hello-pangea/dnd

Backend

Node.js

Express.js

Mongoose

MongoDB Atlas

MongoMemoryServer fallback

JWT

bcryptjs

express-validator

Helmet

CORS

express-rate-limit

Morgan

Compression

AI Services

Primary: OpenRouter API

Secondary: Google Gemini API

Fallback: Deterministic rule-based engine

Deployment

GitHub

Vercel — Frontend

Render — Backend

MongoDB Atlas — Database

5. Screenshots

Screenshots are intentionally not included in this repository README, but in docs/screenshots. 

The deployed application can be explored through the live demo below.

6. Live Demo

Frontend:
https://projectforge-ai-gamma.vercel.app/

GitHub Repository:
https://github.com/manav122005/projectforge-ai

7. Backend

Backend API:
https://projectforge-ai-b7ai.onrender.com/

Backend Health Check:
https://projectforge-ai-b7ai.onrender.com/api/health

8. Setup Instructions

Prerequisites

Node.js 18 or higher

npm 9 or higher

Git

MongoDB instance, or the application's configured memory-server fallback

1. Clone the Repository

git clone https://github.com/manav122005/projectforge-ai.git
cd projectforge-ai

2. Configure the Backend

Create:

backend/.env

Add the required environment variables:

PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key

CLIENT_URL=http://localhost:3000

3. Install and Start the Backend

cd backend
npm install
npm run dev

The backend runs at:

http://localhost:5000

4. Configure the Frontend

Create:

frontend/.env.local

Add:

NEXT_PUBLIC_API_URL=http://localhost:5000/api

5. Install and Start the Frontend

Open another terminal:

cd frontend
npm install
npm run dev

The frontend runs at:

http://localhost:3000

9. Environment Variables

Actual secrets must never be committed to GitHub.

Backend

Variable

Purpose

PORT

Backend server port

NODE_ENV

Application environment

MONGODB_URI

MongoDB connection string

JWT_SECRET

JWT signing secret

JWT_EXPIRES_IN

JWT expiration duration

OPENROUTER_API_KEY

OpenRouter API key

GEMINI_API_KEY

Gemini API key

CLIENT_URL

Frontend origin

Frontend

Variable

Purpose

NEXT_PUBLIC_API_URL

Backend API base URL

Environment files such as .env, .env.local, and other environment-specific files are excluded through .gitignore.

Additional Technical Details

System Architecture

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
                    │ Validation           │
                    │ Business Logic       │
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

Security

ProjectForge AI implements:

JWT authentication

Protected API routes

Project ownership and member authorization

bcrypt password hashing

Input validation

Dependency validation

Centralized error handling

Helmet security headers

CORS configuration

Authentication rate limiting

Environment-variable based secret management

Database Structure

Major MongoDB models include:

Users
Projects
AI Analyses
Milestones
Tasks
Project Members
Risks
Project Events
Notifications

Testing

The backend contains automated tests covering authentication, project CRUD, authorization, AI analysis, architecture generation, planning, milestones, tasks, dependencies, Kanban updates, team capacity, skill gaps, risk detection, recovery, notifications, project events, Copilot functionality, demo seeding, and health-score consistency.

Current verification:

6 / 6 test suites passed
42 / 42 test cases passed
0 failures

Test suites:

test_api.js
test_project_api.js
test_ai_phase3.js
test_phase4.js
test_phase5_phase6.js
test_health_audit.js

AI Provider Resilience

OpenRouter (Primary)
        ↓
Gemini (Secondary)
        ↓
Deterministic Fallback

If an external AI provider fails, the fallback layer allows supported core operations to continue without depending entirely on a single provider.

Human-in-the-Loop Recovery

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

License

MIT License — Copyright (c) 2026 ProjectForge AI Contributors.
