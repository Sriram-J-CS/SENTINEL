import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Shield, LayoutDashboard, Dna, GitBranch, DatabaseZap,
  ShieldCheck, CreditCard, FileText, Sparkles, Store, Users,
  ArrowRight, CornerDownLeft, X, Cpu
} from 'lucide-react';
import { TabKey } from './Navbar';
import { useTheme } from './useTheme';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: TabKey) => void;
  onSelectAgent: (agentId: string) => void;
  onSelectTask: (taskId: string) => void;
  agents: any[];
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Actions';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectTask,
}) => {
  const t = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Define commands
  const allCommands: CommandItem[] = [
    { id: 'nav-feed', category: 'Navigation', title: 'Command Center', subtitle: 'View live KPI metrics & decision stream', icon: <LayoutDashboard className="w-4 h-4" style={{ color: t.accentCyan }} />, action: () => onSelectTab('feed') },
    { id: 'nav-guard', category: 'Navigation', title: 'Policy Guard Simulator', subtitle: '3-stage behavioral decision pipeline HUD', icon: <ShieldCheck className="w-4 h-4" style={{ color: t.accentCyan }} />, action: () => onSelectTab('guard') },
    { id: 'nav-merchant', category: 'Navigation', title: 'Merchant Risk Scorer', subtitle: 'Two-sided trust: track seller drift & bait-and-switch', icon: <Store className="w-4 h-4" style={{ color: t.accentGreen }} />, action: () => onSelectTab('merchant') },
    { id: 'nav-fleet', category: 'Navigation', title: 'Cross-Agent Fleet Correlation', subtitle: 'Detect coordinated prompt injection attacks across fleets', icon: <Users className="w-4 h-4" style={{ color: t.accentRed }} />, action: () => onSelectTab('fleet') },
    { id: 'nav-play', category: 'Navigation', title: 'Payment Playground', subtitle: 'Live 5-step x402 HTTP handshake inspector', icon: <CreditCard className="w-4 h-4" style={{ color: t.accentGreen }} />, action: () => onSelectTab('playground') },
    { id: 'nav-receipts', category: 'Navigation', title: 'Receipts Ledger', subtitle: 'On-chain Algorand TestNet settlement audit', icon: <FileText className="w-4 h-4" style={{ color: t.accentCyan }} />, action: () => onSelectTab('receipts') },
    { id: 'nav-proof', category: 'Navigation', title: 'On-Chain Proof', subtitle: 'Algorand Box Storage 64-byte binary decoder', icon: <DatabaseZap className="w-4 h-4" style={{ color: t.accentGreen }} />, action: () => onSelectTab('proof') },
  ];

  const filteredCommands = allCommands.filter(c => {
    if (!query) return true;
    const q = query.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-10"
        style={{ background: t.bgCard, border: `1px solid ${t.borderBase}` }}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b" style={{ borderColor: t.borderBase }}>
          <Search className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: t.textMuted }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search tabs..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none text-sm font-mono focus:outline-none placeholder:text-slate-500"
            style={{ color: t.textPrimary }}
          />
          <button onClick={onClose} className="p-1 rounded-lg hover:opacity-80" style={{ color: t.textMuted }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono" style={{ color: t.textMuted }}>
              No commands found matching "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className="flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs font-mono transition-all"
                  style={{
                    background: isSelected ? `${t.accentCyan}15` : 'transparent',
                    border: `1px solid ${isSelected ? t.accentCyan : 'transparent'}`,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ background: t.bgInput }}>
                      {cmd.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate" style={{ color: t.textPrimary }}>{cmd.title}</p>
                      <p className="text-[11px] truncate" style={{ color: t.textMuted }}>{cmd.subtitle}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <CornerDownLeft className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.accentCyan }} />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 text-[10px] font-mono flex items-center justify-between border-t" style={{ borderColor: t.borderBase, color: t.textMuted }}>
          <span>Use ↑ ↓ to navigate, Enter to select</span>
          <kbd className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: t.bgInput, border: `1px solid ${t.borderBase}` }}>ESC to close</kbd>
        </div>
      </div>
    </div>
  );
};
