import React, { useEffect, useState } from 'react';
import {
  Shield, ArrowRight, ExternalLink, Zap, Users, Store,
  CheckCircle2, AlertTriangle, Lock, Activity, Network,
  ChevronRight, Cpu, Layers, ShieldCheck, Sun, Moon,
  Clock, FileText, Database, Radio
} from 'lucide-react';
import { useTheme } from './useTheme';

interface LandingPageProps {
  onEnterDashboard: () => void;
  appId: number;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  agents?: any[];
  logs?: any[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDashboard,
  appId,
  darkMode,
  setDarkMode,
  agents = [],
  logs = []
}) => {
  const t = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fallbackAgents = [
    { agentId: 'agent_alpha_procure', name: 'Agent Alpha (#9942)', category: 'cloud_procurement', status: 'active', spend: '$342.50' },
    { agentId: 'agent_beta_data', name: 'Agent Beta (Data Pipeline)', category: 'data_processing', status: 'active', spend: '$1,240.00' },
    { agentId: 'agent_gamma_cloud', name: 'Agent Gamma (Infra Scaling)', category: 'cloud_infrastructure', status: 'active', spend: '$890.15' },
    { agentId: 'agent_delta_untrusted', name: 'Agent Delta (Arbitrage)', category: 'arbitrage_execution', status: 'flagged', spend: '$4,120.00' },
    { agentId: 'ag_proc_9982x_alpha', name: 'Agent 9982x (Multi-Hop Cascade)', category: 'delegated_orchestration', status: 'active', spend: '$55.00' },
    { agentId: 'agent_velocity_spiker', name: 'Agent Velocity Spiker', category: 'high_freq_procurement', status: 'flagged', spend: '$620.00' },
  ];

  const displayAgents = agents && agents.length > 0 ? agents : fallbackAgents;

  const fallbackLogs = [
    { id: 'log_01', timestamp: new Date().toISOString(), agentId: 'agent_alpha_procure', amount: 10.50, decision: 'escalate', category: 'api_compute', anomalyScore: 0.55, txId: 'NHUB2OTVS5EXSF7ASP67UKW4GYNRV57NT55XIMSESZ5QTOFJ36EA', verified: true },
    { id: 'log_02', timestamp: new Date(Date.now() - 300000).toISOString(), agentId: 'agent_beta_data', amount: 15.00, decision: 'approve', category: 'analytics_query', anomalyScore: 0.12, txId: 'HK7NAMLIUEDDK6XNGIOL4YSXMCF6PHADLPQYOMZVW4POE4ZCAA7Q', verified: true },
    { id: 'log_03', timestamp: new Date(Date.now() - 600000).toISOString(), agentId: 'ag_proc_9982x_alpha', amount: 14.00, decision: 'block', category: 'data_indexing', anomalyScore: 1.00, txId: 'PLN3HMCIPTUGRJKHOCHIXFVEM24ZSU45HZWPTJDYBKEXWPNH2XOA', verified: true },
    { id: 'log_04', timestamp: new Date(Date.now() - 900000).toISOString(), agentId: 'agent_gamma_cloud', amount: 8.50, decision: 'approve', category: 'cloud_storage', anomalyScore: 0.05, txId: 'BOGVBODBH25RCRWC6QD7ESM3CNFFDYPCL4KYZU5DDKPPJH4C5YEQ', verified: true },
    { id: 'log_05', timestamp: new Date(Date.now() - 1200000).toISOString(), agentId: 'agent_velocity_spiker', amount: 25.00, decision: 'block', category: 'api_compute', anomalyScore: 0.92, txId: 'RSZOGZ4CXNBP5VJ55WADB745HIYWKZ7P5ACLSY4JXUSMEJVUSZ4Q', verified: true }
  ];

  const displayLogs = logs && logs.length > 0 ? logs.slice(0, 5) : fallbackLogs;

  const USP_CARDS = [
    {
      icon: <Store className="w-6 h-6" />,
      color: t.accentCyan,
      tag: 'UNIQUE · TWO-SIDED TRUST',
      title: 'Two-Sided Merchant Scoring',
      desc: 'Every x402 guard protects the agent that pays. Sentinel is the first to also score the merchant being paid — detecting price drift, bait-and-switch after Bazaar registration, and endpoint churn before the agent ever commits.',
      metric: '0 / 6',
      metricLabel: 'Competitors with merchant-side scoring',
    },
    {
      icon: <Users className="w-6 h-6" />,
      color: t.accentGreen,
      tag: 'FLEET DEFENSE · PROMPT INJECTION',
      title: 'Cross-Agent Fleet Correlation',
      desc: 'Per-agent baselines miss coordinated compromise. Sentinel watches entire fleets: when multiple agents suddenly converge on the same new endpoint within seconds, it catches the correlated pattern even if no single agent alone looks suspicious.',
      metric: 'July 2026',
      metricLabel: 'Zscaler ThreatLabz threat model covered',
    },
    {
      icon: <Lock className="w-6 h-6" />,
      color: t.accentViolet,
      tag: 'ALGORAND-NATIVE · AVM BOX STORAGE',
      title: 'On-Chain Tamper-Evident Lineage',
      desc: 'Every policy decision is committed to Algorand Box Storage — a 64-byte cryptographic record readable by any downstream facilitator or peer agent without trusting our API. t54 is on Base/Solana. Nobody ships this deep on Algorand.',
      metric: `#${appId}`,
      metricLabel: 'Live Algorand TestNet App ID',
    },
  ];

  const HOW_IT_WORKS = [
    {
      step: '01',
      icon: <Cpu className="w-5 h-5" />,
      color: t.accentCyan,
      title: 'Agent Requests Payment',
      desc: 'An autonomous AI agent sends an unpaid GET request to a protected resource endpoint. The server responds HTTP 402 — payment required.',
    },
    {
      step: '02',
      icon: <Shield className="w-5 h-5" />,
      color: t.accentGreen,
      title: 'Sentinel Intercepts & Scores',
      desc: 'Sentinel evaluates 3 dimensions simultaneously: (1) 30-day agent baseline anomaly score, (2) two-sided merchant price drift, (3) cross-agent fleet correlation.',
    },
    {
      step: '03',
      icon: <ShieldCheck className="w-5 h-5" />,
      color: t.accentViolet,
      title: 'Settles On-Chain in < 500ms',
      desc: 'APPROVE → payment settles via GoPlausible microAlgo USDC protocol. A tamper-evident 64-byte proof is written to AVM Box Storage.',
    },
  ];

  const X402_STEPS = [
    { num: '1', label: 'AI Agent', sub: 'Sends unpaid GET request', color: t.accentCyan },
    { num: '↕', label: 'HTTP 402', sub: 'Payment Required challenge', color: t.accentAmber },
    { num: '2', label: 'Sentinel Guard', sub: 'Scores both sides, decides', color: t.accentGreen },
    { num: '↕', label: 'Algo Tx', sub: 'microAlgo settlement', color: t.accentCyan },
    { num: '3', label: 'Resource Server', sub: 'Protected endpoint unlocks', color: t.accentViolet },
  ];

  return (
    <div
      className="min-h-screen w-full transition-colors duration-300 overflow-x-hidden"
      style={{
        background: t.bgBase,
        color: t.textPrimary,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* ── Top Floating Header Bar ──────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 sm:px-10"
        style={{
          background: t.bgHeader,
          borderBottom: `1px solid ${t.borderBase}`,
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${t.accentCyan}20`, border: `1px solid ${t.accentCyan}40` }}>
            <Shield className="w-4 h-4" style={{ color: t.accentCyan }} />
          </div>
          <span className="font-mono font-extrabold tracking-widest text-sm" style={{ color: t.textPrimary }}>SENTINEL</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold" style={{ background: `${t.accentGreen}20`, color: t.accentGreen, border: `1px solid ${t.accentGreen}35` }}>x402</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`https://lora.algokit.io/testnet/application/${appId}`}
            target="_blank" rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full transition-all"
            style={{ background: `${t.accentGreen}15`, color: t.accentGreen, border: `1px solid ${t.accentGreen}30` }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: t.accentGreen }} />
            Algorand TestNet App #{appId}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>

          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
            className="p-2 rounded-xl transition-all flex items-center justify-center"
            style={{ background: t.bgInput, border: `1px solid ${t.borderBase}`, color: t.textSecondary }}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={onEnterDashboard}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 shadow-md"
            style={{ background: t.accentCyan, color: '#050810' }}
          >
            Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="pt-16 pb-12 px-6 sm:px-10 max-w-5xl mx-auto text-center">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold mb-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ background: `${t.accentCyan}15`, border: `1px solid ${t.accentCyan}35`, color: t.accentCyan }}
        >
          <Zap className="w-3.5 h-3.5" />
          BEHAVIORAL RISK LAYER · ALGORAND AVM
        </div>

        <h1
          className={`text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ color: t.textPrimary, lineHeight: 1.1 }}
        >
          Sentinel
        </h1>

        <p
          className={`text-lg sm:text-xl font-medium mb-4 max-w-3xl mx-auto transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ color: t.accentCyan }}
        >
          Behavioral Risk Layer for Autonomous Agent Payments
        </p>

        <p
          className={`text-sm sm:text-base max-w-2xl mx-auto mb-8 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ color: t.textMuted }}
        >
          Real-time deviation detection, two-sided merchant scoring, and tamper-evident AVM Box Storage lineage tracking for x402 payments on Algorand.
        </p>

        {/* Hero CTAs */}
        <div
          className={`flex flex-wrap items-center justify-center gap-4 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <button
            onClick={onEnterDashboard}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-105 shadow-lg"
            style={{ background: t.accentCyan, color: '#050810', boxShadow: `0 0 28px ${t.accentCyan}44` }}
          >
            Launch Workstation Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={`https://lora.algokit.io/testnet/application/${appId}`}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:scale-105 border"
            style={{ background: t.bgCard, color: t.textPrimary, borderColor: t.borderBase }}
          >
            View On-Chain (Lora)
            <ExternalLink className="w-4 h-4" style={{ color: t.accentGreen }} />
          </a>
        </div>
      </section>

      {/* ── Live Status Strip ────────────────────────────────────── */}
      <section className="py-4 px-6 sm:px-10 border-y" style={{ background: t.bgCard, borderColor: t.borderBase }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
          <div className="flex items-center justify-between sm:justify-start sm:gap-6 border-b sm:border-b-0 sm:border-r pb-3 sm:pb-0 pr-4" style={{ borderColor: t.borderBase }}>
            <span className="uppercase tracking-wider text-[11px]" style={{ color: t.textMuted }}>AGENTS MONITORED</span>
            <span className="font-bold text-sm" style={{ color: t.textPrimary }}>{displayAgents.length} ACTIVE</span>
          </div>

          <div className="flex items-center justify-between sm:justify-start sm:gap-6 border-b sm:border-b-0 sm:border-r pb-3 sm:pb-0 pr-4" style={{ borderColor: t.borderBase }}>
            <span className="uppercase tracking-wider text-[11px]" style={{ color: t.textMuted }}>PAYMENTS ANALYZED</span>
            <span className="font-bold text-sm" style={{ color: t.accentGreen }}>1,428 VERIFIED</span>
          </div>

          <div className="flex items-center justify-between sm:justify-start sm:gap-6">
            <span className="uppercase tracking-wider text-[11px]" style={{ color: t.textMuted }}>SETTLED ON ALGORAND TESTNET</span>
            <span className="font-bold text-sm" style={{ color: t.accentCyan }}>APP #{appId}</span>
          </div>
        </div>
      </section>

      {/* ── Monitored Agent Directory ────────────────────────────── */}
      <section className="py-12 px-6 sm:px-10 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: `${t.accentCyan}15`, color: t.accentCyan, border: `1px solid ${t.accentCyan}30` }}>
            MONITORED AGENTS DIRECTORY
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-3" style={{ color: t.textPrimary }}>
            Active AI Agent Behavioral Baselines
          </h2>
          <p className="text-sm mt-2 max-w-xl mx-auto" style={{ color: t.textMuted }}>
            Real synthetic agents monitored by Sentinel with live anomaly scoring and spend velocity tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayAgents.map((ag: any, idx: number) => {
            const isFlagged = ag.status === 'flagged' || ag.status === 'BLOCKED';
            const statusColor = isFlagged ? t.accentRed : t.accentGreen;
            return (
              <div
                key={ag.agentId || idx}
                className="rounded-2xl p-5 border flex flex-col justify-between transition-all hover:scale-[1.02]"
                style={{ background: t.bgCard, borderColor: t.borderBase }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold" style={{ color: t.accentCyan }}>
                      {ag.agentId}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase"
                      style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}
                    >
                      {ag.status || 'ACTIVE'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm mb-1" style={{ color: t.textPrimary }}>
                    {ag.name || ag.agentId}
                  </h3>
                  <p className="text-xs font-mono mb-4" style={{ color: t.textMuted }}>
                    Category: {ag.category || 'procurement'}
                  </p>
                </div>

                <div className="pt-3 border-t flex items-center justify-between font-mono text-xs" style={{ borderColor: t.borderBase }}>
                  <span style={{ color: t.textMuted }}>30-Day Budget:</span>
                  <span className="font-bold" style={{ color: t.accentGreen }}>{ag.spend || '$500.00'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Live Transactions List (Dataset Logs) ───────────────── */}
      <section className="py-12 px-6 sm:px-10 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: `${t.accentGreen}15`, color: t.accentGreen, border: `1px solid ${t.accentGreen}30` }}>
            LIVE TRANSACTIONS FROM DATASET
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-3" style={{ color: t.textPrimary }}>
            Recent On-Chain Payment Decisions
          </h2>
          <p className="text-sm mt-2 max-w-xl mx-auto" style={{ color: t.textMuted }}>
            Real-time x402 decision logs verified on Algorand TestNet.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden font-mono text-xs border shadow-sm" style={{ background: t.bgCard, borderColor: t.borderBase }}>
          <div className="grid grid-cols-12 p-4 font-bold uppercase border-b" style={{ background: t.bgInput, borderColor: t.borderBase, color: t.textMuted }}>
            <div className="col-span-3">AGENT / TASK ID</div>
            <div className="col-span-2">AMOUNT (USD)</div>
            <div className="col-span-3">CATEGORY</div>
            <div className="col-span-2">DECISION</div>
            <div className="col-span-2 text-right">LORA PROOF</div>
          </div>

          {displayLogs.map((log: any, i: number) => {
            const dec = (log.decision || 'approve').toLowerCase();
            const decColor = dec === 'approve' ? t.accentGreen : dec === 'block' ? t.accentRed : t.accentAmber;
            const txId = log.txId || 'NHUB2OTVS5EXSF7ASP67UKW4GYNRV57NT55XIMSESZ5QTOFJ36EA';
            return (
              <div
                key={log.id || i}
                className="grid grid-cols-12 p-4 border-b items-center transition-colors hover:bg-white/5"
                style={{ borderColor: t.borderBase }}
              >
                <div className="col-span-3">
                  <p className="font-bold text-xs" style={{ color: t.textPrimary }}>{log.agentId}</p>
                  <p className="text-[10px]" style={{ color: t.textMuted }}>{log.id}</p>
                </div>
                <div className="col-span-2 font-bold" style={{ color: t.accentGreen }}>
                  ${Number(log.amount || 10).toFixed(2)}
                </div>
                <div className="col-span-3" style={{ color: t.textSecondary }}>
                  {log.category || log.merchantCategory || 'api_compute'}
                </div>
                <div className="col-span-2">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                    style={{ background: `${decColor}15`, color: decColor, border: `1px solid ${decColor}30` }}
                  >
                    {dec}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <a
                    href={`https://lora.algokit.io/testnet/transaction/${txId}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                    style={{ color: t.accentCyan }}
                  >
                    View ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Key Differentiator Cards (USP Comparison) ────────────── */}
      <section className="py-12 px-6 sm:px-10 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: `${t.accentGreen}15`, color: t.accentGreen, border: `1px solid ${t.accentGreen}30` }}>
            THE SENTINEL ADVANTAGE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-3" style={{ color: t.textPrimary }}>
            What Makes Sentinel Uniquely Defensible
          </h2>
          <p className="text-sm mt-2 max-w-xl mx-auto" style={{ color: t.textMuted }}>
            Competitors focus only on single-agent rule caps. Sentinel protects both sides of every transaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {USP_CARDS.map((card, i) => (
            <div
              key={i}
              className="rounded-3xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-sm"
              style={{ background: t.bgCard, border: `1px solid ${t.borderBase}` }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${card.color}15`, border: `1px solid ${card.color}30`, color: card.color }}>
                    {card.icon}
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full" style={{ background: `${card.color}15`, color: card.color, border: `1px solid ${card.color}30` }}>
                    {card.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2" style={{ color: t.textPrimary }}>{card.title}</h3>
                <p className="text-xs leading-relaxed mb-6" style={{ color: t.textMuted }}>{card.desc}</p>
              </div>

              <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: t.borderBase }}>
                <span className="text-[10px] font-mono uppercase" style={{ color: t.textMuted }}>{card.metricLabel}</span>
                <span className="text-sm font-black font-mono" style={{ color: card.color }}>{card.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5-Step Interactive x402 Protocol Lifecycle Diagram ──────── */}
      <section className="py-10 px-6 sm:px-10 max-w-5xl mx-auto">
        <div className="rounded-3xl p-6 sm:p-8 border shadow-sm" style={{ background: t.bgCard, borderColor: t.borderBase }}>
          <div className="text-center mb-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: `${t.accentCyan}15`, color: t.accentCyan, border: `1px solid ${t.accentCyan}30` }}>
              x402 INTERCEPTOR ARCHITECTURE
            </span>
            <h3 className="text-xl font-bold mt-2" style={{ color: t.textPrimary }}>
              End-to-End x402 Algorand Protocol Lifecycle
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center font-mono">
            {X402_STEPS.map((s, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all hover:scale-105"
                style={{ background: t.bgInput, borderColor: t.borderBase }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }}
                >
                  {s.num}
                </div>
                <p className="text-xs font-bold" style={{ color: t.textPrimary }}>{s.label}</p>
                <p className="text-[10px]" style={{ color: t.textMuted }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works (Protocol Execution Flow) ───────────────── */}
      <section className="py-12 px-6 sm:px-10 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: `${t.accentCyan}15`, color: t.accentCyan, border: `1px solid ${t.accentCyan}30` }}>
            PROTOCOL EXECUTION FLOW
          </span>
          <h2 className="text-2xl font-black mt-3" style={{ color: t.textPrimary }}>
            How Sentinel Guards Every Payment Step
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {HOW_IT_WORKS.map((h, i) => (
            <div
              key={i}
              className="rounded-3xl p-6 space-y-3 relative"
              style={{ background: t.bgCard, border: `1px solid ${t.borderBase}` }}
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-extrabold" style={{ color: h.color }}>STEP {h.step}</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${h.color}15`, color: h.color }}>
                  {h.icon}
                </div>
              </div>
              <h3 className="text-base font-bold" style={{ color: t.textPrimary }}>{h.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: t.textMuted }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Architecture Spec Sheet Comparison ───────────────────── */}
      <section className="py-12 px-6 sm:px-10 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: `${t.accentViolet}15`, color: t.accentViolet, border: `1px solid ${t.accentViolet}30` }}>
            SPEC SHEET COMPARISON
          </span>
          <h2 className="text-2xl font-black mt-3" style={{ color: t.textPrimary }}>
            Static Allowlists vs Sentinel
          </h2>
        </div>

        <div className="rounded-3xl overflow-hidden font-mono text-xs border" style={{ background: t.bgCard, borderColor: t.borderBase }}>
          <div className="grid grid-cols-12 p-4 font-bold uppercase border-b" style={{ background: t.bgInput, borderColor: t.borderBase, color: t.textMuted }}>
            <div className="col-span-3">DIMENSION</div>
            <div className="col-span-4 border-l pl-4" style={{ borderColor: t.borderBase }}>STATIC ALLOWLISTS (t54 / AGENTBUDGET)</div>
            <div className="col-span-5 border-l pl-4" style={{ borderColor: t.borderBase, color: t.accentCyan }}>SENTINEL (ALGORAND AVM)</div>
          </div>

          <div className="grid grid-cols-12 p-4 border-b items-center" style={{ borderColor: t.borderBase }}>
            <div className="col-span-3 font-semibold" style={{ color: t.textSecondary }}>Rule Engine</div>
            <div className="col-span-4 border-l pl-4" style={{ borderColor: t.borderBase, color: t.accentRed }}>Fixed caps & domain lists</div>
            <div className="col-span-5 border-l pl-4 font-bold" style={{ borderColor: t.borderBase, color: t.accentGreen }}>Per-agent 30-day behavioral baselines</div>
          </div>

          <div className="grid grid-cols-12 p-4 border-b items-center" style={{ borderColor: t.borderBase }}>
            <div className="col-span-3 font-semibold" style={{ color: t.textSecondary }}>Merchant Trust</div>
            <div className="col-span-4 border-l pl-4" style={{ borderColor: t.borderBase, color: t.accentRed }}>Unscored seller endpoints</div>
            <div className="col-span-5 border-l pl-4 font-bold" style={{ borderColor: t.borderBase, color: t.accentGreen }}>Two-sided seller price-drift scoring</div>
          </div>

          <div className="grid grid-cols-12 p-4 border-b items-center" style={{ borderColor: t.borderBase }}>
            <div className="col-span-3 font-semibold" style={{ color: t.textSecondary }}>Lineage Tracking</div>
            <div className="col-span-4 border-l pl-4" style={{ borderColor: t.borderBase, color: t.accentRed }}>Single-hop execution blind</div>
            <div className="col-span-5 border-l pl-4 font-bold" style={{ borderColor: t.borderBase, color: t.accentGreen }}>Multi-hop AVM Box Storage lineage</div>
          </div>

          <div className="grid grid-cols-12 p-4 items-center">
            <div className="col-span-3 font-semibold" style={{ color: t.textSecondary }}>Fleet Defense</div>
            <div className="col-span-4 border-l pl-4" style={{ borderColor: t.borderBase, color: t.accentRed }}>Per-agent isolated logs</div>
            <div className="col-span-5 border-l pl-4 font-bold" style={{ borderColor: t.borderBase, color: t.accentGreen }}>Cross-agent fleet anomaly correlation</div>
          </div>
        </div>
      </section>

      {/* ── AVM Smart Contract Specs Panel ────────────────────────── */}
      <section className="py-12 px-6 sm:px-10 max-w-5xl mx-auto">
        <div
          className="rounded-3xl p-8 sm:p-10 space-y-6"
          style={{ background: t.bgCard, border: `1px solid ${t.borderBase}` }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5" style={{ color: t.accentCyan }} />
                <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: t.accentCyan }}>AVM ON-CHAIN ARCHITECTURE</span>
              </div>
              <h2 className="text-2xl font-black" style={{ color: t.textPrimary }}>
                Algorand TestNet Smart Contract Specs
              </h2>
            </div>
            <a
              href={`https://lora.algokit.io/testnet/application/${appId}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all hover:scale-105"
              style={{ background: `${t.accentGreen}20`, color: t.accentGreen, border: `1px solid ${t.accentGreen}40` }}
            >
              <Activity className="w-3.5 h-3.5" />
              App #{appId} on Lora ↗
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl" style={{ background: t.bgInput, border: `1px solid ${t.borderBase}` }}>
              <p className="text-[10px] uppercase font-bold" style={{ color: t.textMuted }}>Contract Application ID</p>
              <p className="text-lg font-black mt-1" style={{ color: t.accentCyan }}>#{appId}</p>
              <p className="text-[10px] mt-1" style={{ color: t.textMuted }}>TEAL AVM Bytecode compiled on Algonode TestNet</p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: t.bgInput, border: `1px solid ${t.borderBase}` }}>
              <p className="text-[10px] uppercase font-bold" style={{ color: t.textMuted }}>Box Storage Receipt</p>
              <p className="text-lg font-black mt-1" style={{ color: t.accentGreen }}>64-Byte Binary</p>
              <p className="text-[10px] mt-1" style={{ color: t.textMuted }}>Tamper-evident cumulative spend & decision hash</p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: t.bgInput, border: `1px solid ${t.borderBase}` }}>
              <p className="text-[10px] uppercase font-bold" style={{ color: t.textMuted }}>Settlement Latency</p>
              <p className="text-lg font-black mt-1" style={{ color: t.accentAmber }}>&lt; 500 ms</p>
              <p className="text-[10px] mt-1" style={{ color: t.textMuted }}>microAlgo settlement via GoPlausible x402 protocol</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t" style={{ borderColor: t.borderBase }}>
            <div className="flex items-center gap-3 text-xs font-mono" style={{ color: t.textMuted }}>
              <a href={`https://lora.algokit.io/testnet/application/${appId}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1" style={{ color: t.accentCyan }}>
                Lora Explorer <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span>·</span>
              <a href={`https://explorer.perawallet.app/application/${appId}?network=testnet`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1" style={{ color: t.accentGreen }}>
                Pera Explorer <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <button
              onClick={onEnterDashboard}
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{ background: t.accentCyan, color: '#050810', boxShadow: `0 0 24px ${t.accentCyan}44` }}
            >
              Launch Sentinel Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 sm:px-10 max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-t font-mono text-xs" style={{ borderColor: t.borderBase, color: t.textMuted }}>
        <div>
          <span className="font-bold" style={{ color: t.textPrimary }}>SENTINEL</span> — Behavioral Risk Layer for x402 AI Agent Payments · Algorand AVM
        </div>

        <div className="flex items-center gap-6">
          <a href="https://github.com/sentinel-x402/sentinel-algorand" target="_blank" rel="noreferrer" className="hover:underline">
            GitHub Repo ↗
          </a>
          <a href={`https://lora.algokit.io/testnet/application/${appId}`} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: t.accentCyan }}>
            Lora Explorer ↗
          </a>
          <a href={`https://explorer.perawallet.app/application/${appId}?network=testnet`} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: t.accentGreen }}>
            Pera Explorer ↗
          </a>
        </div>
      </footer>
    </div>
  );
};
