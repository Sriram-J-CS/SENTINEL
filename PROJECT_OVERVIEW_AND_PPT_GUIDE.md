# 🛡️ SENTINEL: Adaptive Behavioral Spend Guard for x402 AI Agent Payments
## Complete Project Documentation, Technical Architecture, and Presentation (PPT) Guide

---

## 📑 TABLE OF CONTENTS
1. **Executive Summary & Pitch**
2. **The Problem Statement: Why AI Agent Payments Break Today**
3. **The Solution: Sentinel's Core Innovation**
4. **End-to-End Workflow & Lifecycle (Every Nook and Corner)**
   - Phase 1: HTTP 402 Handshake & Facilitator Negotiation
   - Phase 2: Algorand TestNet Micropayment Verification
   - Phase 3: The 3-Stage Behavioral Decision Pipeline
   - Phase 4: Algorand Box Storage State & Cryptographic Lineage
   - Phase 5: Counterfactual Exposure Calculation
   - Phase 6: Human-in-the-Loop Escalation Resolution
5. **Technical Architecture & Technology Stack**
6. **Detailed Modules & Feature Breakdown**
   - 1. Command Center (Mission Control)
   - 2. Policy Guard Simulator (Core Differentiator)
   - 3. Payment Playground (Live x402 Protocol Inspector)
   - 4. Agent Demo Flow (Multi-Step Autonomous Sequence)
   - 5. Agent DNA & Drift Trends (Spend Band Oscilloscope)
   - 6. Payment Graph (Traversable Lineage Node Graph)
   - 7. Receipts Ledger (Settlement Audit Table)
   - 8. Architecture Flow Visualizer
   - 9. On-Chain Evidence & Hex Decoder
7. **Complete Slide-by-Slide PPT Presentation Deck (12 Slides)**
8. **Real On-Chain Verification & Demo Scenarios**

---

# 1. EXECUTIVE SUMMARY & PITCH

**Sentinel** is an adaptive behavioral risk policy and multi-hop budget cascade protection layer for the **x402 AI agent payment protocol** on **Algorand TestNet**, integrated with **GoPlausible Facilitator**.

- **What it is:** A paid middleware endpoint (`POST /policy/check`) that autonomous AI agents call before executing payments. It evaluates whether a pending transaction is safe, compliant with historical behavior, aligned with the agent's declared task intent, and within the global multi-agent task budget.
- **Why it matters:** AI agents delegate tasks to sub-agents ($A \to B \to C \to D$). Today's static spend limits (e.g. "Max $50 per transaction") fail completely because 4 legitimate $14 transactions can secretly drain a $40 project budget. Sentinel solves this on-chain.
- **Key Tagline:** *"Static limits protect transactions; Sentinel protects budgets, behaviors, and agent lineages on Algorand."*

---

# 2. THE PROBLEM STATEMENT: WHY AI AGENT PAYMENTS BREAK TODAY

### The Rise of the x402 Protocol
The web is transitioning to machine-to-machine micropayments. Under the `x402` standard, when an AI agent requests a paid API or compute resource, the server responds with `HTTP 402 Payment Required`. The agent pays via crypto (Algorand microAlgos) and retries the request with an `X-402-Payment` receipt.

### The 4 Fatal Flaws of Existing Payment Systems:
1. **The Multi-Hop Cascade Blindspot:**
   - Agent Alpha hires Agent Beta ($12), Beta hires Gamma ($15), Gamma hires Delta ($14), Delta hires Epsilon ($14).
   - *Total Spend:* **$55.00**.
   - *User's Authorized Budget:* **$40.00**.
   - *Result with Traditional Rules:* Every single payment is under the $50 static limit, so **every transaction is approved** and the user is overbilled.
2. **Behavioral Drift & Prompt Injection Exploitation:**
   - A procurement bot whose historical baseline is $8.50 - $12.50 gets prompt-injected or hijacked and attempts an $85.00 compute purchase. A static $100 cap approves it instantly.
3. **Category & Intent Misalignment:**
   - An agent tasked with "Procuring Cloud Compute" suddenly spends funds on "Luxury Travel" or "Arbitrage Execution".
