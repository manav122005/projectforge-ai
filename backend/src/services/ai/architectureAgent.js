const { requestStructuredAi } = require('./aiProviderService');
const { architectureSchema, validateArchitectureSemantics } = require('./aiValidator');
const { generateArchitectureFallback } = require('./deterministicFallback');

const ARCHITECTURE_SYSTEM_PROMPT = `
You are the Architecture Agent for ProjectForge AI.
Your role is to construct a system architecture node-and-edge graph formatted for React Flow visualization.

Allowed node types ONLY:
- "frontend"
- "backend"
- "database"
- "AI"
- "external"

You MUST respond with valid JSON matching this exact structure:
{
  "nodes": [
    {
      "id": "string",
      "type": "frontend" | "backend" | "database" | "AI" | "external",
      "data": {
        "label": "string",
        "description": "string",
        "tech": "string"
      },
      "position": { "x": number, "y": number }
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "string (must match a valid node.id)",
      "target": "string (must match a valid node.id)",
      "animated": boolean,
      "label": "string"
    }
  ]
}

RULES:
- Position nodes clearly (e.g. Frontend at y: 50, Backend at y: 200, Database/AI at y: 350).
- Every edge source and target MUST reference an existing node ID.
- Node IDs and Edge IDs must be unique.
- Return raw JSON only.
`;

const generateArchitectureGraph = async (analystResult) => {
  const userPrompt = `Project Summary: "${analystResult.summary}"\nTech Stack: ${JSON.stringify(analystResult.recommendedTechnologies)}\nMajor Modules: ${JSON.stringify(analystResult.majorModules)}`;

  return await requestStructuredAi({
    systemPrompt: ARCHITECTURE_SYSTEM_PROMPT,
    userPrompt,
    validatorSchema: architectureSchema,
    semanticValidator: validateArchitectureSemantics,
    deterministicFallbackFn: () => generateArchitectureFallback(analystResult)
  });
};

module.exports = { generateArchitectureGraph };
