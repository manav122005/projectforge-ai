# ProjectForge AI

> AI Technical Project Manager + Lightweight Engineering Workspace

ProjectForge AI transforms a natural-language software idea into a structured, feasibility-checked, execution-ready project plan and provides a complete workspace to plan, execute, monitor, and recover the project.

---

## 1. Problem Statement

Planning and managing software projects often requires manually converting an idea into technical requirements, architecture, milestones, tasks, team assignments, risk assessments, and recovery plans.

ProjectForge AI solves this problem by combining AI-powered project intelligence with a lightweight engineering workspace.

A user can enter a natural-language project idea and ProjectForge AI can help transform it through the complete lifecycle:

**IDEA → UNDERSTAND → ANALYZE → DESIGN → PLAN → ORGANIZE → EXECUTE → MONITOR → RECOVER**

The platform combines AI agents, deterministic project-health calculations, task management, team capacity analysis, risk detection, recovery intelligence, and an AI project copilot.

---

## 2. Features

### Authentication & Security

- User registration and login
- JWT authentication
- HTTP-only/Bearer token authentication
- Password hashing using bcrypt
- Protected project routes
- Project ownership and member authorization
- Input validation and sanitization
- Helmet security headers
- CORS protection
- Authentication rate limiting
- Environment-based secret configuration

### Project Management

- Create projects from natural-language ideas
- Project CRUD operations
- Update projects
- Search and filtering
- Pagination
- Project duplication
- Soft archive
- Project deletion
- Project ownership and authorization

### AI Project Intelligence

- AI Project Analyst
- Technical feasibility analysis
- MVP and post-MVP feature identification
- Technology stack recommendations
- Duration estimation
- Team-size estimation
- AI Architecture generation
- Interactive architecture visualization
- AI Planning Agent
- Automatic milestone and task planning

### Deterministic Project Health Engine

ProjectForge AI uses one authoritative backend health engine to calculate project health.

The health score is based on:

- Technical / Feasibility — 25%
- Timeline — 20%
- Skills — 20%
- Scope — 20%
- Team Capacity — 15%

The backend calculates and persists the authoritative:

- `healthScore`
- `healthBreakdown`

All project views use the same persisted health data.

### Execution Workspace

- Milestone management
- Task management
- Task dependencies
- Circular dependency detection
- Six-column Kanban board
- Drag-and-drop task management
- Optimistic UI updates with rollback
- Automatic task completion timestamps
- Milestone completion percentage
- Team member management

### Team & Resource Intelligence

- Team capacity calculation
- Workload utilization
- Under-capacity detection
- Near-capacity detection
- Over-capacity detection
- Deterministic skill-gap analysis
- Required skill matching
- Missing skill identification
- Critical skill deficiency detection

### Risk Radar

- Automatic risk detection
- Workload overload detection
- Blocked dependency detection
- Missing critical skill detection
- Milestone deadline risk detection
- Risk severity classification
- Risk filtering
- Manual risk creation
- Risk resolution
- Risk history

### AI Recovery Intelligence

- AI-generated recovery plans
- Task reassignment recommendations
- Dependency-unblocking strategies
- Non-MVP task descoping
- Milestone timeline recommendations
- Human-in-the-loop recovery execution
- No silent project mutations
- Recovery actions recorded in project events

### Project Copilot

ProjectForge Copilot provides project-context-aware assistance using live project data.

It can answer questions about:

- Current project health
- Team workload
- Overloaded members
- Skill gaps
- Tasks
- Milestones
- Risks
- Priorities
- Project status

The Copilot is grounded in the project's actual database state.

### Monitoring & Audit Trail

- Project event timeline
- Health score history
- Health trend visualization
- Risk notifications
- Global notification system
- Unread notification count
- Mark-as-read functionality
- Lifecycle event auditing

### Demo Showcase

The application includes a one-click demo project containing:

- 5 team members
- 5 milestones
- 21 tasks
- Multiple Kanban states
- 4 realistic risks
- Architecture visualization
- Health history
- Project telemetry

---

## 3. Technology Stack

### Frontend

- Next.js 14
- React
- Tailwind CSS
- Zustand
- Axios
- React Flow / `@xyflow/react`
- Recharts
- Lucide React
- `@hello-pangea/dnd`

### Backend

- Node.js
- Express.js
- Mongoose
- JWT
- bcryptjs
- express-validator
- Helmet
- CORS
- express-rate-limit
- Morgan
- Compression

### Database

- MongoDB Atlas
- MongoDB / Mongoose schemas
- Indexed project search

### AI

- OpenRouter
- Google Gemini
- Deterministic fallback system

The AI architecture uses a provider cascade:

**OpenRouter → Gemini → Deterministic Fallback**

This ensures the application can safely continue operating when an external AI provider is unavailable.

---

## 4. Architecture

```text
                         ProjectForge AI

                              User
                               |
                               v
                    +---------------------+
                    |      Next.js        |
                    |      Frontend       |
                    +----------+----------+
                               |
                               | REST API
                               v
                    +---------------------+
                    |   Node.js/Express   |
                    |       Backend       |
                    +----------+----------+
                               |
             +-----------------+-----------------+
             |                 |                 |
             v                 v                 v
      +-------------+   +-------------+   +-------------+
      | MongoDB     |   | AI Agents   |   | JWT Auth    |
      | Atlas       |   |             |   | & Security  |
      +-------------+   +------+------+   +-------------+
                               |
                       +-------+-------+
                       |               |
                       v               v
                  OpenRouter        Gemini
                       |
                       v
              Deterministic Fallback
