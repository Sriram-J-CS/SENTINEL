import React, { useState } from 'react';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, Play,
  Terminal, Activity, Zap, CheckCircle2, XCircle, Sliders
} from 'lucide-react';
import { useTheme } from './useTheme';

interface PolicyGuardProps {
  agents: any[];
  onSelectAgent: (agentId: string) => void;
  onRefreshFeed?: () => void;
}

export const PolicyGuard: React.FC<PolicyGuardProps> = ({
  agents,
  onSelectAgent,
  onRefreshFeed
}) => {
  const t = useTheme();

  const [selectedAgent, setSelectedAgent] = useState<string>('agent_alpha_procure');
  const [amount, setAmount] = useState<number>(75.00);
  const [category, setCategory] = useState<string>('cloud_hosting');
  const [hopCount, setHopCount] = useState<number>(1);
  const [budget, setBudget] = useState<number>(40.00);
  const [taskDescription, setTaskDescription] = useState<string>('Procure high-performance compute instances for parallel model training');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>({
    decision: 'block',
    anomalyScore: 0.88,
    reasons: ['Amount ($75.00) exceeds historical spend tolerance cap ($12.50) by +500%'],
    stage1: { passed: false, baselineRange: { min: 8.50, max: 12.50, mean: 10.50 } },
    stage2: { passed: false, zScore: 4.8 },
    stage3: { passed: true, cumulativeSpend: 75.00, authorizedBudget: 40.00, intentAlignmentScore: 92 }
  });

  const runSimulation = async (overrides?: any) => {
    setLoading(true);
    try {
      const payload = {
        agentId: overrides?.agentId || selectedAgent,
        amount: overrides?.amount !== undefined ? overrides.amount : amount,
        merchantCategory: overrides?.category || category,
        hopCount: overrides?.hopCount !== undefined ? overrides.hopCount : hopCount,
        authorizedBudget: overrides?.budget !== undefined ? overrides.budget : budget,
        taskDescription: overrides?.taskDescription || taskDescription,
        rootTaskId: 'sim_task_' + Math.random().toString(36).substring(7)
      };

      const res = await fetch('/api/policy/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setResult(data);
      if (onRefreshFeed) onRefreshFeed();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isApprove  = result?.decision === 'approve';
  const isBlock    = result?.decision === 'block';
  const isEscalate = result?.decision === 'escalate';

  const zScoreVal = Math.min(100, Math.max(10, (result?.stage2?.zScore || 1.2) * 20));
  const anomalyVal = Math.min(100, Math.max(10, (result?.anomalyScore || 0.15) * 100));
  const intentVal = result?.stage3?.intentAlignmentScore !== undefined ? result.stage3.intentAlignmentScore : 85;

  const innerBoxStyle: React.CSSProperties = {
    background: t.bgInput,
    border: `1px solid ${t.borderBase}`,
    borderRadius: '0.625rem',
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Top Header Bar ──────────────────────────────────────────── */}
      <div className="s-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${t.accentCyan}15`, border: `1px solid ${t.accentCyan}35`, color: t.accentCyan }}
            >
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold tracking-tight" style={{ color: t.textPrimary }}>
                  Policy Guard Simulator & Risk Engine
                </h2>
                <span className="badge-live">
                  Zero-Gas Sandbox
                </span>
              </div>
              <p className="text-xs font-mono mt-0.5" style={{ color: t.textMuted }}>
                Simulate 3-stage adaptive policy evaluation pipeline in real time
              </p>
            </div>
          </div>

          {/* Quick Scenario Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            <button
              onClick={() => {
                setSelectedAgent('agent_alpha_procure');
                setAmount(75.00);
                setCategory('cloud_hosting');
                runSimulation({ agentId: 'agent_alpha_procure', amount: 75.00, category: 'cloud_hosting' });
              }}
              className="px-3 py-1.5 rounded-lg font-bold transition-all"
              style={{ background: `${t.accentRed}15`, color: t.accentRed, border: `1px solid ${t.accentRed}35` }}
            >
              Scenario A: $75 Spike
            </button>
            <button
              onClick={() => {
                setSelectedAgent('agent_gamma_delegate');
                setAmount(14.00);
                setHopCount(4);
                setBudget(40.00);
                runSimulation({ agentId: 'agent_gamma_delegate', amount: 14.00, hopCount: 4, budget: 40.00 });
              }}
              className="px-3 py-1.5 rounded-lg font-bold transition-all"
              style={{ background: `${t.accentAmber}15`, color: t.accentAmber, border: `1px solid ${t.accentAmber}35` }}
            >
              Scenario B: Cascade Drain
            </button>
            <button
              onClick={() => {
                setSelectedAgent('agent_alpha_procure');
                setAmount(10.50);
                setCategory('cloud_hosting');
                runSimulation({ agentId: 'agent_alpha_procure', amount: 10.50, category: 'cloud_hosting' });
              }}
              className="px-3 py-1.5 rounded-lg font-bold transition-all"
              style={{ background: `${t.accentGreen}15`, color: t.accentGreen, border: `1px solid ${t.accentGreen}35` }}
            >
              Scenario C: Compliant Tx
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Simulator Layout ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── Left Column: Form Controls (5 Cols) ───────────────────── */}
        <div className="lg:col-span-5 s-panel space-y-4">
          <div className="pb-2 font-mono" style={{ borderBottom: `1px solid ${t.borderBase}` }}>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>
              Input Parameters
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="block mb-1" style={{ color: t.textSecondary }}>Target Agent</label>
              <select
                value={selectedAgent}
                onChange={e => setSelectedAgent(e.target.value)}
                className="s-input"
              >
                {agents.map(a => (
                  <option key={a.agentId} value={a.agentId} style={{ background: t.bgCard, color: t.textPrimary }}>
                    {a.name || a.agentId} (Mean: ${a.baseline?.meanAmount || '10.50'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1" style={{ color: t.textSecondary }}>Amount ($ USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="s-input"
                />
              </div>
              <div>
                <label className="block mb-1" style={{ color: t.textSecondary }}>Merchant Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="s-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1" style={{ color: t.textSecondary }}>Cascade Hop</label>
                <input
                  type="number"
                  value={hopCount}
                  onChange={e => setHopCount(Number(e.target.value))}
                  className="s-input"
                />
              </div>
              <div>
                <label className="block mb-1" style={{ color: t.textSecondary }}>Authorized Budget ($)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  className="s-input"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1" style={{ color: t.textSecondary }}>Task Natural Language Intent</label>
              <textarea
                rows={2}
                value={taskDescription}
                onChange={e => setTaskDescription(e.target.value)}
                className="s-input resize-none"
              />
            </div>
          </div>

          <button
            onClick={() => runSimulation()}
            disabled={loading}
            className="s-btn-primary w-full justify-center text-xs py-2.5 mt-2"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Evaluate Transaction Policy
          </button>
        </div>

        {/* ── Right Column: Decision Status + Progress Meters (7 Cols) */}
        <div className="lg:col-span-7 s-panel flex flex-col justify-between space-y-5">

          {/* ── Status Banner ────────────────────────────────────────── */}
          <div
            className="p-5 rounded-xl border flex flex-col items-center justify-center text-center transition-all"
            style={{
              background: isBlock ? `${t.accentRed}12` : isEscalate ? `${t.accentAmber}12` : `${t.accentGreen}12`,
              borderColor: isBlock ? `${t.accentRed}40` : isEscalate ? `${t.accentAmber}40` : `${t.accentGreen}40`,
            }}
          >
            <span className="text-[10px] font-mono tracking-widest uppercase mb-1" style={{ color: t.textMuted }}>
              Sentinel Decision Result
            </span>
            <h1
              className="text-3xl font-mono font-extrabold tracking-tight"
              style={{ color: isBlock ? t.accentRed : isEscalate ? t.accentAmber : t.accentGreen }}
            >
              {result?.decision ? result.decision.toUpperCase() : 'EVALUATING...'}
            </h1>
            <p className="text-xs mt-2 max-w-md font-sans leading-relaxed" style={{ color: t.textSecondary }}>
              {result?.reasons?.[0] || 'Transaction complies with all behavioral envelope, spend band, and lineage constraints.'}
            </p>
          </div>

          {/* ── 3 Diagnostic Meters ──────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 font-mono">
            {/* Meter 1: Z-Score */}
            <div className="p-3 rounded-lg flex flex-col items-center" style={innerBoxStyle}>
              <span className="text-[10px] uppercase mb-2" style={{ color: t.textMuted }}>Z-Score</span>
              <div className="w-4 h-24 rounded-full overflow-hidden flex flex-col justify-end p-0.5" style={{ background: t.bgCard }}>
                <div
                  className="w-full rounded-full transition-all duration-700"
                  style={{ height: `${zScoreVal}%`, background: t.accentCyan }}
                />
              </div>
              <span className="text-xs font-bold mt-2" style={{ color: t.accentCyan }}>
                {result?.stage2?.zScore ? result.stage2.zScore.toFixed(1) : '1.2'}σ
              </span>
            </div>

            {/* Meter 2: Anomaly Risk */}
            <div className="p-3 rounded-lg flex flex-col items-center" style={innerBoxStyle}>
              <span className="text-[10px] uppercase mb-2" style={{ color: t.textMuted }}>Risk Variance</span>
              <div className="w-4 h-24 rounded-full overflow-hidden flex flex-col justify-end p-0.5" style={{ background: t.bgCard }}>
                <div
                  className="w-full rounded-full transition-all duration-700"
                  style={{
                    height: `${anomalyVal}%`,
                    background: anomalyVal > 60 ? t.accentRed : anomalyVal > 30 ? t.accentAmber : t.accentGreen,
                  }}
                />
              </div>
              <span
                className="text-xs font-bold mt-2"
                style={{ color: anomalyVal > 60 ? t.accentRed : anomalyVal > 30 ? t.accentAmber : t.accentGreen }}
              >
                {anomalyVal.toFixed(0)}%
              </span>
            </div>

            {/* Meter 3: Intent Alignment */}
            <div className="p-3 rounded-lg flex flex-col items-center" style={innerBoxStyle}>
              <span className="text-[10px] uppercase mb-2" style={{ color: t.textMuted }}>Intent Match</span>
              <div className="w-4 h-24 rounded-full overflow-hidden flex flex-col justify-end p-0.5" style={{ background: t.bgCard }}>
                <div
                  className="w-full rounded-full transition-all duration-700"
                  style={{ height: `${intentVal}%`, background: t.accentGreen }}
                />
              </div>
              <span className="text-xs font-bold mt-2" style={{ color: t.accentGreen }}>
                {intentVal}%
              </span>
            </div>
          </div>

          {/* 3-Stage Summary Strip */}
          <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
            <div
              className="p-2 rounded-lg border text-center font-bold"
              style={{
                background: result?.stage1?.passed ? `${t.accentGreen}15` : `${t.accentRed}15`,
                borderColor: result?.stage1?.passed ? `${t.accentGreen}35` : `${t.accentRed}35`,
                color: result?.stage1?.passed ? t.accentGreen : t.accentRed,
              }}
            >
              Stage 1: Spend Band
            </div>
            <div
              className="p-2 rounded-lg border text-center font-bold"
              style={{
                background: result?.stage2?.passed ? `${t.accentGreen}15` : `${t.accentRed}15`,
                borderColor: result?.stage2?.passed ? `${t.accentGreen}35` : `${t.accentRed}35`,
                color: result?.stage2?.passed ? t.accentGreen : t.accentRed,
              }}
            >
              Stage 2: Deviation
            </div>
            <div
              className="p-2 rounded-lg border text-center font-bold"
              style={{
                background: result?.stage3?.passed ? `${t.accentGreen}15` : `${t.accentRed}15`,
                borderColor: result?.stage3?.passed ? `${t.accentGreen}35` : `${t.accentRed}35`,
                color: result?.stage3?.passed ? t.accentGreen : t.accentRed,
              }}
            >
              Stage 3: Multi-Hop
            </div>
          </div>

        </div>

      </div>

      {/* ── Terminal Execution Log Console ──────────────────────────── */}
      <div className="s-console">
        <div className="flex items-center justify-between pb-2 mb-3" style={{ borderBottom: `1px solid ${t.borderBase}` }}>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" style={{ color: t.accentCyan }} />
            <span className="font-bold" style={{ color: t.textPrimary }}>sentinel_policy_evaluation_trace.json</span>
          </div>
          <span className="text-[10px] font-bold" style={{ color: t.accentGreen }}>STATUS: 200 OK</span>
        </div>
        <pre className="text-[11px] font-mono overflow-x-auto leading-relaxed" style={{ color: t.textSecondary }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>

    </div>
  );
};
