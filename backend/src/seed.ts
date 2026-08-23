import { db, AgentRecord, BaselineRecord } from './db';
import { updateAgentBaseline } from './baselineEngine';
import { generateAlgorandTxId } from './algorand';

const REAL_TESTNET_TXIDS = [
  'NHUB2OTVS5EXSF7ASP67UKW4GYNRV57NT55XIMSESZ5QTOFJ36EA',
  'HK7NAMLIUEDDK6XNGIOL4YSXMCF6PHADLPQYOMZVW4POE4ZCAA7Q',
  'PLN3HMCIPTUGRJKHOCHIXFVEM24ZSU45HZWPTJDYBKEXWPNH2XOA',
  'BOGVBODBH25RCRWC6QD7ESM3CNFFDYPCL4KYZU5DDKPPJH4C5YEQ',
  'RSZOGZ4CXNBP5VJ55WADB745HIYWKZ7P5ACLSY4JXUSMEJVUSZ4Q',
  'QOOBRVQMX4HW5QZ2EGLQDQCQTKRF3UP3JKDGKYPCXMI6AVV35KQA',
  'ZDQV5D6L35NG4DRBRKH6SNKAMCQZGWKCQBYJX5L5FTFLHL7EFJ6A',
  'ESE4WLMULXSMHMISDRYU7YLS4E7X6YDNJAGFH55K2HXGFQITZ2TA',
  'UFTTCVAAXQKCAWGBI7Q2ZECGUH7KFLB6RSB6AVNBRDHEROPS7HIQ',
  '2OT2EX3STQQF3I7KC7JGHWYKDAYMUGVYOZKCWAI5X4M6J4TTLNOA'
];

function getRealTxId(i: number): string {
  return REAL_TESTNET_TXIDS[i % REAL_TESTNET_TXIDS.length];
}

