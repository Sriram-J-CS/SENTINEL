import React, { useState, useEffect } from 'react';
import { Store, TrendingUp, AlertTriangle, CheckCircle2, ExternalLink, Activity, BarChart3, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { useTheme } from './useTheme';

// ── Fake merchant data ──────────────────────────────────────────────
const MERCHANTS: MerchantProfile[] = [
  {
    id: 'merchant_compute_cloud',
    name: 'CloudCompute API',
    endpoint: '/api/compute/gpu',
    category: 'api_compute',
    basePrice: 10.50,
    registeredDaysAgo: 45,
    completionRate: 98.2,
    riskScore: 0.08,
    status: 'trusted',
    priceHistory: [10.5, 10.5, 10.6, 10.5, 10.4, 10.5, 10.5, 10.5, 10.6, 10.5],
  },
  {
    id: 'merchant_data_index',
    name: 'DataIndex Pro',
    endpoint: '/api/data/index',
    category: 'data_services',
    basePrice: 8.00,
    registeredDaysAgo: 12,
    completionRate: 91.4,
    riskScore: 0.31,
    status: 'watch',
    priceHistory: [8.0, 8.0, 8.1, 8.2, 8.5, 9.0, 9.8, 11.2, 12.0, 13.5],
  },
  {
    id: 'merchant_model_api',
    name: 'ModelHost (Suspicious)',
    endpoint: '/api/llm/inference',
    category: 'model_hosting',
    basePrice: 5.00,
    registeredDaysAgo: 3,
    completionRate: 67.0,
    riskScore: 0.87,
    status: 'flagged',
    priceHistory: [5.0, 5.0, 5.2, 5.5, 6.0, 9.0, 12.5, 18.0, 21.0, 21.5],
  },
  {
    id: 'merchant_storage_s3',
    name: 'AlgoStorage CDN',
    endpoint: '/api/storage/ipfs',
    category: 'storage',
    basePrice: 2.00,
    registeredDaysAgo: 90,
    completionRate: 99.8,
    riskScore: 0.03,
    status: 'trusted',
    priceHistory: [2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0],
  },
];

interface MerchantProfile {
  id: string;
  name: string;
  endpoint: string;
  category: string;
  basePrice: number;
  registeredDaysAgo: number;
  completionRate: number;
  riskScore: number;
  status: 'trusted' | 'watch' | 'flagged';
  priceHistory: number[];
}

function RiskBar({ score, t }: { score: number; t: any }) {
  const color = score >= 0.7 ? t.accentRed : score >= 0.3 ? t.accentAmber : t.accentGreen;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: t.bgInput }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${score * 100}%`, background: color }} />
      </div>
      <span className="text-[11px] font-bold font-mono w-7 text-right" style={{ color }}>{(score * 100).toFixed(0)}</span>
    </div>
  );
}

export const MerchantRisk: React.FC = () => {
  const t = useTheme();
  const [selected, setSelected] = useState<MerchantProfile>(MERCHANTS[2]); // default = suspicious one
  const [refreshing, setRefreshing] = useState(false);

  const simulateRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const chartData = selected.priceHistory.map((price, i) => ({
    t: `T-${9 - i}h`,
    price,
    baseline: selected.priceHistory[0],
  }));

  const priceDriftPct = ((selected.priceHistory[selected.priceHistory.length - 1] - selected.priceHistory[0]) / selected.priceHistory[0] * 100);

  const statusBadge = {
    trusted: { label: 'TRUSTED', color: t.accentGreen },
    watch:   { label: 'WATCH',   color: t.accentAmber },
    flagged: { label: 'FLAGGED', color: t.accentRed },
  }[selected.status];

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="s-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${t.accentCyan}15`, border: `1px solid ${t.accentCyan}35`, color: t.accentCyan }}
            >
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold tracking-tight" style={{ color: t.textPrimary }}>
                  Merchant Risk Scorer
                </h2>
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-mono font-bold"
                  style={{ background: `${t.accentCyan}20`, color: t.accentCyan, border: `1px solid ${t.accentCyan}35` }}
                >
                  UNIQUE · NO COMPETITOR DOES THIS
                </span>
              </div>
              <p className="text-xs font-mono mt-0.5" style={{ color: t.textMuted }}>
                Two-sided trust: scoring the merchant being paid, not just the agent paying.
                Detects price drift, low completion rates, and bait-and-switch after Bazaar registration.
              </p>
            </div>
          </div>
          <button onClick={simulateRefresh} className="s-btn-ghost self-start lg:self-auto">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Scores
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left: Merchant list */}
        <div className="lg:col-span-5 s-panel space-y-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-widest" style={{ color: t.textMuted }}>
            Registered Endpoints · GoPlausible Bazaar
          </p>
          {MERCHANTS.map(m => {
            const isSelected = selected.id === m.id;
            const badge = { trusted: { label: '✓', color: t.accentGreen }, watch: { label: '⚠', color: t.accentAmber }, flagged: { label: '✗', color: t.accentRed } }[m.status];
            return (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className="w-full text-left p-3.5 rounded-xl border transition-all"
                style={{
                  background: isSelected ? `${t.accentCyan}12` : t.bgInput,
                  borderColor: isSelected ? t.accentCyan : t.borderBase,
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs font-mono" style={{ color: badge.color }}>{badge.label}</span>
                    <span className="text-xs font-bold" style={{ color: t.textPrimary }}>{m.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold" style={{ color: badge.color }}>{m.status.toUpperCase()}</span>
                </div>
                <div className="text-[10px] font-mono mb-2" style={{ color: t.textMuted }}>{m.endpoint}</div>
                <RiskBar score={m.riskScore} t={t} />
              </button>
            );
          })}
        </div>

        {/* Right: Detail */}
        <div className="lg:col-span-7 space-y-4">

          {/* Status banner */}
          <div
            className="s-panel"
            style={{
              borderLeft: `4px solid ${statusBadge.color}`,
              background: `${statusBadge.color}08`,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-bold" style={{ color: t.textPrimary }}>{selected.name}</h3>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                    style={{ background: `${statusBadge.color}20`, color: statusBadge.color, border: `1px solid ${statusBadge.color}35` }}
                  >
                    {statusBadge.label}
                  </span>
                </div>
                <p className="text-[11px] font-mono" style={{ color: t.textMuted }}>
                  {selected.endpoint} · {selected.category} · Registered {selected.registeredDaysAgo}d ago
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-2xl font-black font-mono" style={{ color: statusBadge.color }}>
                  {(selected.riskScore * 100).toFixed(0)}
                </p>
                <p className="text-[10px]" style={{ color: t.textMuted }}>Risk Score / 100</p>
              </div>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3 font-mono">
            {[
              { label: 'Price Drift', value: `${priceDriftPct > 0 ? '+' : ''}${priceDriftPct.toFixed(0)}%`, color: priceDriftPct > 20 ? t.accentRed : priceDriftPct > 5 ? t.accentAmber : t.accentGreen },
              { label: 'Completion Rate', value: `${selected.completionRate}%`, color: selected.completionRate < 80 ? t.accentRed : selected.completionRate < 95 ? t.accentAmber : t.accentGreen },
              { label: 'Base Price', value: `$${selected.basePrice.toFixed(2)}`, color: t.accentCyan },
            ].map(({ label, value, color }) => (
              <div key={label} className="s-card p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: t.textMuted }}>{label}</p>
                <p className="text-lg font-black mt-0.5" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Price history chart */}
          <div className="s-panel">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: t.accentCyan }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: t.textSecondary }}>Price History (Last 10h)</span>
              </div>
              {priceDriftPct > 20 && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-1 rounded" style={{ background: `${t.accentRed}15`, color: t.accentRed, border: `1px solid ${t.accentRed}30` }}>
                  <AlertTriangle className="w-3 h-3" />
                  PRICE DRIFT DETECTED
                </div>
              )}
            </div>
            <div
              className="h-36 w-full rounded-xl p-2"
              style={{ background: t.bgInput, border: `1px solid ${t.borderBase}` }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="t" stroke={t.chartAxis} tick={{ fontSize: 9, fill: t.chartTick, fontFamily: 'monospace' }} />
                  <YAxis stroke={t.chartAxis} tick={{ fontSize: 9, fill: t.chartTick, fontFamily: 'monospace' }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, borderRadius: '8px', fontFamily: 'monospace', fontSize: '11px', color: t.chartTooltipText }}
                  />
                  <ReferenceLine y={selected.priceHistory[0]} stroke={t.accentGreen} strokeDasharray="4 2" label={{ value: 'Baseline', fill: t.accentGreen, fontSize: 9 }} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    name="Price ($)"
                    stroke={priceDriftPct > 20 ? t.accentRed : priceDriftPct > 5 ? t.accentAmber : t.accentCyan}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sentinel verdict */}
          <div
            className="s-panel text-xs font-mono"
            style={{ background: `${statusBadge.color}08`, border: `1px solid ${statusBadge.color}30` }}
          >
            <p className="font-bold mb-1" style={{ color: statusBadge.color }}>
              {selected.status === 'flagged' ? '⛔ SENTINEL VERDICT: BLOCK PAYMENTS TO THIS MERCHANT' :
               selected.status === 'watch'   ? '⚠ SENTINEL VERDICT: ESCALATE — UNUSUAL PRICE MOVEMENT' :
                                               '✅ SENTINEL VERDICT: MERCHANT TRUSTED — PAYMENT AUTHORIZED'}
            </p>
            <p style={{ color: t.textMuted }}>
              {selected.status === 'flagged'
                ? `Price increased ${priceDriftPct.toFixed(0)}% in 10 hours. Completion rate dropped to ${selected.completionRate}%. Registered only ${selected.registeredDaysAgo} days ago. Classic bait-and-switch pattern post-Bazaar registration.`
                : selected.status === 'watch'
                ? `Price variance ${priceDriftPct.toFixed(0)}% above baseline. Within acceptable range but trending upward. Monitoring for further drift.`
                : `Stable pricing over 45 days. ${selected.completionRate}% completion rate. No metadata churn detected.`}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
