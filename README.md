# Sentinel

> Behavioral Risk Layer for Autonomous AI Agent Payments on Algorand (x402 Protocol)

---

## The Problem

Autonomous AI agents can now execute financial transactions and procure API resources independently via the **x402 HTTP Payment Protocol** without requiring manual human approval per transaction. However, existing safety implementations rely on static allowlists and fixed per-transaction spend caps (such as the t54 or AgentBudget reference implementations).

These static approaches suffer from two critical vulnerabilities:

1. **Inability to Detect Behavioral Anomalies Within Static Caps**: An agent with a $50 static allowance that normally spends $0.50 on web queries can be manipulated via prompt injection to make dozens of $45 calls. Because each call is under $50, static rules mark every transaction as compliant while the agent's wallet is completely drained.
2. **Blindness to Multi-Hop Chain Budget Drift & Merchant Price Drift**: In multi-hop autonomous agent workflows (where Agent A delegates to Agent B, which delegates to Agent C), single-hop rules fail to evaluate cumulative chain exposure. Furthermore, static allowlists fail to inspect the merchant endpoint—leaving agents exposed to post-registration price drift and bait-and-switch tactics.

---

## What Sentinel Does

Sentinel introduces an adaptive, two-sided behavioral risk layer for x402 agent payments on the **Algorand AVM** blockchain:

1. **Per-Agent 30-Day Rolling Behavioral Baselines**: Instead of static limits, Sentinel computes statistical spending envelopes ($\mu \pm 2\sigma$) per agent category. Transactions exceeding expected velocity or category variance trigger automatic escalation or blocks.
2. **Two-Sided Merchant Risk & Fleet Anomaly Correlation**: Sentinel evaluates both sides of the transaction. It scores seller price-drift, bazaar registration stability, and monitors cross-agent fleet convergence to prevent prompt-injection attacks across fleets.
3. **Tamper-Evident On-Chain Lineage Receipts**: Every policy decision (`APPROVE`, `BLOCK`, `ESCALATE`) is committed to **Algorand AVM Box Storage** under Application `#769717602`. This generates a 64-byte cryptographic record that peer agents and facilitators can verify on-chain without trusting a centralized API.

---

## System Architecture & Processing Workflow

```
+------------------+         +------------------+         +-----------------------+
|     AI Agent     |         | Resource Server  |         | Sentinel Risk Engine  |
+------------------+         +------------------+         +-----------------------+
         |                            |                               |
         |  1. GET /resource/compute  |                               |
         |--------------------------->|                               |
         |                            |                               |
         |  2. HTTP 402 Challenge     |                               |
         |<---------------------------|                               |
         |  (PayTo, Price, ASA ID)    |                               |
         |                            |                               |
         |  3. Intercept & Evaluate Request                           |
         |----------------------------------------------------------->|
         |                                                            |
         |                            |   Evaluate Baseline Z-Score   |
         |                            |   Score Merchant Price Drift  |
         |                            |   Check Fleet Correlation     |
         |                            |                               |
         |  4. Risk Assessment Result |                               |
         |<-----------------------------------------------------------|
         |  (APPROVE / BLOCK / ESCALATE)                              |
         |                            |                               |
         |  5. Build & Sign Algorand Asset Transfer ("axfer")          |
         |----------------------------------------------------------->|
         |                            |                               |
         |                            |   6. Submit to Facilitator    |
         |                            |   & Write to AVM Box Storage  |
         |                            |   (App ID #769717602)         |
         |                            |                               |
         |  7. HTTP 200 OK + Resource |                               |
         |<---------------------------|                               |
```

---

## Verified Codebase Features & API Routes

### Backend Engines (`backend/src/`)
- `baselineEngine.ts`: Computes 30-day statistical envelopes, mean amounts, standard deviations, and z-score anomaly thresholds.
- `intentEngine.ts`: Calculates semantic alignment scores between agent task prompts and merchant categories.
- `lineageEngine.ts`: Tracks multi-hop delegation chains and projects cumulative budget exposure.
- `trustGraph.ts`: Computes merchant price drift, bazaar registration stability, and cross-agent fleet correlation.
- `algorand.ts`: Constructs native Algorand Asset Transfer (`axfer`) transactions for USDC ASA `#10458941`, polls indexer confirmation, and commits 64-byte proofs to AVM Box Storage (App `#769717602`).
- `x402Middleware.ts`: Returns HTTP 402 Payment Required challenges with distinct receiving wallet address (`AVM_ADDRESS`).