4. **Lack of Immutable On-Chain Lineage:**
   - Centralized servers lose track of sub-agent delegation chains across distributed environments.

---

# 3. THE SOLUTION: SENTINEL'S CORE INNOVATION

Sentinel sits between AI Agents and Payment Facilitators, enforcing a **3-Stage Behavioral Decision Pipeline** backed by **Algorand Smart Contract Box Storage**:

```
                                  SENTINEL 3-STAGE PIPELINE
 ┌──────────────────────┐        ┌────────────────────────────────────────────────────────┐        ┌───────────────────────┐
 │   Autonomous Agent   │───────>│ 1. Historical Spend Band Check ([min, max], EWMA μ)   │───────>│ Algorand Box Storage  │
 │  (x402 Micropayment) │        │ 2. Deviation Engine (Z-Score > 2.5σ, Unseen Category)  │        │ (Tamper-evident state)│
 └──────────────────────┘        │ 3. Multi-Hop Lineage Context (Cumulative vs Budget)   │        └───────────────────────┘
                                 └────────────────────────────────────────────────────────┘
```

1. **Adaptive Behavioral Baselining:** Maintains an Exponentially Weighted Moving Average (EWMA, $\alpha = 0.15$), standard deviation ($\sigma$), and historical spend range band $[min, max]$ for every agent.
2. **On-Chain Lineage Tracking in Algorand Box Storage:** Stores authorized budget, cumulative spend, hop count, and cryptographic SHA256 decision hashes in 64-byte binary records on Algorand TestNet.
3. **Intent Alignment Engine:** Compares merchant categories against natural language task descriptions using keyword and semantic vector matching.
4. **Predictive Cascade Projection:** Analyzes current hop velocity to forecast total chain exposure before the budget is breached.
5. **Counterfactual Exposure Analytics:** Calculates the exact financial loss prevented compared to naive static rules.

---

# 4. END-TO-END WORKFLOW & LIFECYCLE (EVERY NOOK AND CORNER)

