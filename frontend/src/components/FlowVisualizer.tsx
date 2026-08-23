import React, { useState } from 'react';
import {
  Network, ArrowRight, ShieldCheck, Database, Cpu, Lock,
  Layers, ExternalLink, Code2, Server, Radio, CheckCircle2
} from 'lucide-react';
import { useTheme } from './useTheme';

interface FlowNode {
  id: string;
  title: string;
  actor: 'client' | 'sentinel' | 'facilitator' | 'algorand' | 'vault';
  actorLabel: string;
  description: string;
  latency: string;
  payload: Record<string, any>;
  keyFeatures: string[];
}

const FLOW_NODES: FlowNode[] = [
  {
    id: 'client',
    title: '1. AI Autonomous Agent',
    actor: 'client',
    actorLabel: 'AI Agent / Client',
    description: 'Autonomous LLM agent initiates micropayment request for cloud compute or data indexing resources.',
    latency: '0ms',
    payload: {
      agentId: 'agent_alpha_procure',
      payment: { amount: 10.50, currency: 'USD', merchantCategory: 'api_compute' },
      lineage: { rootTaskId: 'task_cascade_01', hopCount: 1, authorizedBudget: 40.00 }
    },
    keyFeatures: [
      'Unsigned initial HTTP request',
      'Declares rootTaskId and authorized budget',
      'Receives HTTP 402 challenge with payment specs'
    ]
  },
  {
    id: 'sentinel',
    title: '2. Sentinel Policy Middleware',
    actor: 'sentinel',
    actorLabel: 'Sentinel Spend Guard',
    description: 'Intercepts HTTP 402 flow before settlement. Runs 3-stage behavioral baseline, cross-agent trust, and multi-hop lineage check.',
    latency: '< 15ms',
    payload: {
      stage1_baselineRange: { min: 8.50, max: 12.50, avg: 10.50, status: 'PASSED' },
      stage2_zScore: 0.12,
      stage3_cumulativeSpend: 10.50,
      authorizedBudget: 40.00,
      decision: 'approve',
      anomalyScore: 0.08
    },
    keyFeatures: [
      'Stage 1: Spend band [min, max] check',
      'Stage 2: Z-Score deviation (< 2.5σ)',
      'Stage 3: Multi-hop cumulative budget check'
    ]
  },
  {
    id: 'facilitator',
    title: '3. Payment Facilitator (GoPlausible)',
    actor: 'facilitator',
    actorLabel: 'x402 Facilitator',
    description: 'Verifies Algorand transaction signature, confirms microAlgo amount, and issues verified payment receipt.',
    latency: '~250ms',
    payload: {
      facilitator: 'https://facilitator.goplausible.xyz',
      network: 'algorand-testnet',
      priceMicroAlgos: 1000,
      verificationStatus: 'CONFIRMED_ROUND_44921028'
    },
    keyFeatures: [
      'Stateless HTTP 402 receipt issuance',
      'Algonode TestNet indexer verification',
      'Ensures no double-spending of payment TxID'
    ]
  },
  {
    id: 'algorand',
    title: '4. Algorand Box Storage',
    actor: 'algorand',
    actorLabel: 'On-Chain Lineage Layer',
    description: 'Writes 64-byte binary record to Algorand Box Storage recording rootTaskId, hopCount, cumulative spend, and decision hash.',
    latency: '3.3s (Block Finality)',
    payload: {
      appId: 73491028,
      boxKey: 'task_cascade_01',
      authorizedBudgetMicroAlgos: 40000000,
      cumulativeSpendMicroAlgos: 10500000,
      hopCount: 1,
      decisionHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    keyFeatures: [
      'AVM 8+ Box Storage allocation',
      'Tamper-evident cryptographic state',
      'Publicly auditable on Lora & Pera Explorer'
    ]
  },
  {
    id: 'vault',
    title: '5. Protected Resource Server',
    actor: 'vault',
    actorLabel: 'Data & Compute Vault',
    description: 'Unlocks protected payload (cloud compute credentials, data streams) upon receipt of valid Sentinel decision.',
    latency: '< 5ms',
    payload: {
      status: 200,
      resourceUnlocked: 'COMPUTE_TOKEN_PROVISIONED',
      ttlSeconds: 3600
    },
    keyFeatures: [
      'Gated by X-402-Payment header',
      'Zero unauthorized data leaks',
      'Atomic settlement delivery'
    ]
  }
];

export const FlowVisualizer: React.FC = () => {
  const t = useTheme();
  const [selectedNode, setSelectedNode] = useState<FlowNode>(FLOW_NODES[1]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="s-panel">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${t.accentCyan}15`, border: `1px solid ${t.accentCyan}35`, color: t.accentCyan }}
          >
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold tracking-tight" style={{ color: t.textPrimary }}>
                Architecture Flow Visualizer
              </h2>
              <span className="badge-live">
                5-Stage Protocol
              </span>
            </div>
            <p className="text-xs font-mono mt-0.5" style={{ color: t.textMuted }}>
              Interactive end-to-end trace of agent payments, policy execution, and Algorand Box Storage
            </p>
          </div>
        </div>
      </div>

      {/* ── Flow Nodes Pipeline (Horizontal Sequence) ──────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
        {FLOW_NODES.map(node => {
          const isSelected = selectedNode.id === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className="p-3.5 rounded-xl border text-left transition-all"
              style={
                isSelected
                  ? {
                      background: `${t.accentCyan}18`,
                      borderColor: t.accentCyan,
                      boxShadow: `0 0 16px ${t.accentCyan}35`,
                    }
                  : {
                      background: t.bgCard,
                      borderColor: t.borderBase,
                    }
              }
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold" style={{ color: t.accentGreen }}>{node.latency}</span>
                <span
                  className="px-1.5 py-0.2 rounded text-[9px] font-bold"
                  style={{
                    background: `${t.accentCyan}15`,
                    color: t.accentCyan,
                    border: `1px solid ${t.accentCyan}30`,
                  }}
                >
                  {node.actor}
                </span>
              </div>
              <p className="text-xs font-bold truncate" style={{ color: t.textPrimary }}>{node.title}</p>
              <p className="text-[10px] truncate mt-0.5" style={{ color: t.textMuted }}>{node.actorLabel}</p>
            </button>
          );
        })}
      </div>

      {/* ── Selected Node Inspector Panel ──────────────────────────── */}
      <div className="s-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 font-mono" style={{ borderBottom: `1px solid ${t.borderBase}` }}>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: t.textPrimary }}>
              <Radio className="w-4 h-4" style={{ color: t.accentCyan }} />
              {selectedNode.title} — Technical Deep Dive
            </h3>
            <p className="text-xs mt-0.5" style={{ color: t.textSecondary }}>{selectedNode.description}</p>
          </div>
          <span
            className="px-3 py-1 rounded text-xs font-mono font-bold flex-shrink-0"
            style={{
              background: `${t.accentCyan}15`,
              color: t.accentCyan,
              border: `1px solid ${t.accentCyan}35`,
            }}
          >
            LATENCY: {selectedNode.latency}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-mono text-xs">
          {/* Key Architectural Features */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>
              Key Protocol Properties
            </h4>
            <div className="space-y-2">
              {selectedNode.keyFeatures.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg"
                  style={{ background: t.bgInput, border: `1px solid ${t.borderBase}` }}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: t.accentGreen }} />
                  <span style={{ color: t.textPrimary }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* JSON Payload Inspection */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>
              Live State Payload
            </h4>
            <div className="s-console max-h-56">
              <pre className="text-[11px] leading-relaxed" style={{ color: t.accentCyan }}>
                {JSON.stringify(selectedNode.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
