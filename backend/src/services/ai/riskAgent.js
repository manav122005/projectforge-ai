const { queryAIProvider } = require('./aiProviderService');
const { detectProjectRisks } = require('../riskEngineService');

const RISK_AGENT_SYSTEM_PROMPT = `You are the ProjectForge Risk Agent.
Your responsibility is to analyze software project metrics, active tasks, team composition, and milestones to identify risks.
You must return valid JSON matching this schema:
{
  "risks": [
    {
      "title": "string",
      "description": "string",
      "category": "timeline" | "technical" | "scope" | "skills" | "workload" | "dependency" | "resource",
      "severity": "low" | "medium" | "high" | "critical",
      "probability": "low" | "medium" | "high",
      "impact": "low" | "medium" | "high",
      "recommendedAction": "string"
    }
  ]
}
Do not invent numerical metrics. Base all findings on real project facts. Return ONLY JSON.`;

const analyzeProjectRisksWithAI = async (project, tasks = [], members = []) => {
  // Always run deterministic engine as baseline source of truth
  const deterministicRisks = await detectProjectRisks(project);

  const contextPrompt = `Project: "${project.name}"
Description: ${project.description || 'N/A'}
Tech Stack: ${(project.technologyStack || []).map((t) => t.technology).join(', ')}
Required Skills: ${(project.requiredSkills || []).join(', ')}
Total Tasks: ${tasks.length}, Completed: ${tasks.filter((t) => t.status === 'completed').length}, Blocked: ${tasks.filter((t) => t.status === 'blocked').length}
Team Members: ${members.map((m) => `${m.displayName} (${m.role}, Availability: ${m.availabilityHours}h)`).join('; ')}
Deterministic Findings: ${deterministicRisks.map((r) => `${r.title} (${r.category}, ${r.severity})`).join('; ')}`;

  try {
    const aiResult = await queryAIProvider({
      systemPrompt: RISK_AGENT_SYSTEM_PROMPT,
      userPrompt: `Analyze risks for this project:\n\n${contextPrompt}`,
      fallbackHandler: () => ({ risks: deterministicRisks })
    });

    let aiRisks = [];
    if (aiResult.data && Array.isArray(aiResult.data.risks)) {
      aiRisks = aiResult.data.risks.map((r) => ({
        ...r,
        source: 'ai_analyst'
      }));
    }

    // Merge deterministic risks + unique AI risks
    const combined = [...deterministicRisks];
    aiRisks.forEach((ar) => {
      const isDuplicate = combined.some((dr) =>
        dr.title.toLowerCase().includes(ar.title.toLowerCase()) ||
        ar.title.toLowerCase().includes(dr.title.toLowerCase())
      );
      if (!isDuplicate) {
        combined.push(ar);
      }
    });

    return {
      risks: combined,
      provider: aiResult.provider,
      model: aiResult.model
    };
  } catch (err) {
    return {
      risks: deterministicRisks,
      provider: 'deterministic_fallback',
      model: 'rule_engine'
    };
  }
};

module.exports = {
  analyzeProjectRisksWithAI
};