### Express API Routes (`server.ts`)
- `GET /health`: System status, Algorand TestNet connection, and App `#769717602` info.
- `POST /policy/check`: x402 protected risk-check endpoint returning HTTP 402 challenge or decision response.
- `GET /resource/:id`: Protected resource endpoint unlocked upon valid x402 proof submission.
- `GET /api/live-feed`: Recent decision logs and real-time feed data.
- `GET /api/agents`: Directory of 6 synthetic agents with 30-day spend stats and status badges.
- `GET /api/agent/:id`: Transaction history and baseline stats for a specific agent.
- `GET /api/lineage/:rootTaskId`: Multi-hop cascade chain graph and cumulative spend.
- `GET /api/merchant-risk`: Two-sided merchant trust scores and price drift ratings.
- `GET /api/fleet-correlation`: Cross-agent fleet anomaly correlation state.
- `GET /api/stats`: System statistics, total volume, threats blocked, and counterfactual loss prevented.
- `POST /api/reset-seed`: Re-seeds the synthetic agent database with 1,400+ historical records.

### Frontend Workstation Tabs (`frontend/src/`)
- **Cover Page (`LandingPage.tsx`)**: Protocol overview, USP cards, Monitored Agents Directory, Live Transactions dataset table, 5-step x402 diagram, and smart contract specs panel.
- **Command Center (`LiveFeed.tsx`)**: Real-time transaction monitoring, z-score velocity chart, stats ribbon, decision filter tabs, and escalation modal.
- **Agent Detail (`AgentDetail.tsx`)**: Deep-dive statistical envelope curves ($\mu \pm 2\sigma$) and historical category standard deviations.
- **Policy Guard (`PolicyGuard.tsx`)**: Interactive policy risk simulator testing agent prompts and payment amounts.
- **Merchant Risk (`MerchantRisk.tsx`)**: Two-sided merchant trust visualizer tracking endpoint churn and price drift.
- **Fleet Correlation (`FleetCorrelation.tsx`)**: Cross-agent fleet anomaly detector covering prompt injection threat vectors.
- **Payment Playground (`PaymentPlayground.tsx`)**: Interactive x402 transaction executor signing real `"axfer"` transactions.
- **Receipts Ledger (`ReceiptsLedger.tsx`)**: Searchable decision log table.
- **On-Chain Evidence (`OnChainProof.tsx`)**: Algorand Box Storage 64-byte receipt inspector with live Lora and Pera Explorer links.

---

## Tech Stack & Dependencies

### Backend
- Node.js v18+, TypeScript v5.7.2, Express v4.21.2
- `algosdk` v3.0.0 (Algorand Node & Indexer Client)
- `@x402-avm/core`, `@x402-avm/avm`, `@x402-avm/express` v0.1.0
- `dotenv` v16.4.7, `cors` v2.8.5, `tsx` v4.19.2

### Frontend
- React v18.3.1, TypeScript v5.7.2, Vite v6.0.5
- Tailwind CSS v3.4.17, PostCSS v8.4.49, Autoprefixer v10.4.20
- Recharts v2.15.0 (Statistical baseline graphs and velocity charts)
- Lucide React v0.469.0 (UI iconography)

---

## Algorand Network Configuration & Protocol Standards

- **Network**: Algorand TestNet (`https://testnet-api.algonode.cloud`)
- **Smart Contract Application ID**: `#769717602`
- **Payment Asset**: USDC TestNet ASA `#10458941`
- **Transaction Type**: `"axfer"` (Asset Transfer)
- **Facilitator Endpoint**: `https://facilitator.goplausible.xyz`
- **Resource Server Receiving Address (`AVM_ADDRESS`)**: `OAFMDTGYYN7TSHDL3LGFNCGY47F6XOVW47ENBBTHV4UVC5RNDDEYJDULBU`
- **Client Test Account**: `TONJ53ZS2TAH3L37EZSFKFMUBT5HEUYI5Y3JBFUC7UZL7HYHZJNMYOIYPQ`

---

## Local Setup & Execution Guide

### Prerequisites
- Node.js v18+ and `npm`

### 1. Install Dependencies
```bash
git clone https://github.com/Sriram-J-CS/SENTINEL.git
cd SENTINEL

npm install --prefix backend
npm install --prefix frontend
```

### 2. Start Servers

Terminal 1 (Backend API Server on Port 4002):
```bash
npm run backend
```

Terminal 2 (Frontend Workstation Dashboard on Port 3000):
```bash
npm run dev --prefix frontend
```

Open `http://localhost:3000` in your web browser.

### 3. Run Real On-Chain Payment Test
```bash
cd backend
npx tsx src/testRealPayment.ts
```

---

## Smart Contract & On-Chain Explorer Links

- **Algorand TestNet App `#769717602`**:
  - Lora Explorer: https://lora.algokit.io/testnet/application/769717602
  - Pera Explorer: https://explorer.perawallet.app/application/769717602?network=testnet

---

## License

Distributed under the MIT License. See `LICENSE` for details.
