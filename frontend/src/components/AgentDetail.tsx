import React, { useState } from 'react';
import {
  Activity, ArrowLeft, Dna,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Line
} from 'recharts';
import { useTheme } from './useTheme';

interface AgentDetailProps {
  agents: any[];
  selectedAgentId: string;
  onSelectAgent: (agentId: string) => void;
  onBack: () => void;
}

export const AgentDetail: React.FC<AgentDetailProps> = ({
  agents, selectedAgentId, onSelectAgent, onBack,
}) => {
  const t = useTheme();

  const currentAgentObj = agents.find(a => a.agentId === selectedAgentId) || agents[0];
  const baseline = currentAgentObj?.baseline || {
    meanAmount: 10.50,
    stddevAmount: 1.14,
    minAmount: 8.50,
    maxAmount: 12.50,
    sampleCount: 18,
    historicalCategories: ['cloud_hosting', 'api_compute'],
    callsPerHourAvg: 1,
  };

  const minRange = baseline.minAmount ?? Math.max(0.5, Number((baseline.meanAmount - 2 * baseline.stddevAmount).toFixed(2)));
  const maxRange = baseline.maxAmount ?? Number((baseline.meanAmount + 2.5 * baseline.stddevAmount).toFixed(2));

  const [history, setHistory] = useState<any[]>([]);

  React.useEffect(() => {
    if (currentAgentObj) {
      fetch(`/api/agent/${currentAgentObj.agentId}`)
        .then(res => res.json())
        .then(data => { if (data.history) setHistory(data.history); })
        .catch(console.error);
    }
  }, [currentAgentObj]);

  const chartData = history.map((item, index) => ({
    step: `#${index + 1}`,
    amount: item.amount,
    mean: baseline.meanAmount,
    bandMin: minRange,
    bandMax: maxRange,
    decision: item.decision,
  }));

  const recentHistory = history.slice(0, 8).reverse();
  const avgRecentAmount = recentHistory.length > 0
    ? recentHistory.reduce((sum, i) => sum + i.amount, 0) / recentHistory.length
    : baseline.meanAmount;

  const driftPct    = baseline.meanAmount > 0 ? ((avgRecentAmount - baseline.meanAmount) / baseline.meanAmount) * 100 : 0;
  const anomalyScore = Math.min(100, Math.max(0, Math.round(Math.abs(driftPct) * 1.5)));
  const healthScore  = Math.max(0, 100 - anomalyScore);

  const radius       = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;
  const gaugeColor   = healthScore > 70 ? t.accentGreen : healthScore > 40 ? t.accentAmber : t.accentRed;

  // ── Shared card/input style helper ─────────────────────────────────────────
  const innerCard: React.CSSProperties = {
    background: t.bgInput,
    border: `1px solid ${t.borderBase}`,
    borderRadius: '0.625rem',
    padding: '0.625rem',
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header & Agent Selector ──────────────────────────────────── */}
      <div className="s-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${t.accentCyan}14`, border: `1px solid ${t.accentCyan}33`, color: t.accentCyan }}
            >
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold tracking-tight" style={{ color: t.textPrimary }}>
                  Agent Behavioral Baseline & Spend Profile
                </h2>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
                  style={{ background: `${t.accentGreen}18`, color: t.accentGreen, border: `1px solid ${t.accentGreen}30` }}
                >
                  EWMA Engine (α=0.15)
                </span>
              </div>
              <p className="text-xs font-mono mt-0.5" style={{ color: t.textMuted }}>
                Statistical spend tolerance corridor, standard deviation (σ), and anomaly drift tracking
              </p>
            </div>
          </div>

          {/* Agent Selector */}
          <div className="flex items-center gap-2 font-mono flex-shrink-0">
            <span className="text-xs" style={{ color: t.textMuted }}>SELECT AGENT:</span>
            <select
              value={selectedAgentId}
              onChange={e => onSelectAgent(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg focus:outline-none"
              style={{
                background: t.bgInput,
                border: `1px solid ${t.borderBase}`,
                color: t.accentCyan,
              }}
            >
              {agents.map(a => (
                <option key={a.agentId} value={a.agentId} style={{ background: t.bgCard, color: t.textPrimary }}>
                  {a.name || a.agentId} ({a.agentId})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 3-Column Layout ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── Left: Health Gauge ──────────────────────────────────────── */}
        <div className="lg:col-span-3 s-panel flex flex-col items-center justify-center text-center space-y-4">
          {/* Column header */}
          <div className="w-full flex items-center justify-between pb-2" style={{ borderBottom: `1px solid ${t.borderBase}` }}>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>
              Profile Health Index
            </span>
            <span className="text-[10px] font-mono" style={{ color: t.accentGreen }}>NORMALIZED</span>
          </div>

          {/* SVG Ring Gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64" cy="64" r={radius}
                stroke={t.borderBase} strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="64" cy="64" r={radius}
                stroke={gaugeColor} strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" fill="transparent"
                style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-mono font-bold" style={{ color: t.textPrimary }}>
                {healthScore}%
              </span>
              <span className="text-[9px] font-mono uppercase" style={{ color: gaugeColor }}>
                {healthScore > 70 ? 'STABLE' : healthScore > 40 ? 'DRIFTING' : 'FLAGGED'}
              </span>
            </div>
          </div>

          {/* Sub-metrics */}
          <div className="w-full grid grid-cols-2 gap-2 pt-2 font-mono text-xs" style={{ borderTop: `1px solid ${t.borderBase}` }}>
            <div style={innerCard}>
              <p className="text-[9px] uppercase" style={{ color: t.textMuted }}>Risk Index</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: t.accentCyan }}>{(anomalyScore / 100).toFixed(2)}</p>
            </div>
            <div style={innerCard}>
              <p className="text-[9px] uppercase" style={{ color: t.textMuted }}>Z-Score</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: t.textPrimary }}>{(Math.abs(driftPct) / 30).toFixed(1)}σ</p>
            </div>
          </div>

          <div className="w-full text-left text-[11px] font-mono" style={{ ...innerCard, color: t.textMuted }}>
            <span className="font-bold" style={{ color: t.textPrimary }}>Categories: </span>
            {baseline.historicalCategories.join(', ')}
          </div>
        </div>

        {/* ── Center: Spend Band Corridor Chart ───────────────────────── */}
        <div className="lg:col-span-6 s-panel flex flex-col justify-between space-y-4">
          {/* Chart header */}
          <div className="flex items-center justify-between pb-2" style={{ borderBottom: `1px solid ${t.borderBase}` }}>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: t.accentCyan }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: t.textPrimary }}>
                Historical Spend Band Corridor
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: t.textMuted }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2 rounded-sm" style={{ background: `${t.accentGreen}44` }} />
                Tolerance Corridor
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5" style={{ background: t.accentCyan }} />
                Actual Spend
              </span>
            </div>
          </div>

          {/* Recharts Area Chart — fully theme-aware */}
          <div
            className="h-64 w-full rounded-xl p-2"
            style={{ background: t.bgInput, border: `1px solid ${t.borderBase}` }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={t.accentGreen} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={t.accentGreen} stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="step"
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

                {/* Tolerance band fill */}
                <Area type="monotone" dataKey="bandMax" stroke="transparent" fill="url(#bandGradient)" />

                {/* Mean dashed line — must use Line from recharts, but Area supports it via extra Area */}
                <Area
                  type="monotone" dataKey="mean"
                  stroke={t.textMuted} strokeDasharray="4 4" strokeWidth={1}
                  fill="none" dot={false}
                />

                {/* Actual spend line */}
                <Area
                  type="monotone" dataKey="amount"
                  stroke={t.accentCyan} strokeWidth={2.5}
                  fill="none"
                  dot={{ fill: t.accentCyan, r: 3 }}
                  activeDot={{ r: 5, fill: t.accentCyan }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Corridor Readouts */}
          <div className="grid grid-cols-3 gap-3 font-mono text-center">
            <div style={innerCard}>
              <p className="text-[9px] uppercase" style={{ color: t.textMuted }}>Corridor Floor</p>
              <p className="text-xs font-bold mt-0.5" style={{ color: t.accentGreen }}>${minRange.toFixed(2)}</p>
            </div>
            <div style={innerCard}>
              <p className="text-[9px] uppercase" style={{ color: t.textMuted }}>EWMA Median (μ)</p>
              <p className="text-xs font-bold mt-0.5" style={{ color: t.textPrimary }}>${baseline.meanAmount.toFixed(2)}</p>
            </div>
            <div style={innerCard}>
              <p className="text-[9px] uppercase" style={{ color: t.textMuted }}>Tolerance Cap</p>
              <p className="text-xs font-bold mt-0.5" style={{ color: t.accentAmber }}>${maxRange.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* ── Right: Telemetry Parameters ─────────────────────────────── */}
        <div className="lg:col-span-3 s-panel flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2" style={{ borderBottom: `1px solid ${t.borderBase}` }}>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>
              Telemetry Parameters
            </span>
            <span className="text-[10px] font-mono" style={{ color: t.accentCyan }}>ACTIVE METRICS</span>
          </div>

          <div className="space-y-2.5 font-mono">
            {[
              { label: 'Sample Depth',          value: `${baseline.sampleCount} txns`,          color: t.textPrimary },
              { label: 'Standard Deviation (σ)', value: `±$${baseline.stddevAmount.toFixed(2)}`, color: t.textPrimary },
              { label: 'Request Cadence',        value: `${baseline.callsPerHourAvg || 1} req / hr`, color: t.accentGreen },
              {
                label: 'Recent Variance',
                value: driftPct > 0 ? `+${driftPct.toFixed(1)}%` : `${driftPct.toFixed(1)}%`,
                color: Math.abs(driftPct) > 20 ? t.accentRed : t.accentGreen,
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="flex items-center justify-between p-2.5 rounded-lg"
                style={innerCard}
              >
                <span className="text-[11px]" style={{ color: t.textMuted }}>{label}</span>
                <span className="text-xs font-bold" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Drift Tolerance Progress Bar */}
          <div className="p-3 rounded-lg space-y-2" style={innerCard}>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span style={{ color: t.textMuted }}>DRIFT TOLERANCE</span>
              <span style={{ color: t.accentGreen }}>2.5σ Limit</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: t.borderBase }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.max(5, Math.abs(driftPct)))}%`,
                  background: Math.abs(driftPct) > 50 ? t.accentRed : Math.abs(driftPct) > 25 ? t.accentAmber : t.accentGreen,
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
