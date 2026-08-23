import React, { useState, useEffect, useRef } from 'react';
import { Users, AlertTriangle, ShieldAlert, Activity, Zap, RefreshCw, ExternalLink, Play, ChevronRight } from 'lucide-react';
import { useTheme } from './useTheme';

// ── Fleet agents ─────────────────────────────────────────────────────
interface AgentEvent {
  agentId: string;
  time: number;        // seconds from T=0
  merchant: string;
  amount: number;
  decision: 'approve' | 'block' | 'escalate';
  correlated: boolean;
}

interface FleetAgent {
  id: string;
  label: string;
  operator: string;
  color: string;
  role: string;
  baselineDeviation: number;
}

const AGENTS: FleetAgent[] = [
  { id: 'agent_alpha',   label: 'Alpha',   operator: 'op_sentinel_demo', color: '#38BDF8', role: 'Procurement',  baselineDeviation: 0.12 },
  { id: 'agent_beta',    label: 'Beta',    operator: 'op_sentinel_demo', color: '#10B981', role: 'Data Fetch',   baselineDeviation: 0.08 },
  { id: 'agent_gamma',   label: 'Gamma',   operator: 'op_sentinel_demo', color: '#A78BFA', role: 'Analytics',    baselineDeviation: 0.21 },
  { id: 'agent_delta',   label: 'Delta',   operator: 'op_sentinel_demo', color: '#F59E0B', role: 'Orchestrator', baselineDeviation: 0.15 },
  { id: 'agent_epsilon', label: 'Epsilon', operator: 'op_sentinel_demo', color: '#EF4444', role: 'Reporting',    baselineDeviation: 0.09 },
];

// Normal scenario – agents hitting different merchants
const NORMAL_EVENTS: AgentEvent[] = [
  { agentId: 'agent_alpha',   time: 0,  merchant: 'CloudCompute API',     amount: 10.5, decision: 'approve', correlated: false },
  { agentId: 'agent_beta',    time: 1,  merchant: 'DataIndex Pro',        amount: 8.0,  decision: 'approve', correlated: false },
  { agentId: 'agent_gamma',   time: 2,  merchant: 'AlgoStorage CDN',      amount: 2.0,  decision: 'approve', correlated: false },
  { agentId: 'agent_delta',   time: 3,  merchant: 'CloudCompute API',     amount: 10.5, decision: 'approve', correlated: false },
  { agentId: 'agent_epsilon', time: 4,  merchant: 'ModelHost Legacy',     amount: 5.0,  decision: 'approve', correlated: false },
];

// Attack scenario – 3/5 agents suddenly converge on SAME NEW endpoint after prompt injection
const ATTACK_EVENTS: AgentEvent[] = [
  { agentId: 'agent_alpha',   time: 0, merchant: 'CloudCompute API',     amount: 10.5, decision: 'approve',  correlated: false },
  { agentId: 'agent_beta',    time: 1, merchant: 'DataIndex Pro',        amount: 8.0,  decision: 'approve',  correlated: false },
  { agentId: 'agent_alpha',   time: 4, merchant: '⚠ INJECTED_EP_xyz91', amount: 21.0, decision: 'block',    correlated: true  },
  { agentId: 'agent_gamma',   time: 4, merchant: '⚠ INJECTED_EP_xyz91', amount: 21.0, decision: 'block',    correlated: true  },
  { agentId: 'agent_delta',   time: 5, merchant: '⚠ INJECTED_EP_xyz91', amount: 21.0, decision: 'block',    correlated: true  },
  { agentId: 'agent_beta',    time: 5, merchant: 'DataIndex Pro',        amount: 8.2,  decision: 'approve',  correlated: false },
  { agentId: 'agent_epsilon', time: 6, merchant: 'AlgoStorage CDN',      amount: 2.0,  decision: 'approve',  correlated: false },
];

