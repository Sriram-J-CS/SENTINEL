# Sentinel — Behavioral Risk Layer for Autonomous AI Agent Payments (x402 / Algorand AVM)

Algorand TestNet App ID: 769717602  
Protocol Standard: x402 HTTP Payment Protocol  
Asset Standard: USDC TestNet ASA #10458941  
License: MIT  

---

## Executive Summary

Sentinel is an enterprise behavioral risk layer and automated policy enforcement engine designed for autonomous AI agent payments on the Algorand blockchain.

As autonomous AI agents acquire wallet access and interact with web APIs, traditional hardcoded spending limits fail to prevent budget drain, price drift from malicious sellers, or prompt-injection exploits. Sentinel sits as an intelligent interceptor between AI agents and resource servers, scoring both sides of every transaction in real time and logging immutable decision proofs to Algorand AVM Box Storage.

---

## Target Audience and Key Stakeholders

1. AI Agent Developers and Operators: Prevent budget exhaustion, runaway loops, and unauthorized payment delegation through rolling statistical spend envelopes.
2. Resource Server Merchants: Monetize APIs securely by returning HTTP 402 Payment Required challenges that resolve instantly over Algorand microAlgo/USDC rails.
3. Protocol Reviewers and Hackathon Judges: Verify deep Algorand AVM smart contract integration, 64-byte Box Storage state receipts, and two-sided risk scoring.

---

## Core Risk Engines

### 1. Per-Agent 30-Day Behavioral Baselines
Rather than relying on static caps, Sentinel calculates continuous 30-day statistical spend envelopes per agent category. Transactions exceeding expected spend velocity or standard deviation bounds trigger automatic escalation or blocking.

### 2. Two-Sided Merchant Scoring
Standard payment guards only evaluate the buyer. Sentinel evaluates both the buying agent and the selling merchant endpoint, detecting post-registration price drift, endpoint churn, and unexpected price increases before funds are signed.

### 3. Cross-Agent Fleet Correlation
Sentinel monitors activity across entire fleets of autonomous agents. When multiple independent agents suddenly converge on an unrated endpoint within a short time window, Sentinel flags the pattern as a potential coordinated prompt-injection attack.

### 4. On-Chain AVM Box Storage Lineage
Every policy decision (APPROVE, BLOCK, ESCALATE) is committed to Algorand Box Storage under Application ID #769717602. This produces a 64-byte tamper-evident proof readable by peer agents and facilitators without relying on a central database.

### 5. Native Algorand USDC Asset Transfer (axfer)
Sentinel constructs and validates standard Algorand Asset Transfer (axfer) transactions targeting USDC ASA #10458941 between distinct client and receiving wallet addresses.

---

## System Architecture and Workflow

### Process Flow Diagram

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

## Step-by-Step Execution Sequence

1. Request Initiation: An autonomous AI agent sends an unpaid HTTP request to a protected resource endpoint.
2. HTTP 402 Challenge: The server responds with HTTP 402 Payment Required, supplying price details, recipient AVM_ADDRESS, and USDC ASA ID #10458941.
3. Interception and Evaluation: Sentinel's interceptor evaluates three dimensions concurrently:
   - Agent 30-Day Spend Velocity (Z-Score calculation)
   - Merchant Price Drift and Endpoint Reputation
   - Cross-Agent Fleet Convergence Rate
4. Policy Decision:
   - APPROVE: Payment proceeds to signing.
   - BLOCK: Payment is rejected due to policy breach.
   - ESCALATE: Requires human-in-the-loop confirmation.
5. On-Chain Settlement: The client wallet signs a standard Algorand Asset Transfer transaction (`axfer`) and submits it via the GoPlausible facilitator.
6. AVM Receipt Commitment: The smart contract updates 64-byte Box Storage on Application #769717602, recording cumulative spend and decision hashes.
7. Resource Unlock: Upon transaction verification, the resource server unlocks the requested API endpoint.

---

## Component Breakdown

- `/frontend`: React, TypeScript, Vite, Tailwind CSS, Recharts dashboard workstation.
- `/backend`: Node.js Express server, Algorand SDK integration, baseline calculation engines, and JSON database persistence.
- `/api`: Vercel serverless function entrypoint for production routing.

---

## Local Setup and Quickstart

### Prerequisites
- Node.js version 18 or higher
- npm package manager

### 1. Clone Repository and Install Dependencies

```bash
git clone https://github.com/Sriram-J-CS/SENTINEL.git
cd SENTINEL

npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure Environment Variables

The default configuration is defined in `backend/.env`:

```env
PORT=4002
SENTINEL_APP_ID=769717602
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_PORT=443
USDC_TESTNET_ASSET_ID=10458941
FACILITATOR_URL=https://facilitator.goplausible.xyz
AVM_ADDRESS=OAFMDTGYYN7TSHDL3LGFNCGY47F6XOVW47ENBBTHV4UVC5RNDDEYJDULBU
```

### 3. Start Development Servers

Terminal 1 (Backend API Server):
```bash
npm run backend
```

Terminal 2 (Frontend Workstation Dashboard):
```bash
npm run dev --prefix frontend
```

Open `http://localhost:3000` in your web browser.

---

## On-Chain Contract Reference

- Algorand TestNet Application ID: #769717602
- Lora Explorer: https://lora.algokit.io/testnet/application/769717602
- Pera Explorer: https://explorer.perawallet.app/application/769717602?network=testnet

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.
