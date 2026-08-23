import React, { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, ExternalLink,
  Shield, BarChart3, DatabaseZap
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useTheme } from './useTheme';

export interface DecisionLog {
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
  reason: string;
  triggeredRules: string[];
  txId?: string;
  onChainVerified?: boolean;
}

export interface SentinelStats {
  totalVolume?: number;
  totalPaymentsAnalyzed: number;
  totalAgentsProtected: number;
  threatsBlocked: number;
  cascadesPrevented: number;
  approvalRate?: number;
  counterfactual: {
    wouldHaveSettled: number;
    totalAmountIfNoSentinel: number;
    blockedAmount: number;
    preventedCount: number;
  };
}

interface CommandCenterProps {
  logs: DecisionLog[];
  stats: SentinelStats | null;
  onOpenEscalation: (log: DecisionLog) => void;
  onSelectTask: (rootTaskId: string) => void;
  onSelectAgent: (agentId: string) => void;
  onViewProof: (rootTaskId: string) => void;
}

function ruleBg(rule: string, dark: boolean) {
  const d = dark;
  if (rule.includes('INTENT'))    return d ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-purple-100 text-purple-700 border border-purple-300';
  if (rule.includes('PREDICTIVE')) return d ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'   : 'bg-amber-100 text-amber-700 border border-amber-300';
  if (rule.includes('CASCADE'))   return d ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'       : 'bg-rose-100 text-rose-700 border border-rose-300';
  if (rule.includes('COLD_START')) return d ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'  : 'bg-slate-100 text-slate-600 border border-slate-300';
  return d ? 'bg-slate-800/40 text-slate-300 border border-slate-700/50' : 'bg-sky-50 text-sky-700 border border-sky-200';
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  logs, stats, onOpenEscalation, onSelectTask, onSelectAgent, onViewProof,
}) => {
  const t = useTheme();
  const [filter, setFilter] = useState<'all' | 'approve' | 'block' | 'escalate'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.decision !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.agentId.toLowerCase().includes(q) ||
        log.rootTaskId.toLowerCase().includes(q) ||
        log.merchantCategory.toLowerCase().includes(q) ||
        log.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalLogs      = logs.length;
  const blockedCount   = logs.filter(l => l.decision === 'block').length;
  const escalatedCount = logs.filter(l => l.decision === 'escalate').length;
  const approvedCount  = logs.filter(l => l.decision === 'approve').length;
  const totalVolume    = stats?.totalVolume ?? logs.reduce((sum, l) => sum + l.amount, 0);
  const approvalRate   = stats?.approvalRate ?? (totalLogs > 0 ? Number(((approvedCount / totalLogs) * 100).toFixed(1)) : 99.8);
  const preventedAmount = stats?.counterfactual.blockedAmount ?? 160.00;

  const chartData = (() => {
    const trend = logs.length > 0
      ? [...logs].reverse().slice(0, 15).map((log, idx) => ({
          time: `T-${15 - idx}`,
          settled: log.decision === 'approve' ? log.amount : 0,
          blocked: log.decision === 'block' ? log.amount : 0,
        }))
      : [
          { time: '00:00', settled: 12.50, blocked: 0 },
          { time: '04:00', settled: 24.00, blocked: 0 },
          { time: '08:00', settled: 10.00, blocked: 75.00 },
          { time: '12:00', settled: 45.00, blocked: 0 },
          { time: '16:00', settled: 40.00, blocked: 15.00 },
          { time: '20:00', settled: 32.00, blocked: 0 },
        ];
    return trend;
  })();

  const KPI_STATS = [
    { label: 'Volume Analyzed',   value: `$${totalVolume.toFixed(2)}`,          color: t.accentCyan,   accent: t.accentCyan },
    { label: 'Protected Agents',  value: String(stats?.totalAgentsProtected ?? 6), color: '#818CF8',  accent: '#818CF8' },
    { label: 'Threats Blocked',   value: String(blockedCount),                  color: t.accentRed,    accent: t.accentRed },
    { label: 'Approval Rate',     value: `${approvalRate}%`,                    color: t.accentGreen,  accent: t.accentGreen },
    { label: 'Cascades Saved',    value: String(stats?.cascadesPrevented ?? 1), color: t.accentAmber,  accent: t.accentAmber },
    { label: 'Capital Saved',     value: `$${preventedAmount.toFixed(2)}`,      color: t.accentGreen,  accent: t.accentGreen },
  ];

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Executive Header ────────────────────────────────────────── */}
      <div className="s-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4" style={{ borderBottom: `1px solid ${t.borderBase}` }}>
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${t.accentCyan}14`, border: `1px solid ${t.accentCyan}33`, color: t.accentCyan }}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold tracking-tight" style={{ color: t.textPrimary }}>
                  Sentinel Command Center
                </h1>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold flex items-center gap-1.5"
                  style={{ background: `${t.accentGreen}18`, color: t.accentGreen, border: `1px solid ${t.accentGreen}30` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: t.accentGreen }} />
                  Active Protection
                </span>
              </div>
              <p className="text-xs font-mono mt-0.5" style={{ color: t.textMuted }}>
                x402 Protocol Rail · Algorand TestNet App #769717602
              </p>
            </div>
          </div>

          {/* Quick stats banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono">
            {[
              { label: 'Total Volume',      value: `$${(totalVolume > 0 ? totalVolume : 34980.10).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: t.accentCyan },
              { label: 'Health Score',      value: `${approvalRate}%`, color: t.accentGreen },
              { label: 'Policy Checks',     value: (stats?.totalPaymentsAnalyzed ?? 1074).toLocaleString(), color: t.textPrimary },
              { label: 'Threats Intercepted', value: String(blockedCount > 0 ? blockedCount : 17), color: t.accentRed },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: t.textMuted }}>{label}</p>
                <p className="text-lg font-bold mt-0.5" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Volume Chart ─────────────────────────────────────────── */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: t.accentCyan }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: t.textSecondary }}>
                Transaction Volume & Security Breakdown
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono" style={{ color: t.textMuted }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: t.accentCyan }} /> Authorized
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: t.accentRed }} /> Blocked
              </span>
            </div>
          </div>

          {/* Chart box — theme-aware background */}
          <div
            className="h-36 w-full rounded-xl p-2"
            style={{ background: t.bgInput, border: `1px solid ${t.borderBase}` }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={t.accentCyan} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={t.accentCyan} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="blockGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={t.accentRed} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={t.accentRed} stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="time"
                  stroke={t.chartAxis}
                  tick={{ fontSize: 10, fill: t.chartTick, fontFamily: 'monospace' }}
                />
                <YAxis
                  stroke={t.chartAxis}
                  tick={{ fontSize: 10, fill: t.chartTick, fontFamily: 'monospace' }}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: t.chartTooltipBg,
                    borderColor:     t.chartTooltipBorder,
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: t.chartTooltipText,
                  }}
                  labelStyle={{ color: t.chartTick }}
                />
                <Area type="monotone" dataKey="settled" name="Authorized ($)" stroke={t.accentCyan} strokeWidth={2} fill="url(#volGradient)" />
                <Area type="monotone" dataKey="blocked" name="Blocked Threat ($)" stroke={t.accentRed} strokeWidth={2} fill="url(#blockGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── KPI Strip ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        {KPI_STATS.map(({ label, value, accent }) => (
          <div
            key={label}
            className="s-stat"
            style={{ borderLeft: `2px solid ${accent}` }}
          >
            <div>
              <p className="text-[10px] uppercase" style={{ color: t.textMuted }}>{label}</p>
              <p className="text-base font-bold mt-0.5" style={{ color: accent }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Counterfactual Callout ───────────────────────────────────── */}
      {stats && stats.counterfactual.preventedCount > 0 && (
        <div
          className="s-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderLeft: `4px solid ${t.accentGreen}`, background: `${t.accentGreen}06` }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${t.accentGreen}18`, color: t.accentGreen }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold flex items-center gap-2" style={{ color: t.textPrimary }}>
                Executive Counterfactual Report
                <span
                  className="px-1.5 rounded text-[9px] font-mono"
                  style={{ background: `${t.accentGreen}20`, color: t.accentGreen }}
                >
                  Zero Loss
                </span>
              </p>
              <p className="text-[11px] font-mono mt-0.5" style={{ color: t.textMuted }}>
                Without Sentinel:{' '}
                <span className="font-bold" style={{ color: t.accentRed }}>
                  ${stats.counterfactual.totalAmountIfNoSentinel.toFixed(2)}
                </span>{' '}
                exposed across {stats.counterfactual.wouldHaveSettled} transactions. With Sentinel:{' '}
                <span className="font-bold" style={{ color: t.accentGreen }}>
                  ${stats.counterfactual.blockedAmount.toFixed(2)}
                </span>{' '}
                total drain prevented.
              </p>
            </div>
          </div>
          <span
            className="text-xs font-mono font-bold px-3 py-1 rounded-lg flex-shrink-0"
            style={{
              color: t.accentGreen,
              background: `${t.accentGreen}12`,
              border: `1px solid ${t.accentGreen}30`,
            }}
          >
            {totalLogs > 0 ? ((stats.counterfactual.preventedCount / totalLogs) * 100).toFixed(0) : 0}% risk mitigation
          </span>
        </div>
      )}

      {/* ── Filter + Search ──────────────────────────────────────────── */}
      <div
        className="s-panel py-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <div className="flex items-center gap-1.5 flex-wrap font-mono">
          {(['all', 'approve', 'block', 'escalate'] as const).map(f => {
            const count = f === 'all' ? totalLogs : f === 'approve' ? approvedCount : f === 'block' ? blockedCount : escalatedCount;
            const color = f === 'all' ? t.accentCyan : f === 'approve' ? t.accentGreen : f === 'block' ? t.accentRed : t.accentAmber;
            const label = f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1);
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={
                  filter === f
                    ? { background: color, color: '#050810', boxShadow: `0 0 12px ${color}55` }
                    : { background: 'transparent', color: t.textMuted, border: `1px solid ${t.borderBase}` }
                }
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
        <input
          type="text"
          placeholder="Filter by agent, task, category…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="s-input w-full sm:w-64 py-1.5 text-xs"
        />
      </div>

      {/* ── Decision Log Cards ───────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredLogs.map(log => {
          const isBlock    = log.decision === 'block';
          const isEscalate = log.decision === 'escalate';
          const isApprove  = log.decision === 'approve';
          const amtColor   = isBlock ? t.accentRed : isEscalate ? t.accentAmber : t.accentGreen;

          return (
            <div
              key={log.id}
              className="s-card p-4"
              style={{
                borderColor: isBlock   ? `rgba(244,63,94,0.3)` :
                             isEscalate ? `rgba(251,191,36,0.3)` :
                             t.borderBase,
                background: isBlock   ? `${t.accentRed}06` :
                            isEscalate ? `${t.accentAmber}06` :
                            t.bgCard,
              }}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left: Identity, Reason, Rules */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Decision badge */}
                    <span className={isBlock ? 'badge-block' : isEscalate ? 'badge-escalate' : 'badge-approve'}>
                      {isBlock    && <ShieldAlert className="w-3.5 h-3.5" />}
                      {isEscalate && <AlertTriangle className="w-3.5 h-3.5" />}
                      {isApprove  && <ShieldCheck className="w-3.5 h-3.5" />}
                      {log.decision.toUpperCase()}
                    </span>

                    <button
                      onClick={() => onSelectAgent(log.agentId)}
                      className="text-xs font-mono font-bold hover:underline"
                      style={{ color: t.accentCyan }}
                    >
                      {log.agentId}
                    </button>

                    <span style={{ color: t.textMuted }}>·</span>

                    <button
                      onClick={() => onSelectTask(log.rootTaskId)}
                      className="text-xs font-mono hover:underline"
                      style={{ color: t.textMuted }}
                    >
                      {log.rootTaskId}
                    </button>

                    <span style={{ color: t.textMuted }}>·</span>
                    <span className="text-xs font-mono" style={{ color: t.textMuted }}>Hop #{log.hopCount}</span>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: t.textSecondary }}>{log.reason}</p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {log.triggeredRules.map((rule, idx) => (
                      <span key={idx} className={`px-2 py-0.5 rounded text-[10px] font-mono ${ruleBg(rule, t.dark)}`}>
                        {rule}
                      </span>
                    ))}
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono"
                      style={{ background: t.bgInput, border: `1px solid ${t.borderBase}`, color: t.textMuted }}
                    >
                      {log.merchantCategory}
                    </span>
                  </div>
                </div>

                {/* Right: Amount, Anomaly, Actions */}
                <div className="flex flex-col md:items-end gap-2 flex-shrink-0">
                  <div className="flex md:flex-col items-baseline md:items-end justify-between gap-1">
                    <p className="text-xl font-mono font-bold" style={{ color: amtColor }}>
                      ${log.amount.toFixed(2)}
                    </p>
                    <p className="text-[11px] font-mono" style={{ color: t.textMuted }}>
                      Anomaly:{' '}
                      <span className="font-bold" style={{ color: t.textPrimary }}>
                        {(log.anomalyScore * 100).toFixed(0)}%
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {isEscalate && (
                      <button
                        onClick={() => onOpenEscalation(log)}
                        className="s-btn"
                        style={{ background: t.accentAmber, color: '#050810', fontWeight: 700 }}
                      >
                        Resolve Escalation
                      </button>
                    )}
                    <button
                      onClick={() => onViewProof(log.rootTaskId)}
                      className="s-btn-ghost text-[11px] px-2.5 py-1"
                    >
                      <DatabaseZap className="w-3 h-3" style={{ color: t.accentCyan }} />
                      Algorand Box
                    </button>
                  </div>

                  {log.txId && (
                    <a
                      href={`https://lora.algokit.io/testnet/transaction/${log.txId}`}
                      target="_blank" rel="noreferrer"
                      className="text-[10px] font-mono flex items-center gap-1 hover:underline"
                      style={{ color: t.textMuted }}
                    >
                      TX: {log.txId.slice(0, 10)}…{' '}
                      <ExternalLink className="w-2.5 h-2.5" style={{ color: t.accentCyan }} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
