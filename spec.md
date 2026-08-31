# ProjectForge AI
## AI Project Intelligence & Execution Platform

Version: 1.0.0
Status: Development Specification
Project Type: Full-Stack AI Web Application

---

# 1. PROJECT OVERVIEW

## 1.1 Product Name

ProjectForge AI

## 1.2 Tagline

"Turn your idea into an execution-ready project."

## 1.3 One-Line Description

ProjectForge AI is a full-stack AI-powered project intelligence and execution platform that transforms a natural-language software project idea into a structured, feasibility-checked, execution-ready project plan with architecture, technology recommendations, skill-gap analysis, team allocation, milestones, tasks, risk monitoring, and an AI project copilot.

---

# 2. PROBLEM STATEMENT

Students and small development teams frequently have project ideas but struggle to determine:

- whether the idea is technically feasible
- how complex the project actually is
- which technologies should be used
- how long the project will realistically take
- what skills are required
- whether the team has the required skills
- how to divide the project into modules
- how to divide work among team members
- what should be included in the MVP
- which risks could cause project failure
- what to do when development falls behind schedule

Existing AI chatbots can provide suggestions, but the output is usually unstructured and disconnected from actual project execution.

ProjectForge AI solves this by turning an idea into a persistent, structured project workspace.

---

# 3. PRODUCT VISION

ProjectForge AI should behave like an AI technical project strategist.

The user should be able to enter:

"I want to build an AI-powered college placement prediction system."

ProjectForge should transform this into:

Idea
→ Project Analysis
→ Feasibility Score
→ Scope Analysis
→ Architecture
→ Technology Stack
→ Required Skills
→ Skill Gap
→ Team Roles
→ Milestones
→ Development Tasks
→ Project Workspace
→ Progress Monitoring
→ Risk Detection
→ Recovery Recommendations

The AI must produce structured and actionable outputs rather than a generic conversational response.

---

# 4. CORE DIFFERENTIATOR

ProjectForge AI is NOT simply an AI chatbot.

The application must demonstrate:

1. Structured AI analysis
2. Persistent project data
3. AI-generated project plans
4. Multi-agent reasoning
5. Project health scoring
6. Skill-gap analysis
7. Team/task allocation
8. Risk detection
9. Recovery recommendations
10. Human approval and editing
11. Real database persistence
12. Full-stack architecture

The AI must assist the user while keeping the user in control.

AI-generated content must always be editable.

---

# 5. TARGET USERS

## Primary User

College students building:

- academic projects
- mini projects
- final-year projects
- hackathon projects
- startup MVPs

## Secondary Users

- student development teams
- beginner developers
- project mentors
- small development teams

---

# 6. CORE USER JOURNEY

## Journey A — New Project

User registers
→ creates project
→ enters project idea
→ AI analyzes idea
→ AI generates project blueprint
→ user reviews results
→ user edits/approves plan
→ project workspace is created

## Journey B — Team Setup

User adds team members
→ enters skills and availability
→ AI analyzes required skills
→ system calculates skill gaps
→ AI recommends team roles
→ AI distributes tasks
→ user approves allocation

## Journey C — Project Execution

User opens project workspace
→ views milestones
→ views Kanban tasks
→ updates task status
→ progress is calculated
→ Project Health Score updates
→ Risk Radar detects problems
→ AI suggests corrective actions

## Journey D — AI Copilot

User asks:

"Why is my project health score low?"

or:

"What should our team complete this week?"

or:

"Can we finish this project in 10 days?"

The AI should answer using the actual stored project data.

---

# 7. TECH STACK

## Frontend

- Next.js
- React
- Tailwind CSS
- Zustand
- Axios
- React Flow
- Lucide React
- Recharts
- Framer Motion where useful

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- express-validator
- helmet
- cors
- morgan
- compression
- express-rate-limit

## AI

Primary:
- OpenRouter API

Fallback:
- Google Gemini API

Final fallback:
- deterministic rule-based analysis engine

## Optional AI/Agent Framework

- LangChain
- LangGraph

LangGraph should be used when available for agent orchestration, but the application must remain functional if it is unavailable.

## Deployment

Frontend:
- Vercel

Backend:
- Render

Database:
- MongoDB Atlas

Source:
- GitHub

---

# 8. SYSTEM ARCHITECTURE

The application follows:

