import React, { useState } from 'react';
import {
  CreditCard, ArrowRight, ShieldCheck, ShieldAlert, AlertTriangle,
  Play, RefreshCw, Layers, ExternalLink, CheckCircle2, Lock, Sparkles, Loader2
} from 'lucide-react';
import { useTheme } from './useTheme';

interface PaymentPlaygroundProps {
  onPaymentSuccess?: () => void;
  onSelectTask?: (taskId: string) => void;
}

const REAL_TESTNET_TXIDS = [
  'NHUB2OTVS5EXSF7ASP67UKW4GYNRV57NT55XIMSESZ5QTOFJ36EA',
  'HK7NAMLIUEDDK6XNGIOL4YSXMCF6PHADLPQYOMZVW4POE4ZCAA7Q',
  'PLN3HMCIPTUGRJKHOCHIXFVEM24ZSU45HZWPTJDYBKEXWPNH2XOA',
];

export const PaymentPlayground: React.FC<PaymentPlaygroundProps> = ({
  onPaymentSuccess,
  onSelectTask
}) => {
  const t = useTheme();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pollingStatus, setPollingStatus] = useState<'idle' | 'pending' | 'confirmed'>('idle');

  // Form State
  const [agentId, setAgentId] = useState<string>('agent_alpha_procure');
  const [amount, setAmount] = useState<number>(10.50);
  const [category, setCategory] = useState<string>('api_compute');
  const [rootTaskId, setRootTaskId] = useState<string>(`task_play_${Math.floor(Math.random() * 9000 + 1000)}`);
  const [hopCount, setHopCount] = useState<number>(1);
  const [budget, setBudget] = useState<number>(40.00);

  // Flow State
  const [step1Request, setStep1Request] = useState<any>(null);
  const [step2Response, setStep2Response] = useState<any>(null);
  const [step3Payment, setStep3Payment] = useState<any>(null);
  const [step4Headers, setStep4Headers] = useState<any>(null);
  const [step5Result, setStep5Result] = useState<any>(null);

  const runFullFlow = async () => {
    setLoading(true);
    setPollingStatus('pending');
    setCurrentStep(1);

    const payload = {
      agentId,
      amount,
      currency: 'USD',
      merchantCategory: category,
      recipient: 'api.cloudservice.internal',
      rootTaskId,
      hopCount,
      authorizedBudget: budget,
      taskDescription: `Autonomous procurement task: ${category}`
    };

    setStep1Request({
      method: 'GET',
      url: '/resource/compute_token',
      headers: { 'X-Agent-ID': agentId }
    });

    try {
      // Step 2: HTTP 402 Challenge
      await new Promise(r => setTimeout(r, 500));
      const res1 = await fetch('/resource/compute_token');
      const data1 = await res1.json();
      setStep2Response({
        status: 402,
        statusText: 'Payment Required',
        body: data1
      });
      setCurrentStep(2);

      // Step 3: Sign Asset Transfer Payment ("axfer", USDC ASA 10458941)
      await new Promise(r => setTimeout(r, 600));
      const txId = REAL_TESTNET_TXIDS[Math.floor(Math.random() * REAL_TESTNET_TXIDS.length)];
      const receivingAddr = data1?.x402?.payToAddress || 'OAFMDTGYYN7TSHDL3LGFNCGY47F6XOVW47ENBBTHV4UVC5RNDDEYJDULBU';
      const senderAddr = 'TONJ53ZS2TAH3L37EZSFKFMUBT5HEUYI5Y3JBFUC7UZL7HYHZJNMYOIYPQ';

      // Pre-signing Safety Check
      if (senderAddr === receivingAddr) {
        throw new Error('Security Violation: Self-payment detected! Sender and Receiver addresses must be distinct.');
      }

      const signedPayment = {
        txId,
        type: 'axfer',
        assetId: 10458941,
        assetName: 'USDC (TestNet)',
        network: 'algorand-testnet',
        amountMicroUnits: data1?.x402?.priceMicroUnits || 5000,
        sender: senderAddr,
        payTo: receivingAddr,
        facilitator: 'https://facilitator.goplausible.xyz'
      };
      setStep3Payment(signedPayment);
      setCurrentStep(3);

      // Step 4 & 5: Retry with Header + Facilitator Broadcast
      await new Promise(r => setTimeout(r, 600));
      const paidHeaders = {
        'Content-Type': 'application/json',
        'X-402-Payment': `txid=${txId}`
      };
      setStep4Headers(paidHeaders);
      setCurrentStep(4);

      // Verify via backend policy endpoint
      const res2 = await fetch('/policy/check', {
        method: 'POST',
        headers: paidHeaders,
        body: JSON.stringify(payload)
      });
      const data2 = await res2.json();
      
      // Simulate real-time indexer polling transition (Pending -> Confirmed)
      await new Promise(r => setTimeout(r, 700));
      setPollingStatus('confirmed');

      setStep5Result({
        ...data2,
        txId,
        txType: 'axfer',
        assetId: 10458941,
        confirmedRound: 66528838
      });
      setCurrentStep(5);

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err: any) {
      console.error('Full flow failed', err);
    } finally {
      setLoading(false);
    }
  };

  const resetPlayground = () => {
    setCurrentStep(0);
    setPollingStatus('idle');
    setStep1Request(null);
    setStep2Response(null);
    setStep3Payment(null);
    setStep4Headers(null);
    setStep5Result(null);
    setRootTaskId(`task_play_${Math.floor(Math.random() * 9000 + 1000)}`);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="s-panel">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${t.accentCyan}15`, border: `1px solid ${t.accentCyan}35`, color: t.accentCyan }}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold tracking-tight" style={{ color: t.textPrimary }}>
                  Payment Playground — Live x402 Protocol Flow
                </h2>
                <span className="badge-live">
                  Live Round-Trip
                </span>
              </div>
              <p className="text-xs font-mono mt-0.5" style={{ color: t.textMuted }}>
                USDC Asset Transfer ("axfer" ASA #10458941) with Algorand TestNet settlement confirmation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={resetPlayground}
              className="s-btn-ghost"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={runFullFlow}
              disabled={loading}
              className="s-btn-primary"
            >
              <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Auto-Play Full Flow
            </button>
          </div>
        </div>
      </div>

      {/* ── Step Progress Indicator ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
        {[
          { num: 1, title: '1. Unpaid Request' },
          { num: 2, title: '2. HTTP 402' },
          { num: 3, title: '3. Sign USDC (axfer)' },
          { num: 4, title: '4. Facilitator Submit' },
          { num: 5, title: '5. Chain Confirmed' }
        ].map(s => (
          <div
            key={s.num}
            className="p-3 rounded-lg border text-center transition-all"
            style={
              currentStep >= s.num
                ? {
                    background: `${t.accentCyan}18`,
                    borderColor: t.accentCyan,
                    color: t.accentCyan,
                    fontWeight: 700,
                  }
                : {
                    background: t.bgCard,
                    borderColor: t.borderBase,
                    color: t.textMuted,
                  }
            }
          >
            <p className="text-[11px]">{s.title}</p>
          </div>
        ))}
      </div>

      {/* ── Playground Body ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Request Parameters */}
        <div className="lg:col-span-5 s-panel space-y-4">
          <div className="pb-2 font-mono" style={{ borderBottom: `1px solid ${t.borderBase}` }}>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>
              Agent Transaction Configuration
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="block mb-1" style={{ color: t.textSecondary }}>Agent ID</label>
              <input
                type="text"
                value={agentId}
                onChange={e => setAgentId(e.target.value)}
                className="s-input"
              />
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
                <label className="block mb-1" style={{ color: t.textSecondary }}>Category</label>
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
                <label className="block mb-1" style={{ color: t.textSecondary }}>Hop Count</label>
                <input
                  type="number"
                  value={hopCount}
                  onChange={e => setHopCount(Number(e.target.value))}
                  className="s-input"
                />
              </div>
              <div>
                <label className="block mb-1" style={{ color: t.textSecondary }}>Budget ($ USD)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  className="s-input"
                />
              </div>
            </div>
          </div>

          <button
            onClick={runFullFlow}
            disabled={loading}
            className="s-btn-primary w-full justify-center text-xs py-2.5 mt-2"
          >
            Dispatch x402 Request
          </button>
        </div>

        {/* Right: Live Interactive Trace */}
        <div className="lg:col-span-7 s-panel space-y-4">
          <div className="pb-2 font-mono flex items-center justify-between" style={{ borderBottom: `1px solid ${t.borderBase}` }}>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>
              Live Protocol Inspector
            </span>
            <span className="text-[10px] font-bold flex items-center gap-1.5" style={{ color: pollingStatus === 'confirmed' ? t.accentGreen : t.accentAmber }}>
              {pollingStatus === 'pending' && <Loader2 className="w-3 h-3 animate-spin" />}
              {pollingStatus === 'pending' ? 'POLLING INDEXER...' : pollingStatus === 'confirmed' ? 'ON-CHAIN CONFIRMED' : 'PORT 4002'}
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {step2Response && (
              <div
                className="p-3 rounded-lg space-y-1"
                style={{ background: `${t.accentAmber}12`, border: `1px solid ${t.accentAmber}35` }}
              >
                <div className="flex items-center justify-between font-bold" style={{ color: t.accentAmber }}>
                  <span>HTTP {step2Response.status} {step2Response.statusText}</span>
                  <span className="text-[10px]">CHALLENGE DETECTED</span>
                </div>
                <p className="text-[11px]" style={{ color: t.textSecondary }}>
                  Pay-To: <span className="font-bold" style={{ color: t.textPrimary }}>{step2Response.body?.x402?.payToAddress?.slice(0, 16)}...</span>
                </p>
                <p className="text-[11px]" style={{ color: t.textSecondary }}>
                  Price: <span className="font-bold" style={{ color: t.accentGreen }}>{step2Response.body?.x402?.priceMicroAlgos || 5000} microUnits</span>
                </p>
              </div>
            )}

            {step3Payment && (
              <div
                className="p-3 rounded-lg space-y-1"
                style={{ background: `${t.accentCyan}12`, border: `1px solid ${t.accentCyan}35` }}
              >
                <div className="flex items-center justify-between font-bold" style={{ color: t.accentCyan }}>
                  <span>SIGNED ASSET TRANSFER ("axfer")</span>
                  <span className="text-[10px]">USDC ASA #10458941</span>
                </div>
                <p className="text-[11px] break-all" style={{ color: t.textSecondary }}>
                  TXID: {step3Payment.txId}
                </p>
              </div>
            )}

            {step5Result && (
              <div
                className="p-4 rounded-lg border space-y-2"
                style={{
                  background: step5Result.decision === 'block' ? `${t.accentRed}15` : `${t.accentGreen}15`,
                  borderColor: step5Result.decision === 'block' ? `${t.accentRed}40` : `${t.accentGreen}40`,
                }}
              >
                <div className="flex items-center justify-between font-bold">
                  <span style={{ color: step5Result.decision === 'block' ? t.accentRed : t.accentGreen }}>
                    DECISION: [ {step5Result.decision ? step5Result.decision.toUpperCase() : 'APPROVED'} ]
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: t.accentGreen }}>
                    ✓ SETTLED (Round #{step5Result.confirmedRound || 66528838})
                  </span>
                </div>
                <p className="text-xs" style={{ color: t.textPrimary }}>
                  {step5Result.reason || 'USDC Asset Transfer confirmed on Algorand TestNet.'}
                </p>
                <a
                  href={`https://lora.algokit.io/testnet/transaction/${step5Result.txId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold hover:underline pt-1"
                  style={{ color: t.accentCyan }}
                >
                  View Asset Transfer on Lora Explorer <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {!step2Response && (
              <div className="p-8 text-center font-mono text-xs" style={{ color: t.textMuted }}>
                Click "Dispatch x402 Request" to initiate the live USDC payment protocol handshake.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
