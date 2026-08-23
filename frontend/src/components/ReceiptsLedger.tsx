import React, { useState, useEffect } from 'react';
import {
  FileText, ExternalLink, Search, RefreshCw,
  Filter, Copy, Check, ArrowUpRight
} from 'lucide-react';

interface ReceiptItem {
  id: string;
  timestamp: string;
  route: string;
  agentId: string;
  amount: number;
  currency: string;
  status: 'SETTLED' | 'BLOCKED' | 'ESCALATED';
  decision: string;
  merchantCategory: string;
  txId: string;
  loraUrl: string;
  peraUrl: string;
}

export const ReceiptsLedger: React.FC = () => {
  const [receipts,   setReceipts]   = useState<ReceiptItem[]>([]);
  const [filter,     setFilter]     = useState<'ALL' | 'SETTLED' | 'BLOCKED' | 'ESCALATED'>('ALL');
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(false);
  const [copiedId,   setCopiedId]   = useState<string | null>(null);

  const fetchReceipts = () => {
    setLoading(true);
    fetch('/api/receipts?limit=100')
      .then(res => res.json())
      .then(data => { if (data.receipts) setReceipts(data.receipts); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReceipts();
    const interval = setInterval(fetchReceipts, 3000);
    return () => clearInterval(interval);
  }, []);

  const copyTxId = (txId: string, id: string) => {
    navigator.clipboard.writeText(txId);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredReceipts = receipts.filter(r => {
    if (filter !== 'ALL' && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.agentId.toLowerCase().includes(q) ||
        r.txId.toLowerCase().includes(q) ||
        r.merchantCategory.toLowerCase().includes(q) ||
        r.route.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const settledCount   = receipts.filter(r => r.status === 'SETTLED').length;
  const blockedCount   = receipts.filter(r => r.status === 'BLOCKED').length;
  const escalatedCount = receipts.filter(r => r.status === 'ESCALATED').length;

  const statusBadgeClass = (s: string) =>
    s === 'SETTLED' ? 'badge-approve' : s === 'BLOCKED' ? 'badge-block' : 'badge-escalate';

  const FILTERS = [
    { key: 'ALL',       count: receipts.length, color: 'var(--accent-cyan)' },
    { key: 'SETTLED',   count: settledCount,     color: 'var(--accent-green)' },
    { key: 'BLOCKED',   count: blockedCount,     color: 'var(--accent-red)' },
    { key: 'ESCALATED', count: escalatedCount,   color: 'var(--accent-amber)' },
  ] as const;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="s-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(34,211,238,0.08)',
                border: '1px solid rgba(34,211,238,0.2)',
                color: 'var(--accent-cyan)',
              }}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  className="text-base font-extrabold font-mono tracking-widest"
                  style={{ color: 'var(--text-primary)' }}
                >
                  RECEIPTS LEDGER
                </h1>
                <span className="badge-live">Algorand TestNet</span>
              </div>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Immutable cryptographic log of all x402 micropayment settlements & policy decisions
              </p>
            </div>
          </div>

          <button
            onClick={fetchReceipts}
            disabled={loading}
            className="s-btn-ghost"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Ledger
          </button>
        </div>
      </div>

      {/* ── Filter + Search Bar ─────────────────────────────────────── */}
      <div className="s-panel py-3 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 font-mono flex-wrap">
            {FILTERS.map(({ key, count, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={
                  filter === key
                    ? {
                        background: color,
                        color: '#050810',
                        boxShadow: `0 0 12px ${color}55`,
                      }
                    : {
                        background: 'var(--bg-surface)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-base)',
                      }
                }
              >
                {key} <span style={{ opacity: 0.75 }}>({count})</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search txid / agent / route..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="s-input pl-9 py-1.5 text-[11px]"
            />
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="s-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="s-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>AGENT ID</th>
                <th>ENDPOINT ROUTE</th>
                <th>CATEGORY</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ALGORAND TXID</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    — No receipts found for selected filter —
                  </td>
                </tr>
              ) : (
                filteredReceipts.map(r => {
                  const isBlocked   = r.status === 'BLOCKED';
                  const isEscalated = r.status === 'ESCALATED';
                  const amtColor    = isBlocked ? 'var(--accent-red)' : isEscalated ? 'var(--accent-amber)' : 'var(--accent-green)';

                  // Correct Lora + Pera URLs
                  const loraLink = r.loraUrl || (r.txId ? `https://lora.algokit.io/testnet/transaction/${r.txId}` : null);
                  const peraLink = r.peraUrl || (r.txId ? `https://explorer.perawallet.app/transaction/${r.txId}` : null);

                  return (
                    <tr key={r.id}>
                      {/* Timestamp */}
                      <td className="whitespace-nowrap font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : 'LIVE'}
                      </td>

                      {/* Agent ID */}
                      <td className="whitespace-nowrap font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                        {r.agentId}
                      </td>

                      {/* Route */}
                      <td className="whitespace-nowrap font-mono text-[11px]" style={{ color: 'var(--accent-cyan)' }}>
                        {r.route}
                      </td>

                      {/* Category */}
                      <td className="whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {r.merchantCategory}
                      </td>

                      {/* Amount */}
                      <td className="whitespace-nowrap font-mono font-bold" style={{ color: amtColor }}>
                        ${r.amount.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap">
                        <span className={statusBadgeClass(r.status)}>
                          {r.status}
                        </span>
                      </td>

                      {/* TX ID + Explorer Links */}
                      <td className="whitespace-nowrap">
                        {r.txId ? (
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                              {r.txId.slice(0, 7)}…{r.txId.slice(-5)}
                            </span>

                            {/* Copy */}
                            <button
                              onClick={() => copyTxId(r.txId, r.id)}
                              title="Copy TX ID"
                              className="transition-colors p-0.5"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {copiedId === r.id
                                ? <Check className="w-3 h-3" style={{ color: 'var(--accent-green)' }} />
                                : <Copy className="w-3 h-3" />
                              }
                            </button>

                            {/* Lora */}
                            {loraLink && (
                              <a
                                href={loraLink}
                                target="_blank"
                                rel="noreferrer"
                                title="View on Lora Explorer"
                                className="transition-colors"
                                style={{ color: 'var(--accent-cyan)' }}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}

                            {/* Pera */}
                            {peraLink && (
                              <a
                                href={peraLink}
                                target="_blank"
                                rel="noreferrer"
                                title="View on Pera Explorer"
                                className="transition-colors"
                                style={{ color: 'var(--accent-green)' }}
                              >
                                <ArrowUpRight className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredReceipts.length > 0 && (
          <div
            className="px-4 py-3 flex items-center justify-between text-[11px] font-mono"
            style={{
              borderTop: '1px solid var(--border-base)',
              color: 'var(--text-muted)',
            }}
          >
            <span>
              Showing <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{filteredReceipts.length}</span> of{' '}
              {receipts.length} records
            </span>
            <span style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
              Polled every 3s · Algorand TestNet
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
