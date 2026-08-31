/**
 * Deterministic Fallback Rule Engine for ProjectForge AI
 * Generates structured, schema-compliant project blueprints without external API calls.
 */

const detectDomain = (prompt = '') => {
  const text = prompt.toLowerCase();
  if (text.includes('mobile') || text.includes('android') || text.includes('ios') || text.includes('app')) {
    return 'mobile application';
  }
  if (text.includes('ai') || text.includes('ml') || text.includes('predict') || text.includes('machine learning') || text.includes('model')) {
    return 'AI/ML project';
  }
  if (text.includes('commerce') || text.includes('shop') || text.includes('store') || text.includes('cart') || text.includes('payment')) {
    return 'e-commerce application';
  }
  if (text.includes('college') || text.includes('student') || text.includes('placement') || text.includes('school') || text.includes('university')) {
    return 'college management system';
  }
  if (text.includes('bot') || text.includes('chat') || text.includes('assistant') || text.includes('copilot')) {
    return 'chatbot';
  }
  if (text.includes('dashboard') || text.includes('analytics') || text.includes('metrics') || text.includes('chart')) {
    return 'dashboard';
  }
  if (text.includes('automate') || text.includes('workflow') || text.includes('crawler') || text.includes('script')) {
    return 'automation system';
  }
  return 'web application';
};

const domainTemplates = {
  'AI/ML project': {
    projectName: 'AI Placement & Skill Intelligence System',
    summary: 'Machine learning platform that analyzes student academic records and predicts placement probabilities.',
    problemStatement: 'Students struggle to evaluate their job readiness and pinpoint missing technical skills.',
    targetUsers: ['Students', 'Placement Officers', 'Mentors'],
    difficulty: 4,
    estimatedDurationDays: 45,
    recommendedTeamSize: 4,
    feasibilitySubscore: 82,
    complexitySubscore: 85,
    scopeSubscore: 78,
    timelineSubscore: 75,
    skillReadinessSubscore: 70,
    requiredSkills: ['Python', 'Scikit-Learn', 'React', 'Node.js', 'MongoDB', 'REST APIs'],
    recommendedTechnologies: [
      { technology: 'Python', category: 'Backend/ML', reason: 'Industry standard for machine learning pipelines.', confidence: 0.95, alternatives: ['R'] },
      { technology: 'React', category: 'Frontend', reason: 'High interactivity for displaying health dashboards.', confidence: 0.92, alternatives: ['Vue.js'] },
      { technology: 'Node.js', category: 'API Backend', reason: 'Lightweight asynchronous API routing.', confidence: 0.90, alternatives: ['FastAPI'] },
      { technology: 'MongoDB', category: 'Database', reason: 'Flexible document model for student profiles.', confidence: 0.88, alternatives: ['PostgreSQL'] }
    ],
    majorModules: ['User Authentication', 'Student Profile Management', 'ML Prediction Engine', 'Placement Analytics Dashboard'],
    risks: [
      { title: 'Training Data Imbalance', category: 'technical', severity: 'high', recommendedAction: 'Collect balanced dataset across multiple academic disciplines.' },
      { title: 'Model Deployment Delay', category: 'timeline', severity: 'medium', recommendedAction: 'Containerize model API using Docker early in development.' }
    ],
    mvpFeatures: ['User Auth', 'Resume Data Entry', 'Placement Score Predictor', 'Basic Skill Gap Analysis'],
    futureFeatures: ['Automated Mock Interviews', 'Recruiter Connect Portal']
  },
  'college management system': {
    projectName: 'Smart College Academic & Placement Portal',
    summary: 'Unified academic, student tracking, and campus placement management web system.',
    problemStatement: 'Campus administration relies on fragmented spreadsheets for tracking placement readiness.',
    targetUsers: ['College Students', 'Department Heads', 'Campus Recruiters'],
    difficulty: 3,
    estimatedDurationDays: 30,
    recommendedTeamSize: 3,
    feasibilitySubscore: 88,
    complexitySubscore: 72,
    scopeSubscore: 82,
    timelineSubscore: 80,
    skillReadinessSubscore: 85,
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    recommendedTechnologies: [
      { technology: 'React', category: 'Frontend', reason: 'Component-driven design for student portals.', confidence: 0.94, alternatives: ['Svelte'] },
      { technology: 'Express.js', category: 'Backend', reason: 'Rapid RESTful routing and middleware integration.', confidence: 0.92, alternatives: ['NestJS'] },
      { technology: 'MongoDB', category: 'Database', reason: 'Document store for student records and applications.', confidence: 0.90, alternatives: ['MySQL'] }
    ],
    majorModules: ['Authentication & Roles', 'Student Directory', 'Company Placement Listings', 'Application Tracker'],
    risks: [
      { title: 'Role Authorization Overlap', category: 'technical', severity: 'medium', recommendedAction: 'Implement strict RBAC middleware at route level.' }
    ],
    mvpFeatures: ['Student Auth', 'Profile View', 'Job Listings', 'Apply Button'],
    futureFeatures: ['Automated Email Alerts', 'Export PDF Reports']
  },
  'web application': {
    projectName: 'Full-Stack Execution Platform',
    summary: 'Scalable web application featuring real-time data persistence, authentication, and user workspace.',
    problemStatement: 'Teams lack a unified digital platform to organize ideas into actionable steps.',
    targetUsers: ['Developers', 'Project Managers', 'Students'],
    difficulty: 3,
    estimatedDurationDays: 30,
    recommendedTeamSize: 3,
    feasibilitySubscore: 90,
    complexitySubscore: 65,
    scopeSubscore: 85,
    timelineSubscore: 85,
    skillReadinessSubscore: 88,
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    recommendedTechnologies: [
      { technology: 'React', category: 'Frontend', reason: 'Modern declarative user interface builder.', confidence: 0.95, alternatives: ['Vue'] },
      { technology: 'Node.js', category: 'Backend', reason: 'Non-blocking I/O engine for API throughput.', confidence: 0.93, alternatives: ['Go'] },
      { technology: 'MongoDB', category: 'Database', reason: 'NoSQL persistence for hierarchical data.', confidence: 0.90, alternatives: ['PostgreSQL'] }
    ],
    majorModules: ['User Accounts', 'Project Workspaces', 'Data CRUD', 'Settings Dashboard'],
    risks: [
      { title: 'Scope Creep', category: 'scope', severity: 'medium', recommendedAction: 'Freeze MVP specifications prior to second development milestone.' }
    ],
    mvpFeatures: ['User Register/Login', 'Project List', 'Project Details', 'Data Persistence'],
    futureFeatures: ['Real-time WebSocket Updates', 'Dark/Light Theme Toggle']
  }
};

