import { db, BaselineRecord } from './db';

export interface AnomalyAssessment {
  anomalyScore: number; // 0.0 to 1.0
  deviationScore: number; // Normalized deviation
  isAnomaly: boolean;
  shouldBlock: boolean;
  shouldEscalate: boolean;
  reasons: string[];
  triggeredRules: string[];
  zScore: number;
  agentBaselineRange: {
    min: number;
    max: number;
    avg: number;
  };
}

/**
 * Returns the min, max, and avg spend range for an agent's historical baseline.
 */
export function getAgentBaselineRange(agentId: string): { min: number; max: number; avg: number } {
  const baseline = db.getBaseline(agentId);
  if (!baseline || baseline.sampleCount === 0) {
    return { min: 5.0, max: 20.0, avg: 10.0 };
  }

  const min = baseline.minAmount !== undefined && baseline.minAmount > 0
    ? baseline.minAmount
    : Math.max(0.5, Number((baseline.meanAmount - 2 * (baseline.stddevAmount || baseline.meanAmount * 0.2)).toFixed(2)));

  const max = baseline.maxAmount !== undefined && baseline.maxAmount > 0
    ? baseline.maxAmount
    : Number((baseline.meanAmount + 2.5 * (baseline.stddevAmount || baseline.meanAmount * 0.2)).toFixed(2));

  const avg = Number(baseline.meanAmount.toFixed(2));

  return { min, max, avg };
}

/**
 * Calculates adaptive anomaly score for an agent's transaction based on historical fingerprint.
 */
export function evaluateBehavioralBaseline(
  agentId: string,
  amount: number,
  merchantCategory: string,
  currentCadencePerHour: number = 1
): AnomalyAssessment {
  const baseline = db.getBaseline(agentId);
  const baselineRange = getAgentBaselineRange(agentId);

  // Cold start fallback if no baseline exists
  if (!baseline || baseline.sampleCount < 3) {
    return {
      anomalyScore: 0.1,
      deviationScore: 0.1,
      isAnomaly: false,
      shouldBlock: false,
      shouldEscalate: false,
      reasons: ['Cold start: Initial agent transaction recorded (baseline establishing)'],
      triggeredRules: ['COLD_START_NEUTRAL'],
      zScore: 0,
      agentBaselineRange: baselineRange
    };
  }

  const { meanAmount, stddevAmount, historicalCategories, callsPerHourAvg } = baseline;
  const triggeredRules: string[] = [];
  const reasons: string[] = [];
  let scoreComponents = 0;

  // 1. Z-Score Calculation on Amount
  const effectiveStddev = stddevAmount > 0 ? stddevAmount : meanAmount * 0.1 || 1.0;
  const zScore = (amount - meanAmount) / effectiveStddev;

  if (zScore > 2.5) {
    triggeredRules.push('AMOUNT_ANOMALY_ZSCORE_EXCEEDED');
    reasons.push(
      `Amount ($${amount.toFixed(2)}) is ${zScore.toFixed(1)} std devs above agent mean ($${meanAmount.toFixed(2)}, stddev: $${effectiveStddev.toFixed(2)})`
    );
    // Severe z-score (z > 5.0) triggers strong block score (>= 0.75)
    if (zScore > 5.0) {
      scoreComponents += Math.min(0.85, 0.55 + (zScore - 5.0) * 0.05);
    } else {
      scoreComponents += 0.50; // Borderline z-score triggers escalation (0.50)
    }
  } else if (zScore > 1.8) {
    scoreComponents += 0.2;
    reasons.push(`Amount ($${amount.toFixed(2)}) is slightly elevated (z=${zScore.toFixed(1)})`);
  }

  // 2. Unseen / Off-Target Merchant Category
  const isKnownCategory = historicalCategories.includes(merchantCategory);
  if (!isKnownCategory) {
    triggeredRules.push('UNSEEN_MERCHANT_CATEGORY');
    reasons.push(`Merchant category "${merchantCategory}" has never been used by Agent ${agentId} before`);
    scoreComponents += 0.35;
  }

  // 3. Cadence / Velocity Spike Detection (5x+ historical average calls per hour)
  const safeAvgCadence = callsPerHourAvg > 0 ? callsPerHourAvg : 1;
  const cadenceMultiplier = currentCadencePerHour / safeAvgCadence;
  if (cadenceMultiplier >= 5.0) {
    triggeredRules.push('CADENCE_VELOCITY_SPIKE');
    reasons.push(
      `Cadence spike: Current rate (${currentCadencePerHour.toFixed(1)} calls/hr) is ${cadenceMultiplier.toFixed(1)}x historical average (${safeAvgCadence.toFixed(1)}/hr)`
    );
    scoreComponents += 0.40;
  }

  // Final anomaly score normalized [0, 1]
  const anomalyScore = Math.min(1.0, Number(scoreComponents.toFixed(2)));
  const deviationScore = anomalyScore;

  const shouldBlock = anomalyScore >= 0.70;
  const shouldEscalate = anomalyScore >= 0.45 && anomalyScore < 0.70;
  const isAnomaly = shouldBlock || shouldEscalate;

  if (!isAnomaly && reasons.length === 0) {
    reasons.push(`Transaction amount ($${amount.toFixed(2)}) and category standard for agent profile (z=${zScore.toFixed(1)})`);
  }

  return {
    anomalyScore,
    deviationScore,
    isAnomaly,
    shouldBlock,
    shouldEscalate,
    reasons,
    triggeredRules,
    zScore: Number(zScore.toFixed(2)),
    agentBaselineRange: baselineRange
  };
}

