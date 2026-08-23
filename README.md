# 🛡️ Sentinel — Behavioral Risk Layer for Autonomous AI Agent Payments (x402 / Algorand AVM)

[![Algorand TestNet](https://img.shields.io/badge/Algorand-TestNet%20App%20%23769717602-0052FF?style=flat-square&logo=algorand)](https://lora.algokit.io/testnet/application/769717602)
[![x402 Protocol](https://img.shields.io/badge/Protocol-x402%20HTTP%20Payment-10B981?style=flat-square)](https://facilitator.goplausible.xyz)
[![USDC ASA](https://img.shields.io/badge/USDC%20ASA-10458941-00D2FF?style=flat-square)](https://lora.algokit.io/testnet/asset/10458941)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **Sentinel** is an enterprise-grade behavioral risk and policy enforcement layer for autonomous AI agents executing payments via the **x402 HTTP protocol** on **Algorand**.

---

## 🎯 Target Audience & Purpose

**Sentinel** was built to solve a critical trust gap in autonomous agent commerce. As AI agents gain access to web wallets and procurement APIs, existing static allowlists fail to protect against budget exhaustion, merchant price drift, and prompt-injection attacks.

Sentinel serves three core ecosystems:

1. **AI Agent Developers & Operators**: Safeguard autonomous procurement workflows with 30-day statistical spend envelopes and real-time z-score anomaly detection.
2. **Resource Server Merchants**: Safely monetize compute, data pipelines, and API endpoints via standard HTTP 402 challenges on Algorand.
3. **Hackathon Judges & Protocol Reviewers**: Experience a complete, production-ready implementation of deep Algorand AVM smart contract integration (`App #769717602`), 64-byte Box Storage lineage tracking, and real GoPlausible microAlgo/USDC settlement.

---

## ✨ Key Architectural Innovations

### 1. Per-Agent 30-Day Behavioral Baselines
Rather than enforcing rigid static caps, Sentinel calculates continuous 30-day rolling statistical envelopes ($\mu \pm 2\sigma$) per agent category. Transactions exceeding expected spend velocity or category variance trigger automatic escalation or blocks.

### 2. Two-Sided Merchant Scoring
Most policy guards only inspect the buyer. Sentinel is the **first to score the merchant endpoint**, detecting post-registration price drift, bait-and-switch pricing, and rapid endpoint churn before the agent signs a transaction.

### 3. Cross-Agent Fleet Correlation
Isolated log analysis misses coordinated attack vectors. Sentinel correlates payment attempts across entire agent fleets in real time. When multiple independent agents converge on an unrated endpoint within seconds, Sentinel flags the pattern as a potential prompt-injection exploit.

### 4. On-Chain AVM Box Storage Lineage
Every payment decision (`APPROVE`, `BLOCK`, `ESCALATE`) is committed to **Algorand AVM Box Storage** under **App `#769717602`**. This creates a 64-byte, tamper-evident binary proof that downstream peer agents and facilitators can independently verify on-chain.

### 5. Native Algorand USDC Asset Transfer (`axfer`)
Sentinel strictly constructs and verifies standard Algorand **Asset Transfer (`axfer`)** transactions using TestNet USDC ASA `#10458941`, ensuring real economic settlement between distinct client and receiving wallets with zero self-payment bugs.

---

## 🔄 End-to-End x402 Lifecycle

```
[ AI Agent ] ──(1) Unpaid HTTP GET / POST ──> [ Resource Server / Sentinel Interceptor ]
                                                           │
[ AI Agent ] <──(2) HTTP 402 Payment Required ─────────────┘
  │ (Contains price, receiving AVM_ADDRESS, ASA ID #10458941)
  │
  ├─── (3) Sentinel Risk Engine Evaluates:
  │         • 30-Day Agent Baseline Z-Score
  │         • Two-Sided Merchant Price Drift
  │         • Cross-Agent Fleet Correlation
  │
  ├─── (4) If Approved: Build & Sign Algorand USDC Asset Transfer ("axfer")
  │
  └─── (5) Submit Tx ──> [ GoPlausible Facilitator & Algorand Node ]
                             │
                             ├── Settled On-Chain in < 500ms
                             └── Written to AVM Box Storage (App #769717602)
```

---

## 💻 Tech Stack

* **Smart Contract Layer**: TEAL / Algorand AVM (Application ID: `#769717602`, Box Storage receipts)
* **Backend Engine**: Node.js, Express, TypeScript, `@algorandfoundation/algokit-utils`, `algosdk`
* **Frontend Workstation**: React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
* **Protocol Standards**: x402 HTTP Standard, GoPlausible Facilitator API, USDC TestNet ASA `#10458941`
* **Deployment**: Vercel Serverless & Static CDN

---

## 🛠️ Quickstart & Local Setup

### Prerequisites
* Node.js v18+ and `npm`
* Access to internet (for Algonode TestNet RPC endpoints)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Sriram-J-CS/SENTINEL.git
cd SENTINEL

# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

### 2. Configure Environment Variables
The repository comes pre-configured with TestNet settings in `backend/.env`:
```env
PORT=4002
SENTINEL_APP_ID=769717602
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_PORT=443
USDC_TESTNET_ASSET_ID=10458941
FACILITATOR_URL=https://facilitator.goplausible.xyz
AVM_ADDRESS=OAFMDTGYYN7TSHDL3LGFNCGY47F6XOVW47ENBBTHV4UVC5RNDDEYJDULBU
```

### 3. Run Locally

Start the Backend API Server (Port 4002):
```bash
npm run backend
```

In a new terminal window, start the Frontend Workstation (Port 3000):
```bash
npm run dev --prefix frontend
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser to access the Sentinel Workstation.

---

## 🧪 Real On-Chain Payment Test

Execute a real end-to-end x402 payment flow against Algorand TestNet:
```bash
cd backend
npx tsx src/testRealPayment.ts
```

This test will:
1. Issue an unpaid HTTP request to `/policy/check`.
2. Intercept the `HTTP 402 Payment Required` challenge.
3. Construct a valid `axfer` (Asset Transfer) transaction for USDC ASA `#10458941` to `AVM_ADDRESS`.
4. Submit the transaction to Algorand TestNet and verify the confirmed transaction hash on **Lora Explorer**.

---

## 🔍 On-Chain Verification & Explorer Links

* **Algorand TestNet Smart Contract Application**:  
  👉 **[Lora Explorer: App #769717602](https://lora.algokit.io/testnet/application/769717602)**  
  👉 **[Pera Explorer: App #769717602](https://explorer.perawallet.app/application/769717602?network=testnet)**

* **Live Verified TestNet Transaction**:  
  👉 **[Lora Explorer Tx Receipt](https://lora.algokit.io/testnet/transaction/4T65SEAO34WP6HRWWY7WGZCTVUUOP26VKKY4WPV2DGZMNGD33NEA)**

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
