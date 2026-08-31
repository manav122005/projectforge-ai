const Project = require('../models/projectModel');
const ProjectMember = require('../models/projectMemberModel');
const Milestone = require('../models/milestoneModel');
const Task = require('../models/taskModel');
const Risk = require('../models/riskModel');
const ProjectEvent = require('../models/projectEventModel');
const Notification = require('../models/notificationModel');
const AIAnalysis = require('../models/aiAnalysisModel');
const User = require('../models/userModel');

const seedDemoProject = async (userId) => {
  // 1. Create the Demo Project
  const demoProject = await Project.create({
    name: 'AI-Powered College Placement Intelligence',
    description: 'An enterprise AI platform that predicts student placement probability, highlights skill deficiencies, and produces individualized learning roadmaps using predictive machine learning models and resume vectorization.',
    originalIdea: 'Build an AI-powered college placement prediction system for 500 students with skill gap analysis, personalized roadmaps, and recruiter analytics.',
    owner: userId,
    status: 'active',
    healthScore: 78,
    healthBreakdown: {
      technical: 84,
      timeline: 72,
      skills: 65,
      scope: 81,
      team: 88
    },
    healthHistory: [
      { score: 72, recordedAt: new Date(Date.now() - 21 * 86400000) },
      { score: 76, recordedAt: new Date(Date.now() - 14 * 86400000) },
      { score: 81, recordedAt: new Date(Date.now() - 7 * 86400000) },
      { score: 78, recordedAt: new Date() }
    ],
    architecture: {
      nodes: [
        { id: '1', type: 'input', data: { label: 'Next.js Frontend Dashboard' }, position: { x: 250, y: 0 } },
        { id: '2', data: { label: 'Node.js / Express API Gateway' }, position: { x: 250, y: 100 } },
        { id: '3', data: { label: 'JWT & RBAC Auth Middleware' }, position: { x: 50, y: 200 } },
        { id: '4', data: { label: 'Placement Prediction AI Service (Python / FastAPI)' }, position: { x: 450, y: 200 } },
        { id: '5', data: { label: 'Scikit-learn / XGBoost Model Engine' }, position: { x: 450, y: 300 } },
        { id: '6', type: 'output', data: { label: 'MongoDB Atlas Primary Cluster' }, position: { x: 250, y: 400 } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e2-4', source: '2', target: '4', animated: true },
        { id: 'e4-5', source: '4', target: '5', animated: true },
        { id: 'e2-6', source: '2', target: '6' },
        { id: 'e4-6', source: '4', target: '6' }
      ]
    },
    technologyStack: [
      { technology: 'Next.js & React', category: 'Frontend', reason: 'High performance server-rendered dashboard with interactive charts', confidence: 0.95, alternatives: ['Vue.js', 'Angular'] },
      { technology: 'Node.js & Express', category: 'API Layer', reason: 'Non-blocking I/O ideal for real-time collaboration and API gateway', confidence: 0.92, alternatives: ['NestJS', 'Go'] },
      { technology: 'Python & FastAPI', category: 'AI Inference', reason: 'Native support for ML libraries and asynchronous high-throughput inference', confidence: 0.96, alternatives: ['Flask', 'TorchServe'] },
      { technology: 'Scikit-learn & XGBoost', category: 'Machine Learning', reason: 'Proven accuracy on tabular student academic and skill data', confidence: 0.94, alternatives: ['TensorFlow', 'PyTorch'] },
      { technology: 'MongoDB Atlas', category: 'Database', reason: 'Flexible document schema for polymorphic task, project, and telemetry models', confidence: 0.98, alternatives: ['PostgreSQL', 'DynamoDB'] },
      { technology: 'Docker', category: 'Containerization', reason: 'Ensures reliable model execution across development and production', confidence: 0.90, alternatives: ['Podman'] }
    ],
    requiredSkills: ['React', 'Node.js', 'Python', 'Machine Learning', 'FastAPI', 'MongoDB', 'Docker', 'Testing'],
    recommendedMVP: [
      'Student profile and academic data intake',
      'Placement probability scoring engine (0-100%)',
      'Skill deficiency report and missing tag identification',
      'Personalized recommended learning path',
      'Recruiter & Placement Cell Analytics Dashboard'
    ]
  });

  const projectId = demoProject._id;

  // 2. Create 5 Team Members
  const membersData = [
    { displayName: 'Rahul Sharma', role: 'Full-Stack Architect', skills: ['Node.js', 'MongoDB', 'React', 'System Design'], experienceLevel: 'advanced', availabilityHours: 40 },
    { displayName: 'Priya Patel', role: 'ML & Data Engineer', skills: ['Python', 'Machine Learning', 'FastAPI', 'Data Analysis'], experienceLevel: 'advanced', availabilityHours: 30 },
    { displayName: 'Amit Verma', role: 'Frontend Engineer', skills: ['React', 'Next.js', 'Tailwind CSS', 'UI/UX'], experienceLevel: 'intermediate', availabilityHours: 35 },
    { displayName: 'Sneha Reddy', role: 'Backend & Cloud DevOps', skills: ['Node.js', 'Express', 'Docker', 'MongoDB'], experienceLevel: 'intermediate', availabilityHours: 25 },
    { displayName: 'Vikram Joshi', role: 'QA & Automation Specialist', skills: ['Testing', 'Python', 'Jest', 'Automation'], experienceLevel: 'beginner', availabilityHours: 20 }
  ];

  const createdMembers = [];
  for (const m of membersData) {
    const syntheticEmail = `demo.${m.displayName.toLowerCase().replace(/\s+/g, '')}.${Date.now()}@projectforge.ai`;
    const userObj = await User.create({
      name: m.displayName,
      email: syntheticEmail,
      password: 'DemoPassword123!',
      role: 'operator'
    });

    const memberObj = await ProjectMember.create({
      projectId,
      userId: userObj._id,
      displayName: m.displayName,
      role: m.role,
      skills: m.skills,
      experienceLevel: m.experienceLevel,
      availabilityHours: m.availabilityHours,
      workload: 0
    });
    createdMembers.push(memberObj);
  }

  // 3. Create 5 Milestones
  const milestonesData = [
    { name: 'Milestone 1: Architecture & Foundation Setup', description: 'Core authentication, database schemas, and foundational API pipelines.', startDate: new Date(Date.now() - 25 * 86400000), dueDate: new Date(Date.now() - 10 * 86400000), status: 'completed' },
    { name: 'Milestone 2: Data Ingestion & Feature Engineering', description: 'Historical placement records ingestion, normalization, and feature extraction.', startDate: new Date(Date.now() - 10 * 86400000), dueDate: new Date(Date.now() + 5 * 86400000), status: 'active' },
    { name: 'Milestone 3: AI Inference Engine & Model Training', description: 'Train predictive model and deploy FastAPI inference endpoints.', startDate: new Date(Date.now() - 5 * 86400000), dueDate: new Date(Date.now() + 15 * 86400000), status: 'active' },
    { name: 'Milestone 4: Interactive Student & Recruiter Dashboard', description: 'Frontend visual analytics, radar charts, and recommendation roadmaps.', startDate: new Date(Date.now() + 5 * 86400000), dueDate: new Date(Date.now() + 25 * 86400000), status: 'planning' },
    { name: 'Milestone 5: Production Deployment & QA Testing', description: 'End-to-end integration tests, load testing, and Docker cloud deployment.', startDate: new Date(Date.now() + 20 * 86400000), dueDate: new Date(Date.now() + 35 * 86400000), status: 'planning' }
  ];

  const createdMilestones = [];
  for (const ms of milestonesData) {
    const msObj = await Milestone.create({
      projectId,
      name: ms.name,
      description: ms.description,
      startDate: ms.startDate,
      dueDate: ms.dueDate,
      status: ms.status
    });
    createdMilestones.push(msObj);
  }

  // 4. Create 21 Actionable Tasks across Milestones
  const tasksData = [
    // Milestone 1 (Completed)
    { milestoneIdx: 0, memberIdx: 0, title: 'Define MongoDB Schemas for Students & Records', priority: 'high', hours: 6, status: 'completed', skills: ['MongoDB', 'Node.js'] },
    { milestoneIdx: 0, memberIdx: 0, title: 'Implement JWT Authentication & Role-Based Middleware', priority: 'critical', hours: 8, status: 'completed', skills: ['Node.js', 'System Design'] },
    { milestoneIdx: 0, memberIdx: 2, title: 'Setup Next.js 14 App Shell & Theme System', priority: 'medium', hours: 6, status: 'completed', skills: ['Next.js', 'Tailwind CSS'] },
    { milestoneIdx: 0, memberIdx: 3, title: 'Configure Docker Development Compose Environment', priority: 'medium', hours: 4, status: 'completed', skills: ['Docker'] },

    // Milestone 2 (Active)
    { milestoneIdx: 1, memberIdx: 1, title: 'Parse 5-Year Historical College Placement Datasets', priority: 'high', hours: 10, status: 'completed', skills: ['Python', 'Data Analysis'] },
    { milestoneIdx: 1, memberIdx: 1, title: 'Engineer GPA, Backlog & Coding Profile Features', priority: 'high', hours: 8, status: 'completed', skills: ['Python', 'Machine Learning'] },
    { milestoneIdx: 1, memberIdx: 0, title: 'Create REST Endpoints for Student Profile Data', priority: 'medium', hours: 6, status: 'in_progress', skills: ['Node.js', 'REST APIs'] },
    { milestoneIdx: 1, memberIdx: 4, title: 'Validate Data Cleansing with Automated Unit Tests', priority: 'medium', hours: 5, status: 'in_progress', skills: ['Testing', 'Python'] },

    // Milestone 3 (Active)
    { milestoneIdx: 2, memberIdx: 1, title: 'Train XGBoost Classifier for Placement Probability', priority: 'critical', hours: 14, status: 'in_progress', skills: ['Python', 'Machine Learning'] },
    { milestoneIdx: 2, memberIdx: 1, title: 'Build FastAPI Microservice for Real-Time Model Serving', priority: 'high', hours: 8, status: 'todo', skills: ['FastAPI', 'Python'] },
    { milestoneIdx: 2, memberIdx: 3, title: 'Implement Redis Model Prediction Response Cache', priority: 'medium', hours: 6, status: 'blocked', skills: ['Node.js', 'Docker'] },
    { milestoneIdx: 2, memberIdx: 0, title: 'Implement Explainable AI Feature Importance Breakdown', priority: 'high', hours: 8, status: 'todo', skills: ['Python', 'Machine Learning'] },

    // Milestone 4 (Planning)
    { milestoneIdx: 3, memberIdx: 2, title: 'Develop Probability Gauge & Radar Chart Components', priority: 'high', hours: 8, status: 'todo', skills: ['React', 'UI/UX'] },
    { milestoneIdx: 3, memberIdx: 2, title: 'Build Dynamic Skill Deficiency Matrix & Roadmap View', priority: 'high', hours: 10, status: 'todo', skills: ['React', 'Next.js'] },
    { milestoneIdx: 3, memberIdx: 2, title: 'Create Recruiter Batch Candidate Filter Dashboard', priority: 'medium', hours: 8, status: 'backlog', skills: ['React', 'Tailwind CSS'] },
    { milestoneIdx: 3, memberIdx: 0, title: 'Build PDF Placement Readiness Report Generator', priority: 'low', hours: 6, status: 'backlog', skills: ['Node.js'] },

    // Milestone 5 (Planning)
    { milestoneIdx: 4, memberIdx: 4, title: 'Author Automated E2E Test Suite for Prediction Flow', priority: 'high', hours: 10, status: 'todo', skills: ['Testing', 'Jest'] },
    { milestoneIdx: 4, memberIdx: 3, title: 'Setup Multi-Stage Dockerfile & Health Check Probes', priority: 'medium', hours: 6, status: 'todo', skills: ['Docker'] },
    { milestoneIdx: 4, memberIdx: 0, title: 'Execute Load Testing with 500 Concurrent Virtual Users', priority: 'high', hours: 8, status: 'backlog', skills: ['System Design', 'Testing'] },
    { milestoneIdx: 4, memberIdx: 3, title: 'Configure CI/CD Deployment Pipeline to Cloud Run', priority: 'medium', hours: 6, status: 'backlog', skills: ['Docker', 'DevOps'] },
    { milestoneIdx: 4, memberIdx: 4, title: 'Compile Final Technical Documentation & API Spec', priority: 'low', hours: 4, status: 'backlog', skills: ['Documentation'] }
  ];

  const createdTasks = [];
  for (const t of tasksData) {
    const taskObj = await Task.create({
      projectId,
      milestoneId: createdMilestones[t.milestoneIdx]._id,
      assignedMember: createdMembers[t.memberIdx]._id,
      title: t.title,
      description: `Implementation task for ${createdMilestones[t.milestoneIdx].name}`,
      priority: t.priority,
      estimatedHours: t.hours,
      status: t.status,
      requiredSkills: t.skills,
      completedAt: t.status === 'completed' ? new Date(Date.now() - 3 * 86400000) : null
    });
    createdTasks.push(taskObj);
  }

  // 5. Create 4 Realistic Risks
  const risksData = [
    {
      title: 'ML Model Inference Latency & High Memory Footprint',
      description: 'Heavy ML vectorization models may cause endpoint latency spikes on low-tier server instances during batch candidate processing.',
      category: 'technical',
      severity: 'high',
      probability: 'medium',
      impact: 'high',
      recommendedAction: 'Quantize models using ONNX runtime and introduce Redis response caching for identical student attribute queries.',
      status: 'open',
      source: 'deterministic_engine'
    },
    {
      title: 'Redis Prediction Cache Blocked Dependency',
      description: 'Task "Implement Redis Model Prediction Response Cache" is blocked, creating a bottleneck for high-throughput testing.',
      category: 'dependency',
      severity: 'high',
      probability: 'high',
      impact: 'medium',
      recommendedAction: 'Unblock dependency by finalizing Docker container network definitions.',
      status: 'open',
      source: 'deterministic_engine'
    },
    {
      title: 'Team Workload Concentration on Full-Stack Architect',
      description: 'Rahul Sharma has multiple active tasks totaling 36h across architecture, reporting, and explainability modules.',
      category: 'workload',
      severity: 'medium',
      probability: 'medium',
      impact: 'medium',
      recommendedAction: 'Reassign report generation and documentation tasks to junior engineers.',
      status: 'open',
      source: 'deterministic_engine'
    },
    {
      title: 'DevOps & Docker Deployment Skill Readiness',
      description: 'Only 1 team member has active Docker production deployment experience.',
      category: 'skills',
      severity: 'low',
      probability: 'low',
      impact: 'medium',
      recommendedAction: 'Pair Sneha Reddy with Rahul Sharma during CI/CD setup.',
      status: 'open',
      source: 'deterministic_engine'
    }
  ];

  for (const r of risksData) {
    await Risk.create({
      projectId,
      ...r
    });
  }

  // 6. Create Initial Project Events Timeline
  const eventsData = [
    { type: 'PROJECT_CREATED', message: 'Project "AI-Powered College Placement Intelligence" blueprint initialized.' },
    { type: 'AI_ANALYSIS_COMPLETED', message: 'AI Analyst generated project feasibility breakdown (Score: 78/100).' },
    { type: 'ARCHITECTURE_GENERATED', message: 'React Flow 6-tier architecture canvas compiled.' },
    { type: 'MEMBER_ADDED', message: '5 engineering specialists assigned to project roster.' },
    { type: 'TASK_COMPLETED', message: 'Completed 6 foundational tasks across Milestones 1 & 2.' },
    { type: 'RISK_DETECTED', message: 'Detected high-severity technical inference latency risk.' }
  ];

  for (const ev of eventsData) {
    await ProjectEvent.create({
      projectId,
      userId,
      type: ev.type,
      message: ev.message,
      metadata: { demoSeed: true }
    });
  }

  // 7. Create Sample Notification
  await Notification.create({
    owner: userId,
    projectId,
    type: 'risk_alert',
    title: 'Demo Project Ready',
    message: 'Welcome to the "AI-Powered College Placement Intelligence" demo workspace! Check out the Kanban board, Risk Radar, and AI Copilot.'
  });

  return {
    project: demoProject,
    milestonesCount: createdMilestones.length,
    tasksCount: createdTasks.length,
    membersCount: createdMembers.length,
    risksCount: risksData.length
  };
};

module.exports = {
  seedDemoProject
};