/**
 * Updates agent baseline after an APPROVED payment using Exponentially Weighted Moving Average (EWMA) and min/max bounds.
 */
export function updateAgentBaseline(
  agentId: string,
  amount: number,
  merchantCategory: string,
  wasApproved: boolean
): void {
  if (!wasApproved) {
    // DO NOT update baseline on blocked or rejected transactions to prevent baseline poisoning
    return;
  }

  let baseline = db.getBaseline(agentId);

  if (!baseline) {
    baseline = {
      agentId,
      meanAmount: amount,
      stddevAmount: amount * 0.1,
      minAmount: amount,
      maxAmount: amount,
      sampleCount: 1,
      historicalCategories: [merchantCategory],
      callsPerHourAvg: 1,
      lastUpdated: new Date().toISOString()
    };
  } else {
    const alpha = 0.15; // EWMA weight for new sample
    const newCount = baseline.sampleCount + 1;
    const oldMean = baseline.meanAmount;
    
    const newMean = (1 - alpha) * oldMean + alpha * amount;
    const diff = amount - oldMean;
    const oldVar = Math.pow(baseline.stddevAmount, 2);
    const newVar = (1 - alpha) * oldVar + alpha * Math.pow(diff, 2);
    const newStddev = Math.sqrt(Math.max(0.1, newVar));

    const newMin = baseline.minAmount ? Math.min(baseline.minAmount, amount) : amount;
    const newMax = baseline.maxAmount ? Math.max(baseline.maxAmount, amount) : amount;

    const categories = new Set(baseline.historicalCategories);
    categories.add(merchantCategory);

    baseline = {
      agentId,
      meanAmount: Number(newMean.toFixed(2)),
      stddevAmount: Number(newStddev.toFixed(2)),
      minAmount: Number(newMin.toFixed(2)),
      maxAmount: Number(newMax.toFixed(2)),
      sampleCount: newCount,
      historicalCategories: Array.from(categories),
      callsPerHourAvg: Number((baseline.callsPerHourAvg * 0.9 + 0.1).toFixed(2)),
      lastUpdated: new Date().toISOString()
    };
  }

  db.upsertBaseline(baseline);
}

