import React from 'react';
import {
  Menu, Search, RefreshCw, Sun, Moon, ExternalLink,
  ShieldCheck, Activity, Zap, Radio, Cpu
} from 'lucide-react';
import { TabKey } from './Navbar';

interface TopRibbonProps {
  activeTab: TabKey;
  onToggleMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  appId: number;
  onResetSeed: () => void;
}

const TAB_TITLES: Record<TabKey, { section: string; title: string }> = {
  feed:       { section: 'OPERATIONS HUD',       title: 'Command Center' },
  guard:      { section: 'OPERATIONS HUD',       title: 'Policy Guard Simulator' },
  merchant:   { section: 'TRUST LAYER',          title: 'Merchant Risk Scorer — Two-Sided Trust' },
  fleet:      { section: 'TRUST LAYER',          title: 'Fleet Correlation — Coordinated Attack Detection' },
  playground: { section: 'x402 PROTOCOL',        title: 'Payment Playground — Live x402 Flow' },
  receipts:   { section: 'AUDIT & LEDGER',       title: 'Receipts Ledger & Settlement Audit' },
  proof:      { section: 'ON-CHAIN',             title: 'On-Chain Evidence — Algorand Box Storage' },
};

export const TopRibbon: React.FC<TopRibbonProps> = ({
  activeTab,
  onToggleMobileSidebar,
  onOpenCommandPalette,
  darkMode,
  setDarkMode,
  appId,
  onResetSeed,
}) => {
  const { section, title } = TAB_TITLES[activeTab] || { section: 'SENTINEL', title: 'Workstation' };

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 sm:px-6 gap-4"
      style={{
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-base)',
      }}
    >
      {/* ── Left: Mobile toggle + Breadcrumb ────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 rounded-lg lg:hidden transition-all"
          style={{ color: 'var(--text-muted)', background: 'transparent' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono min-w-0">
          <span className="hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
            {section}
          </span>
          <span className="hidden sm:inline" style={{ color: 'var(--border-base)' }}>/</span>
          <span className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {title}
          </span>
        </div>
      </div>

      {/* ── Right: Controls ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Algorand AVM Latency Badge */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-base)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--accent-green)' }}
          />
          <span style={{ color: 'var(--text-muted)' }}>AVM:</span>
          <span className="font-bold" style={{ color: 'var(--accent-green)' }}>&lt; 8ms</span>
        </div>

        {/* Lora Explorer Live Badge */}
        <a
          href={`https://lora.algokit.io/testnet/application/${appId}`}
          target="_blank"
          rel="noreferrer"
          id="lora-explorer-ribbon-link"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-base)',
            color: 'var(--accent-cyan)',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-base)')}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--accent-cyan)' }}
          />
          <span className="font-bold">Lora #{appId}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
        </a>

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          id="cmd-palette-trigger"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-base)',
            color: 'var(--text-muted)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent-cyan)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-base)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd
            className="hidden sm:inline px-1.5 py-0.5 rounded text-[9px]"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-base)' }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Reset Seed */}
        <button
          onClick={onResetSeed}
          id="reset-seed-btn"
          title="Re-seed synthetic dataset"
          className="p-2 rounded-lg transition-all"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border-base)', background: 'var(--bg-surface)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-amber)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Dark / Light Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          id="theme-toggle-btn"
          title={darkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
          className="p-2 rounded-lg transition-all"
          style={{
            border: '1px solid var(--border-base)',
            background: 'var(--bg-surface)',
            color: darkMode ? 'var(--accent-amber)' : 'var(--accent-cyan)',
          }}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
