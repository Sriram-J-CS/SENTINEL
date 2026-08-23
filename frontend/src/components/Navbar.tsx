import React from 'react';
import {
  Shield, LayoutDashboard, DatabaseZap,
  Sun, Moon, RefreshCw, ExternalLink, ShieldCheck, CreditCard,
  FileText, Store, Users
} from 'lucide-react';

// Only the 6 essential tabs remain
export type TabKey = 'feed' | 'guard' | 'merchant' | 'fleet' | 'playground' | 'receipts' | 'proof';

interface NavbarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  appId: number;
  onResetSeed: () => void;
  onShowLanding: () => void;
}

const NAV_ITEMS: { key: TabKey; label: string; icon: React.ReactNode; badge?: string }[] = [
  { key: 'feed',       label: 'Command Center',   icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'guard',      label: 'Policy Guard',     icon: <ShieldCheck className="w-4 h-4" />,  badge: 'Core' },
  { key: 'merchant',   label: 'Merchant Risk',    icon: <Store className="w-4 h-4" />,        badge: 'NEW' },
  { key: 'fleet',      label: 'Fleet Correlation',icon: <Users className="w-4 h-4" />,        badge: 'NEW' },
  { key: 'playground', label: 'x402 Playground',  icon: <CreditCard className="w-4 h-4" /> },
  { key: 'receipts',   label: 'Receipts',         icon: <FileText className="w-4 h-4" /> },
  { key: 'proof',      label: 'On-Chain Proof',   icon: <DatabaseZap className="w-4 h-4" /> },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  appId,
  onResetSeed,
  onShowLanding,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full" style={{ background: 'var(--bg-header)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-base)' }}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand — clicking goes to landing */}
        <button onClick={onShowLanding} className="flex items-center gap-2.5 flex-shrink-0 transition-opacity hover:opacity-80">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-cyan-glow)', border: '1px solid var(--border-accent)' }}>
            <Shield className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold tracking-widest text-sm" style={{ color: 'var(--text-primary)' }}>SENTINEL</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-green-glow)', color: 'var(--accent-green)', border: '1px solid var(--accent-green)' }}>
                x402
              </span>
            </div>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-0.5 p-1 rounded-xl overflow-x-auto" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-base)' }}>
          {NAV_ITEMS.map(({ key, label, icon, badge }) => (
            <button
              key={key}
              id={`nav-${key}`}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
              style={
                activeTab === key
                  ? { background: 'var(--bg-surface)', color: 'var(--accent-cyan)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', fontWeight: 700 }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <span style={{ color: activeTab === key ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{icon}</span>
              {label}
              {badge && (
                <span
                  className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded"
                  style={
                    badge === 'NEW'
                      ? { background: 'var(--accent-green-glow)', color: 'var(--accent-green)', border: '1px solid var(--accent-green)' }
                      : { background: 'var(--accent-cyan-glow)', color: 'var(--accent-cyan)', border: '1px solid var(--border-accent)' }
                  }
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={`https://lora.algokit.io/testnet/application/${appId}`}
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-all hover:scale-105"
            style={{ background: 'var(--accent-green-glow)', color: 'var(--accent-green)', border: '1px solid var(--accent-green)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-green)' }} />
            Lora #{appId}
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>

          <button
            onClick={onResetSeed}
            title="Re-seed synthetic dataset"
            className="p-2 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)' }}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)' }}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sub-nav for smaller screens */}
      <div className="xl:hidden flex overflow-x-auto px-2 py-1.5 gap-1" style={{ borderTop: '1px solid var(--border-base)', background: 'var(--bg-panel)' }}>
        {NAV_ITEMS.map(({ key, label, icon, badge }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all"
            style={
              activeTab === key
                ? { background: 'var(--accent-cyan)', color: '#050810', fontWeight: 700 }
                : { color: 'var(--text-muted)' }
            }
          >
            {icon}
            {label}
            {badge === 'NEW' && <span className="w-1.5 h-1.5 rounded-full ml-0.5" style={{ background: 'var(--accent-green)' }} />}
          </button>
        ))}
      </div>
    </header>
  );
};
