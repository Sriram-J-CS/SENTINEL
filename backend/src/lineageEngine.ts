import crypto from 'crypto';
import { db, LineageTaskRecord } from './db';
import { initLineageOnChain, recordHopOnChain, readLineageBoxOnChain } from './algorand';
import { CONFIG } from './config';

export interface CascadeProjection {
  currentPayment: number;
  projectedRemainingSpend: number;
  projectedTotalExposure: number;
  estimatedHopsRemaining: number;
  avgHopAmount: number;
  exceedsBudget: boolean;
  holdRecommended: boolean;
}

export interface LineageAssessment {
  isValid: boolean;
  shouldBlock: boolean;
  shouldEscalate: boolean;
  cumulativeSpendAfter: number;
  authorizedBudget: number;
  hopCount: number;
  reasons: string[];
  triggeredRules: string[];
  onChainTxId?: string;
  decisionHash: string;
  loraTxUrl?: string;
  cascadeProjection: CascadeProjection;
}

/**
 * Projects the remaining chain spend based on current hop count and average per-hop amount.
 * If projected total would exceed the authorized budget, recommends HOLD before approving.
 */
function predictCascade(
  cumulativeSpendAfter: number,
  hopCount: number,
  amount: number,
  authorizedBudget: number
): CascadeProjection {
  const MAX_HOPS = 5;
  const estimatedHopsRemaining = Math.max(0, MAX_HOPS - hopCount);

  // Average hop amount based on what we've seen so far (including current)
  const avgHopAmount = hopCount > 0
    ? Number((cumulativeSpendAfter / hopCount).toFixed(2))
    : amount;

  const projectedRemainingSpend = Number((avgHopAmount * estimatedHopsRemaining).toFixed(2));
  const projectedTotalExposure = Number((cumulativeSpendAfter + projectedRemainingSpend).toFixed(2));

  const exceedsBudget = projectedTotalExposure > authorizedBudget;
  // Only recommend HOLD (not block) if current payment itself is fine but future would exceed
  const holdRecommended = exceedsBudget && cumulativeSpendAfter <= authorizedBudget;

  return {
    currentPayment: amount,
    projectedRemainingSpend,
    projectedTotalExposure,
    estimatedHopsRemaining,
    avgHopAmount,
    exceedsBudget,
    holdRecommended
  };
}

