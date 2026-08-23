import React, { useState, useEffect } from 'react';
import { Navbar, TabKey } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TopRibbon } from './components/TopRibbon';
import { CommandPalette } from './components/CommandPalette';
import { CommandCenter, DecisionLog, SentinelStats } from './components/LiveFeed';
import { OnChainProof } from './components/OnChainProof';
import { EscalationModal } from './components/EscalationModal';
import { PolicyGuard } from './components/PolicyGuard';
import { PaymentPlayground } from './components/PaymentPlayground';
import { ReceiptsLedger } from './components/ReceiptsLedger';
import { MerchantRisk } from './components/MerchantRisk';
import { FleetCorrelation } from './components/FleetCorrelation';
import { LandingPage } from './components/LandingPage';

import { AgentDetail } from './components/AgentDetail';

export function App() {
  const [showLanding, setShowLanding]   = useState(true);   // Start at landing page
  const [activeTab, setActiveTab]       = useState<TabKey>('feed');
  const [darkMode, setDarkMode]         = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen]   = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const [logs,   setLogs]   = useState<DecisionLog[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [appId,  setAppId]  = useState<number>(769717602);
  const [stats,  setStats]  = useState<SentinelStats | null>(null);

  const [selectedRootTaskId, setSelectedRootTaskId] = useState<string>('task_cascade_demo_01');
  const [selectedAgentId,    setSelectedAgentId]    = useState<string | null>(null);
  const [escalatingLog,      setEscalatingLog]      = useState<DecisionLog | null>(null);

  // Sync dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchData = () => {
    fetch('/api/live-feed')
      .then(res => res.json())
      .then(data => { if (data.logs) setLogs(data.logs); })
      .catch(console.error);

    fetch('/api/agents')
      .then(res => res.json())
      .then(data => { if (data.agents) setAgents(data.agents); })
      .catch(console.error);

    fetch('/health')
      .then(res => res.json())
      .then(data => { if (data.appId) setAppId(data.appId); })
      .catch(console.error);

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  };

  // Initial fetch + 4-second polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleResetSeed = () => {
    fetch('/api/reset-seed', { method: 'POST' })
      .then(() => fetchData())
      .catch(console.error);
  };

  const handleSelectTask  = (id: string) => { setSelectedRootTaskId(id); setActiveTab('proof'); };
  const handleViewProof   = (id: string) => { setSelectedRootTaskId(id); setActiveTab('proof'); };
  const handleSelectAgent = (id: string) => { setSelectedAgentId(id); };

  // ── Landing Page ─────────────────────────────────────────────────
  if (showLanding) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', transition: 'all 0.3s' }}>
        <LandingPage
          onEnterDashboard={() => setShowLanding(false)}
          appId={appId}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          agents={agents}
          logs={logs}
        />
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────
  return (
    <div
      id="app-root"
      className="min-h-screen flex font-sans antialiased"
      style={{
        background: 'var(--bg-base)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* ── Left Sidebar ─────────────────────────────────────────── */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={tab => { setSelectedAgentId(null); setActiveTab(tab); }}
        appId={appId}
        agents={agents}
        selectedAgentId={selectedAgentId || ''}
        onSelectAgent={handleSelectAgent}
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* ── Main Workstation ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">

        {/* Top Ribbon */}
        <TopRibbon
          activeTab={activeTab}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          appId={appId}
          onResetSeed={handleResetSeed}
        />

        {/* Content Canvas */}
        <main
          className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          style={{ minHeight: 0 }}
        >
          {/* Agent Profile Deep-Dive */}
          {selectedAgentId ? (
            <AgentDetail
              agents={agents}
              selectedAgentId={selectedAgentId}
              onSelectAgent={handleSelectAgent}
              onBack={() => setSelectedAgentId(null)}
            />
          ) : (
            <>
              {/* 1. Command Center */}
              {activeTab === 'feed' && (
                <CommandCenter
                  logs={logs}
                  stats={stats}
                  onOpenEscalation={log => setEscalatingLog(log)}
                  onSelectTask={handleSelectTask}
                  onSelectAgent={handleSelectAgent}
                  onViewProof={handleViewProof}
                />
              )}

              {/* 2. Policy Guard Simulator */}
              {activeTab === 'guard' && (
                <PolicyGuard
                  agents={agents}
                  onSelectAgent={handleSelectAgent}
                  onRefreshFeed={fetchData}
                />
              )}

              {/* 3. Merchant Risk Scorer */}
              {activeTab === 'merchant' && (
                <MerchantRisk />
              )}

              {/* 4. Fleet Correlation */}
              {activeTab === 'fleet' && (
                <FleetCorrelation />
              )}

              {/* 5. Payment Playground (x402) */}
              {activeTab === 'playground' && (
                <PaymentPlayground
                  onPaymentSuccess={fetchData}
                  onSelectTask={handleSelectTask}
                />
              )}

              {/* 6. Receipts Ledger */}
              {activeTab === 'receipts' && (
                <ReceiptsLedger />
              )}

              {/* 7. On-Chain Evidence */}
              {activeTab === 'proof' && (
                <OnChainProof selectedRootTaskId={selectedRootTaskId} />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer
          className="px-6 sm:px-8 py-3 text-xs font-mono"
          style={{
            borderTop: '1px solid var(--border-base)',
            color: 'var(--text-muted)',
            background: 'var(--bg-panel)',
          }}
        >
          <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLanding(true)}
                className="font-bold hover:underline transition-all"
                style={{ color: 'var(--accent-cyan)' }}
              >
                Sentinel
              </button>
              <span style={{ opacity: 0.5 }}>—</span>
              <span>Two-sided trust layer for x402 AI agent payments · Algorand AVM</span>
            </div>
            <div className="flex items-center gap-4">
              <span style={{ opacity: 0.5 }}>App #{appId}</span>
              <a
                href={`https://lora.algokit.io/testnet/application/${appId}`}
                target="_blank" rel="noreferrer"
                className="hover:underline"
                style={{ color: 'var(--accent-cyan)' }}
              >
                Lora ↗
              </a>
              <a
                href={`https://explorer.perawallet.app/application/${appId}?network=testnet`}
                target="_blank" rel="noreferrer"
                className="hover:underline"
                style={{ color: 'var(--accent-green)' }}
              >
                Pera ↗
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Command Palette ───────────────────────────────────── */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectTab={tab => {
          if (['feed','guard','merchant','fleet','playground','receipts','proof'].includes(tab)) {
            setActiveTab(tab as TabKey);
          }
          setCommandPaletteOpen(false);
        }}
        onSelectAgent={() => { setCommandPaletteOpen(false); }}
        onSelectTask={id => { setSelectedRootTaskId(id); setActiveTab('proof'); setCommandPaletteOpen(false); }}
        agents={agents}
      />

      {/* ── Escalation Modal ──────────────────────────────────── */}
      {escalatingLog && (
        <EscalationModal
          log={escalatingLog}
          onClose={() => setEscalatingLog(null)}
          onResolved={fetchData}
        />
      )}
    </div>
  );
}

export default App;
