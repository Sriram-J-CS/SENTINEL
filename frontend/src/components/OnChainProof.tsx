import React, { useEffect, useState } from 'react';
import { SearchCheck, ExternalLink, Database, Code, CheckCircle, Copy, DatabaseZap, ShieldCheck } from 'lucide-react';

interface OnChainProofProps {
  selectedRootTaskId: string;
}

export const OnChainProof: React.FC<OnChainProofProps> = ({ selectedRootTaskId }) => {
  const [proofData, setProofData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const taskId = selectedRootTaskId || 'task_cascade_demo_01';
  const box    = proofData?.onChainBox || {};
  const appId  = proofData?.appId || 769717602;

  useEffect(() => {
    fetch(`/api/proof/${taskId}`)
      .then(res => res.json())
      .then(data => setProofData(data))
      .catch(console.error);
  }, [taskId]);

  const copyHex = () => {
    if (box.rawBytesHex) {
      navigator.clipboard.writeText(box.rawBytesHex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const LORA_URL = `https://lora.algokit.io/testnet/application/${appId}`;
  const PERA_URL = `https://explorer.perawallet.app/application/${appId}?network=testnet`;

  const DecodedField = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
    <div
      className="p-4 rounded-xl space-y-1"
      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-base)' }}
    >
      <span
        className="text-[10px] font-mono font-bold uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </span>
      <p className="text-sm font-bold font-mono mt-1" style={{ color: accent }}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="s-panel">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <DatabaseZap className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-green)' }} />
              <h1
                className="text-base font-extrabold font-mono tracking-widest"
                style={{ color: 'var(--text-primary)' }}
              >
                ON-CHAIN EVIDENCE
              </h1>
              <span className="badge-live">Algorand Box Storage</span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  color: 'var(--accent-green)',
                  border: '1px solid rgba(16,185,129,0.25)',
                }}
              >
                APP #{appId}
              </span>
            </div>
            <p
              className="text-xs font-mono mt-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Task: <span style={{ color: 'var(--accent-cyan)' }}>{taskId}</span>
              &nbsp;· AVM 8+ Box Storage · Tamper-Evident Lineage Record
            </p>
          </div>

          {/* Explorer Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={LORA_URL}
              target="_blank"
              rel="noreferrer"
              id="onchain-lora-btn"
              className="s-btn-primary"
            >
              Lora Explorer <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={PERA_URL}
              target="_blank"
              rel="noreferrer"
              id="onchain-pera-btn"
              className="s-btn-emerald"
            >
              Pera Wallet <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Decoded Fields + Raw Hex ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Decoded Fields */}
        <div className="lg:col-span-2 s-panel space-y-4">
          <div
            className="flex items-center justify-between pb-3 font-mono"
            style={{ borderBottom: '1px solid var(--border-base)' }}
          >
            <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Database className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
              DECODED BOX STORAGE RECORD
            </h3>
            <span
              className="text-[10px] px-2.5 py-0.5 rounded"
              style={{
                background: 'rgba(34,211,238,0.08)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(34,211,238,0.2)',
              }}
            >
              KEY: {taskId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DecodedField
              label="Authorized Budget (Bytes 0–8)"
              value={`$${((box.authorizedBudget || 40000000) / 1000000).toFixed(2)} USD`}
              accent="var(--accent-green)"
            />
            <DecodedField
              label="Cumulative Spend (Bytes 8–16)"
              value={`$${((box.cumulativeSpend || 0) / 1000000).toFixed(2)} USD`}
              accent="var(--accent-cyan)"
            />
            <DecodedField
              label="Hop Count (Bytes 16–24)"
              value={`Hop #${box.hopCount !== undefined ? box.hopCount : 4}`}
              accent="var(--accent-amber)"
            />
            <DecodedField
              label="On-Chain Status (Bytes 24–32)"
              value={box.status === 1 ? '1 — BLOCKED' : box.status === 3 ? '3 — APPROVED' : '0 — ACTIVE'}
              accent={box.status === 1 ? 'var(--accent-red)' : 'var(--accent-green)'}
            />
          </div>

          {/* Decision Hash */}
          <div
            className="p-4 rounded-xl space-y-1"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-base)' }}
          >
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              On-Chain SHA-256 Decision Hash (Bytes 32–64)
            </span>
            <p
              className="text-[11px] font-bold font-mono break-all mt-1"
              style={{ color: 'var(--accent-cyan)' }}
            >
              {box.decisionHash || '0000000000000000000000000000000000000000000000000000000000000000'}
            </p>
          </div>
        </div>

        {/* Right: Raw Hex Dump */}
        <div className="s-panel space-y-4">
          <div
            className="flex items-center justify-between pb-3 font-mono"
            style={{ borderBottom: '1px solid var(--border-base)' }}
          >
            <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Code className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
              64-BYTE RAW HEX DUMP
            </h3>
            <button
              onClick={copyHex}
              className="transition-colors p-1 rounded"
              title="Copy Raw Hex"
              style={{ color: 'var(--text-muted)' }}
            >
              {copied
                ? <CheckCircle className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                : <Copy className="w-4 h-4" />
              }
            </button>
          </div>

          <div
            className="p-4 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto break-all"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-base)',
              color: 'var(--accent-green)',
            }}
          >
            {box.rawBytesHex ||
              '0000000002625a0000000003473bc0000000000000000400000000000000010000000000000000000000000000000000000000000000000000000000000000'}
          </div>

          <div
            className="text-[11px] font-mono space-y-2 leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Why Algorand Box Storage?
            </p>
            <p>
              Box Storage creates a tamper-evident audit record directly on Algorand TestNet state space,
              allowing any external facilitator or judge to independently verify multi-hop lineage proofs.
            </p>
          </div>

          {/* Both explorer links */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <a
              href={LORA_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-mono font-bold transition-all"
              style={{
                background: 'rgba(34,211,238,0.08)',
                border: '1px solid rgba(34,211,238,0.2)',
                color: 'var(--accent-cyan)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,211,238,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(34,211,238,0.08)')}
            >
              <ExternalLink className="w-3 h-3" /> Lora
            </a>
            <a
              href={PERA_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-mono font-bold transition-all"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                color: 'var(--accent-green)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.08)')}
            >
              <ExternalLink className="w-3 h-3" /> Pera
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};
