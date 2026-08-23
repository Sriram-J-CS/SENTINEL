import React from 'react';
import {
  Shield, LayoutDashboard, Dna, GitBranch, DatabaseZap,
  ShieldCheck, CreditCard, Bot, FileText, Network,
  ExternalLink, Activity, Zap
} from 'lucide-react';
import { TabKey } from './Navbar';
import { useTheme } from './useTheme';

interface SidebarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  appId: number;
  agents: any[];
  selectedAgentId: string;
  onSelectAgent: (agentId: string) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

interface NavItem { key: TabKey; label: string; icon: React.ReactNode; badge?: string; }
interface NavGroup { title: string; items: NavItem[]; }

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'OPERATIONS HUD',
    items: [
      { key: 'feed',       label: 'Command Center',     icon: <LayoutDashboard className="w-4 h-4" /> },
      { key: 'guard',      label: 'Policy Guard',       icon: <ShieldCheck className="w-4 h-4" />,  badge: 'ENGINE' },
      { key: 'playground', label: 'x402 Playground',   icon: <CreditCard className="w-4 h-4" />,   badge: 'x402' },
    ],
  },
  {
    title: '★ UNIQUE FEATURES',
    items: [
      { key: 'merchant',   label: 'Merchant Risk',      icon: <Dna className="w-4 h-4" />,          badge: 'NEW' },
      { key: 'fleet',      label: 'Fleet Correlation',  icon: <GitBranch className="w-4 h-4" />,    badge: 'NEW' },
    ],
  },
  {
    title: 'ON-CHAIN AUDIT',
    items: [
      { key: 'receipts',   label: 'Receipts Ledger',    icon: <FileText className="w-4 h-4" /> },
      { key: 'proof',      label: 'On-Chain Evidence',  icon: <DatabaseZap className="w-4 h-4" /> },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab, setActiveTab, appId, agents, selectedAgentId,
  onSelectAgent, isOpen, onCloseMobile,
}) => {
  const t = useTheme();

  const navigate = (tab: TabKey) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    ENGINE: { bg: `${t.accentCyan}20`,   text: t.accentCyan,  border: `${t.accentCyan}40` },
    x402:   { bg: `${t.accentGreen}20`,  text: t.accentGreen, border: `${t.accentGreen}40` },
    NEW:    { bg: `${t.accentRed}20`,    text: t.accentRed,   border: `${t.accentRed}40` },
  };


  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: t.bgSidebar,
          borderRight: `1px solid ${t.borderBase}`,
        }}
      >
        {/* ── Brand Logo ─────────────────────────────────────────── */}
        <div
          className="h-14 px-4 flex items-center gap-3"
          style={{ borderBottom: `1px solid ${t.borderBase}` }}
        >
          {/* Icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{
              background: `${t.accentCyan}18`,
              border: `1px solid ${t.accentCyan}40`,
            }}
          >
            <Shield className="w-4 h-4" style={{ color: t.accentCyan }} />
          </div>

          {/* Name */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-sm tracking-widest" style={{ color: t.textPrimary }}>
                SENTINEL
              </span>
              <span
                className="px-1.5 rounded text-[9px] font-mono font-bold"
                style={{
                  background: `${t.accentGreen}20`,
                  color: t.accentGreen,
                  border: `1px solid ${t.accentGreen}40`,
                }}
              >
                x402
              </span>
            </div>
            <p className="text-[10px] font-mono" style={{ color: t.textMuted }}>
              Algorand Box Guard
            </p>
          </div>
        </div>

        {/* ── Navigation ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
          {NAV_GROUPS.map(group => (
            <div key={group.title} className="space-y-0.5">
              {/* Group Label */}
              <p
                className="px-3 mb-2 text-[9.5px] font-mono font-bold uppercase tracking-[0.13em]"
                style={{ color: t.textMuted }}
              >
                {group.title}
              </p>

              {group.items.map(item => {
                const isActive = activeTab === item.key;
                const badgeColor = item.badge ? BADGE_COLORS[item.badge] : null;

                return (
                  <button
                    key={item.key}
                    id={`sidebar-nav-${item.key}`}
                    onClick={() => navigate(item.key)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all"
                    style={
                      isActive
                        ? {
                            background: `${t.accentCyan}18`,
                            color: t.accentCyan,
                            border: `1px solid ${t.accentCyan}40`,
                            fontWeight: 700,
                          }
                        : {
                            background: 'transparent',
                            color: t.textSecondary,
                            border: '1px solid transparent',
                          }
                    }
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = t.bgHighlight;
                        e.currentTarget.style.color = t.textPrimary;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = t.textSecondary;
                      }
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span style={{ color: isActive ? t.accentCyan : t.textMuted }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {badgeColor && item.badge && (
                      <span
                        className="px-1.5 rounded text-[9px] font-mono font-bold"
                        style={{
                          background: badgeColor.bg,
                          color: badgeColor.text,
                          border: `1px solid ${badgeColor.border}`,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* ── Monitored Agents ─────────────────────────────────── */}
          {agents.length > 0 && (
            <div className="space-y-0.5">
              <p
                className="px-3 mb-2 text-[9.5px] font-mono font-bold uppercase tracking-[0.13em]"
                style={{ color: t.textMuted }}
              >
                MONITORED AGENTS
              </p>
              {agents.map(a => {
                const isSelected = selectedAgentId === a.agentId;
                return (
                  <button
                    key={a.agentId}
                    id={`sidebar-agent-${a.agentId}`}
                    onClick={() => { onSelectAgent(a.agentId); navigate('guard'); }}
                    className="w-full text-left px-3 py-1.5 rounded text-[11px] font-mono flex items-center justify-between transition-all"
                    style={
                      isSelected
                        ? { background: `${t.accentGreen}18`, color: t.accentGreen, border: `1px solid ${t.accentGreen}40`, fontWeight: 700 }
                        : { background: 'transparent', color: t.textSecondary, border: '1px solid transparent' }
                    }
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.color = t.textPrimary;
                        e.currentTarget.style.background = t.bgHighlight;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.color = t.textSecondary;
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span className="truncate">{a.agentId}</span>
                    <span style={{ color: t.textMuted, fontSize: '10px' }}>
                      ${a.baseline?.meanAmount ? a.baseline.meanAmount.toFixed(0) : '10'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Bottom Dock: Algorand Rail + Explorer Links ─────────── */}
        <div
          className="p-3"
          style={{ borderTop: `1px solid ${t.borderBase}`, background: t.bgInput }}
        >
          {/* Info Row */}
          <div
            className="p-3 rounded-xl space-y-2 font-mono"
            style={{ background: t.bgCard, border: `1px solid ${t.borderBase}` }}
          >
            <div className="flex items-center justify-between text-[10px]">
              <span style={{ color: t.textMuted }}>NETWORK</span>
              <span className="font-bold" style={{ color: t.accentGreen }}>TESTNET</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span style={{ color: t.textMuted }}>APP ID</span>
              <span className="font-bold" style={{ color: t.textPrimary }}>#{appId}</span>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: t.borderBase }} />

            {/* Explorer Links */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              {/* Lora Explorer */}
              <a
                href={`https://lora.algokit.io/testnet/application/${appId}`}
                target="_blank"
                rel="noreferrer"
                id="sidebar-lora-link"
                className="flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold transition-all"
                style={{
                  background: `${t.accentCyan}15`,
                  border: `1px solid ${t.accentCyan}35`,
                  color: t.accentCyan,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = `${t.accentCyan}25`)}
                onMouseLeave={e => (e.currentTarget.style.background = `${t.accentCyan}15`)}
              >
                <ExternalLink className="w-3 h-3" />
                <span>Lora</span>
              </a>

              {/* Pera Explorer */}
              <a
                href={`https://explorer.perawallet.app/application/${appId}`}
                target="_blank"
                rel="noreferrer"
                id="sidebar-pera-link"
                className="flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold transition-all"
                style={{
                  background: `${t.accentGreen}15`,
                  border: `1px solid ${t.accentGreen}35`,
                  color: t.accentGreen,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = `${t.accentGreen}25`)}
                onMouseLeave={e => (e.currentTarget.style.background = `${t.accentGreen}15`)}
              >
                <ExternalLink className="w-3 h-3" />
                <span>Pera</span>
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
