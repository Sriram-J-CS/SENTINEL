# Sentinel

**Behavioral Risk Layer for Autonomous AI Agent Payments on Algorand (x402 Protocol)**

Sentinel is a real-time policy-enforcement engine that sits in front of x402 payment execution and decides, per transaction, whether an autonomous AI agent's payment should be approved, escalated, or blocked — based on that specific agent's own behavioral history, the counterparty merchant's trust profile, and the payment's position inside a multi-hop delegation chain. Every decision is backed by a live, signed Algorand TestNet transaction and a tamper-evident on-chain receipt, not a simulated result.

Built for the **Agentic Solutions — Powered by x402** hackathon track, deployed against Algorand TestNet via the GoPlausible facilitator.

---

## Table of Contents

- [The Problem](#the-problem)
- [What Sentinel Does](#what-sentinel-does)
- [Full End-to-End Workflow](#full-end-to-end-workflow)
- [System Architecture](#system-architecture)
- [Why This Is Different](#why-this-is-different)
- [Backend Engines](#backend-engines)
- [API Routes](#api-routes)
- [Frontend Screens](#frontend-screens)
- [Algorand & x402 Configuration](#algorand--x402-configuration)
- [Tech Stack](#tech-stack)
- [Local Setup](#local-setup)
- [Verifying a Live Transaction](#verifying-a-live-transaction)
- [Known Scope & Limitations](#known-scope--limitations)
- [Roadmap](#roadmap)
- [License](#license)

---

## The Problem

Autonomous AI agents can now execute financial transactions and procure API resources independently via the **x402 HTTP Payment Protocol**, without requiring manual human sign-off on every individual call. This is the entire premise of "agentic commerce" — and it opens a gap that no existing reference implementation actually closes.

Existing safety approaches (including the official Algorand Foundation's own reference Spend Policy Guard, and generic implementations like static allowlist/budget-cap patterns) rely on **fixed, global rules**: a daily budget, a max-per-request cap, a static allow/block list of services. These catch the obvious cases — a $500 payment against a $5 cap — but they have two structural blind spots that matter far more in practice:

1. **Behavioral anomalies within static caps.** An agent whose normal behavior is $0.50 web-query calls can be manipulated — via prompt injection or a compromised task — into making dozens of $45 calls. Every single one of those calls is technically under a $50 static cap, so a static rule engine approves all of them while the agent's wallet is fully drained. The cap was never the right defense; the agent's *own historical pattern* was the signal that mattered, and static systems don't look at it.

2. **Multi-hop chain blindness and merchant drift.** In a delegation chain (Agent A → Agent B → Agent C), each individual hop can pass its own local check while the chain as a whole has cumulatively overspent or drifted off its original task. Static systems also don't inspect the *merchant side* of the transaction at all — leaving agents exposed to post-registration price drift, bait-and-switch endpoint behavior, or a merchant that looks fine in isolation but is being hit by a coordinated fleet of compromised agents simultaneously.

Sentinel exists to close both gaps — on the agent side and on the merchant side — while producing a verifiable on-chain record of every decision.

---

## What Sentinel Does

**1. Per-Agent Rolling Behavioral Baselines**
Instead of a fixed global cap, Sentinel computes a statistical spending envelope per agent, per merchant category, using a rolling historical window. A new transaction is scored against that specific agent's own mean and standard deviation (μ ± 2σ), not a one-size-fits-all number. A transaction that would pass any static cap can still be flagged the moment it deviates sharply from *that agent's* own normal behavior.

**2. Two-Sided Merchant & Fleet Risk**
Sentinel doesn't just police the agent — it scores the counterparty. Merchant price-drift is tracked over time (has this endpoint quietly raised its price since the agent last transacted with it?), bazaar/registration stability is monitored, and cross-agent fleet correlation detects when multiple agents suddenly converge on the same anomalous pattern — a strong signal of a coordinated prompt-injection attack rather than isolated bad luck.

**3. Lineage-Aware Multi-Hop Tracking**
Every payment carries a signed context — root task ID, hop count, cumulative spend so far — structured as an ordered chain. This lets Sentinel catch cascades where each hop looks individually compliant but the chain as a whole has drifted off-task or blown its cumulative budget.

**4. Tamper-Evident On-Chain Receipts**
Every policy decision (`APPROVE`, `BLOCK`, `ESCALATE`) is committed on-chain to Algorand AVM Box Storage under a dedicated smart contract application. This produces a cryptographic record that any peer agent, facilitator, or auditor can independently verify — without trusting Sentinel's own API as the sole source of truth.

---

## Full End-to-End Workflow

```
+------------------+       +------------------+       +-----------------------+
|     AI Agent      |       | Resource Server  |       | Sentinel Risk Engine |
+------------------+       +------------------+       +-----------------------+
        |                          |                              |
        |  1. GET /resource/compute |                             |
        |------------------------->|                              |
        |                          |                              |
        |  2. HTTP 402 Challenge    |                             |
        |<-------------------------|                              |
        |  (payTo, price, ASA ID)  |                              |
        |                          |                              |
        |  3. Route request through Sentinel for evaluation       |
        |---------------------------------------------------------->|
        |                                                          |
        |                          |   Compute baseline z-score    |
        |                          |   Score merchant price drift  |
        |                          |   Check fleet correlation     |
        |                          |   Evaluate lineage/cascade    |
        |                                                          |
        |  4. Risk decision returned (APPROVE / ESCALATE / BLOCK)   |
        |<----------------------------------------------------------|
        |                          |                              |
        |  5. If approved: build unsigned "axfer" (asset transfer) |
        |     transaction, correct sender = agent wallet,          |
        |     correct receiver = AVM_ADDRESS (resource server)     |
        |                          |                              |
        |  6. Sign via connected wallet (Lute Wallet)              |
        |                          |                              |
        |  7. Submit signed transaction to GoPlausible facilitator |
        |---------------------------------------------------------->|
        |                          |  Facilitator verifies         |
        |                          |  signature + balance,         |
        |                          |  broadcasts to Algorand       |
        |                          |  TestNet                      |
        |                          |                              |
        |  8. Poll indexer for confirmation; write 64-byte decision |
        |     receipt to AVM Box Storage on confirmation           |
        |                          |                              |
        |  9. HTTP 200 OK + resource returned to agent              |
        |<-------------------------|                              |
```

Step-by-step, in plain terms:

1. The agent's client requests a protected resource.
2. The resource server responds with an HTTP `402 Payment Required`, including exactly who to pay (`payTo`), how much, and in what asset.
3. Before any payment is signed, the request is routed through Sentinel's `POST /policy/check`.
4. Sentinel evaluates: baseline deviation (z-score), merchant trust/price-drift, fleet correlation, and lineage/cascade context — and returns a structured decision.
5. If approved, the client builds a real Algorand **asset-transfer ("axfer")** transaction — sender is the agent's own wallet, receiver is the resource server's distinct `AVM_ADDRESS` (these must never be the same address; Sentinel validates this explicitly before signing).
6. The transaction is signed via the connected **Lute Wallet**.
7. The signed transaction is submitted to the **GoPlausible facilitator**, which verifies the signature and balance and broadcasts it to Algorand TestNet.
8. Once confirmed on-chain, Sentinel writes a 64-byte tamper-evident receipt of the decision into AVM Box Storage, and the dashboard updates from this confirmed on-chain state — not from optimistic frontend state.
9. The resource server returns the requested resource with `HTTP 200`.

---

## System Architecture

```
┌───────────────┐     ┌──────────────────┐     ┌────────────────────────┐
│   Frontend    │────▶│   Backend API     │────▶│  GoPlausible Facilitator│
│  (Vite/React) │◀────│  (Express/Node)   │◀────│                        │
└───────────────┘     └──────────────────┘     └────────────────────────┘
                              │                             │
                              ▼                             ▼
                    ┌───────────────────┐        ┌──────────────────────┐
                    │  SQLite / Seed DB │        │   Algorand TestNet    │
                    │  (agents, decisions)       │  (axfer + AVM Box     │
                    └───────────────────┘        │   Storage receipts)   │
                                                  └──────────────────────┘
```

- **Frontend** reads all live and historical data from the backend API — never fabricates or mocks a decision result.
- **Backend** owns behavioral scoring, merchant risk, lineage tracking, and Algorand transaction construction.
- **Database** persists agents, decisions, and receipts so the dashboard reflects real accumulated history across sessions, not just the current one.
- **Algorand TestNet** is the actual settlement layer — every approved decision corresponds to a real signed transaction, verifiable independently on a block explorer.

---

## Why This Is Different

| Existing Approach | Sentinel |
|---|---|
| Fixed global spend cap per agent | Per-agent, per-category statistical baseline (μ ± 2σ) |
| Blind to the agent's own historical pattern | Flags deviation from that specific agent's normal behavior |
| No visibility into merchant-side risk | Two-sided scoring: merchant price drift + registration stability |
| No cross-agent correlation | Fleet-wide anomaly correlation to catch coordinated prompt-injection attacks |
| Each hop checked in isolation | Lineage-aware cumulative chain tracking (rootTaskId, hop count, cumulative spend) |
| Opaque approve/block decisions | Every decision returns a structured reason tied to the specific check that fired |
| Policy state trusted only via a centralized API | Decisions committed to Algorand AVM Box Storage — independently verifiable on-chain |

---

## Backend Engines

Located in `backend/src/`:

| File | Responsibility |
|---|---|
| `baselineEngine.ts` | Computes rolling statistical envelopes — mean, standard deviation, z-score anomaly threshold — per agent and category. |
| `intentEngine.ts` | Scores semantic alignment between an agent's stated task intent and the merchant category being paid. |
| `lineageEngine.ts` | Tracks multi-hop delegation chains and projects cumulative budget exposure across hops. |
| `trustGraph.ts` | Computes merchant price drift, bazaar/registration stability, and cross-agent fleet correlation. |
| `algorand.ts` | Constructs real Algorand asset-transfer ("axfer") transactions, polls the indexer for confirmation, and commits 64-byte decision receipts to AVM Box Storage. Validates sender ≠ receiver and non-zero amount before signing. |
| `x402Middleware.ts` | Issues HTTP `402 Payment Required` challenges with the correct distinct receiving wallet address (`AVM_ADDRESS`), price, and asset. |

---

## API Routes

| Method & Route | Purpose |
|---|---|
| `GET /health` | System status, Algorand TestNet connectivity, and smart contract application info. |
| `POST /policy/check` | Core x402-protected risk-check endpoint — returns a 402 challenge or a structured decision. |
| `GET /resource/:id` | Protected resource endpoint, unlocked only after valid x402 payment proof. |
| `GET /api/live-feed` | Recent decision logs for the real-time dashboard feed. |
| `GET /api/agents` | Directory of monitored agents with rolling spend stats and status badges. |
| `GET /api/agent/:id` | Transaction history and baseline stats for one specific agent. |
| `GET /api/lineage/:rootTaskId` | Full multi-hop cascade chain graph and cumulative spend for a task. |
| `GET /api/merchant-risk` | Two-sided merchant trust scores and price-drift ratings. |
| `GET /api/fleet-correlation` | Cross-agent fleet anomaly correlation state. |
| `GET /api/stats` | Aggregate system statistics: total volume, threats blocked, counterfactual loss prevented. |
| `POST /api/reset-seed` | Re-seeds the agent/decision database with historical records for demo purposes. |

Every decision response follows this structure:

```json
{
  "agentId": "agent_9942",
  "txId": "NHUB2OTVS5EXSF7ASP67UKW4GYNRV57NT55XIMSESZ5QTOFJ36EA",
  "amount": 75.00,
  "merchantCategory": "cloud_hosting",
  "deviationScore": 4.8,
  "status": "blocked",
  "reason": "Amount ($75.00) exceeds historical spend tolerance cap ($12.50) by +500%",
  "rootTaskId": "ag_proc_9982x_alpha",
  "hopCount": 1,
  "cumulativeSpend": 75.00,
  "agentBaselineRange": { "min": 0.10, "max": 12.50, "avg": 2.30 }
}
```

---

## Frontend Screens

Located in `frontend/src/`:

| Screen | File | What It Shows |
|---|---|---|
| Cover Page | `LandingPage.tsx` | Protocol overview, monitored agents directory, live transactions table, 5-step x402 diagram, smart contract specs. |
| Command Center | `LiveFeed.tsx` | Real-time decision feed, z-score velocity chart, stats ribbon, decision filter tabs. |
| Agent Detail | `AgentDetail.tsx` | Per-agent statistical envelope curves (μ ± 2σ) and historical category deviation. |
| Policy Guard | `PolicyGuard.tsx` | Interactive policy simulator — test any agent, amount, category, and cascade hop against the live behavioral pipeline. |
| Merchant Risk | `MerchantRisk.tsx` | Two-sided merchant trust visualizer — endpoint churn and price-drift tracking. |
| Fleet Correlation | `FleetCorrelation.tsx` | Cross-agent anomaly correlation view for detecting coordinated prompt-injection patterns. |
| Payment Playground | `PaymentPlayground.tsx` | Executes a real signed x402 "axfer" transaction end to end via connected wallet. |
| Receipts Ledger | `ReceiptsLedger.tsx` | Searchable, filterable log of every settled decision. |
| On-Chain Evidence | `OnChainProof.tsx` | Inspects the 64-byte AVM Box Storage receipt for a decision, with live links to the Algorand block explorer. |

---

## Algorand & x402 Configuration

| Setting | Value |
|---|---|
| Network | Algorand TestNet (`https://testnet-api.algonode.cloud`) |
| Smart Contract Application ID | `#769717602` |
| Payment Asset | USDC TestNet ASA `#10458941` |
| Transaction Type | `axfer` (Asset Transfer — never `pay`/native ALGO, never `appl` alone) |
| Facilitator | `https://facilitator.goplausible.xyz` |
| Resource Server Receiving Address (`AVM_ADDRESS`) | `OAFMDTGYYN7TSHDL3LGFNCGY47F6XOVW47ENBBTHV4UVC5RNDDEYJDULBU` |
| Connected Wallet Provider | Lute Wallet |

**Note on sender/receiver validation:** an earlier build had a bug where sender and receiver could resolve to the same address (a self-payment). The transaction builder now explicitly validates `sender !== receiver` and a non-zero `amount` against the real 402 payment requirements before any transaction is signed — this is enforced in `algorand.ts`, not just in the UI.

---

## Tech Stack

**Backend**
- Node.js v18+, TypeScript v5.7.2, Express v4.21.2
- `algosdk` v3.0.0 (Algorand node & indexer client)
- `@x402-avm/core`, `@x402-avm/avm`, `@x402-avm/express` v0.1.0
- `better-sqlite3` for persistence
- `dotenv`, `cors`, `tsx`

**Frontend**
- React v18.3.1, TypeScript v5.7.2, Vite v6.0.5
- Tailwind CSS v3.4.17
- Recharts v2.15.0 (baseline envelope and velocity charts)
- Lucide React (iconography)
- `@txnlab/use-wallet` with Lute Wallet connector

**Infrastructure**
- Deployed on Railway (persistent disk required for SQLite; avoid serverless/ephemeral-filesystem platforms for this reason)

---

## Local Setup

**Prerequisites:** Node.js v18+, npm

```bash
git clone https://github.com/Sriram-J-CS/SENTINEL.git
cd SENTINEL

npm install --prefix backend
npm install --prefix frontend
```

**Environment variables** (`backend/.env`):

```
AVM_ADDRESS=OAFMDTGYYN7TSHDL3LGFNCGY47F6XOVW47ENBBTHV4UVC5RNDDEYJDULBU
FACILITATOR_URL=https://facilitator.goplausible.xyz
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_NETWORK=testnet
```

**Environment variables** (`frontend/.env.local`):

```
VITE_FACILITATOR_URL=https://facilitator.goplausible.xyz
VITE_ALGOD_NETWORK=testnet
```

**Run the servers:**

```bash
# Terminal 1 — backend API (port 4002)
npm run backend

# Terminal 2 — frontend dashboard (port 3000)
npm run dev --prefix frontend
```

Open `http://localhost:3000`.

**Fund a TestNet wallet** via the Algorand TestNet dispenser and connect it with Lute Wallet before running a live payment.

---

## Verifying a Live Transaction

```bash
cd backend
npx tsx src/testRealPayment.ts
```

This runs one real payment through the full pipeline. Confirm the result directly on-chain:

- **Application (AVM Box Storage receipts):** `https://lora.algokit.io/testnet/application/769717602`
- **Individual transaction:** search the returned `txId` at `https://lora.algokit.io/testnet/transaction/<txId>`

A correctly settled payment should show `Type: Asset Transfer`, a sender address matching the connected agent wallet, a receiver address matching `AVM_ADDRESS` (never identical to the sender), and an amount in USDC matching the price returned in the original 402 challenge.

---

## Known Scope & Limitations

- Enforcement currently runs at the payment-gateway/proxy level — it intercepts the 402 flow before settlement, rather than embedding at the wallet signer/TEE level. This is an honest, buildable scope for a hackathon timeline.
- Baseline statistics are seeded with historical synthetic data for demo purposes alongside live transactions, so the dashboard has genuine data from first load rather than an empty state.

## Roadmap

- Signer-level / TEE-embedded enforcement, so policy checks cannot be bypassed by a client that skips the proxy entirely
- Mainnet deployment path with real facilitator fee handling
- Expanded fleet-correlation model trained on a larger multi-agent dataset

---

## License

Distributed under the MIT License. See `LICENSE` for details.
