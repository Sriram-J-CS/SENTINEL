/**
 * Intent Alignment Engine
 *
 * Compares an agent's payment merchant category against a root task's
 * declared intent description using keyword/category similarity matching.
 * Returns an alignment score 0–100 and triggers INTENT_MISALIGNMENT rule
 * if the score falls below the threshold.
 *
 * Design: lightweight keyword overlap — no ML needed.
 */

// Category → semantic intent keyword map
const CATEGORY_TO_KEYWORDS: Record<string, string[]> = {
  api_compute: ['compute', 'api', 'cloud', 'processing', 'inference', 'ml', 'ai', 'model', 'server'],
  cloud_hosting: ['cloud', 'hosting', 'server', 'infrastructure', 'deploy', 'compute', 'storage'],
  data_pipeline: ['data', 'pipeline', 'etl', 'transform', 'stream', 'batch', 'ingest', 'process'],
  analytics_query: ['analytics', 'query', 'database', 'sql', 'analysis', 'report', 'metrics', 'data'],
  object_storage: ['storage', 'file', 'blob', 'object', 's3', 'bucket', 'data', 'archive'],
  data_indexing: ['index', 'search', 'data', 'retrieval', 'query', 'elasticsearch', 'vector'],
  web_scraping: ['scrape', 'web', 'crawl', 'html', 'page', 'extract', 'internet', 'browser'],
  llm_inference: ['llm', 'inference', 'ai', 'model', 'language', 'gpt', 'generate', 'prompt', 'ml'],
  payment_processing: ['payment', 'transaction', 'finance', 'money', 'charge', 'billing', 'settle'],
  communication: ['email', 'sms', 'notify', 'message', 'alert', 'communication', 'send'],
  marketplace: ['buy', 'purchase', 'shop', 'marketplace', 'order', 'product', 'vendor', 'ecommerce'],
  research: ['research', 'find', 'search', 'discover', 'compare', 'analyze', 'review', 'report'],
  general_api: ['api', 'service', 'request', 'endpoint', 'call', 'fetch', 'data']
};

// Default keywords for unknown categories
const DEFAULT_KEYWORDS = ['service', 'api', 'data'];

/**
 * Tokenizes a text string into lowercase word tokens.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, ' ')
    .split(/[\s_]+/)
    .filter(t => t.length > 2);
}

/**
 * Evaluates how well a payment's merchant category aligns with
 * the root task's declared text description.
 *
 * Returns:
 *   - alignmentScore: 0–100 (100 = perfect match)
 *   - isAligned: true if score >= threshold
 *   - triggeredRules: ['INTENT_MISALIGNMENT'] if misaligned
 *   - reasons: human-readable explanation
 */
export function evaluateIntentAlignment(
  taskDescription: string,
  merchantCategory: string
): {
  alignmentScore: number;
  isAligned: boolean;
  triggeredRules: string[];
  reasons: string[];
} {
  const ALIGNMENT_THRESHOLD = 55; // Scores below this trigger the rule

  if (!taskDescription || taskDescription.trim().length === 0) {
    // No description provided → neutral, no penalty
    return {
      alignmentScore: 75,
      isAligned: true,
      triggeredRules: [],
      reasons: []
    };
  }

  const descriptionTokens = new Set(tokenize(taskDescription));
  const categoryKeywords = CATEGORY_TO_KEYWORDS[merchantCategory] || DEFAULT_KEYWORDS;

  // Count overlapping tokens between description and category keywords
  let matchCount = 0;
  const matchedTerms: string[] = [];

  for (const kw of categoryKeywords) {
    if (descriptionTokens.has(kw)) {
      matchCount++;
      matchedTerms.push(kw);
    }
    // Partial substring match for compound words
    for (const token of descriptionTokens) {
      if (token.includes(kw) || kw.includes(token)) {
        if (!matchedTerms.includes(kw)) {
          matchCount += 0.5;
          matchedTerms.push(kw);
        }
      }
    }
  }

  // Score: weighted overlap normalized to 0–100
  const maxPossible = Math.max(categoryKeywords.length, 1);
  const rawScore = Math.min(1.0, matchCount / maxPossible);

  // Apply a boost if category name itself appears in description
  const categoryTokens = tokenize(merchantCategory);
  const directCategoryMatch = categoryTokens.some(t => descriptionTokens.has(t));
  const boost = directCategoryMatch ? 0.20 : 0;

  const finalScore = Math.round(Math.min(1.0, rawScore + boost) * 100);

  const isAligned = finalScore >= ALIGNMENT_THRESHOLD;
  const triggeredRules: string[] = [];
  const reasons: string[] = [];

  if (!isAligned) {
    triggeredRules.push('INTENT_MISALIGNMENT');
    reasons.push(
      `Intent misalignment: Merchant category "${merchantCategory}" scores ${finalScore}% alignment with task description "${taskDescription.slice(0, 60)}${taskDescription.length > 60 ? '...' : ''}"`
    );
  }

  return {
    alignmentScore: finalScore,
    isAligned,
    triggeredRules,
    reasons
  };
}
