const { z } = require('zod');

/**
 * Safely extract JSON object or array from raw text/markdown fences
 */
const extractJson = (text) => {
  if (typeof text !== 'string') {
    throw new Error('LLM response must be a string');
  }

  let cleaned = text.trim();

  // Try extracting from markdown code fences ```json ... ``` or ``` ... ```
  const fenceRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const fenceMatch = cleaned.match(fenceRegex);
  if (fenceMatch && fenceMatch[1]) {
    cleaned = fenceMatch[1].trim();
  } else {
    // Alternatively look for first '{' and last '}'
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse JSON from response: ${err.message}`);
  }
};

// ----------------------------------------------------
// Project Analyst Agent Schema
// ----------------------------------------------------
const projectAnalystSchema = z.object({
  projectName: z.string().min(1).max(120),
  summary: z.string().min(1).max(2000),
  problemStatement: z.string().min(1).max(2000),
  targetUsers: z.array(z.string()).default([]),
  difficulty: z.number().min(1).max(5).default(3),
  estimatedDurationDays: z.number().min(1).default(30),
  recommendedTeamSize: z.number().min(1).default(4),
  feasibilitySubscore: z.number().min(0).max(100).default(80),
  complexitySubscore: z.number().min(0).max(100).default(70),
  scopeSubscore: z.number().min(0).max(100).default(75),
  timelineSubscore: z.number().min(0).max(100).default(75),
  skillReadinessSubscore: z.number().min(0).max(100).default(70),
  requiredSkills: z.array(z.string()).default([]),
  recommendedTechnologies: z.array(
    z.object({
      technology: z.string(),
      category: z.string(),
      reason: z.string(),
      confidence: z.number().min(0).max(1).default(0.85),
      alternatives: z.array(z.string()).default([])
    })
  ).default([]),
  majorModules: z.array(z.string()).default([]),
  risks: z.array(
    z.object({
      title: z.string(),
      category: z.enum(['timeline', 'technical', 'scope', 'skills', 'workload', 'dependency']).default('technical'),
      severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
      recommendedAction: z.string()
    })
  ).default([]),
  mvpFeatures: z.array(z.string()).default([]),
  futureFeatures: z.array(z.string()).default([])
});

// ----------------------------------------------------
// Architecture Agent Schema
// ----------------------------------------------------
const architectureNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['frontend', 'backend', 'database', 'AI', 'external']),
  data: z.object({
    label: z.string().min(1),
    description: z.string().default(''),
    tech: z.string().default('')
  }),
  position: z.object({
    x: z.number(),
    y: z.number()
  })
});

const architectureEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  animated: z.boolean().default(true),
  label: z.string().default('')
});

const architectureSchema = z.object({
  nodes: z.array(architectureNodeSchema).min(1),
  edges: z.array(architectureEdgeSchema).default([])
});

// Semantic validation for Architecture
const validateArchitectureSemantics = (data) => {
  const nodeIds = new Set();
  data.nodes.forEach((node) => {
    if (nodeIds.has(node.id)) {
      throw new Error(`Duplicate architecture node ID: ${node.id}`);
    }
    nodeIds.add(node.id);
  });

  const edgeIds = new Set();
  data.edges.forEach((edge) => {
    if (edgeIds.has(edge.id)) {
      throw new Error(`Duplicate architecture edge ID: ${edge.id}`);
    }
    edgeIds.add(edge.id);

    if (!nodeIds.has(edge.source)) {
      throw new Error(`Architecture edge source '${edge.source}' does not reference any existing node`);
    }
    if (!nodeIds.has(edge.target)) {
      throw new Error(`Architecture edge target '${edge.target}' does not reference any existing node`);
    }
  });

  return true;
};

// ----------------------------------------------------
// Planning Agent Schema
// ----------------------------------------------------
const milestoneSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  startDate: z.string().optional(),
  dueDate: z.string().optional()
});

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  estimatedHours: z.number().min(0.5),
  requiredSkills: z.array(z.string()).default([]),
  milestoneIndex: z.number().min(0)
});

const planningSchema = z.object({
  milestones: z.array(milestoneSchema).min(1),
  tasks: z.array(taskSchema).min(1)
});

// Semantic validation for Planning
const validatePlanningSemantics = (data) => {
  data.tasks.forEach((task, idx) => {
    if (task.milestoneIndex < 0 || task.milestoneIndex >= data.milestones.length) {
      throw new Error(`Task #${idx + 1} ('${task.title}') references invalid milestoneIndex ${task.milestoneIndex}`);
    }
    if (task.estimatedHours <= 0) {
      throw new Error(`Task #${idx + 1} ('${task.title}') has non-positive estimatedHours`);
    }
  });

  data.milestones.forEach((m, idx) => {
    if (m.startDate && m.dueDate) {
      const start = new Date(m.startDate).getTime();
      const due = new Date(m.dueDate).getTime();
      if (!isNaN(start) && !isNaN(due) && due < start) {
        throw new Error(`Milestone #${idx + 1} ('${m.name}') dueDate cannot be earlier than startDate`);
      }
    }
  });

  return true;
};

module.exports = {
  extractJson,
  projectAnalystSchema,
  architectureSchema,
  validateArchitectureSemantics,
  planningSchema,
  validatePlanningSemantics
};
