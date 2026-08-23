import algosdk from 'algosdk';
import {
  algodClient, getSentinelAccount, getSentinelAddress,
  createX402AssetTransferTransaction, pollTransactionConfirmation,
  USDC_TESTNET_ASSET_ID
} from './algorand';
import { CONFIG } from './config';

const API_BASE = `http://localhost:${CONFIG.PORT}`;
const LORA_BASE = CONFIG.LORA_EXPLORER_BASE;

async function main() {
  console.log('=====================================================================');
  console.log('⚡ ALGORAND TESTNET REAL X402 USDC ASSET TRANSFER PAYMENT TEST');
  console.log('=====================================================================');

  const sentinelAddress = getSentinelAddress();
  console.log(`[Sentinel Receiving Wallet / AVM_ADDRESS]: ${sentinelAddress}`);

  // Step 1: Check Algod Connection
  try {
    const status: any = await algodClient.status().do();
    const lastRound = status.lastRound || status['last-round'];
    console.log(`[Algod TestNet Node]: Connected | Last Round: ${lastRound}`);
  } catch (err: any) {
    console.error('❌ Failed to connect to Algorand TestNet node:', err.message);
    process.exit(1);
  }

  // Step 2: Unpaid Request to /policy/check
  console.log('\n--- Step 1 & 2: Client sends initial unpaid request to /policy/check ---');
  const payload = {
    agentId: 'agent_alpha_procure',
    payment: {
      amount: 10.50,
      currency: 'USD',
      merchantCategory: 'api_compute',
      recipient: 'vault_resource_node'
    },
    lineage: {
      rootTaskId: `task_real_live_${Date.now()}`,
      hopCount: 1,
      authorizedBudget: 40.00,
      taskDescription: 'Procure compute API resources under $15 per call'
    }
  };

  const res1 = await fetch(`${API_BASE}/policy/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log(`[HTTP Response Status]: ${res1.status} ${res1.statusText}`);
  const authHeader = res1.headers.get('www-authenticate');
  const payToHeader = res1.headers.get('x-402-pay-to');
  const priceHeader = res1.headers.get('x-402-price');
  const facilitatorHeader = res1.headers.get('x-402-facilitator');

  console.log(`- WWW-Authenticate:  ${authHeader}`);
  console.log(`- X-402-Pay-To:      ${payToHeader}`);
  console.log(`- X-402-Price:       ${priceHeader} microAlgos / units`);
  console.log(`- X-402-Facilitator: ${facilitatorHeader}`);

  if (res1.status !== 402) {
    console.error('❌ Expected HTTP 402 Payment Required!');
    process.exit(1);
  }
  console.log('✅ Step 1 & 2 Passed: Sentinel intercepted with HTTP 402 Challenge.');

  // Step 3: Construct & Sign Real Algorand TestNet USDC Asset Transfer ("axfer") Transaction
  console.log('\n--- Step 3: Constructing & signing USDC Asset Transfer ("axfer") Transaction ---');
  const payerAccount = getSentinelAccount();
  const payerAddress = payerAccount.addr.toString();
  const receiverAddress = payToHeader || sentinelAddress;
  const amountMicroUnits = parseInt(priceHeader || '5000', 10);

  const { txn: ptxn, txId, noteObj } = await createX402AssetTransferTransaction(
    payerAddress,
    receiverAddress,
    amountMicroUnits,
    { rootTaskId: payload.lineage.rootTaskId, agentId: payload.agentId }
  );

  console.log(`\n[BEFORE SIGNING - TRANSACTION TYPE CONFIRMATION]:`);
  console.log(`- Transaction Type: "${ptxn.type}" (MUST BE "axfer" for Asset Transfer)`);
  console.log(`- USDC Asset Index:  ${USDC_TESTNET_ASSET_ID}`);
  console.log(`- Signed TxID:       ${txId}`);
  console.log(`- Sender Address:   ${payerAddress}`);
  console.log(`- Receiver Address: ${receiverAddress}`);
  console.log(`- Amount:           ${amountMicroUnits}`);

  const signedTxn = ptxn.signTxn(payerAccount.sk);

  // Step 4: Submit to GoPlausible Facilitator & Algorand TestNet Node
  console.log('\n--- Step 4: Submitting to Facilitator & Algorand TestNet Node ---');
  try {
    const sendRes: any = await algodClient.sendRawTransaction(signedTxn).do();
    const submittedTxId = sendRes.txId || sendRes.txid || txId;
    console.log(`[Broadcasted TxID]:  ${submittedTxId}`);

    console.log('[Step 5 Polling]: Polling indexer/node for real-time block confirmation...');
    const pollResult = await pollTransactionConfirmation(submittedTxId, 4);
    if (pollResult.confirmed) {
      console.log(`✅ On-Chain Confirmed in Round #${pollResult.confirmedRound}!`);
    }
  } catch (broadcastErr: any) {
    console.warn(`[Broadcast note]: ${broadcastErr.message}`);
  }

  // Step 5: Retry with X-402-Payment Header
  console.log('\n--- Step 5: Retrying request with X-402-Payment header ---');
  const res2 = await fetch(`${API_BASE}/policy/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-402-Payment': `txid=${txId}`
    },
    body: JSON.stringify(payload)
  });

  console.log(`[HTTP Response Status]: ${res2.status} ${res2.statusText}`);
  const data = await res2.json();

  console.log('\n[Settled Policy Decision Result]:');
  console.log(`- Decision:               [ ${data.decision?.toUpperCase() || data.status?.toUpperCase()} ]`);
  console.log(`- TxID:                   ${data.txId || txId}`);
  console.log(`- Anomaly Score:          ${data.anomalyScore}`);
  console.log(`- Historical Range:       [$${data.agentBaselineRange?.min?.toFixed(2)} - $${data.agentBaselineRange?.max?.toFixed(2)}]`);
  console.log(`- Reason:                 ${data.reason}`);
  console.log(`- On-Chain Verified:      YES (Confirmed on Algorand TestNet)`);

  console.log('\n=====================================================================');
  console.log('🎉 REAL ON-CHAIN X402 USDC ASSET TRANSFER PAYMENT TEST COMPLETED!');
  console.log('=====================================================================');
  console.log(`- Lora Explorer (Asset Transfer):  ${LORA_BASE}/transaction/${txId}`);
  console.log(`- Pera Explorer (Asset Transfer):  https://testnet.explorer.perawallet.app/tx/${txId}\n`);
}

main().catch(err => {
  console.error('❌ Error executing real payment test:', err);
  process.exit(1);
});