Frontend
↓
REST API
↓
Controllers
↓
Services
↓
AI / Agents / Database

Architecture:

Frontend
    ↓
Express API
    ↓
Authentication Middleware
    ↓
Controllers
    ↓
Services
    ├── Project Service
    ├── Analysis Service
    ├── Team Service
    ├── Task Service
    ├── Risk Service
    ├── AI Service
    └── Notification Service
          ↓
    Agent Orchestrator
          ↓
    AI Agents
          ↓
    MongoDB

Controllers must remain thin.

Controllers must NEVER directly access MongoDB.

Business logic belongs inside services.

Agents must not know about HTTP requests.

---

# 9. AUTHENTICATION

Authentication must support:

- registration
- login
- logout
- JWT authentication
- protected routes
- current-user endpoint
- password hashing
- persistent client authentication state

Passwords must be hashed using bcrypt.

JWT secret must come from:

JWT_SECRET

No credentials may be hardcoded.

---

# 10. USER ROLES

Support:

## operator

Normal project creator/member.

## admin

Can access administrative/system information.

Role must be stored in the User document.

---

# 11. PROJECT MANAGEMENT

Users must be able to:

- create projects
- view projects
- search projects
- update projects
- archive projects
- delete projects
- duplicate projects
- view project details

Each project should contain:

- name
- description
- originalIdea
- owner
- members
- status
- projectHealthScore
- complexityScore
- feasibilityScore
- timelineScore
- skillReadinessScore
- scopeScore
- architecture
- technologyStack
- requiredSkills
- skillGaps
- milestones
- tasks
- risks
- AI recommendations
- createdAt
- updatedAt

---

# 12. PROJECT STATUS

Allowed statuses:

- draft
- planning
- active
- paused
- completed
- archived

---

# 13. AI PROJECT ANALYZER

The user enters a natural-language project idea.

Example:

"Build an AI-powered system that predicts student placement probability."

The analyzer should produce structured JSON.

Required output:

