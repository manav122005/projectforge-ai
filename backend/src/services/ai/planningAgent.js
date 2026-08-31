const { requestStructuredAi } = require('./aiProviderService');
const { planningSchema, validatePlanningSemantics } = require('./aiValidator');
const { generatePlanningFallback } = require('./deterministicFallback');

const PLANNING_SYSTEM_PROMPT = `
You are the Planning Agent for ProjectForge AI.
Your role is to divide a software project blueprint into sequential milestones and actionable development tasks.

You MUST respond with valid JSON matching this exact structure:
{
  "milestones": [
    {
      "name": "string",
      "description": "string",
      "startDate": "YYYY-MM-DD",
      "dueDate": "YYYY-MM-DD"
    }
  ],
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "low" | "medium" | "high" | "critical",
      "estimatedHours": number (> 0),
      "requiredSkills": ["string"],
      "milestoneIndex": number (0-indexed position of associated milestone)
    }
  ]
}

RULES:
- milestoneIndex MUST point to a valid index in the milestones array.
- estimatedHours must be positive.
- priority must be one of: "low", "medium", "high", "critical".
- Return raw JSON only.
`;

const generateProjectPlan = async (analystResult) => {
  const userPrompt = `Project Name: "${analystResult.projectName}"\nSummary: "${analystResult.summary}"\nMajor Modules: ${JSON.stringify(analystResult.majorModules)}\nMVP Features: ${JSON.stringify(analystResult.mvpFeatures)}`;

  return await requestStructuredAi({
    systemPrompt: PLANNING_SYSTEM_PROMPT,
    userPrompt,
    validatorSchema: planningSchema,
    semanticValidator: validatePlanningSemantics,
    deterministicFallbackFn: () => generatePlanningFallback(analystResult)
  });
};

module.exports = { generateProjectPlan };