export const FleetCorrelation: React.FC = () => {
  const t = useTheme();
  const [scenario, setScenario] = useState<'normal' | 'attack'>('normal');
  const [running, setRunning] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<AgentEvent[]>([]);
  const [attackDetected, setAttackDetected] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const events = scenario === 'attack' ? ATTACK_EVENTS : NORMAL_EVENTS;

  const runSimulation = () => {
    setVisibleEvents([]);
    setAttackDetected(false);
    setRunning(true);

    events.forEach((evt, i) => {
      timerRef.current = setTimeout(() => {
        setVisibleEvents(prev => {
          const next = [...prev, evt];
          // Detect correlation: 3+ agents → same merchant in <3s
          const injected = next.filter(e => e.correlated);
          if (injected.length >= 3) setAttackDetected(true);
          return next;
        });
        if (i === events.length - 1) setRunning(false);
      }, evt.time * 800);
    });
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisibleEvents([]);
    setAttackDetected(false);
    setRunning(false);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="s-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${t.accentGreen}15`, border: `1px solid ${t.accentGreen}35`, color: t.accentGreen }}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold tracking-tight" style={{ color: t.textPrimary }}>
                  Cross-Agent Fleet Correlation
                </h2>
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-mono font-bold"
                  style={{ background: `${t.accentGreen}20`, color: t.accentGreen, border: `1px solid ${t.accentGreen}35` }}
                >
                  UNIQUE · COVERS FLEET-WIDE ATTACKS
                </span>
              </div>
              <p className="text-xs font-mono mt-0.5" style={{ color: t.textMuted }}>
                Inspired by Zscaler ThreatLabz (July 2026): prompt injection hitting multiple agents simultaneously.
                Per-agent baselines miss this. Sentinel catches the correlated pattern across the fleet.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario picker + controls */}
      <div className="s-panel py-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => { reset(); setScenario('normal'); }}
            className="px-3 py-1.5 rounded-lg font-bold transition-all"
            style={
              scenario === 'normal'
                ? { background: t.accentGreen, color: '#050810' }
                : { background: t.bgCard, color: t.textMuted, border: `1px solid ${t.borderBase}` }
            }
          >
            Normal Operation
          </button>
          <button
            onClick={() => { reset(); setScenario('attack'); }}
            className="px-3 py-1.5 rounded-lg font-bold transition-all"
            style={
              scenario === 'attack'
                ? { background: t.accentRed, color: '#FFFFFF' }
                : { background: t.bgCard, color: t.textMuted, border: `1px solid ${t.borderBase}` }
            }
          >
            ⚠ Prompt Injection Attack
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="s-btn-ghost text-xs px-2.5 py-1.5" disabled={running}>
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={runSimulation}
            disabled={running}
            className="s-btn text-xs px-3 py-1.5 font-bold"
            style={{ background: t.accentCyan, color: '#050810' }}
          >
            <Play className="w-3.5 h-3.5" /> Run Simulation
          </button>
        </div>
      </div>

      {/* Attack detected banner */}
      {attackDetected && (
        <div
          className="s-panel flex items-center gap-4"
          style={{ borderLeft: `4px solid ${t.accentRed}`, background: `${t.accentRed}10`, borderColor: `${t.accentRed}40` }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse"
            style={{ background: `${t.accentRed}20`, color: t.accentRed }}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: t.accentRed }}>
              🚨 FLEET CORRELATION ATTACK DETECTED
            </p>
            <p className="text-xs font-mono mt-0.5" style={{ color: t.textSecondary }}>
              3 agents (Alpha, Gamma, Delta) suddenly converged on new endpoint <strong>INJECTED_EP_xyz91</strong> within 2 seconds.
              No single agent triggered a standalone block — but the fleet correlation pattern flagged it immediately.
              Sentinel blocked all 3 payments. <strong style={{ color: t.accentRed }}>$63.00 in unauthorized payments prevented.</strong>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Agent Fleet Panel */}
        <div className="lg:col-span-4 s-panel space-y-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-widest" style={{ color: t.textMuted }}>
            Fleet — {AGENTS[0].operator}
          </p>
          {AGENTS.map(agent => {
            const agentEvents = visibleEvents.filter(e => e.agentId === agent.id);
            const isCompromised = agentEvents.some(e => e.correlated);
            return (
              <div
                key={agent.id}
                className="p-3 rounded-xl border flex items-center gap-3 transition-all"
                style={{
                  background: isCompromised ? `${t.accentRed}10` : t.bgInput,
                  borderColor: isCompromised ? `${t.accentRed}50` : t.borderBase,
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black font-mono flex-shrink-0"
                  style={{ background: `${agent.color}25`, color: agent.color, border: `1px solid ${agent.color}45` }}
                >
                  {agent.label[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: isCompromised ? t.accentRed : t.textPrimary }}>
                      {agent.label}
                    </span>
                    {isCompromised && (
                      <span className="text-[9px] font-mono font-bold" style={{ color: t.accentRed }}>COMPROMISED</span>
                    )}
                  </div>
                  <p className="text-[10px] truncate" style={{ color: t.textMuted }}>{agent.role} · Δ {agent.baselineDeviation}</p>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  {agentEvents.slice(-2).map((e, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-mono font-bold px-1.5 rounded"
                      style={{
                        background: e.decision === 'block' ? `${t.accentRed}20` : `${t.accentGreen}20`,
                        color: e.decision === 'block' ? t.accentRed : t.accentGreen,
                      }}
                    >
                      {e.decision.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Event Timeline */}
        <div className="lg:col-span-8 s-panel flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: `1px solid ${t.borderBase}` }}>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: t.accentCyan }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: t.textSecondary }}>
                Real-Time Event Timeline
              </span>
            </div>
            <span className="text-[10px] font-mono" style={{ color: t.textMuted }}>
              {visibleEvents.length} / {events.length} events
            </span>
          </div>

          {visibleEvents.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-10 text-center">
              <div>
                <Zap className="w-8 h-8 mx-auto mb-3" style={{ color: t.textMuted, opacity: 0.4 }} />
                <p className="text-sm" style={{ color: t.textMuted }}>
                  {scenario === 'attack' ? 'Run the simulation to see a prompt-injection fleet attack in action.' : 'Run the simulation to see normal fleet operation.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-80">
              {visibleEvents.map((evt, i) => {
                const agent = AGENTS.find(a => a.id === evt.agentId)!;
                return (
                  <div
                    key={i}
                    className="p-3 rounded-xl border flex items-center gap-3 transition-all"
                    style={{
                      background: evt.correlated ? `${t.accentRed}12` : t.bgInput,
                      borderColor: evt.correlated ? `${t.accentRed}45` : t.borderBase,
                      animation: 'fadeIn 0.3s ease',
                    }}
                  >
                    {evt.correlated && (
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: t.accentRed }} />
                    )}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                      style={{ background: `${agent.color}25`, color: agent.color }}
                    >
                      {agent.label[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold" style={{ color: agent.color }}>{agent.label}</span>
                        <ChevronRight className="w-3 h-3" style={{ color: t.textMuted }} />
                        <span className="text-xs truncate" style={{ color: evt.correlated ? t.accentRed : t.textPrimary }}>{evt.merchant}</span>
                      </div>
                      {evt.correlated && (
                        <p className="text-[10px] font-mono" style={{ color: t.accentRed }}>
                          ⚡ CORRELATED with {visibleEvents.filter(e => e.correlated && e.agentId !== evt.agentId).length} other agent(s) — fleet attack pattern
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-sm font-black font-mono" style={{ color: evt.decision === 'block' ? t.accentRed : t.accentGreen }}>
                        ${evt.amount.toFixed(2)}
                      </span>
                      <span
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: evt.decision === 'block' ? `${t.accentRed}20` : evt.decision === 'escalate' ? `${t.accentAmber}20` : `${t.accentGreen}20`,
                          color: evt.decision === 'block' ? t.accentRed : evt.decision === 'escalate' ? t.accentAmber : t.accentGreen,
                        }}
                      >
                        {evt.decision.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Correlation note */}
          <div
            className="mt-3 pt-3 text-[11px] font-mono"
            style={{ borderTop: `1px solid ${t.borderBase}`, color: t.textMuted }}
          >
            Correlation threshold: ≥3 agents → same new endpoint within 3 seconds.
            Detection is triggered <strong style={{ color: t.textPrimary }}>even if no single agent's per-transaction score exceeds the block threshold</strong>.
          </div>
        </div>

      </div>
    </div>
  );
};
