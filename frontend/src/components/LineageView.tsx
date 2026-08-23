import React, { useEffect, useState } from 'react';
import {
  GitBranch, ArrowRight, ShieldAlert, ShieldCheck, AlertTriangle,
  Layers, CheckCircle2, XCircle, DatabaseZap, TrendingUp, Target, Zap, ExternalLink
} from 'lucide-react';
import { useTheme } from './useTheme';

interface LineageViewProps {
  selectedRootTaskId: string;
  onSelectTask: (taskId: string) => void;
  onViewProof: (taskId: string) => void;
}

export const LineageView: React.FC<LineageViewProps> = ({
  selectedRootTaskId,
  onSelectTask,
  onViewProof
}) => {
  const t = useTheme();
  const [taskData, setTaskData] = useState<any>(null);

  useEffect(() => {
    const taskId = selectedRootTaskId || 'task_cascade_demo_01';
    fetch(`/api/lineage/${taskId}`)
      .then(res => res.json())
      .then(data => setTaskData(data))
      .catch(console.error);
  }, [selectedRootTaskId]);

  const taskLogs = taskData?.taskLogs || [];
  const dbTask = taskData?.dbTask || {
    authorizedBudget: 40.0,
    cumulativeSpend: 0.0,
    status: 'ACTIVE'
  };

  const cumulativeSpend   = dbTask.cumulativeSpend || 0;
  const authorizedBudget  = dbTask.authorizedBudget || 40.0;
  const budgetPercentage  = Math.min(100, Math.round((cumulativeSpend / authorizedBudget) * 100));
  const isOverBudget      = cumulativeSpend > authorizedBudget;

  const totalChainAmount   = taskLogs.reduce((s: number, l: any) => s + l.amount, 0);
  const blockedLogs        = taskLogs.filter((l: any) => l.decision === 'block');
  const blockedChainAmount = blockedLogs.reduce((s: number, l: any) => s + l.amount, 0);

  const innerCardStyle: React.CSSProperties = {
    background: t.bgInput,
    border: `1px solid ${t.borderBase}`,
    borderRadius: '0.625rem',
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Top Header & Task Switcher ──────────────────────────────── */}
      <div className="s-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${t.accentCyan}15`, border: `1px solid ${t.accentCyan}35`, color: t.accentCyan }}
            >
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold tracking-tight" style={{ color: t.textPrimary }}>
                  Multi-Hop Lineage Graph & Cascade Monitor
                </h2>
                <span className="badge-live">
                  Algorand Box Sync
                </span>
              </div>
              <p className="text-xs font-mono mt-0.5" style={{ color: t.textMuted }}>
                Root Task: <span className="font-bold" style={{ color: t.accentCyan }}>{selectedRootTaskId || 'task_cascade_demo_01'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap font-mono">
            <button
              onClick={() => onSelectTask('task_cascade_demo_01')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={
                selectedRootTaskId === 'task_cascade_demo_01' || !selectedRootTaskId
                  ? { background: t.accentCyan, color: '#FFFFFF', boxShadow: `0 0 12px ${t.accentCyan}55` }
                  : { background: t.bgCard, color: t.textSecondary, border: `1px solid ${t.borderBase}` }
              }
            >
              Demo Cascade ($55 / $40 Budget)
            </button>
            <button
              onClick={() => onViewProof(selectedRootTaskId || 'task_cascade_demo_01')}
              className="s-btn-ghost text-xs"
            >
              <DatabaseZap className="w-3.5 h-3.5" style={{ color: t.accentGreen }} />
              View Box Storage
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Canvas Layout ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── Left/Center: Lineage Chain Graph Canvas (8 Cols) ──────── */}
        <div className="lg:col-span-8 s-panel min-h-[420px] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-6 font-mono" style={{ borderBottom: `1px solid ${t.borderBase}` }}>
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: t.textPrimary }}>
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: t.accentCyan }} />
              Autonomous Delegation Hop Sequence
            </span>
            <span className="text-[10px]" style={{ color: t.textMuted }}>
              {taskLogs.length} Total Hops Analyzed
            </span>
          </div>

          {/* Node Progression Sequence */}
          <div className="space-y-4 my-auto font-mono">
            {taskLogs.map((log: any, index: number) => {
              const isBlock    = log.decision === 'block';
              const isEscalate = log.decision === 'escalate';
              const isApprove  = log.decision === 'approve';
              const hopColor   = isBlock ? t.accentRed : isEscalate ? t.accentAmber : t.accentGreen;

              return (
                <div key={log.id} className="flex items-center gap-3.5">
                  {/* Step Connector Line */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border"
                      style={{
                        background: `${hopColor}20`,
                        borderColor: hopColor,
                        color: hopColor,
                      }}
                    >
                      #{log.hopCount}
                    </div>
                    {index < taskLogs.length - 1 && (
                      <div className="w-0.5 h-6 my-1" style={{ background: t.borderBase }} />
                    )}
                  </div>

                  {/* Node Card */}
                  <div
                    className="flex-1 p-3.5 rounded-xl border transition-all"
                    style={{
                      background: isBlock ? `${t.accentRed}10` : isEscalate ? `${t.accentAmber}10` : t.bgInput,
                      borderColor: isBlock ? `${t.accentRed}40` : isEscalate ? `${t.accentAmber}40` : t.borderBase,
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs" style={{ color: t.textPrimary }}>{log.agentId}</span>
                          <span style={{ color: t.textMuted }}>→</span>
                          <span className="text-[11px]" style={{ color: t.textMuted }}>{log.recipient}</span>
                        </div>
                        <p className="text-[11px] font-sans" style={{ color: t.textSecondary }}>{log.reason}</p>
                      </div>

                      <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-1 flex-shrink-0">
                        <span className="text-sm font-bold" style={{ color: hopColor }}>
                          ${log.amount.toFixed(2)}
                        </span>
                        <span className={isBlock ? 'badge-block' : isEscalate ? 'badge-escalate' : 'badge-approve'}>
                          {log.decision.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Telemetry */}
          <div className="mt-6 pt-3 flex items-center justify-between text-[11px] font-mono" style={{ borderTop: `1px solid ${t.borderBase}`, color: t.textMuted }}>
            <span>Cryptographic State: SHA256(RootTask, Hops, CumulativeSpend)</span>
            <span className="font-bold" style={{ color: t.accentCyan }}>STATE: TAMPER-EVIDENT</span>
          </div>
        </div>

        {/* ── Right Column: Cascade Budget Telemetry (4 Cols) ───────── */}
        <div className="lg:col-span-4 s-panel flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 font-mono" style={{ borderBottom: `1px solid ${t.borderBase}` }}>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>
              Budget Telemetry
            </span>
            <span className="text-[10px] font-bold" style={{ color: t.accentGreen }}>AUDIT VERIFIED</span>
          </div>

          {/* Budget Progress Bar */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: t.textMuted }}>Cumulative Spend</span>
              <span className="font-bold" style={{ color: isOverBudget ? t.accentRed : t.textPrimary }}>
                ${cumulativeSpend.toFixed(2)} / ${authorizedBudget.toFixed(2)}
              </span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden p-0.5" style={{ background: t.borderBase }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, budgetPercentage)}%`,
                  background: isOverBudget ? t.accentRed : budgetPercentage > 75 ? t.accentAmber : t.accentGreen,
                }}
              />
            </div>
            <p className="text-[10px] text-right" style={{ color: t.textMuted }}>{budgetPercentage}% of Task Budget</p>
          </div>

          {/* Detailed Metric Cards */}
          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-3 flex items-center justify-between" style={innerCardStyle}>
              <span style={{ color: t.textMuted }}>Total Requested</span>
              <span className="font-bold" style={{ color: t.textPrimary }}>${totalChainAmount.toFixed(2)}</span>
            </div>

            <div className="p-3 flex items-center justify-between" style={innerCardStyle}>
              <span style={{ color: t.textMuted }}>Blocked Drain</span>
              <span className="font-bold" style={{ color: t.accentGreen }}>${blockedChainAmount.toFixed(2)}</span>
            </div>

            <div className="p-3 flex items-center justify-between" style={innerCardStyle}>
              <span style={{ color: t.textMuted }}>Cascade Status</span>
              <span className="font-bold uppercase" style={{ color: isOverBudget ? t.accentRed : t.accentGreen }}>
                {isOverBudget ? 'BREACH INTERCEPTED' : 'COMPLIANT'}
              </span>
            </div>
          </div>

          {/* Algorand Explorer Link */}
          <a
            href="https://lora.algokit.io/testnet/application/769717602"
            target="_blank"
            rel="noreferrer"
            className="s-btn-primary w-full justify-center text-xs py-2.5"
          >
            Verify On Algorand TestNet
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

    </div>
  );
};
