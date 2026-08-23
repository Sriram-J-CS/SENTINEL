import fs from 'fs';
import path from 'path';
import { CONFIG } from './config';

export interface AgentRecord {
  agentId: string;
  name: string;
  category: string;
  status: 'active' | 'flagged' | 'suspended';
  createdAt: string;
}

export interface BaselineRecord {
  agentId: string;
  meanAmount: number;
  stddevAmount: number;
  minAmount: number;
  maxAmount: number;
  sampleCount: number;
  historicalCategories: string[];
  callsPerHourAvg: number;
  lastUpdated: string;
}

export interface LineageTaskRecord {
  rootTaskId: string;
  authorizedBudget: number;
  cumulativeSpend: number;
  hopCount: number;
  status: 'ACTIVE' | 'BLOCKED' | 'ESCALATED' | 'APPROVED';
  merchantCategories: string[];
  decisionHash: string;
  updatedAt: string;
  onChainTxId?: string;
  taskDescription?: string; // Optional declared intent text for alignment scoring
}

export interface DecisionLogRecord {
  id: string;
  timestamp: string;
  agentId: string;
  rootTaskId: string;
  hopCount: number;
  amount: number;
  currency: string;
  merchantCategory: string;
  recipient: string;
  decision: 'approve' | 'block' | 'escalate';
  anomalyScore: number;
  deviationScore?: number;
  status?: string;
  reason: string;
  triggeredRules: string[];
  txId?: string;
  onChainVerified?: boolean;
  zScore?: number;
  intentAlignmentScore?: number;
  agentBaselineRange?: {
    min: number;
    max: number;
    avg: number;
  };
}

export interface TrustEdgeRecord {
  id: string;
  payerAgentId: string;
  recipientAgentId: string;
  transactionCount: number;
  totalAmount: number;
  anomalyCount: number;
  lastTransactionAt: string;
}

export interface DatabaseSchema {
  agents: AgentRecord[];
  baselines: BaselineRecord[];
  lineageTasks: LineageTaskRecord[];
  decisionLogs: DecisionLogRecord[];
  trustEdges: TrustEdgeRecord[];
}

