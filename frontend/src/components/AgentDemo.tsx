import React, { useState } from 'react';
import {
  Bot, Play, CheckCircle2, XCircle, AlertTriangle, ArrowRight,
  RefreshCw, Layers, ShieldAlert, ShieldCheck, Zap
} from 'lucide-react';

interface AgentDemoProps {
  onDemoComplete?: () => void;
  onSelectTask?: (taskId: string) => void;
}

const DEMO_STEPS = [
  {
    step: 1,
    agentId: 'agent_alpha_procure',
    name: 'Agent Alpha (Procurement)',
    category: 'api_compute',
    amount: 10.00,
    budget: 40.00,
    expected: 'approve',
    description: 'Procures cloud compute resource API token for sub-task #1',
  },
  {
    step: 2,
    agentId: 'agent_beta_data',
    name: 'Agent Beta (Data Pipeline)',
    category: 'analytics_query',
    amount: 12.00,
    budget: 40.00,
    expected: 'approve',
    description: 'Queries indexer database for processed telemetry records',
  },
  {
    step: 3,
    agentId: 'agent_alpha_procure',
    name: 'Agent Alpha (Procurement)',
    category: 'cloud_hosting',
    amount: 85.00,
    budget: 40.00,
    expected: 'block',
    description: 'Attempts sudden $85.00 spike — outside historical $8.50–$12.50 spend band',
  },
  {
    step: 4,
    agentId: 'agent_delta_untrusted',
    name: 'Agent Delta (Arbitrage)',
    category: 'arbitrage_execution',
    amount: 25.00,
    budget: 40.00,
    expected: 'block',
    description: 'Attempts delegated hop exceeding authorized $40.00 task budget',
  },
];

export const AgentDemo: React.FC<AgentDemoProps> = ({ onDemoComplete, onSelectTask }) => {
  const [running,          setRunning]          = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [demoResult,       setDemoResult]       = useState<any[] | null>(null);

  const executeDemo = async () => {
    setRunning(true);
    setDemoResult([]);
    const results: any[] = [];

    for (let i = 0; i < DEMO_STEPS.length; i++) {
      setCurrentStepIndex(i);
      const step = DEMO_STEPS[i];
      try {
        const res = await fetch('/api/policy/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: step.agentId,
            amount: step.amount,
            merchantCategory: step.category,
            rootTaskId: 'task_demo_sequence',
            hopCount: i + 1,
            authorizedBudget: step.budget,
            taskDescription: step.description,
          }),
        });
        const data = await res.json();
        results.push({ ...step, result: data });
      } catch {
        results.push({ ...step, result: { decision: 'error' } });
      }
      setDemoResult([...results]);
      await new Promise(r => setTimeout(r, 700));
    }

    setRunning(false);
    setCurrentStepIndex(-1);
    if (onDemoComplete) onDemoComplete();
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="s-panel">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Bot className="w-5 h-5" style={{ color: 'var(--accent-cyan)' }} />
              <h1
                className="text-base font-extrabold font-mono tracking-widest"
                style={{ color: 'var(--text-primary)' }}
              >
                AUTONOMOUS AGENT DEMO FLOW
              </h1>
              <span className="badge-live">4-Step Suite</span>
            </div>
            <p className="text-xs font-mono mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Simulate multi-agent cascade delegation, anomaly spike interception, and budget guardrails
            </p>
          </div>

          <button
            onClick={executeDemo}
            disabled={running}
            className="s-btn-primary disabled:opacity-60"
          >
            <Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Running…' : 'Run Autonomous Suite'}
          </button>
        </div>
      </div>

      {/* ── Step Cards ─────────────────────────────────────────────── */}
      <div className="space-y-3 font-mono">
        {DEMO_STEPS.map((step, idx) => {
          const res       = demoResult?.[idx];
          const isCurrent = currentStepIndex === idx && running;
          const decision  = res?.result?.decision;

          const isApprove = decision === 'approve' || decision === 'escalate';
          const isBlock   = decision === 'block';
          const isError   = decision === 'error';

          let borderColor = 'var(--border-base)';
          let bg          = 'var(--bg-card)';

          if (isCurrent) {
            borderColor = 'var(--accent-cyan)';
            bg          = 'rgba(34,211,238,0.06)';
          } else if (isBlock || isError) {
            borderColor = 'rgba(244,63,94,0.4)';
            bg          = 'rgba(244,63,94,0.04)';
          } else if (isApprove) {
            borderColor = 'rgba(16,185,129,0.4)';
            bg          = 'rgba(16,185,129,0.04)';
          }

          return (
            <div
              key={step.step}
              className="p-4 rounded-xl border transition-all"
              style={{ background: bg, borderColor, boxShadow: isCurrent ? `0 0 18px rgba(34,211,238,0.12)` : undefined }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs font-bold"
                      style={{ color: isCurrent ? 'var(--accent-cyan)' : 'var(--text-primary)' }}
                    >
                      Step #{step.step}: {step.name}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      ({step.category})
                    </span>
                    {isCurrent && (
                      <span
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ background: 'var(--accent-cyan)' }}
                      />
                    )}
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {step.description}
                  </p>
                </div>

                {/* Right: Amount + Decision */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Requested</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      ${step.amount.toFixed(2)}
                    </p>
                  </div>

                  {res ? (
                    <span className={isBlock || isError ? 'badge-block' : 'badge-approve'}>
                      {(decision || 'error').toUpperCase()}
                    </span>
                  ) : (
                    <span className="badge-neutral">
                      {isCurrent ? 'EVALUATING' : 'PENDING'}
                    </span>
                  )}
                </div>
              </div>

              {/* Reason (if result) */}
              {res?.result?.reason && (
                <div
                  className="mt-2.5 pt-2 text-[11px]"
                  style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
                >
                  <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>Reason: </span>
                  {res.result.reason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Summary (if done) ──────────────────────────────────────── */}
      {demoResult && !running && demoResult.length === DEMO_STEPS.length && (
        <div
          className="s-panel flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'rgba(16,185,129,0.3)' }}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
            <div>
              <p className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Demo Suite Complete
              </p>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {demoResult.filter(r => r.result?.decision === 'approve').length} approved ·{' '}
                {demoResult.filter(r => r.result?.decision === 'block').length} blocked ·{' '}
                cascade prevention demonstrated
              </p>
            </div>
          </div>
          {onSelectTask && (
            <button
              onClick={() => onSelectTask('task_demo_sequence')}
              className="s-btn-ghost"
            >
              View Lineage Graph <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