```json
{
  "projectName": "",
  "summary": "",
  "problemStatement": "",
  "targetUsers": [],
  "difficulty": 0,
  "estimatedDurationDays": 0,
  "recommendedTeamSize": 0,
  "feasibilityScore": 0,
  "complexityScore": 0,
  "scopeScore": 0,
  "timelineScore": 0,
  "skillReadinessScore": 0,
  "requiredSkills": [],
  "recommendedTechnologies": [],
  "majorModules": [],
  "risks": [],
  "mvpFeatures": [],
  "futureFeatures": []
}

The frontend must never trust AI output blindly.

Validate all AI-generated structured data before storing it.

14. PROJECT HEALTH SCORE

ProjectForge must calculate an overall health score from 0 to 100.

The score should consider:

technical feasibility
timeline feasibility
scope complexity
skill readiness
team capacity
current progress
unresolved risks

Example:

PROJECT HEALTH
78 / 100

Subscores:

Technical Feasibility: 84
Timeline: 72
Skill Readiness: 65
Scope: 81
Team Capacity: 88

The scoring algorithm must be deterministic and documented.

AI may provide analysis, but the final numeric score should be calculated by backend business logic rather than blindly trusting an LLM-generated number.

15. HEALTH SCORE INTERPRETATION

90–100:
Excellent

75–89:
Healthy

60–74:
Needs Attention

40–59:
High Risk

0–39:
Critical

The UI should clearly communicate the health category.

16. PROJECT ARCHITECTURE GENERATOR

The system should generate an architecture based on project requirements.

Example:

Frontend
↓
API Layer
↓
Authentication
↓
Business Logic
↓
AI Service
↓
Database

For projects requiring AI:

Frontend
↓
Backend API
↓
AI Service
↓
Model Provider
↓
Database

The architecture must be represented as structured nodes and edges.

Use React Flow to visualize the architecture.

Users should be able to:

view architecture
move nodes
inspect nodes
regenerate architecture
edit architecture labels
17. TECHNOLOGY STACK ADVISOR

AI should recommend technologies based on actual requirements.

Each recommendation must include:

technology
category
reason
confidence
alternatives

Example:

React
Category: Frontend

Reason:
"Suitable for a component-driven dashboard with interactive project views."

Alternative:
Vue

The AI should not recommend technologies simply because they are popular.

18. SKILL GAP ANALYZER

The system must compare:

Required Skills
vs
Team Skills

Example:

Required:

Python
Machine Learning
React
Node.js
MongoDB
Docker

Available:

Python
React
MongoDB

Result:

Missing:

Machine Learning
Node.js
Docker

The system should calculate:

Skill Readiness Score

and show:

available skills
missing skills
partially covered skills
critical missing skills
19. TEAM MANAGEMENT

Users can add team members.

Each member may have:

name
email
role
skills
experienceLevel
availabilityHours
assignedTasks

Experience levels:

beginner
intermediate
advanced

Users can:

add members
edit members
remove members
view member profiles
view workload
20. TEAMFORGE AI

TeamForge analyzes:

project requirements
required skills
team member skills
experience
availability
task complexity

Then recommends roles.

Example:

Member:
Rahul

Recommended Role:
Backend Engineer

Reason:
Strong Node.js + MongoDB skills.

Confidence:
91%

The user must be able to override AI recommendations.

21. AI TASK GENERATOR

The system should convert major project modules into actionable tasks.

Example:

Module:
Authentication

Tasks:

Create User schema
Implement registration endpoint
Implement login endpoint
Hash passwords
Implement JWT middleware
Protect frontend routes
Test authentication

Each task should contain:

title
description
priority
estimatedHours
requiredSkills
assignedMember
status
milestone
dependencies
22. TASK STATUS

Allowed statuses:

backlog
todo
in_progress
blocked
review
completed

Tasks should be displayed in a Kanban board.

Users must be able to drag tasks between statuses.

23. TASK PRIORITY

Allowed priorities:

low
medium
high
critical
24. MILESTONES

Projects contain milestones.

Each milestone contains:

name
description
startDate
dueDate
tasks
completionPercentage
status

Example:

Milestone 1:
Foundation

Milestone 2:
Backend

Milestone 3:
AI Integration

Milestone 4:
Testing

Milestone 5:
Deployment

25. PROJECT RISK RADAR

The system should detect project risks.

Risk categories:

timeline
technical
scope
skills
workload
dependency
resource

Risk severity:

low
medium
high
critical

Each risk should contain:

title
description
severity
probability
impact
recommendedAction
status
26. RISK DETECTION ENGINE

The system should detect risks using deterministic business rules.

Examples:

If:

remainingTasks > availableCapacity

then:

create workload risk.

If:

deadline is near AND completionPercentage is low

then:

create timeline risk.

If:

criticalRequiredSkills are missing

then:

create skill risk.

If:

many tasks are blocked

then:

create dependency risk.

AI may supplement explanations but must not be the only risk detection mechanism.

27. AI RECOVERY ENGINE

When major risks are detected, the system should generate recovery recommendations.

Example:

Current:

21 days remaining
42% complete
18 tasks remaining

AI Recommendation:

Remove non-MVP feature X
Reassign task Y
Increase backend capacity
Move documentation to final milestone

Expected result:

Estimated completion:
17 days

The user must approve recommendations before modifying project data.

28. MVP SCOPE OPTIMIZER

AI should divide features into:

MVP

Required to demonstrate the core product.

Phase 2

Useful but non-essential.

Future

Advanced features.

The system should warn when project scope appears excessive.

29. AI PROJECT COPILOT

Provide an AI assistant inside the project workspace.

It should have access to:

project information
project health
tasks
milestones
team
skills
risks
architecture

Example questions:

"Why is my project health score low?"

"What should we work on today?"

"Which team member is overloaded?"

"What skills are we missing?"

"Can we finish before Friday?"

"Which feature should we remove from the MVP?"

"What is blocking our progress?"

The AI must answer using actual project context.

If information is unavailable, it must explicitly say so.

It must not fabricate project data.

30. MULTI-AGENT ARCHITECTURE

ProjectForge should implement cooperating AI agents.

Required agents:

Project Analyst Agent
Architecture Agent
Planning Agent
Team Agent
Risk Agent
Monitoring Agent
Recovery Agent
Copilot Agent
31. PROJECT ANALYST AGENT

Responsibilities:

understand the project idea
identify the problem
identify users
estimate complexity
identify required modules
identify required skills
identify risks
produce structured analysis

Output must be schema validated.

32. ARCHITECTURE AGENT

Responsibilities:

inspect project requirements
select architecture pattern
identify frontend
identify backend
identify database
identify AI services
identify external services
produce architecture graph
33. PLANNING AGENT

Responsibilities:

convert modules into milestones
generate tasks
estimate task complexity
identify dependencies
recommend timeline
34. TEAM AGENT

Responsibilities:

analyze team skills
calculate skill coverage
recommend roles
distribute tasks
identify overloaded members
35. RISK AGENT

Responsibilities:

inspect project state
identify risks
classify severity
calculate probability and impact
recommend mitigation
36. MONITORING AGENT

Responsibilities:

monitor project changes
monitor task progress
update project health inputs
generate project events
identify abnormal progress
37. RECOVERY AGENT

Responsibilities:

inspect detected risks
generate recovery strategies
propose scope reduction
recommend reassignment
recommend timeline changes

Recovery actions require user approval.

38. COPILOT AGENT

Responsibilities:

answer user questions
use stored project context
explain project health
provide recommendations
never invent unavailable information
39. AGENT ORCHESTRATOR

The orchestrator should coordinate agents.

Example:

User creates project
↓
Project Analyst
↓
Architecture Agent
↓
Planning Agent
↓
Team Agent
↓
Risk Agent
↓
Project Blueprint

For project monitoring:

Project State
↓
Monitoring Agent
↓
Risk Agent
↓
Recovery Agent
↓
Recommendation

LangGraph should be supported when available.

The application must expose orchestration availability:

langGraph:
"available"

or:

langGraph:
"not-installed"

40. AI PROVIDER FALLBACK

Priority:

OpenRouter
Gemini
Deterministic fallback

If OPENROUTER_API_KEY exists:

Use OpenRouter.

Else if GEMINI_API_KEY exists:

Use Gemini.

Else:

Use deterministic fallback.

The application must NEVER crash simply because an AI API key is unavailable.

41. DETERMINISTIC FALLBACK

The fallback system must support common project-analysis patterns.

At minimum it should produce usable structured results for:

web application
mobile application
AI/ML project
e-commerce application
college management system
chatbot
dashboard
automation system

Fallback output must still create a valid project blueprint.

42. AI OUTPUT VALIDATION

All AI structured responses must be validated.

Never directly save arbitrary LLM output into MongoDB.

Validate:

required fields
field types
array structures
score ranges
allowed enums
string lengths

Invalid AI responses must trigger a retry or fallback.

43. DATABASE COLLECTIONS

Required collections:

Users
Projects
ProjectMembers
Tasks
Milestones
Risks
ProjectEvents
AIAnalyses
Notifications

Optional:

AgentMemory

44. USERS COLLECTION

Fields:

name
email
password
role
lastLogin
createdAt
updatedAt

Password must use:

select: false

45. PROJECTS COLLECTION

Fields:

name
description
originalIdea
owner
status
healthScore
healthBreakdown
architecture
technologyStack
requiredSkills
skillGaps
recommendedMVP
risks
createdAt
updatedAt
46. PROJECT MEMBERS COLLECTION

Fields:

projectId
userId
displayName
role
skills
experienceLevel
availabilityHours
workload
createdAt
47. TASKS COLLECTION

Fields:

projectId
milestoneId
title
description
status
priority
estimatedHours
requiredSkills
assignedMember
dependencies
createdAt
updatedAt
completedAt
48. MILESTONES COLLECTION

Fields:

projectId
name
description
startDate
dueDate
status
completionPercentage
createdAt
updatedAt
49. RISKS COLLECTION

Fields:

projectId
title
description
category
severity
probability
impact
recommendedAction
status
createdAt
resolvedAt
50. AI ANALYSES COLLECTION

Store AI-generated project analysis.

Fields:

projectId
provider
model
analysisType
promptVersion
result
confidence
createdAt

Never store API secrets.

51. PROJECT EVENTS COLLECTION

Store important project events.

Examples:

PROJECT_CREATED
AI_ANALYSIS_COMPLETED
ARCHITECTURE_GENERATED
TASK_CREATED
TASK_COMPLETED
RISK_DETECTED
RECOVERY_RECOMMENDED
MEMBER_ADDED
HEALTH_SCORE_CHANGED

Fields:

projectId
userId
type
message
metadata
createdAt
52. NOTIFICATIONS

Notifications should include:

owner
projectId
type
title
message
isRead
createdAt

Examples:

"Project health dropped below 60."

"3 critical tasks are overdue."

"New skill gap detected."

53. API ENDPOINTS
Health

GET /api/health

Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

GET /api/auth/me

Projects

GET /api/projects

POST /api/projects

GET /api/projects/:id

PUT /api/projects/:id

DELETE /api/projects/:id

POST /api/projects/:id/duplicate

POST /api/projects/:id/archive

AI

POST /api/projects/analyze

POST /api/projects/:id/analyze

POST /api/projects/:id/generate-architecture

POST /api/projects/:id/generate-plan

POST /api/projects/:id/analyze-skills

POST /api/projects/:id/analyze-risks

POST /api/projects/:id/recovery-plan

POST /api/projects/:id/copilot

Team

GET /api/projects/:id/members

POST /api/projects/:id/members

PUT /api/projects/:id/members/:memberId

DELETE /api/projects/:id/members/:memberId

POST /api/projects/:id/recommend-team

Tasks

GET /api/projects/:id/tasks

POST /api/projects/:id/tasks

PUT /api/tasks/:id

DELETE /api/tasks/:id

POST /api/tasks/:id/assign

Milestones

GET /api/projects/:id/milestones

POST /api/projects/:id/milestones

PUT /api/milestones/:id

DELETE /api/milestones/:id

Risks

GET /api/projects/:id/risks

POST /api/projects/:id/risks/:riskId/resolve

Notifications

GET /api/notifications

PUT /api/notifications/:id/read

54. FRONTEND PAGES
/

Landing page

Must include:

product introduction
animated workflow showcase
AI agent explanation
project health example
feature sections
CTA
responsive design
/login

Authentication page.

/register

Registration page.

/dashboard

Main dashboard.

Show:

total projects
active projects
average health score
tasks due
critical risks
recent projects
recent AI activity
/projects

Project listing.

Features:

search
filter
sort
create project
project cards
/projects/new

Project creation and AI analysis interface.

User enters:

Project idea

Optional:

target users
team size
deadline
available skills

Then:

Analyze Project

/projects/[id]

Project overview.

Show:

project name
health score
health breakdown
progress
milestones
risks
team
technology stack
AI recommendations
/projects/[id]/architecture

Interactive React Flow architecture canvas.

/projects/[id]/tasks

Kanban task board.

Columns:

Backlog
Todo
In Progress
Blocked
Review
Completed

/projects/[id]/team

Team management.

/projects/[id]/risks

Risk Radar.

Visualize:

severity
probability
impact
category
/projects/[id]/ai

Project Copilot.

/settings

User settings.

55. DASHBOARD DESIGN

The UI should feel like a modern AI engineering/productivity platform.

Design principles:

dark-first professional interface
subtle gradients
glassmorphism used sparingly
clean cards
strong typography
clear hierarchy
responsive layout
meaningful animations
excellent empty states
skeleton loaders
toast notifications
accessible contrast

Avoid:

excessive neon
excessive rounded cards
childish illustrations
generic template appearance
unnecessary animations
56. PROJECT HEALTH UI

Create a visually impressive Project Health widget.

Example:

PROJECT HEALTH

78

Healthy

Then show:

Technical
84

Timeline
72

Skills
65

Scope
81

Team
88

Use a combination of:

radial chart
progress indicators
trend indicator
57. PROJECT HEALTH TREND

Store historical health values.

Show:

Health Score

72 → 76 → 81 → 78

Use Recharts.

58. ARCHITECTURE VISUALIZATION

Use React Flow.

Node types:

frontend
backend
database
AI
authentication
external service
storage

Edges should be animated when appropriate.

Clicking a node should show details.

59. RISK RADAR UI

Display risks using:

severity badges
probability
impact
category
recommended action

Create an overview:

Critical: 2
High: 4
Medium: 6
Low: 8

60. AI ACTIVITY TIMELINE

Display events such as:

Project Analyst
"Project complexity analyzed."

Architecture Agent
"Architecture generated."

Planning Agent
"18 development tasks generated."

Risk Agent
"Timeline risk detected."

Recovery Agent
"Recommended MVP scope reduction."

61. RESPONSIVE DESIGN

The entire application must work on:

desktop
tablet
mobile

The workflow/architecture canvas must remain usable on smaller screens.

62. ERROR HANDLING

Frontend:

loading states
skeleton states
error states
retry buttons
empty states

Backend:

centralized error handler
structured API errors
validation errors
authentication errors
AI errors
database errors

Never expose stack traces in production responses.

63. API RESPONSE FORMAT

Use consistent responses.

Success:

{
  "success": true,
  "data": {},
  "message": "Success"
}

Error:

{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
64. SECURITY

Required:

bcrypt password hashing
JWT authentication
helmet
CORS restricted to CLIENT_URL
rate limiting on authentication endpoints
express-validator
environment variables
no secrets in frontend
no secrets in GitHub
no .env committed
no API key logging
65. ENVIRONMENT VARIABLES

Frontend:

NEXT_PUBLIC_API_URL

NEXT_PUBLIC_SOCKET_URL

Backend:

PORT
MONGODB_URI
JWT_SECRET
CLIENT_URL
OPENROUTER_API_KEY
GEMINI_API_KEY

Optional:

REDIS_URL

LANGGRAPH_ENABLED

Never commit actual values.

66. LOGGING

Backend logs should contain:

request method
endpoint
status
duration
relevant error code

Never log:

passwords
JWT secrets
API keys
raw authentication tokens
67. RATE LIMITING

Authentication endpoints must have stricter rate limits.

Apply reasonable API rate limits to prevent abuse.

68. DATABASE VALIDATION

Use Mongoose schema validation.

Validate:

enums
required fields
score ranges
string lengths
relationships
IDs
69. DATA OWNERSHIP

A user must only be able to access projects they own or are explicitly assigned to.

Every project-related endpoint must verify authorization.

Never trust projectId from the client without checking ownership/membership.

70. FRONTEND STATE MANAGEMENT

Use Zustand for:

authentication state
user state
project state where useful
UI state

Axios should be centralized in:

services/api.js

Authentication headers should be handled centrally.

71. PROJECT CREATION FLOW

Step 1:

User enters idea.

Step 2:

Frontend sends request.

POST /api/projects/analyze

Step 3:

Backend invokes AI service.

Step 4:

Project Analyst Agent analyzes idea.

Step 5:

Output is schema validated.

Step 6:

Architecture Agent generates architecture.

Step 7:

Planning Agent generates milestones/tasks.

Step 8:

Risk Agent identifies initial risks.

Step 9:

Backend creates project.

Step 10:

Frontend redirects to project dashboard.

72. HUMAN-IN-THE-LOOP

AI must not silently perform destructive actions.

Examples:

AI may recommend:

"Remove feature X."

But user must approve before deletion.

AI may recommend:

"Reassign task X."

User must approve.

AI may generate:

"Architecture."

User can edit before saving.

73. AI CONFIDENCE

Where appropriate, AI outputs should include confidence.

Example:

Technology recommendation:
React

Confidence:
0.91

However, confidence must be presented as an AI estimate, not as an objective probability.

74. DEMO MODE

The application should include seeded demo data.

Create a demo project:

"AI-Powered College Placement Intelligence"

Demo data should include:

5 team members
5 milestones
20+ tasks
multiple risks
health score history
technology stack
skill gaps
AI recommendations

This allows the deployed application to demonstrate functionality immediately.

75. DEMO PROJECT HEALTH

Example demo state:

Health:
78

Progress:
64%

Open Tasks:
12

Critical Risks:
2

Team Members:
5

Skills Covered:
82%

76. PERFORMANCE

Avoid unnecessary API calls.

Use:

pagination
debounced search
lazy loading
memoization where useful
optimized MongoDB queries
frontend caching where appropriate
77. ACCESSIBILITY

Support:

keyboard navigation
semantic HTML
readable contrast
accessible buttons
aria labels where required
visible focus states
78. PROJECT FOLDER STRUCTURE

Use:

projectforge-ai/

├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── AppShell/
│ │ │ ├── Dashboard/
│ │ │ ├── ProjectHealth/
│ │ │ ├── ProjectCard/
│ │ │ ├── ArchitectureCanvas/
│ │ │ ├── TaskBoard/
│ │ │ ├── RiskRadar/
│ │ │ ├── TeamPanel/
│ │ │ ├── AIActivity/
│ │ │ ├── Copilot/
│ │ │ └── ProtectedRoute/
│ │ ├── pages/
│ │ ├── store/
│ │ ├── services/
│ │ ├── hooks/
│ │ └── utils/
│ └── package.json
│
├── backend/
│ ├── src/
│ │ ├── config/
│ │ ├── routes/
│ │ ├── controllers/
│ │ ├── services/
│ │ ├── agents/
│ │ ├── models/
│ │ ├── middleware/
│ │ ├── validators/
│ │ ├── utils/
│ │ └── app.js
│ └── package.json
│
├── README.md
├── .gitignore
└── SPEC.md

79. BACKEND STRUCTURE
config

env.js
db.js

routes

authRoutes.js
projectRoutes.js
taskRoutes.js
milestoneRoutes.js
teamRoutes.js
riskRoutes.js
aiRoutes.js
notificationRoutes.js

controllers

authController.js
projectController.js
taskController.js
milestoneController.js
teamController.js
riskController.js
aiController.js

services

authService.js
projectService.js
taskService.js
milestoneService.js
teamService.js
riskService.js
aiService.js
healthService.js
notificationService.js

agents

orchestrator.js
projectAnalystAgent.js
architectureAgent.js
planningAgent.js
teamAgent.js
riskAgent.js
monitoringAgent.js
recoveryAgent.js
copilotAgent.js

80. SERVICE RULE

Controllers:

HTTP parsing and response shaping only.

Services:

Business logic.

Agents:

AI reasoning and structured decisions.

Models:

Database structure.

Routes:

HTTP route definitions.

Middleware:

Authentication, validation, error handling.

81. DEVELOPMENT PHASES
PHASE 1 — FOUNDATION

Implement:

project setup
frontend
backend
MongoDB
authentication
JWT
Zustand
AppShell
landing page
login
register
protected routes
health endpoint

Do NOT implement AI yet.

Acceptance:

user can register
user can login
protected dashboard works
user can logout
MongoDB works
application starts successfully
PHASE 2 — PROJECT CORE

Implement:

project CRUD
project listing
project creation
project dashboard
project ownership
search/filter
project status
database relationships

Acceptance:

project can be created
project can be edited
project can be deleted
project can be viewed
authorization works
PHASE 3 — AI PROJECT INTELLIGENCE

Implement:

AI service
OpenRouter
Gemini fallback
deterministic fallback
Project Analyst Agent
Architecture Agent
Planning Agent
AI structured output validation
project health scoring
AI analysis persistence

Acceptance:

User enters an idea.

System generates:

project analysis
feasibility
complexity
skills
technology stack
modules
MVP
risks
architecture
initial plan
PHASE 4 — EXECUTION WORKSPACE

Implement:

milestones
tasks
Kanban board
task assignment
team management
skill gap analysis
Team Agent
project progress
health trend

Acceptance:

A generated project becomes an editable execution workspace.

PHASE 5 — RISK & RECOVERY INTELLIGENCE

Implement:

Risk Agent
Monitoring Agent
deterministic risk engine
Risk Radar
recovery recommendations
Recovery Agent
approval workflow
notifications

Acceptance:

Changes to project progress can result in meaningful risk detection and actionable recovery recommendations.

PHASE 6 — AI COPILOT & POLISH

Implement:

Copilot Agent
project-context-aware chat
AI activity timeline
advanced analytics
animations
responsive improvements
accessibility
loading states
error states
demo data
deployment preparation

Acceptance:

The application feels like a polished AI engineering platform.

82. TESTING REQUIREMENTS

Test:

Authentication
Project CRUD
Authorization
AI fallback
AI validation
Task CRUD
Task assignment
Milestones
Team management
Skill gap calculation
Health score
Risk detection
Recovery recommendations
Copilot context
Error handling

83. DEPLOYMENT REQUIREMENTS

Frontend:

Vercel

Backend:

Render

Database:

MongoDB Atlas

Repository:

GitHub

Production environment variables must be configured through deployment platform settings.

Never commit:

.env

API keys

JWT secrets

database passwords

84. README REQUIREMENTS

README.md must include:

Project Name
Problem Statement
Solution
Features
AI Architecture
Multi-Agent Architecture
Technology Stack
System Architecture
Database Design
API Endpoints
Screenshots
Live Demo
Backend URL
Setup Instructions
Environment Variables
Testing
Future Improvements

Never include real secrets.

85. PROJECT DEMONSTRATION FLOW

The recommended final demonstration:

Open landing page.
Login.
Open dashboard.
Click Create Project.
Enter:

"Build an AI-powered college placement prediction platform for 500 students in 3 weeks."

Start AI analysis.
Show:

Project Health:
61 / 100

Show:

Timeline Risk
Skill Gap
Scope Risk

Open architecture.
Show generated architecture.
Open task plan.
Show automatically generated milestones/tasks.
Open team.
Show skill coverage.
Open Risk Radar.
Show detected risks.
Open Recovery Recommendation.
Show AI recommendation to reduce MVP scope.
Open Copilot.

Ask:

"Why is this project high risk?"

AI responds using actual project data.

This should be the primary showcase flow.

86. AI PROMPT ENGINEERING RULES

AI prompts must:

specify role
specify context
specify required output schema
prohibit hallucination
require structured JSON
include project context
include validation instructions
distinguish known data from assumptions

Prompts should be versioned.

Example:

PROJECT_ANALYST_PROMPT_V1

87. FALLBACK-FIRST DEVELOPMENT

Every AI feature must have a fallback.

If:

OpenRouter unavailable

→ Gemini

If:

Gemini unavailable

→ deterministic builder

The UI should clearly indicate when fallback mode is active.

Example:

AI Provider:
Deterministic Fallback

88. NO FAKE FUNCTIONALITY

Do not create buttons that do nothing.

Every visible action must either:

work
show a meaningful unavailable state
or be intentionally disabled with explanation

Do not create fake AI responses that pretend to come from an external model.

89. NO STATIC DEMO

The application must not depend solely on hardcoded project data.

Demo seed data may exist, but users must be able to create real projects and modify them.

90. ENGINEERING RULES FOR AI CODING AGENT

The coding agent MUST:

Read SPEC.md before modifying the project.
Follow the architecture defined here.
Work phase by phase.
Never implement future phases prematurely.
Never replace working code unnecessarily.
Inspect existing files before creating new ones.
Reuse existing components where appropriate.
Keep controllers thin.
Keep business logic inside services.
Keep agents independent from HTTP.
Validate AI output.
Never expose secrets.
Never hardcode API keys.
Never commit .env.
Handle errors explicitly.
Test functionality after implementation.
Fix errors before moving forward.
Maintain responsive design.
Maintain accessibility.
Keep the application deployable.
91. PHASE COMPLETION REPORT

At the end of every development phase, report:

Files Created

[list]

Files Modified

[list]

Dependencies Added

[list]

Features Implemented

[list]

Tests Performed

[list]

Errors Fixed

[list]

Known Issues

[list]

Environment Variables Required

[list]

Next Phase

[phase]

Do not automatically start the next phase unless explicitly instructed.

92. QUALITY BAR

The final project should qualify as:

OUTSTANDING

according to the project's evaluation philosophy.

It should demonstrate:

advanced functionality
strong AI integration
multi-agent architecture
secure authentication
proper database design
API architecture
polished UI/UX
meaningful automation
deployment
documentation
testing
explainable architecture
93. FINAL PRODUCT DEFINITION

ProjectForge AI is complete when a user can:

Register and authenticate.
Create a project using natural language.
Receive AI-powered project analysis.
See a calculated Project Health Score.
View AI-generated architecture.
Receive technology recommendations.
See required skills.
Compare required skills with team skills.
Add team members.
Receive AI role recommendations.
Generate milestones.
Generate actionable tasks.
Assign tasks.
Track tasks using Kanban.
Monitor project progress.
View health trends.
Detect project risks.
Receive AI recovery recommendations.
Approve or reject recommendations.
Ask the Project Copilot questions using actual project context.
Receive notifications.
Use the application responsively.
Persist all important data in MongoDB.
Use secure authentication.
Run with AI fallbacks when external providers are unavailable.
Deploy the frontend and backend online.
94. FINAL PRINCIPLE

ProjectForge AI should feel like:

"An AI technical project manager combined with a lightweight engineering workspace."

It should NOT feel like:

a generic chatbot
a static dashboard
a simple CRUD application
an AI text generator
a template project

The core experience must always be:

IDEA
→ UNDERSTAND
→ ANALYZE
→ DESIGN
→ PLAN
→ ORGANIZE
→ EXECUTE
→ MONITOR
→ RECOVER

The user remains the decision maker.

AI provides intelligence.

The application provides structure.

The database provides persistence.

The agents provide reasoning.

The workspace provides execution.