export async function processLineageHop(
  rootTaskId: string,
  hopCount: number,
  amount: number,
  merchantCategory: string,
  declaredBudget?: number,
  taskDescription?: string
): Promise<LineageAssessment> {
  let task = db.getLineageTask(rootTaskId);

  // If task not initialized, create with declared budget (default $40 USD)
  const defaultBudget = declaredBudget || 40.0;

  if (!task) {
    const budgetMicroAlgos = Math.round(defaultBudget * 1000000);
    const initRes = await initLineageOnChain(CONFIG.SENTINEL_APP_ID, rootTaskId, budgetMicroAlgos);

    task = {
      rootTaskId,
      authorizedBudget: defaultBudget,
      cumulativeSpend: 0,
      hopCount: 0,
      status: 'ACTIVE',
      merchantCategories: [merchantCategory],
      decisionHash: '0'.repeat(64),
      updatedAt: new Date().toISOString(),
      onChainTxId: initRes.txId,
      taskDescription: taskDescription || ''
    };
    db.upsertLineageTask(task);
  } else if (taskDescription && !task.taskDescription) {
    // Persist description on first time it's provided
    task.taskDescription = taskDescription;
    db.upsertLineageTask(task);
  }

  const authorizedBudget = task.authorizedBudget;
  const currentCumulativeSpend = task.cumulativeSpend;
  const newCumulativeSpend = Number((currentCumulativeSpend + amount).toFixed(2));

  const triggeredRules: string[] = [];
  const reasons: string[] = [];
  let shouldBlock = false;
  let shouldEscalate = false;

  // 1. Check cumulative chain spend vs authorized budget
  if (newCumulativeSpend > authorizedBudget) {
    shouldBlock = true;
    triggeredRules.push('CASCADE_BUDGET_EXCEEDED');
    reasons.push(
      `On-chain lineage budget exceeded: Cumulative chain spend ($${newCumulativeSpend.toFixed(2)}) exceeds authorized task budget ($${authorizedBudget.toFixed(2)}) at hop ${hopCount}`
    );
  }

  // 2. Check hop depth limit (max 5 hops)
  if (hopCount > 5) {
    shouldBlock = true;
    triggeredRules.push('MAX_HOP_DEPTH_EXCEEDED');
    reasons.push(`Lineage depth limit exceeded: Hop count (${hopCount}) exceeds maximum allowed chain depth (5)`);
  }

  // 3. Check scope / category drift across chain
  const knownCategories = new Set(task.merchantCategories);
  if (!knownCategories.has(merchantCategory) && knownCategories.size > 0 && !shouldBlock) {
    shouldEscalate = true;
    triggeredRules.push('SCOPE_DRIFT_DETECTED');
    reasons.push(`Merchant category "${merchantCategory}" drifts from root task declared scope (${Array.from(knownCategories).join(', ')})`);
  }

  // 4. Predictive Cascade Projection
  const cascadeProjection = predictCascade(newCumulativeSpend, hopCount, amount, authorizedBudget);

  // Add HOLD trigger if projection would exceed budget but current payment itself is within budget
  if (cascadeProjection.holdRecommended && !shouldBlock) {
    shouldEscalate = true;
    triggeredRules.push('PREDICTIVE_BUDGET_EXCEEDED');
    reasons.push(
      `Predictive cascade warning: Projected total chain exposure ($${cascadeProjection.projectedTotalExposure.toFixed(2)}) would exceed authorized budget ($${authorizedBudget.toFixed(2)}) if ${cascadeProjection.estimatedHopsRemaining} remaining hops average $${cascadeProjection.avgHopAmount.toFixed(2)}/hop`
    );
  }

  // Compute decision hash
  const hashInput = `${rootTaskId}:${hopCount}:${amount}:${newCumulativeSpend}:${task.decisionHash}:${new Date().toISOString()}`;
  const decisionHash = crypto.createHash('sha256').update(hashInput).digest('hex');

  // Record to Algorand Box Storage on-chain
  const amountMicroAlgos = Math.round(amount * 1000000);
  const onChainRes = await recordHopOnChain(
    CONFIG.SENTINEL_APP_ID,
    rootTaskId,
    amountMicroAlgos,
    hopCount,
    decisionHash
  );

  // Update DB task state
  knownCategories.add(merchantCategory);
  const newStatus = shouldBlock ? 'BLOCKED' : shouldEscalate ? 'ESCALATED' : 'ACTIVE';

  db.upsertLineageTask({
    ...task,
    cumulativeSpend: newCumulativeSpend,
    hopCount,
    status: newStatus,
    merchantCategories: Array.from(knownCategories),
    decisionHash,
    updatedAt: new Date().toISOString(),
    onChainTxId: onChainRes.txId
  });

  const loraTxUrl = `${CONFIG.LORA_EXPLORER_BASE}/transaction/${onChainRes.txId}`;

  return {
    isValid: !shouldBlock,
    shouldBlock,
    shouldEscalate,
    cumulativeSpendAfter: newCumulativeSpend,
    authorizedBudget,
    hopCount,
    reasons,
    triggeredRules,
    onChainTxId: onChainRes.txId,
    decisionHash,
    loraTxUrl,
    cascadeProjection
  };
}

export async function getLineageProof(rootTaskId: string) {
  const dbTask = db.getLineageTask(rootTaskId);
  const onChainBox = await readLineageBoxOnChain(CONFIG.SENTINEL_APP_ID, rootTaskId);

  return {
    rootTaskId,
    dbTask,
    onChainBox,
    appId: CONFIG.SENTINEL_APP_ID,
    loraAppUrl: `${CONFIG.LORA_EXPLORER_BASE}/application/${CONFIG.SENTINEL_APP_ID}`,
    peraAppUrl: `https://testnet.explorer.perawallet.app/application/${CONFIG.SENTINEL_APP_ID}`
  };
}