### Phase 1: HTTP 402 Handshake & Facilitator Negotiation
1. **Unpaid Request:** The client/agent sends a `POST` request to `http://localhost:4002/policy/check` with transaction metadata.
2. **402 Challenge:** Sentinel intercepts the request and responds with:
   - `HTTP 402 Payment Required`
   - `WWW-Authenticate: x402 realm="Sentinel Policy Risk Check", pay_to="TONJ53ZS...", price="1000", facilitator="https://facilitator.goplausible.com"`
   - `X-402-Pay-To: TONJ53ZS...` (Sentinel's TestNet escrow wallet)
   - `X-402-Price: 1000` (1,000 microAlgos = 0.001 ALGO)

### Phase 2: Algorand TestNet Micropayment Verification
3. **Transaction Signing:** The agent signs an Algorand TestNet micropayment transaction using its private key or Algorand wallet.
4. **Retry with Payment Header:** The agent re-issues the request with:
   - `X-402-Payment: txid=KPJNRFEYQELME667ATPTFBJ37T5TQPU2TRMIPZQ4QSOXVHANMKSA`
5. **Facilitator Verification:** Sentinel queries Algorand TestNet (Algonode / GoPlausible facilitator) to verify confirmation round, sender, recipient, and amount.

### Phase 3: The 3-Stage Behavioral Decision Pipeline
6. **Stage 1 — Historical Spend Band Range:**
   - Calculates whether candidate amount $x$ is within the agent's historical spend band $[min, max]$ and within $\mu \pm 2.5\sigma$.
7. **Stage 2 — Deviation & Anomaly Engine:**
   - Computes $Z\text{-score} = \frac{x - \mu}{\sigma}$. If $Z > 2.5$, flagged as an anomaly.
   - Evaluates merchant category (applies a $+0.40$ penalty if the category has never been used by this agent).
   - Evaluates call cadence velocity (applies a $+0.25$ penalty if frequency is $\ge 5.0\times$ baseline).
8. **Stage 3 — Multi-Hop Lineage Context:**
   - Checks `rootTaskId`, retrieves the Algorand Box Storage record for this chain.
   - Calculates projected cumulative spend: $\text{Cumulative}_{\text{new}} = \text{Cumulative}_{\text{old}} + x$.
   - If $\text{Cumulative}_{\text{new}} > \text{Authorized Budget}$ ($40.00), the transaction is **BLOCKED**.
   - Evaluates intent score: checks if merchant category aligns with declared task intent (scores $0\% - 100\%$).

### Phase 4: Algorand Box Storage State & Cryptographic Proof
9. **On-Chain Box Write:** The smart contract updates the 64-byte binary record in Algorand Box Storage:
   - `[0..7]`: Authorized Budget in microAlgos ($40,000,000$)
   - `[8..15]`: Cumulative Spend in microAlgos
   - `[16..23]`: Hop Count ($1, 2, 3, 4\dots$)
   - `[24]`: Status byte ($0 = \text{Active}, 1 = \text{Blocked}, 2 = \text{Escalated}$)
   - `[32..63]`: SHA256 cryptographic decision hash.
10. **Receipt Generation:** Generates a structured JSON response with immutable transaction hash and Lora/Pera explorer verification URLs.

### Phase 5: Counterfactual Exposure Calculation
11. Computes platform-wide and per-chain counterfactual metrics:
    $$\text{Exposure Prevented} = \text{Total Value If Naive} - \text{Total Value Actually Settled}$$

### Phase 6: Human-in-the-Loop Escalation Resolution
12. Transactions falling in the uncertainty zone ($0.45 \le \text{Risk} < 0.70$) are placed on **HOLD (ESCALATE)**. A human supervisor can review the reason in the UI modal, approve/reject, and write the override directly into Algorand Box Storage.

---

# 5. TECHNICAL ARCHITECTURE & TECHNOLOGY STACK

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             FRONTEND PRESENTATION LAYER                          │
│  React 18 · Vite · TypeScript · Tailwind CSS · Recharts · Lucide · Apple Pro UI  │
│  [Sidebar] · [TopRibbon] · [CommandPalette Cmd+K] · [9 Modular Workstation Views]│
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ HTTP / JSON API (Port 4002)
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                             BACKEND SERVICES LAYER                               │
│  Node.js · Express · TypeScript · SQLite/JSON Database                           │
│  ├── x402Middleware.ts     (HTTP 402 Challenge & Payment Header Verification)   │
│  ├── baselineEngine.ts     (EWMA, Spend Band [min,max], Z-Score Anomaly)         │
│  ├── lineageEngine.ts      (Multi-hop chain tracking, Cascade Projection)       │
│  ├── intentEngine.ts       (Task intent vs merchant category semantic score)     │
│  ├── trustGraph.ts         (Payer risk propagation & cross-agent trust weights)  │
│  └── algorand.ts           (Algorand SDK v3, TestNet Algod, Indexer, Box State)  │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ Algorand AVM Layer
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                        BLOCKCHAIN & FACILITATOR INFRASTRUCTURE                   │
│  Algorand TestNet (App ID #73491028) · GoPlausible Facilitator (x402 AVM)        │
│  ├── 64-Byte Structured Box Storage per rootTaskId                               │
│  ├── Algonode TestNet Node (testnet-api.algonode.cloud)                          │
│  └── Explorers: Lora (lora.algokit.io) & Pera Explorer (perawallet.app)          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

# 6. DETAILED MODULES & FEATURE BREAKDOWN

### 1. Command Center (Mission Control)
- **Top KPI Strip:** Total Volume Analyzed ($812.42), Active Protected Agents (6), Threats Blocked (7), Approval Rate (80.8%), Cascades Prevented (1), Total Exposure Prevented ($219.00).
- **Counterfactual Callout Banner:** Real-time summary of saved funds.
- **Live Decision Stream:** Filter by All/Approve/Block/Escalate with risk gauge bars, rule tags, intent alignment badges, and "Verify on Algorand" links.

### 2. Policy Guard Simulator (Core Differentiator)
- Interactive 3-stage behavioral pipeline test bench.
- Quick Presets: *Normal ($10.50)*, *Burst Spike ($75.00)*, *Chain Budget Breach*, *Unseen Category*, *Intent Drift*.
- Live stage-by-stage pass/fail cards showing exact mathematical parameters.

### 3. Payment Playground (Live x402 Protocol Inspector)
- 5-step visual round-trip tester:
  1. Unpaid Request
  2. HTTP 402 Challenge & Headers
  3. Algorand TestNet Signing
  4. Retrying with `X-402-Payment`
  5. Settlement & Policy Outcome
- Real HTTP header inspector displaying raw wire formats.

### 4. Agent Demo Flow (Multi-Step Autonomous Sequence)
- Automated runner testing 4 simulated agents in sequence:
  - Step 1: Procurement compute ($10.00) $\to$ **Approved**
  - Step 2: Data query ($12.00) $\to$ **Approved**
  - Step 3: Cloud hosting spike ($85.00) $\to$ **Blocked (Z-Score 56.5σ)**
  - Step 4: Delegated task hop ($25.00) $\to$ **Blocked (Cascade Budget Exceeded)**
- Writes real decisions directly into backend DB.

### 5. Agent DNA & Drift Trends (Spend Band Oscilloscope)
- **Historical Spend Band Chart:** Composed chart plotting the $[min, max]$ range band as a shaded gradient, rolling mean ($\mu$) line, $2.5\sigma$ anomaly ceiling, and individual transaction markers.
- **7-Transaction Drift Trend:** Bar chart of % deviation from baseline.
- **Exact Velocity Timeline:** Inter-call latency gaps ($\Delta t$ in seconds) catching burst anomalies.

### 6. Payment Graph (Traversable Lineage Node Graph)
- Ordered traversable graph ($A \to B \to C \to D$) displaying agent, hop count, amount, cumulative spend, intent badge, and block reason.
- Smart Contract Lineage State gauge displaying budget consumption.
- Predictive cascade projection cards.

### 7. Receipts Ledger (Settlement Audit Table)
- Comprehensive ledger of all settled and blocked transactions.
- Filter and search by status, agent, TxID, and category.
- Clickable links to live Algorand TestNet explorers (Lora & Pera).

### 8. Architecture Flow Visualizer
- Interactive node topology diagram mapping:
  `Client -> Sentinel Guard -> GoPlausible Facilitator -> Algorand Box Storage -> Resource Vault`.
- Clickable nodes with live JSON payload wire schemas and latency metrics.

### 9. On-Chain Evidence & Hex Decoder
- Decodes Algorand Box Storage records.
- Displays 64-byte raw binary hex dump with one-click copy and live Lora App link.

---

# 7. COMPLETE SLIDE-BY-SLIDE PPT PRESENTATION DECK (12 SLIDES)

Use the exact content below to build your PowerPoint / Keynote presentation slides:

---

### 🖥️ SLIDE 1: Title & Cover
- **Slide Title:** **SENTINEL**
- **Subtitle:** Adaptive Behavioral Spend Guard & Lineage Protocol for x402 AI Agent Payments
- **Presenters:** [Your Name / Team Name]
- **Key Badges:** Built on Algorand TestNet · GoPlausible Facilitator · x402 Payment Standard
- **Speaker Notes:** *"Good morning everyone. Today we are presenting Sentinel — an intelligent security and behavioral policy layer for autonomous AI agent payments on the Algorand blockchain."*

---

### 🖥️ SLIDE 2: The Problem: Autonomous Agents Break Traditional Payments
- **Slide Title:** The Problem: Why Static Limits Fail for AI Agents
- **Key Points:**
  - **The Multi-Agent Economy is Here:** LLM agents autonomously buy API tokens, compute, data indexing, and sub-services.
  - **The Cascade Blindspot:** Multi-hop agent delegation ($A \to B \to C \to D$) causes budget leaks.
  - **Static Rules Don't Work:** A "$50 max per transaction" limit will approve four $14 transactions that destroy a $40 total project budget.
  - **Prompt Injections & Drift:** Hijacked agents make out-of-character purchases (e.g. $85 instead of normal $10).
- **Visual:** Diagram showing 4 hops of $14 passing a $50 static filter but exceeding the $40 budget.
- **Speaker Notes:** *"Traditional credit cards and static payment limits were designed for humans making single purchases. When AI agents spawn sub-agents in multi-hop chains, static limits are blind to cumulative spend."*

---

### 🖥️ SLIDE 3: The Solution: Sentinel Adaptive Policy Layer
- **Slide Title:** The Solution: Sentinel — Intelligent Behavioral Risk Engine
- **Key Points:**
  - **x402 Protocol Interceptor:** Sits between the AI Agent and the GoPlausible Payment Facilitator.
  - **Adaptive Baselining (Agent DNA):** Learns each agent's historical spend band $[min, max]$, rolling mean, and velocity.
  - **On-Chain Lineage in Algorand Box Storage:** Enforces cumulative budgets and writes cryptographic decision hashes to the blockchain.
  - **Zero Placeholder Data:** 100% real mathematical evaluation, live database persistence, and on-chain verification.
- **Visual:** High-level diagram showing Agent $\to$ Sentinel $\to$ GoPlausible Facilitator $\to$ Algorand TestNet.
- **Speaker Notes:** *"Sentinel is an intelligent middleware layer that intercepts x402 payments, runs an adaptive 3-stage behavioral check in under 12 milliseconds, and records immutable proof on Algorand."*

---

### 🖥️ SLIDE 4: Core Innovation: The 3-Stage Behavioral Decision Pipeline
- **Slide Title:** Core Differentiator: 3-Stage Behavioral Decision Pipeline
- **Key Points:**
  - **Stage 1: Historical Baseline Spend Band Check**
    - Evaluates if transaction falls within the agent's historical range $[min, max]$ (not just an average).
  - **Stage 2: Deviation & Anomaly Engine**
    - Computes $Z\text{-score} = (x - \mu)/\sigma$. Flags anomalies where $Z > 2.5\sigma$.
    - Penalizes unseen merchant categories ($+0.40$) and high-frequency bursts ($+0.25$).
  - **Stage 3: Multi-Hop Lineage Context**
    - Enforces cumulative task budget recorded in Algorand Box Storage.
    - Evaluates semantic intent alignment between task description and merchant category.
- **Visual:** Flowchart of Stage 1 $\to$ Stage 2 $\to$ Stage 3 with Pass/Block indicators.
- **Speaker Notes:** *"Unlike basic firewall rules, Sentinel runs a multi-layered evaluation pipeline: checking historical spend bounds, statistical anomaly scores, and cumulative chain budget."*

---

### 🖥️ SLIDE 5: Algorand Blockchain & Box Storage Architecture
- **Slide Title:** Why Algorand? High-Speed Box Storage & Micropayments
- **Key Points:**
  - **Algorand Smart Contract App ID:** `#73491028` on Algorand TestNet.
  - **64-Byte Binary Box Storage:** Compact, tamper-evident storage per `rootTaskId`.
  - **Instant Finality & Sub-Cent Fees:** Micro-settlements of 1,000 microAlgos (0.001 ALGO).
  - **Public Auditability:** Every settled and blocked decision is viewable on Lora and Pera Explorers.
- **Visual:** 64-byte Box layout breakdown (Budget, Cumulative Spend, Hop Count, Status, SHA256 Hash).
- **Speaker Notes:** *"We chose Algorand because of its 3.5-second instant finality, sub-cent transaction fees, and state-of-the-art Box Storage which lets us store lineage state directly inside the smart contract."*

---

### 🖥️ SLIDE 6: GoPlausible Facilitator & x402 Protocol Flow
- **Slide Title:** Live x402 Protocol Flow with GoPlausible Facilitator
- **Key Points:**
  - **Step 1:** Client sends unpaid request to `/policy/check`.
  - **Step 2:** Sentinel returns `HTTP 402 Payment Required` with `WWW-Authenticate` challenge and GoPlausible facilitator address.
  - **Step 3:** Agent signs Algorand TestNet transaction (1,000 microAlgos).
  - **Step 4:** Agent retries with `X-402-Payment: txid=<TXID>`.
  - **Step 5:** Sentinel verifies on Algorand, updates Box state, and releases policy approval.
- **Visual:** 5-step horizontal round-trip diagram with request/response headers.
- **Speaker Notes:** *"We fully adhere to the official x402 protocol specification, utilizing GoPlausible's facilitator rails for seamless verification on Algorand."*

---

### 🖥️ SLIDE 7: Key Feature 1 — Agent DNA & Historical Spend Band Chart
- **Slide Title:** Agent DNA: Historical Baselining & Velocity Telemetry
- **Key Points:**
  - **Spend Band Chart:** Plots shaded $[min, max]$ spend area, rolling mean ($\mu$), and $2.5\sigma$ anomaly ceiling.
  - **7-Transaction Drift Trend:** Tracks subtle shifts in agent behavior before large anomalies happen.
  - **Exact Velocity Timeline:** Analyzes inter-call latency gaps ($\Delta t$) to catch rapid-fire API burst draining.
- **Visual:** Screenshot of the Agent DNA Spend Band oscilloscope and Drift Trend chart.
- **Speaker Notes:** *"Every agent develops a unique biometric fingerprint. If an agent normally spends between $8.50 and $12.50, any deviation above its 2.5 sigma ceiling is immediately caught."*

---

### 🖥️ SLIDE 8: Key Feature 2 — Payment Graph & Multi-Hop Cascade Protection
- **Slide Title:** Payment Graph: Stopping Multi-Hop Budget Cascades
- **Key Points:**
  - **Traversable Node Topology:** Visualizes $A \to B \to C \to D$ delegation chains.
  - **Predictive Cascade Projection:** Estimates future hop spend based on current cadence and alerts before budget breaches.
  - **Intent Alignment Scoring:** Displays semantic alignment scores ($0\% - 100\%$) for every hop in the chain.
- **Visual:** Screenshot of the 4-Hop node diagram with Hop 4 marked as BLOCKED on cumulative budget.
- **Speaker Notes:** *"Our Payment Graph tracks sub-agent delegation. In our demo, Hop 4 is blocked because the cumulative spend of $55 exceeds the $40 on-chain budget, even though Hop 4 requested only $14."*

---

### 🖥️ SLIDE 9: Key Feature 3 — Policy Guard Simulator & Live Playground
- **Slide Title:** Interactive Workbench: Policy Guard & Payment Playground
- **Key Points:**
  - **Policy Guard Simulator:** Allows engineers to test hypothetical transactions against the 3-stage pipeline with one-click presets.
  - **Payment Playground:** Interactive live test bench for inspecting raw HTTP 402 headers, Algorand TxIDs, and settlement wire payloads.
  - **Human-in-the-Loop Escalations:** Provides a supervisor resolution interface with on-chain Algorand writeback.
- **Visual:** Screenshots of the Policy Guard simulator and Payment Playground console.
- **Speaker Notes:** *"We built full developer ergonomics: an interactive simulator to test edge cases and a live playground that executes real HTTP 402 handshakes."*

---

### 🖥️ SLIDE 10: Apple Pro Workstation UI Design
- **Slide Title:** Apple Pro UI: Sleek Left Sidebar & Command Palette (⌘K)
- **Key Points:**
  - **Left Sidebar Navigation:** Grouped into Operations, Intelligence, and System.
  - **Command Palette (`⌘K`):** Global Spotlight-style fuzzy search across all tabs, monitored agents, and tasks.
  - **Apple Glass Aesthetics:** Deep Obsidian palette, frosted glass (`backdrop-blur-2xl`), specular highlights, and live telemetry tickers.
- **Visual:** Screenshot of the desktop workstation layout with the left sidebar and open `⌘K` modal.
- **Speaker Notes:** *"We crafted the user interface to Apple Pro standards — featuring a collapsible left sidebar, keyboard-driven Command Palette, and real-time microsecond latency telemetry."*

---

### 🖥️ SLIDE 11: Live Demo Results & Counterfactual Impact
- **Slide Title:** Live Demonstration & Real-World Impact
- **Key Metrics from Live Run:**
  - **Total Volume Analyzed:** $812.42 USD
  - **Threats Blocked:** 7 High-Risk Anomaly Attempts
  - **Platform Approval Rate:** 80.8%
  - **Cascades Prevented:** 1 Multi-Hop Chain Breach
  - **Financial Exposure Prevented:** **$219.00 USD**
- **Counterfactual Verdict:**
  *"Without Sentinel, all 73 transactions would have settled, leaking $219.00 in excess spend. With Sentinel, all authorized work completed while anomalies were stopped."*
- **Visual:** Comparison chart: *Without Sentinel vs With Sentinel*.
- **Speaker Notes:** *"Our counterfactual analytics engine proves real ROI: stopping 7 threat attacks and saving $219 in unauthorized exposure across our synthetic workload."*

---

### 🖥️ SLIDE 12: Conclusion & Future Roadmap
- **Slide Title:** Summary & Future Roadmap
- **Summary:**
  - ✅ x402-compliant paid endpoint (`POST /policy/check`) on Algorand TestNet.
  - ✅ 3-stage adaptive behavioral baselining & Spend Band charts.
  - ✅ On-chain multi-hop lineage tracking in Algorand Box Storage.
  - ✅ Apple Pro workstation UI with live receipts ledger and explorer links.
- **Future Roadmap:**
  - MainNet deployment with decentralized multi-sig supervisor consensus.
  - Cross-chain bridging with EVM/Solana x402 facilitators.
  - Zero-Knowledge behavioral proofs (ZK-SNARKs) for private agent baselines.
- **Questions & Answers:** Thank You!
- **Speaker Notes:** *"Thank you for your time. Sentinel provides the essential trust and security layer for the emerging autonomous AI agent economy on Algorand. We are now open for questions."*

---

# 8. REAL ON-CHAIN VERIFICATION & DEMO SCENARIOS

When presenting or demoing the project live, execute these scenarios:

### Scenario A: Single-Agent Anomaly Spike ($75 vs $10 Baseline)
- **Agent:** `agent_alpha_procure` (Mean: ~$10.25, StdDev: ~$1.14, Range: $8.50 - $12.50)
- **Attempted Payment:** $75.00 for `cloud_hosting`
- **Result:** **BLOCKED**
- **Reason:** Amount is 56.8 standard deviations above mean ($Z = 56.8\sigma$). Triggered rules: `AMOUNT_ANOMALY_ZSCORE_EXCEEDED`, `PREDICTIVE_BUDGET_EXCEEDED`.

### Scenario B: Multi-Hop 4-Agent Cascade Budget Breach
- **Root Task:** `task_cascade_demo_01` (Authorized Budget: $40.00 in Algorand Box Storage)
- **Hop 1:** Alpha spends $12.00 (Cum: $12) $\to$ **APPROVED**
- **Hop 2:** Beta spends $15.00 (Cum: $27) $\to$ **APPROVED**
- **Hop 3:** Gamma spends $14.00 (Cum: $41) $\to$ **BLOCKED** (Exceeds $40 budget)
- **Hop 4:** Delta spends $14.00 (Cum: $55) $\to$ **BLOCKED** (Exceeds $40 budget)
- **Static Rule Result:** A naive $50 limit would have approved all 4 hops! Sentinel stopped the cascade.

### Scenario C: Live Algorand TestNet Transaction Explorer Links
- **Algorand Smart Contract App ID:** [https://lora.algokit.io/testnet/application/73491028](https://lora.algokit.io/testnet/application/73491028)
- **Sample Verified TxID:** [https://lora.algokit.io/testnet/transaction/KPJNRFEYQELME667ATPTFBJ37T5TQPU2TRMIPZQ4QSOXVHANMKSA](https://lora.algokit.io/testnet/transaction/KPJNRFEYQELME667ATPTFBJ37T5TQPU2TRMIPZQ4QSOXVHANMKSA)
- **Pera Wallet Explorer Link:** [https://testnet.explorer.perawallet.app/tx/KPJNRFEYQELME667ATPTFBJ37T5TQPU2TRMIPZQ4QSOXVHANMKSA](https://testnet.explorer.perawallet.app/tx/KPJNRFEYQELME667ATPTFBJ37T5TQPU2TRMIPZQ4QSOXVHANMKSA)
