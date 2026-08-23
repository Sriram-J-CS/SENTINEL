import { db, TrustEdgeRecord } from './db';

export interface TrustAssessment {
  payerRiskFactor: number; // 0.0 (fully trusted) to 1.0 (high risk)
  isUntrustedPayer: boolean;
  reasons: string[];
  triggeredRules: string[];
}

export function evaluateTrustGraph(
  payerAgentId: string,
  recipientAgentId: string,
  amount: number
): TrustAssessment {
  const triggeredRules: string[] = [];
  const reasons: string[] = [];

  // Fetch past decisions for payer to determine anomaly rate
  const payerLogs = db.getDecisionLogsByAgent(payerAgentId);
  const totalPayerTx = payerLogs.length;

  let payerRiskFactor = 0.0;

  if (totalPayerTx === 0) {
    // New / Unknown Payer Agent
    payerRiskFactor = 0.25;
    reasons.push(`Payer Agent "${payerAgentId}" is new with no established cross-agent trust history`);
  } else {
    const blockedCount = payerLogs.filter(l => l.decision === 'block' || l.decision === 'escalate').length;
    const anomalyRate = blockedCount / totalPayerTx;

    if (anomalyRate >= 0.3) {
      payerRiskFactor = 0.60;
      triggeredRules.push('UNTRUSTED_PAYER_CHAIN_PROPAGATION');
      reasons.push(
        `High risk payer propagation: Payer Agent "${payerAgentId}" has a ${(anomalyRate * 100).toFixed(0)}% past anomaly/block rate`
      );
    }
  }

  // Update edge record
  let edge = db.getTrustEdge(payerAgentId, recipientAgentId);
  if (!edge) {
    edge = {
      id: `edge_${payerAgentId}_${recipientAgentId}`,
      payerAgentId,
      recipientAgentId,
      transactionCount: 1,
      totalAmount: amount,
      anomalyCount: payerRiskFactor > 0.4 ? 1 : 0,
      lastTransactionAt: new Date().toISOString()
    };
  } else {
    edge.transactionCount += 1;
    edge.totalAmount += amount;
    if (payerRiskFactor > 0.4) edge.anomalyCount += 1;
    edge.lastTransactionAt = new Date().toISOString();
  }
  db.upsertTrustEdge(edge);

  return {
    payerRiskFactor,
    isUntrustedPayer: payerRiskFactor >= 0.4,
    reasons,
    triggeredRules
  };
}

export function getGraphSummary() {
  const edges = db.getAllTrustEdges();
  const agents = db.getAllAgents();

  return {
    nodes: agents.map(a => ({
      id: a.agentId,
      name: a.name,
      category: a.category,
      status: a.status
    })),
    edges: edges.map(e => ({
      source: e.payerAgentId,
      target: e.recipientAgentId,
      count: e.transactionCount,
      totalAmount: e.totalAmount,
      isHighRisk: e.anomalyCount > 0
    }))
  };
}
