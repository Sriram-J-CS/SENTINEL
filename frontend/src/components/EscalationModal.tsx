import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { DecisionLog } from './LiveFeed';

interface EscalationModalProps {
  log: DecisionLog | null;
  onClose: () => void;
  onResolved: () => void;
}

export const EscalationModal: React.FC<EscalationModalProps> = ({ log, onClose, onResolved }) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  if (!log) return null;

  const handleResolve = async (action: 'approve' | 'reject') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/escalation/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisionLogId: log.id, rootTaskId: log.rootTaskId, action }),
      });
      const data = await res.json();
      if (res.ok && data.success) { onResolved(); onClose(); }
      else setError(data.message || 'Failed to resolve escalation');
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}>
      <div
        className="w-full max-w-lg s-card p-6 space-y-5 animate-fade-in"
        style={{ borderColor: 'rgba(251,191,36,0.35)', boxShadow: '0 0 40px rgba(251,191,36,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-base)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: 'var(--accent-amber)' }}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                HUMAN ESCALATION REVIEW
              </h3>
              <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                Supervisor Approval Gateway · Algorand Writeback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Summary */}
        <div
          className="space-y-2.5 text-xs font-mono p-4 rounded-xl"
          style={{ background: 'var(--bg-input)', border: '1px solid var(--border-base)' }}
        >
          {[
            { label: 'Agent ID',         value: log.agentId,            accent: 'var(--accent-cyan)' },
            { label: 'Root Task ID',     value: log.rootTaskId,         accent: 'var(--text-primary)' },
            { label: 'Payment Amount',   value: `$${log.amount.toFixed(2)} USD`, accent: 'var(--text-primary)', bold: true },
            { label: 'Merchant Category',value: log.merchantCategory,   accent: 'var(--text-secondary)' },
            { label: 'Anomaly Score',    value: `${(log.anomalyScore * 100).toFixed(0)}% (Borderline)`, accent: 'var(--accent-amber)', bold: true },
          ].map(({ label, value, accent, bold }) => (
            <div key={label} className="flex justify-between items-center gap-2">
              <span style={{ color: 'var(--text-muted)' }}>{label}:</span>
              <span style={{ color: accent, fontWeight: bold ? 700 : 400 }}>{value}</span>
            </div>
          ))}
          <div className="pt-2" style={{ borderTop: '1px solid var(--border-base)' }}>
            <span className="text-[10px] uppercase block mb-1" style={{ color: 'var(--text-muted)' }}>
              Triggered Reason:
            </span>
            <p style={{ color: 'var(--text-secondary)' }}>{log.reason}</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="p-3 text-xs rounded-lg"
            style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: 'var(--accent-red)' }}
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 font-mono">
          <button
            disabled={loading}
            onClick={() => handleResolve('reject')}
            className="s-btn-danger disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject & Block
          </button>
          <button
            disabled={loading}
            onClick={() => handleResolve('approve')}
            className="s-btn-emerald disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Approve & Write to Box
          </button>
        </div>
      </div>
    </div>
  );
};
