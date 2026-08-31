const { requestStructuredAi } = require('./aiProviderService');
const { projectAnalystSchema } = require('./aiValidator');
const { generateAnalystFallback } = require('./deterministicFallback');

const PROJECT_ANALYST_SYSTEM_PROMPT = `
You are the lead Project Analyst Agent for ProjectForge AI.
Your role is to analyze a natural-language software project idea and produce a structured, realistic technical blueprint.

You MUST respond with valid JSON matching this structure exactly:
{
  "projectName": "string",
  "summary": "string",
  "problemStatement": "string",
  "targetUsers": ["string"],
  "difficulty": 1 to 5,
  "estimatedDurationDays": number,
  "recommendedTeamSize": number,
  "feasibilitySubscore": 0 to 100,
  "complexitySubscore": 0 to 100,
  "scopeSubscore": 0 to 100,
  "timelineSubscore": 0 to 100,
  "skillReadinessSubscore": 0 to 100,
  "requiredSkills": ["string"],
  "recommendedTechnologies": [
    {
      "technology": "string",
      "category": "string",
      "reason": "string",
      "confidence": 0.0 to 1.0,
      "alternatives": ["string"]
    }
  ],
  "majorModules": ["string"],
  "risks": [
    {
      "title": "string",
      "category": "timeline" | "technical" | "scope" | "skills" | "workload" | "dependency",
      "severity": "low" | "medium" | "high" | "critical",
      "recommendedAction": "string"
    }
  ],
  "mvpFeatures": ["string"],
  "futureFeatures": ["string"]
}

RULES:
- Return ONLY valid raw JSON. Do not add conversational text.
- Be objective, realistic, and specific to the project domain.
`;

const analyzeProjectIdea = async (projectIdea, context = '') => {
  const userPrompt = `Project Idea: "${projectIdea}"\nAdditional Context: "${context}"`;

  return await requestStructuredAi({
    systemPrompt: PROJECT_ANALYST_SYSTEM_PROMPT,
    userPrompt,
    validatorSchema: projectAnalystSchema,
    deterministicFallbackFn: () => generateAnalystFallback(projectIdea)
  });
};

module.exports = { analyzeProjectIdea };
