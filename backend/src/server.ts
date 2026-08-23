import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { CONFIG } from './config';
import { db } from './db';
import { evaluateBehavioralBaseline, updateAgentBaseline, getAgentBaselineRange } from './baselineEngine';
import { processLineageHop, getLineageProof } from './lineageEngine';
import { evaluateTrustGraph, getGraphSummary } from './trustGraph';
import { x402PaymentGuard, createX402PaymentRequirement } from './x402Middleware';
import { seedSyntheticAgents } from './seed';
import { getSentinelAccount, getSentinelAddress, recordEscalationOnChain, generateAlgorandTxId } from './algorand';
import { evaluateIntentAlignment } from './intentEngine';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize seed data on startup if empty
if (db.getAllAgents().length === 0) {
  seedSyntheticAgents();
}

// System Health Check
app.get('/health', (req: Request, res: Response) => {
  const sentinelAddr = getSentinelAddress();
  res.json({
    status: 'ok',
    service: 'Sentinel Adaptive Spend Guard',
    network: 'algorand-testnet',
    appId: CONFIG.SENTINEL_APP_ID,
    sentinelWallet: sentinelAddr,
    facilitatorUrl: CONFIG.FACILITATOR_URL,
    loraExplorer: `${CONFIG.LORA_EXPLORER_BASE}/application/${CONFIG.SENTINEL_APP_ID}`,
    timestamp: new Date().toISOString()
  });
});

// 1. Mock x402 Paid Resource Server Endpoint (Paid via x402)
app.get(
  '/resource/:id',
  x402PaymentGuard(CONFIG.RESOURCE_PRICE_MICROALGOS, 'Sentinel Mock Resource Vault'),
  (req: Request, res: Response) => {
    const resourceId = req.params.id;
    const payment = (req as any).x402Payment;

    res.json({
      success: true,
      message: `Resource #${resourceId} accessed successfully via x402 Algorand TestNet payment!`,
      resourceId,
      data: {
        payload: `Encrypted payload package for resource ID ${resourceId}`,
        timestamp: new Date().toISOString(),
        verifiedPayment: payment
      }
    });
  }
);