export function seedSyntheticAgents() {
  console.log('\n=== SEEDING SYNTHETIC AGENT BASELINES & LINEAGE HISTORY ===');
  db.resetAll();

  const agents: AgentRecord[] = [
    {
      agentId: 'agent_alpha_procure',
      name: 'Agent Alpha (Procurement Bot / #9942)',
      category: 'cloud_procurement',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      agentId: 'agent_beta_data',
      name: 'Agent Beta (Data Pipeline Bot)',
      category: 'data_processing',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      agentId: 'agent_gamma_cloud',
      name: 'Agent Gamma (Infrastructure Scaling Bot)',
      category: 'cloud_infrastructure',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      agentId: 'agent_delta_untrusted',
      name: 'Agent Delta (Untrusted Arbitrage Bot)',
      category: 'arbitrage_execution',
      status: 'flagged',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      agentId: 'ag_proc_9982x_alpha',
      name: 'Agent 9982x (Multi-Hop Cascade Bot)',
      category: 'delegated_orchestration',
      status: 'active',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
    },
    {
      agentId: 'agent_velocity_spiker',
      name: 'Agent Velocity (High-Frequency Micro-Bot)',
      category: 'cadence_telemetry',
      status: 'flagged',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ];

  agents.forEach(a => db.upsertAgent(a));

  const now = Date.now();

  // 1. Seed 18 realistic historical payments for Agent Alpha (Mean ~$10.50, min $8.50, max $12.50, stddev ~$1.14)
  const alphaCategories = ['api_compute', 'cloud_hosting', 'data_pipeline'];
  for (let i = 1; i <= 18; i++) {
    const amt = Number((9.0 + (i % 4) * 0.9 + Math.sin(i) * 0.5).toFixed(2));
    const cat = alphaCategories[i % alphaCategories.length];
    updateAgentBaseline('agent_alpha_procure', amt, cat, true);

    db.addDecisionLog({
      id: `seed_log_alpha_${i}`,
      timestamp: new Date(now - (20 - i) * 3600000).toISOString(),
      agentId: 'agent_alpha_procure',
      rootTaskId: `task_historical_alpha_${Math.floor(i / 3)}`,
      hopCount: (i % 3) + 1,
      amount: amt,
      currency: 'USD',
      merchantCategory: cat,
      recipient: 'server_resource_node',
      decision: 'approve',
      anomalyScore: 0.08,
      deviationScore: 0.08,
      reason: `Standard transaction matching historical profile (mean $10.50, min $8.50, max $12.50)`,
      triggeredRules: [],
      txId: getRealTxId(i),
      onChainVerified: true,
      agentBaselineRange: { min: 8.50, max: 12.50, avg: 10.50 }
    });
  }

  // Seed Agent Alpha anomalous spike ($75.00 for cloud_hosting -> BLOCKED with z-score = 56.5)
  db.addDecisionLog({
    id: `seed_log_alpha_anomaly_01`,
    timestamp: new Date(now - 15 * 60000).toISOString(),
    agentId: 'agent_alpha_procure',
    rootTaskId: 'task_scenario_a_001',
    hopCount: 1,
    amount: 75.00,
    currency: 'USD',
    merchantCategory: 'cloud_hosting',
    recipient: 'untrusted_hosting_vault',
    decision: 'block',
    anomalyScore: 0.95,
    deviationScore: 0.95,
    reason: `Amount ($75.00) is 56.5 std devs above agent mean ($10.50, stddev: $1.14)`,
    triggeredRules: ['AMOUNT_ANOMALY_ZSCORE_EXCEEDED'],
    txId: getRealTxId(19),
    onChainVerified: true,
    zScore: 56.5,
    intentAlignmentScore: 35,
    agentBaselineRange: { min: 8.50, max: 12.50, avg: 10.50 }
  });

  // 2. Seed 16 realistic historical payments for Agent Beta (Mean ~$5.20, min $4.50, max $6.50)
  const betaCategories = ['analytics_query', 'data_indexing'];
  for (let i = 1; i <= 16; i++) {
    const amt = Number((4.5 + (i % 3) * 0.6).toFixed(2));
    const cat = betaCategories[i % betaCategories.length];
    updateAgentBaseline('agent_beta_data', amt, cat, true);

    db.addDecisionLog({
      id: `seed_log_beta_${i}`,
      timestamp: new Date(now - (20 - i) * 3600000).toISOString(),
      agentId: 'agent_beta_data',
      rootTaskId: `task_historical_beta_${Math.floor(i / 3)}`,
      hopCount: (i % 2) + 1,
      amount: amt,
      currency: 'USD',
      merchantCategory: cat,
      recipient: 'analytics_node_01',
      decision: 'approve',
      anomalyScore: 0.05,
      deviationScore: 0.05,
      reason: `Standard transaction matching historical profile (mean $5.20)`,
      triggeredRules: [],
      txId: getRealTxId(i + 20),
      onChainVerified: true,
      agentBaselineRange: { min: 4.50, max: 6.50, avg: 5.20 }
    });
  }

  // 3. Seed 15 realistic historical payments for Agent Gamma (Mean ~$18.50, min $16.00, max $21.00)
  const gammaCategories = ['object_storage', 'archival_backup'];
  for (let i = 1; i <= 15; i++) {
    const amt = Number((16.0 + (i % 5) * 1.1).toFixed(2));
    const cat = gammaCategories[i % gammaCategories.length];
    updateAgentBaseline('agent_gamma_cloud', amt, cat, true);

    db.addDecisionLog({
      id: `seed_log_gamma_${i}`,
      timestamp: new Date(now - (20 - i) * 3600000).toISOString(),
      agentId: 'agent_gamma_cloud',
      rootTaskId: `task_historical_gamma_${Math.floor(i / 3)}`,
      hopCount: 1,
      amount: amt,
      currency: 'USD',
      merchantCategory: cat,
      recipient: 'storage_vault_cluster',
      decision: 'approve',
      anomalyScore: 0.07,
      deviationScore: 0.07,
      reason: `Standard transaction matching historical profile (mean $18.50)`,
      triggeredRules: [],
      txId: getRealTxId(i + 40),
      onChainVerified: true,
      agentBaselineRange: { min: 16.00, max: 21.00, avg: 18.50 }
    });
  }

  // 4. Seed Multi-Hop Cascade Chain `task_cascade_demo_01` (4 Hops, Budget $40.00, Hop 4 BLOCKED on cumulative spend $55.00)
  const cascadeChainHops = [
    { hop: 1, agentId: 'agent_alpha_procure', amount: 12.00, cat: 'api_compute', decision: 'approve' as const, score: 0.08, reason: 'Hop 1 compliant with task budget ($12.00 / $40.00)' },
    { hop: 2, agentId: 'agent_beta_data', amount: 15.00, cat: 'analytics_query', decision: 'approve' as const, score: 0.12, reason: 'Hop 2 compliant with cumulative spend ($27.00 / $40.00)' },
    { hop: 3, agentId: 'agent_gamma_cloud', amount: 14.00, cat: 'object_storage', decision: 'approve' as const, score: 0.18, reason: 'Hop 3 compliant ($41.00 projected budget caution)' },
    { hop: 4, agentId: 'ag_proc_9982x_alpha', amount: 14.00, cat: 'data_indexing', decision: 'block' as const, score: 1.00, reason: 'On-chain lineage budget exceeded: Cumulative chain spend ($55.00) exceeds authorized task budget ($40.00) at hop 4' }
  ];

  let chainCumulative = 0;
  cascadeChainHops.forEach(h => {
    chainCumulative = Number((chainCumulative + h.amount).toFixed(2));
    db.addDecisionLog({
      id: `seed_cascade_hop_${h.hop}`,
      timestamp: new Date(now - (5 - h.hop) * 120000).toISOString(),
      agentId: h.agentId,
      rootTaskId: 'task_cascade_demo_01',
      hopCount: h.hop,
      amount: h.amount,
      currency: 'USD',
      merchantCategory: h.cat,
      recipient: 'chain_resource_endpoint',
      decision: h.decision,
      anomalyScore: h.score,
      deviationScore: h.score,
      reason: h.reason,
      triggeredRules: h.decision === 'block' ? ['CASCADE_BUDGET_EXCEEDED'] : [],
      txId: getRealTxId(h.hop),
      onChainVerified: true,
      intentAlignmentScore: h.decision === 'block' ? 42 : 88,
      agentBaselineRange: { min: 8.00, max: 20.00, avg: 13.00 }
    });
  });

  db.upsertLineageTask({
    rootTaskId: 'task_cascade_demo_01',
    authorizedBudget: 40.00,
    cumulativeSpend: 55.00,
    hopCount: 4,
    status: 'BLOCKED',
    merchantCategories: ['api_compute', 'analytics_query', 'object_storage', 'data_indexing'],
    decisionHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    updatedAt: new Date(now - 120000).toISOString(),
    onChainTxId: getRealTxId(0),
    taskDescription: 'Find cheapest cloud compute API under $40 budget'
  });

  // 5. Seed Velocity Burst for `agent_velocity_spiker` (14 payments in 3-minute window)
  for (let v = 1; v <= 14; v++) {
    const vAmt = Number((0.60 + (v % 4) * 0.15).toFixed(2));
    const vTime = new Date(now - (180 - v * 12) * 1000).toISOString(); // Every 12 seconds
    const isSpike = v >= 8;
    updateAgentBaseline('agent_velocity_spiker', vAmt, 'cadence_telemetry', !isSpike);

    db.addDecisionLog({
      id: `seed_velocity_burst_${v}`,
      timestamp: vTime,
      agentId: 'agent_velocity_spiker',
      rootTaskId: 'task_velocity_burst_demo',
      hopCount: v,
      amount: vAmt,
      currency: 'USD',
      merchantCategory: 'cadence_telemetry',
      recipient: 'high_freq_telemetry_node',
      decision: isSpike ? 'escalate' : 'approve',
      anomalyScore: isSpike ? 0.65 : 0.08,
      deviationScore: isSpike ? 0.65 : 0.08,
      reason: isSpike
        ? `Cadence spike: Current rate (300.0 calls/hr) is 15.0x historical average (20.0/hr)`
        : `Normal telemetry micro-call (#${v})`,
      triggeredRules: isSpike ? ['CADENCE_VELOCITY_SPIKE'] : [],
      txId: getRealTxId(v),
      onChainVerified: true,
      agentBaselineRange: { min: 0.50, max: 1.20, avg: 0.75 }
    });
  }

  // 6. Seed Trust Graph Edges
  db.upsertTrustEdge({
    id: 'edge_alpha_beta',
    payerAgentId: 'agent_alpha_procure',
    recipientAgentId: 'agent_beta_data',
    transactionCount: 24,
    totalAmount: 260.50,
    anomalyCount: 0,
    lastTransactionAt: new Date(now - 3600000).toISOString()
  });

  db.upsertTrustEdge({
    id: 'edge_beta_gamma',
    payerAgentId: 'agent_beta_data',
    recipientAgentId: 'agent_gamma_cloud',
    transactionCount: 19,
    totalAmount: 310.00,
    anomalyCount: 1,
    lastTransactionAt: new Date(now - 7200000).toISOString()
  });

  db.upsertTrustEdge({
    id: 'edge_gamma_delta',
    payerAgentId: 'agent_gamma_cloud',
    recipientAgentId: 'agent_delta_untrusted',
    transactionCount: 4,
    totalAmount: 56.00,
    anomalyCount: 3,
    lastTransactionAt: new Date(now - 14400000).toISOString()
  });

  console.log('✅ Seeded 6 agents with rich histories, anomaly spikes, blocked multi-hop chain, and velocity bursts.');
}

if (require.main === module) {
  seedSyntheticAgents();
}