const dbFilePath = path.join(__dirname, '../sentinel_db.json');

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(dbFilePath)) {
      try {
        const raw = fs.readFileSync(dbFilePath, 'utf8');
        return JSON.parse(raw);
      } catch (e) {
        console.warn('[DB] Failed to parse db file, starting fresh.');
      }
    }
    const initial: DatabaseSchema = {
      agents: [],
      baselines: [],
      lineageTasks: [],
      decisionLogs: [],
      trustEdges: []
    };
    this.save(initial);
    return initial;
  }

  public save(data?: DatabaseSchema): void {
    if (data) this.data = data;
    fs.writeFileSync(dbFilePath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  // Agents
  public getAgent(agentId: string): AgentRecord | undefined {
    return this.data.agents.find(a => a.agentId === agentId);
  }

  public getAllAgents(): AgentRecord[] {
    return this.data.agents;
  }

  public upsertAgent(agent: AgentRecord): void {
    const idx = this.data.agents.findIndex(a => a.agentId === agent.agentId);
    if (idx >= 0) {
      this.data.agents[idx] = agent;
    } else {
      this.data.agents.push(agent);
    }
    this.save();
  }

  // Baselines
  public getBaseline(agentId: string): BaselineRecord | undefined {
    return this.data.baselines.find(b => b.agentId === agentId);
  }

  public upsertBaseline(baseline: BaselineRecord): void {
    const idx = this.data.baselines.findIndex(b => b.agentId === baseline.agentId);
    if (idx >= 0) {
      this.data.baselines[idx] = baseline;
    } else {
      this.data.baselines.push(baseline);
    }
    this.save();
  }

  // Lineage Tasks
  public getLineageTask(rootTaskId: string): LineageTaskRecord | undefined {
    return this.data.lineageTasks.find(l => l.rootTaskId === rootTaskId);
  }

  public getAllLineageTasks(): LineageTaskRecord[] {
    return this.data.lineageTasks;
  }

  public upsertLineageTask(task: LineageTaskRecord): void {
    const idx = this.data.lineageTasks.findIndex(l => l.rootTaskId === task.rootTaskId);
    if (idx >= 0) {
      this.data.lineageTasks[idx] = task;
    } else {
      this.data.lineageTasks.push(task);
    }
    this.save();
  }

  // Decision Logs
  public addDecisionLog(log: DecisionLogRecord): void {
    this.data.decisionLogs.unshift(log);
    this.save();
  }

  public getDecisionLogs(limit: number = 50): DecisionLogRecord[] {
    return this.data.decisionLogs.slice(0, limit);
  }

  public getDecisionLogsByAgent(agentId: string): DecisionLogRecord[] {
    return this.data.decisionLogs.filter(d => d.agentId === agentId);
  }

  public getDecisionLogsByTask(rootTaskId: string): DecisionLogRecord[] {
    return this.data.decisionLogs.filter(d => d.rootTaskId === rootTaskId);
  }

  public updateDecisionLog(id: string, updates: Partial<DecisionLogRecord>): void {
    const log = this.data.decisionLogs.find(d => d.id === id);
    if (log) {
      Object.assign(log, updates);
      this.save();
    }
  }

  // Trust Edges
  public getTrustEdge(payerId: string, recipientId: string): TrustEdgeRecord | undefined {
    return this.data.trustEdges.find(e => e.payerAgentId === payerId && e.recipientAgentId === recipientId);
  }

  public getTrustEdgesForAgent(agentId: string): TrustEdgeRecord[] {
    return this.data.trustEdges.filter(e => e.payerAgentId === agentId || e.recipientAgentId === agentId);
  }

  public getAllTrustEdges(): TrustEdgeRecord[] {
    return this.data.trustEdges;
  }

  public upsertTrustEdge(edge: TrustEdgeRecord): void {
    const idx = this.data.trustEdges.findIndex(e => e.payerAgentId === edge.payerAgentId && e.recipientAgentId === edge.recipientAgentId);
    if (idx >= 0) {
      this.data.trustEdges[idx] = edge;
    } else {
      this.data.trustEdges.push(edge);
    }
    this.save();
  }

  // Node Graph Query Helper
  public getTraversableChain(rootTaskId: string) {
    const task = this.getLineageTask(rootTaskId);
    const logs = this.getDecisionLogsByTask(rootTaskId).sort((a, b) => a.hopCount - b.hopCount);

    let cumulative = 0;
    const nodes = logs.map(l => {
      cumulative = Number((cumulative + l.amount).toFixed(2));
      return {
        hopCount: l.hopCount,
        agentId: l.agentId,
        amount: l.amount,
        cumulativeSpend: cumulative,
        timestamp: l.timestamp,
        status: l.decision === 'approve' ? 'APPROVED' : l.decision === 'block' ? 'BLOCKED' : 'ESCALATED',
        decision: l.decision,
        merchantCategory: l.merchantCategory,
        anomalyScore: l.anomalyScore,
        reason: l.reason,
        txId: l.txId,
        intentAlignmentScore: l.intentAlignmentScore
      };
    });

    return {
      rootTaskId,
      authorizedBudget: task?.authorizedBudget || 40.0,
      cumulativeSpend: task?.cumulativeSpend || (nodes.length > 0 ? nodes[nodes.length - 1].cumulativeSpend : 0),
      status: task?.status || (nodes.some(n => n.status === 'BLOCKED') ? 'BLOCKED' : 'ACTIVE'),
      taskDescription: task?.taskDescription || '',
      nodes
    };
  }

  // KPI Strip & Summary Stats Helper
  public getSummaryStats() {
    const allLogs = this.data.decisionLogs;
    const allAgents = this.data.agents;
    const allTasks = this.data.lineageTasks;

    const totalPaymentsAnalyzed = allLogs.length;
    const totalVolume = Number(allLogs.reduce((sum, l) => sum + l.amount, 0).toFixed(2));
    const blockedLogs = allLogs.filter(l => l.decision === 'block');
    const blockedCount = blockedLogs.length;
    const approvedCount = allLogs.filter(l => l.decision === 'approve').length;
    const escalatedCount = allLogs.filter(l => l.decision === 'escalate').length;
    const approvalRate = totalPaymentsAnalyzed > 0
      ? Number(((approvedCount / totalPaymentsAnalyzed) * 100).toFixed(1))
      : 100;
    const activeAgents = allAgents.length;
    const threatsBlocked = blockedCount;
    const cascadesPrevented = allTasks.filter(t => t.status === 'BLOCKED').length;
    const blockedAmount = Number(blockedLogs.reduce((sum, l) => sum + l.amount, 0).toFixed(2));

    return {
      totalVolume,
      totalPaymentsAnalyzed,
      blockedCount,
      approvedCount,
      escalatedCount,
      approvalRate,
      activeAgents,
      threatsBlocked,
      cascadesPrevented,
      counterfactual: {
        wouldHaveSettled: totalPaymentsAnalyzed,
        totalAmountIfNoSentinel: totalVolume,
        blockedAmount,
        preventedCount: blockedCount
      }
    };
  }

  // Receipts Ledger Query Helper
  public getReceipts(limit: number = 50) {
    return this.data.decisionLogs.slice(0, limit).map(l => ({
      id: l.id,
      timestamp: l.timestamp,
      route: `/policy/check (Hop ${l.hopCount})`,
      agentId: l.agentId,
      amount: l.amount,
      currency: l.currency,
      status: l.decision === 'approve' ? 'SETTLED' : l.decision === 'block' ? 'BLOCKED' : 'ESCALATED',
      decision: l.decision,
      merchantCategory: l.merchantCategory,
      txId: l.txId || '4L67ABC...TESTNET',
      loraUrl: `${CONFIG.LORA_EXPLORER_BASE}/transaction/${l.txId || ''}`,
      peraUrl: `https://testnet.explorer.perawallet.app/tx/${l.txId || ''}`
    }));
  }

  public resetAll(): void {
    this.data = {
      agents: [],
      baselines: [],
      lineageTasks: [],
      decisionLogs: [],
      trustEdges: []
    };
    this.save();
  }
}

export const db = new Database();