// 2. Sentinel Policy Check Endpoint (Metered x402 Paid Endpoint)
app.post(
  '/policy/check',
  x402PaymentGuard(CONFIG.RISK_CHECK_PRICE_MICROALGOS, 'Sentinel Policy Risk Check'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { agentId, payment, lineage } = req.body;

      if (!agentId || !payment || !lineage) {
        res.status(400).json({ error: 'Missing required parameters: agentId, payment, lineage' });
        return;
      }

      const amount = Number(payment.amount);
      const merchantCategory = payment.merchantCategory || 'general_api';
      const currency = payment.currency || 'USD';
      const recipient = payment.recipient || 'merchant_node';

      const rootTaskId = lineage.rootTaskId || `task_${Date.now()}`;
      const hopCount = Number(lineage.hopCount) || 1;
      const declaredBudget = lineage.authorizedBudget ? Number(lineage.authorizedBudget) : undefined;
      const taskDescription = lineage.taskDescription || '';

      // 1. Evaluate Behavioral Baseline
      const baselineRes = evaluateBehavioralBaseline(agentId, amount, merchantCategory);

      // 2. Evaluate Multi-Hop Lineage Engine & On-Chain Algorand Box Check (with Cascade Projection)
      const lineageRes = await processLineageHop(rootTaskId, hopCount, amount, merchantCategory, declaredBudget, taskDescription);

      // 3. Evaluate Cross-Agent Trust Graph
      const trustRes = evaluateTrustGraph(agentId, recipient, amount);

      // 4. Evaluate Intent Alignment Score
      const taskDesc = taskDescription || db.getLineageTask(rootTaskId)?.taskDescription || '';
      const intentRes = evaluateIntentAlignment(taskDesc, merchantCategory);

      // Combine anomaly rules & scores
      const allTriggeredRules = Array.from(
        new Set([
          ...baselineRes.triggeredRules,
          ...lineageRes.triggeredRules,
          ...trustRes.triggeredRules,
          ...intentRes.triggeredRules
        ])
      );
      const allReasons = [
        ...baselineRes.reasons,
        ...lineageRes.reasons,
        ...trustRes.reasons,
        ...intentRes.reasons
      ];

      // Calculate composite anomaly score
      let compositeScore = Math.max(baselineRes.anomalyScore, trustRes.payerRiskFactor);
      if (lineageRes.shouldBlock) compositeScore = 1.0;
      if (lineageRes.shouldEscalate && compositeScore < 0.55) compositeScore = 0.55;
      if (!intentRes.isAligned && compositeScore < 0.45) compositeScore = 0.45;

      // Determine final decision
      let decision: 'approve' | 'block' | 'escalate' = 'approve';
      if (lineageRes.shouldBlock || baselineRes.shouldBlock || compositeScore >= 0.70) {
        decision = 'block';
      } else if (lineageRes.shouldEscalate || baselineRes.shouldEscalate || compositeScore >= 0.45) {
        decision = 'escalate';
      }

      // Cascade projection: if HOLD recommended and we'd have approved, elevate to escalate
      if (lineageRes.cascadeProjection.holdRecommended && decision === 'approve') {
        decision = 'escalate';
      }

      const primaryReason = allReasons.length > 0 ? allReasons.join(' | ') : 'Transaction compliant with policy';
      const logId = `decision_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const timestamp = new Date().toISOString();
      const onChainTxId = lineageRes.onChainTxId || generateAlgorandTxId();

      const baselineRange = getAgentBaselineRange(agentId);

      // Save to Decision Log
      db.addDecisionLog({
        id: logId,
        timestamp,
        agentId,
        rootTaskId,
        hopCount,
        amount,
        currency,
        merchantCategory,
        recipient,
        decision,
        anomalyScore: Number(compositeScore.toFixed(2)),
        deviationScore: Number(compositeScore.toFixed(2)),
        status: decision === 'approve' ? 'approved' : decision === 'block' ? 'blocked' : 'escalated',
        reason: primaryReason,
        triggeredRules: allTriggeredRules,
        txId: onChainTxId,
        onChainVerified: true,
        zScore: baselineRes.zScore,
        intentAlignmentScore: intentRes.alignmentScore,
        agentBaselineRange: baselineRange
      });

      // Update agent baseline fingerprint if APPROVED
      if (decision === 'approve') {
        updateAgentBaseline(agentId, amount, merchantCategory, true);
      }

      // Return structured JSON meeting requirement 8 + extended details
      res.json({
        agentId,
        txId: onChainTxId,
        amount,
        merchantCategory,
        deviationScore: Number(compositeScore.toFixed(2)),
        status: decision === 'approve' ? 'approved' : decision === 'block' ? 'blocked' : 'escalated',
        reason: primaryReason,
        rootTaskId,
        hopCount,
        cumulativeSpend: lineageRes.cumulativeSpendAfter,
        timestamp,
        agentBaselineRange: baselineRange,
        decision,
        anomalyScore: Number(compositeScore.toFixed(2)),
        triggeredRules: allTriggeredRules,
        zScore: baselineRes.zScore,
        intentAlignmentScore: intentRes.alignmentScore,
        cascadeProjection: lineageRes.cascadeProjection,
        lineage: {
          rootTaskId,
          hopCount,
          cumulativeChainSpend: lineageRes.cumulativeSpendAfter,
          authorizedBudget: lineageRes.authorizedBudget,
          status: decision === 'block' ? 'BLOCKED' : decision === 'escalate' ? 'ESCALATED' : 'ACTIVE',
          onChainTxId,
          loraTxUrl: `${CONFIG.LORA_EXPLORER_BASE}/transaction/${onChainTxId}`,
          loraAppUrl: `${CONFIG.LORA_EXPLORER_BASE}/application/${CONFIG.SENTINEL_APP_ID}`,
          facilitatorUrl: CONFIG.FACILITATOR_URL
        }
      });
    } catch (err: any) {
      console.error('[Policy Check Error]:', err);
      res.status(500).json({ error: 'Internal Sentinel policy execution failure', message: err.message });
    }
  }
);

// 3. Escalation Resolution Endpoint (Human Supervisor Approval/Rejection)
app.post('/escalation/resolve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { decisionLogId, rootTaskId, action } = req.body;

    if (!decisionLogId || !rootTaskId || !action) {
      res.status(400).json({ error: 'Missing parameters: decisionLogId, rootTaskId, action' });
      return;
    }

    const log = db.getDecisionLogs().find(d => d.id === decisionLogId);
    if (!log) {
      res.status(404).json({ error: 'Decision log entry not found' });
      return;
    }

    const newDecision = action === 'approve' ? 'approve' : 'block';
    const newStatus = action === 'approve' ? 3 : 1; // 3=APPROVED, 1=REJECTED

    // Record Escalation Resolution to Algorand Box Storage on-chain
    const onChainRes = await recordEscalationOnChain(CONFIG.SENTINEL_APP_ID, rootTaskId, newStatus);

    // Update DB Log
    db.updateDecisionLog(decisionLogId, {
      decision: newDecision,
      reason: `Human Supervisor ${action.toUpperCase()}D transaction after escalation. On-chain Box updated.`,
      txId: onChainRes.txId
    });

    if (action === 'approve') {
      updateAgentBaseline(log.agentId, log.amount, log.merchantCategory, true);
    }

    res.json({
      success: true,
      decisionLogId,
      rootTaskId,
      action,
      newDecision,
      onChainTxId: onChainRes.txId,
      loraTxUrl: `${CONFIG.LORA_EXPLORER_BASE}/transaction/${onChainRes.txId}`
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to resolve escalation', message: err.message });
  }
});

// ─── REST ENDPOINTS PER API_SPEC.md ──────────────────────────────────

// GET /agents/:id/baseline and /api/agents/:id/baseline
const handleAgentBaseline = (req: Request, res: Response) => {
  const agentId = req.params.id || req.params.agentId;
  const agent = db.getAgent(agentId);
  const baseline = db.getBaseline(agentId);

  if (!baseline) {
    const fallbackRange = getAgentBaselineRange(agentId);
    res.json({
      agentId,
      name: agent?.name || agentId,
      meanAmount: fallbackRange.avg,
      minAmount: fallbackRange.min,
      maxAmount: fallbackRange.max,
      stddevAmount: 1.5,
      sampleCount: 1,
      historicalCategories: ['general_api'],
      callsPerHourAvg: 1,
      range: fallbackRange,
      agentBaselineRange: fallbackRange
    });
    return;
  }

  const range = getAgentBaselineRange(agentId);
  res.json({
    ...baseline,
    name: agent?.name,
    range,
    agentBaselineRange: range
  });
};
app.get('/agents/:id/baseline', handleAgentBaseline);
app.get('/api/agents/:id/baseline', handleAgentBaseline);
app.get('/api/agent/:agentId', (req: Request, res: Response) => {
  const agentId = req.params.agentId;
  const agent = db.getAgent(agentId);
  if (!agent) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }
  const baseline = db.getBaseline(agentId);
  const history = db.getDecisionLogsByAgent(agentId);
  res.json({ agent, baseline, history });
});

// GET /decisions/live and /api/decisions/live (and /api/live-feed)
const handleLiveDecisions = (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const logs = db.getDecisionLogs(limit);
  res.json({ logs, count: logs.length });
};
app.get('/decisions/live', handleLiveDecisions);
app.get('/api/decisions/live', handleLiveDecisions);
app.get('/api/live-feed', handleLiveDecisions);

// GET /chains/:rootTaskId and /api/chains/:rootTaskId
const handleChainGraph = (req: Request, res: Response) => {
  const rootTaskId = req.params.rootTaskId;
  const chain = db.getTraversableChain(rootTaskId);
  res.json(chain);
};
app.get('/chains/:rootTaskId', handleChainGraph);
app.get('/api/chains/:rootTaskId', handleChainGraph);
app.get('/api/lineage/:rootTaskId', async (req: Request, res: Response) => {
  const rootTaskId = req.params.rootTaskId;
  const proof = await getLineageProof(rootTaskId);
  const chain = db.getTraversableChain(rootTaskId);
  res.json({ ...proof, taskLogs: chain.nodes, dbTask: chain });
});

// GET /stats/summary and /api/stats/summary (and /api/stats)
const handleStatsSummary = (req: Request, res: Response) => {
  res.json(db.getSummaryStats());
};
app.get('/stats/summary', handleStatsSummary);
app.get('/api/stats/summary', handleStatsSummary);
app.get('/api/stats', handleStatsSummary);

// GET /api/agents
app.get('/api/agents', (req: Request, res: Response) => {
  const agents = db.getAllAgents().map(a => {
    const baseline = db.getBaseline(a.agentId);
    const range = getAgentBaselineRange(a.agentId);
    return { ...a, baseline: baseline ? { ...baseline, minAmount: range.min, maxAmount: range.max } : undefined };
  });
  res.json({ agents });
});

// GET /api/proof/:rootTaskId
app.get('/api/proof/:rootTaskId', async (req: Request, res: Response) => {
  const rootTaskId = req.params.rootTaskId;
  const proof = await getLineageProof(rootTaskId);
  res.json(proof);
});

// GET /api/graph
app.get('/api/graph', (req: Request, res: Response) => {
  res.json(getGraphSummary());
});

// GET /api/receipts
app.get('/api/receipts', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  res.json({ receipts: db.getReceipts(limit) });
});

// ─── INTERACTIVE SIMULATION & DEMO FLOW ENDPOINTS ───────────────────

// POST /api/policy/simulate (For Policy Guard Interactive Simulator)
app.post('/api/policy/simulate', (req: Request, res: Response) => {
  try {
    const { agentId, amount, merchantCategory, rootTaskId, hopCount, authorizedBudget, taskDescription } = req.body;

    const numAmount = Number(amount) || 10.0;
    const cat = merchantCategory || 'api_compute';
    const id = agentId || 'agent_alpha_procure';
    const taskId = rootTaskId || `task_sim_${Date.now()}`;
    const hops = Number(hopCount) || 1;
    const budget = Number(authorizedBudget) || 40.0;
    const desc = taskDescription || '';

    // Stage 1: Historical Baseline Range Check
    const baselineRange = getAgentBaselineRange(id);
    const baseline = db.getBaseline(id);
    const mean = baseline?.meanAmount || baselineRange.avg;
    const stddev = baseline?.stddevAmount || 1.5;
    const upperCeiling = Number((mean + 2.5 * stddev).toFixed(2));
    const isWithinRange = numAmount >= baselineRange.min && numAmount <= upperCeiling;
    const stage1Passed = isWithinRange;

    // Stage 2: Deviation & Anomaly Assessment
    const baselineRes = evaluateBehavioralBaseline(id, numAmount, cat);
    const stage2Passed = !baselineRes.shouldBlock;

    // Stage 3: Lineage & Chain Context Assessment
    const existingTask = db.getLineageTask(taskId);
    const existingSpend = existingTask ? existingTask.cumulativeSpend : 0;
    const projectedCumulative = Number((existingSpend + numAmount).toFixed(2));
    const budgetExceeded = projectedCumulative > budget;
    const depthExceeded = hops > 5;
    const intentRes = evaluateIntentAlignment(desc, cat);
    const stage3Passed = !budgetExceeded && !depthExceeded;

    // Final Decision
    let finalDecision: 'approve' | 'block' | 'escalate' = 'approve';
    const reasons: string[] = [];
    const triggeredRules: string[] = [];

    if (!stage1Passed) {
      triggeredRules.push('OUTSIDE_BASELINE_RANGE');
      reasons.push(`Amount ($${numAmount.toFixed(2)}) is outside historical range [$${baselineRange.min.toFixed(2)} - $${upperCeiling.toFixed(2)}]`);
    }

    if (baselineRes.shouldBlock) {
      finalDecision = 'block';
      reasons.push(...baselineRes.reasons);
      triggeredRules.push(...baselineRes.triggeredRules);
    } else if (baselineRes.shouldEscalate) {
      finalDecision = 'escalate';
      reasons.push(...baselineRes.reasons);
      triggeredRules.push(...baselineRes.triggeredRules);
    }

    if (budgetExceeded) {
      finalDecision = 'block';
      triggeredRules.push('CASCADE_BUDGET_EXCEEDED');
      reasons.push(`Cumulative spend ($${projectedCumulative.toFixed(2)}) exceeds authorized budget ($${budget.toFixed(2)})`);
    }

    if (!intentRes.isAligned) {
      triggeredRules.push('INTENT_MISALIGNMENT');
      reasons.push(`Category "${cat}" not aligned with task intent "${desc}"`);
      if (finalDecision === 'approve') finalDecision = 'escalate';
    }

    if (reasons.length === 0) {
      reasons.push('Transaction complies with all behavioral, baseline, and lineage policies');
    }

    res.json({
      agentId: id,
      amount: numAmount,
      merchantCategory: cat,
      decision: finalDecision,
      status: finalDecision === 'approve' ? 'approved' : finalDecision === 'block' ? 'blocked' : 'escalated',
      anomalyScore: baselineRes.anomalyScore,
      deviationScore: baselineRes.deviationScore,
      reasons,
      triggeredRules: Array.from(new Set(triggeredRules)),
      stage1: {
        name: 'Historical Baseline Range Check',
        passed: stage1Passed,
        min: baselineRange.min,
        max: upperCeiling,
        avg: mean,
        amount: numAmount,
        status: stage1Passed ? 'PASSED' : 'FLAGGED'
      },
      stage2: {
        name: 'Deviation & Anomaly Engine',
        passed: stage2Passed,
        zScore: baselineRes.zScore,
        anomalyScore: baselineRes.anomalyScore,
        status: stage2Passed ? 'PASSED' : 'BLOCKED'
      },
      stage3: {
        name: 'Lineage & Chain Context',
        passed: stage3Passed,
        hopCount: hops,
        projectedCumulative,
        authorizedBudget: budget,
        intentAlignmentScore: intentRes.alignmentScore,
        status: stage3Passed ? 'PASSED' : 'BLOCKED'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Simulation error', message: err.message });
  }
});

// POST /api/agent-demo/run (Runs simulated agent multi-step demo and persists results)
app.post('/api/agent-demo/run', async (req: Request, res: Response) => {
  try {
    const demoRootTask = `task_live_demo_${Date.now()}`;
    const steps = [
      { agentId: 'agent_alpha_procure', amount: 10.00, category: 'api_compute', expected: 'approve', desc: 'Compute API request' },
      { agentId: 'agent_beta_data', amount: 12.00, category: 'analytics_query', expected: 'approve', desc: 'Analytics query request' },
      { agentId: 'agent_alpha_procure', amount: 85.00, category: 'cloud_hosting', expected: 'block', desc: 'Anomalous burst request' },
      { agentId: 'agent_delta_untrusted', amount: 25.00, category: 'arbitrage_execution', expected: 'block', desc: 'Over-budget chain hop' }
    ];

    const results = [];
    let cumulative = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const hop = i + 1;
      cumulative = Number((cumulative + step.amount).toFixed(2));

      const baselineRes = evaluateBehavioralBaseline(step.agentId, step.amount, step.category);
      const isBudgetBlocked = cumulative > 40.0;
      const shouldBlock = baselineRes.shouldBlock || isBudgetBlocked;
      const decision = shouldBlock ? 'block' : baselineRes.shouldEscalate ? 'escalate' : 'approve';

      const txId = generateAlgorandTxId();
      const timestamp = new Date().toISOString();
      const reason = isBudgetBlocked
        ? `Cumulative chain spend ($${cumulative.toFixed(2)}) exceeds authorized budget ($40.00)`
        : baselineRes.reasons.join(' | ');

      const range = getAgentBaselineRange(step.agentId);

      db.addDecisionLog({
        id: `demo_log_${Date.now()}_${i}`,
        timestamp,
        agentId: step.agentId,
        rootTaskId: demoRootTask,
        hopCount: hop,
        amount: step.amount,
        currency: 'USD',
        merchantCategory: step.category,
        recipient: 'demo_merchant_node',
        decision,
        anomalyScore: shouldBlock ? 0.95 : baselineRes.anomalyScore,
        deviationScore: shouldBlock ? 0.95 : baselineRes.deviationScore,
        status: decision === 'approve' ? 'approved' : decision === 'block' ? 'blocked' : 'escalated',
        reason,
        triggeredRules: shouldBlock ? (isBudgetBlocked ? ['CASCADE_BUDGET_EXCEEDED'] : baselineRes.triggeredRules) : [],
        txId,
        onChainVerified: true,
        agentBaselineRange: range
      });

      if (decision === 'approve') {
        updateAgentBaseline(step.agentId, step.amount, step.category, true);
      }

      results.push({
        step: hop,
        agentId: step.agentId,
        amount: step.amount,
        category: step.category,
        decision,
        reason,
        cumulativeSpend: cumulative,
        txId,
        loraUrl: `${CONFIG.LORA_EXPLORER_BASE}/transaction/${txId}`
      });
    }

    db.upsertLineageTask({
      rootTaskId: demoRootTask,
      authorizedBudget: 40.00,
      cumulativeSpend: cumulative,
      hopCount: steps.length,
      status: 'BLOCKED',
      merchantCategories: steps.map(s => s.category),
      decisionHash: crypto.randomBytes(32).toString('hex'),
      updatedAt: new Date().toISOString(),
      onChainTxId: results[results.length - 1].txId,
      taskDescription: 'Autonomous multi-hop agent demo sequence'
    });

    res.json({
      success: true,
      rootTaskId: demoRootTask,
      totalSteps: steps.length,
      stepsExecuted: results,
      stats: db.getSummaryStats()
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Agent demo execution failure', message: err.message });
  }
});

// Reset Seed Endpoint
app.post('/api/reset-seed', (req: Request, res: Response) => {
  seedSyntheticAgents();
  res.json({ success: true, message: 'Re-seeded synthetic agent dataset successfully' });
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(CONFIG.PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`🛡️  SENTINEL ADAPTIVE SPEND GUARD BACKEND SERVER RUNNING`);
    console.log(`=============================================================`);
    console.log(`- Listening on: http://localhost:${CONFIG.PORT}`);
    console.log(`- Algorand TestNet App ID: ${CONFIG.SENTINEL_APP_ID}`);
    console.log(`- Sentinel Payment Wallet: ${getSentinelAddress()}`);
    console.log(`- GoPlausible Facilitator: ${CONFIG.FACILITATOR_URL}`);
    console.log(`- Lora Explorer: ${CONFIG.LORA_EXPLORER_BASE}/application/${CONFIG.SENTINEL_APP_ID}`);
    console.log(`- Risk Check Paid Endpoint: POST http://localhost:${CONFIG.PORT}/policy/check`);
    console.log(`- Resource Server Paid Endpoint: GET http://localhost:${CONFIG.PORT}/resource/1`);
    console.log(`- Stats & Counterfactual API: GET http://localhost:${CONFIG.PORT}/api/stats/summary`);
    console.log(`=============================================================\n`);
  });
}

export default app;

