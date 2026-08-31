const { generateWithOpenRouter } = require('./openRouterProvider');
const { generateWithGemini } = require('./geminiProvider');
const { extractJson } = require('./aiValidator');
const env = require('../../config/env');

/**
 * Execute structured AI generation with 3-tier provider fallback & retry loop
 */
const requestStructuredAi = async ({
  systemPrompt,
  userPrompt,
  validatorSchema,
  semanticValidator = null,
  deterministicFallbackFn
}) => {
  const maxAttemptsPerProvider = 2;

  // --------------------------------------------------
  // Tier 1: OpenRouter Provider
  // --------------------------------------------------
  if (env.OPENROUTER_API_KEY && env.OPENROUTER_API_KEY.trim() !== '') {
    for (let attempt = 1; attempt <= maxAttemptsPerProvider; attempt++) {
      try {
        console.log(`[AI Provider] Calling OpenRouter (Attempt ${attempt}/${maxAttemptsPerProvider})...`);
        const rawResponse = await generateWithOpenRouter(systemPrompt, userPrompt);
        const parsedJson = extractJson(rawResponse);
        const validatedData = validatorSchema.parse(parsedJson);

        if (semanticValidator) {
          semanticValidator(validatedData);
        }

        console.log('[AI Provider] OpenRouter request succeeded and passed validation!');
        return {
          data: validatedData,
          provider: 'openrouter',
          model: 'google/gemini-2.5-flash'
        };
      } catch (err) {
        console.warn(`[AI Provider] OpenRouter attempt ${attempt} failed: ${err.message}`);
      }
    }
    console.warn('[AI Provider] OpenRouter failed after max attempts. Cascading to Gemini...');
  } else {
    console.log('[AI Provider] OPENROUTER_API_KEY not configured. Skipping OpenRouter.');
  }

  // --------------------------------------------------
  // Tier 2: Gemini Provider
  // --------------------------------------------------
  if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '') {
    for (let attempt = 1; attempt <= maxAttemptsPerProvider; attempt++) {
      try {
        console.log(`[AI Provider] Calling Gemini (Attempt ${attempt}/${maxAttemptsPerProvider})...`);
        const rawResponse = await generateWithGemini(systemPrompt, userPrompt);
        const parsedJson = extractJson(rawResponse);
        const validatedData = validatorSchema.parse(parsedJson);

        if (semanticValidator) {
          semanticValidator(validatedData);
        }

        console.log('[AI Provider] Gemini request succeeded and passed validation!');
        return {
          data: validatedData,
          provider: 'gemini',
          model: 'gemini-1.5-flash'
        };
      } catch (err) {
        console.warn(`[AI Provider] Gemini attempt ${attempt} failed: ${err.message}`);
      }
    }
    console.warn('[AI Provider] Gemini failed after max attempts. Cascading to Deterministic Fallback...');
  } else {
    console.log('[AI Provider] GEMINI_API_KEY not configured. Skipping Gemini.');
  }

  // --------------------------------------------------
  // Tier 3: Deterministic Rule Fallback Engine
  // --------------------------------------------------
  console.log('[AI Provider] Executing Deterministic Rule Fallback Engine...');
  const fallbackData = deterministicFallbackFn();
  const validatedFallback = validatorSchema.parse(fallbackData);

  if (semanticValidator) {
    semanticValidator(validatedFallback);
  }

  return {
    data: validatedFallback,
    provider: 'deterministic',
    model: 'deterministic-rule-engine-v1'
  };
};

module.exports = { requestStructuredAi };