const generateAnalystFallback = (prompt = '') => {
  const domain = detectDomain(prompt);
  const template = domainTemplates[domain] || domainTemplates['web application'];

  return {
    ...template,
    projectName: prompt && prompt.length <= 60 ? prompt : template.projectName,
    summary: `[Deterministic Fallback] ${template.summary}`
  };
};

const generateArchitectureFallback = (analystResult) => {
  const nodes = [
    {
      id: 'node-fe',
      type: 'frontend',
      data: { label: 'Frontend Client UI', description: 'Interactive React/Next.js dashboard', tech: 'React / Tailwind CSS' },
      position: { x: 250, y: 50 }
    },
    {
      id: 'node-be',
      type: 'backend',
      data: { label: 'Express API Server', description: 'REST controllers and middleware', tech: 'Node.js / Express' },
      position: { x: 250, y: 200 }
    },
    {
      id: 'node-db',
      type: 'database',
      data: { label: 'Primary MongoDB', description: 'User & project workspace persistence', tech: 'MongoDB / Mongoose' },
      position: { x: 100, y: 350 }
    },
    {
      id: 'node-ai',
      type: 'AI',
      data: { label: 'AI Intelligence Service', description: 'Multi-provider reasoning engine', tech: 'OpenRouter / Gemini / Rules' },
      position: { x: 400, y: 350 }
    }
  ];

  const edges = [
    { id: 'edge-fe-be', source: 'node-fe', target: 'node-be', animated: true, label: 'HTTPS / REST API' },
    { id: 'edge-be-db', source: 'node-be', target: 'node-db', animated: false, label: 'Mongoose Queries' },
    { id: 'edge-be-ai', source: 'node-be', target: 'node-ai', animated: true, label: 'JSON Prompt Payload' }
  ];

  return { nodes, edges };
};

const generatePlanningFallback = (analystResult) => {
  const today = new Date();
  const addDays = (d, days) => new Date(d.getTime() + days * 86400000).toISOString().split('T')[0];

  const milestones = [
    {
      name: 'Milestone 1: Foundation & Auth',
      description: 'Setup database schema, authentication routes, and baseline UI layout.',
      startDate: addDays(today, 0),
      dueDate: addDays(today, 7)
    },
    {
      name: 'Milestone 2: Core Workspace Engine',
      description: 'Implement core business logic, CRUD endpoints, and project workspace UI.',
      startDate: addDays(today, 8),
      dueDate: addDays(today, 18)
    },
    {
      name: 'Milestone 3: AI Intelligence Integration',
      description: 'Hook up multi-agent analysis, architecture node generation, and health engine.',
      startDate: addDays(today, 19),
      dueDate: addDays(today, 28)
    },
    {
      name: 'Milestone 4: Testing & Deployment',
      description: 'End-to-end verification, optimization, and production deployment.',
      startDate: addDays(today, 29),
      dueDate: addDays(today, 35)
    }
  ];

  const tasks = [
    { title: 'Create User Schema & Auth Middleware', description: 'Implement JWT token verification and bcrypt hashing.', priority: 'critical', estimatedHours: 8, requiredSkills: ['Node.js', 'MongoDB'], milestoneIndex: 0 },
    { title: 'Build Responsive AppShell Navigation', description: 'Dark-first responsive navbar and sidebar.', priority: 'high', estimatedHours: 6, requiredSkills: ['React', 'Tailwind CSS'], milestoneIndex: 0 },
    { title: 'Implement Project CRUD Services', description: 'Backend service methods for workspace management.', priority: 'high', estimatedHours: 12, requiredSkills: ['Express', 'Mongoose'], milestoneIndex: 1 },
    { title: 'Build Project Listing & Detail Views', description: 'Frontend cards, filters, and workspace pages.', priority: 'high', estimatedHours: 10, requiredSkills: ['React', 'Zustand'], milestoneIndex: 1 },
    { title: 'Integrate Multi-Provider AI Fallback', description: 'OpenRouter, Gemini, and rule engine cascade.', priority: 'critical', estimatedHours: 14, requiredSkills: ['Python/Node', 'REST APIs'], milestoneIndex: 2 },
    { title: 'Build Interactive React Flow Architecture Canvas', description: 'Node and edge diagram canvas view.', priority: 'medium', estimatedHours: 8, requiredSkills: ['React', 'React Flow'], milestoneIndex: 2 },
    { title: 'End-to-End System Testing & Build Verification', description: 'Execute integration tests and Next.js build verification.', priority: 'high', estimatedHours: 6, requiredSkills: ['Testing', 'CI/CD'], milestoneIndex: 3 }
  ];

  return { milestones, tasks };
};

module.exports = {
  detectDomain,
  generateAnalystFallback,
  generateArchitectureFallback,
  generatePlanningFallback
};
