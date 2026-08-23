import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getSentinelAddress, verifyPaymentTransaction } from './algorand';
import { CONFIG } from './config';

export function createX402PaymentRequirement(priceMicroUnits: number, realmName: string = 'Sentinel Risk Guard') {
  const receivingAddress = CONFIG.AVM_ADDRESS;
  const challenge = crypto.randomBytes(16).toString('hex');

  return {
    status: 402,
    error: 'Payment Required',
    x402: {
      realm: realmName,
      priceMicroUnits,
      amount: priceMicroUnits,
      payToAddress: receivingAddress,
      payTo: receivingAddress,
      receiver: receivingAddress,
      network: 'algorand-testnet',
      assetId: CONFIG.USDC_TESTNET_ASSET_ID,
      asset: CONFIG.USDC_TESTNET_ASSET_ID,
      paymentChallenge: challenge,
      facilitator: CONFIG.FACILITATOR_URL,
      loraExplorer: `${CONFIG.LORA_EXPLORER_BASE}/application/${CONFIG.SENTINEL_APP_ID}`
    }
  };
}

export function x402PaymentGuard(priceMicroUnits: number, realmName: string = 'Sentinel Risk Guard') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const paymentHeader = req.header('X-402-Payment') || req.header('Authorization');
    const receivingAddress = CONFIG.AVM_ADDRESS;

    // Stage 1 & 2: Check if x402 payment header is present
    if (!paymentHeader) {
      console.log(`\n[x402 Stage 1] Unpaid request received at ${req.originalUrl || req.url}`);
      const requirement = createX402PaymentRequirement(priceMicroUnits, realmName);
      
      console.log(`[x402 Stage 2] HTTP 402 Challenge issued | Price: ${priceMicroUnits} USDC microUnits | Pay-To (AVM_ADDRESS): ${receivingAddress} | Asset: #${CONFIG.USDC_TESTNET_ASSET_ID}`);

      res.setHeader(
        'WWW-Authenticate',
        `x402 realm="${realmName}", pay_to="${receivingAddress}", price="${priceMicroUnits}", asset_id="${CONFIG.USDC_TESTNET_ASSET_ID}", network="algorand-testnet", facilitator="${CONFIG.FACILITATOR_URL}"`
      );
      res.setHeader('X-402-Pay-To', receivingAddress);
      res.setHeader('X-402-Price', priceMicroUnits.toString());
      res.setHeader('X-402-Asset-ID', CONFIG.USDC_TESTNET_ASSET_ID.toString());
      res.setHeader('X-402-Network', 'algorand-testnet');
      res.setHeader('X-402-Facilitator', CONFIG.FACILITATOR_URL);

      res.status(402).json(requirement);
      return;
    }

    // Stage 3: Parse transaction ID from payment header
    let txId = paymentHeader;
    if (paymentHeader.includes('txid=')) {
      const match = paymentHeader.match(/txid=([a-zA-Z0-9]+)/);
      if (match) txId = match[1];
    } else if (paymentHeader.startsWith('Bearer ')) {
      txId = paymentHeader.substring(7).trim();
    }

    console.log(`\n[x402 Stage 3] Signed payment header received with TxID: ${txId}`);
    console.log(`[x402 Stage 4] Verifying transaction via Facilitator (${CONFIG.FACILITATOR_URL}) & Algod Node...`);

    // Verify payment on Algorand TestNet via Algod or GoPlausible Facilitator
    const verification = await verifyPaymentTransaction(txId, receivingAddress, priceMicroUnits);

    // Stage 4 Safety Check: Self-Payment Prevention
    if (verification.sender === receivingAddress) {
      console.error(`🚨 [x402 Safety Check Failed] Self-payment detected! Sender (${verification.sender}) matches Receiver (${receivingAddress}).`);
      res.status(400).json({
        status: 400,
        error: 'Invalid Payment: Self-payment detected. Sender must be distinct from receiving wallet (AVM_ADDRESS).'
      });
      return;
    }

    if (!verification.valid) {
      console.log(`❌ [x402 Stage 4 Failed] Verification failed for TxID ${txId}: ${verification.error}`);
      res.status(402).json({
        status: 402,
        error: 'Payment Verification Failed',
        reason: verification.error || 'Invalid Algorand TestNet payment transaction',
        x402: createX402PaymentRequirement(priceMicroUnits, realmName).x402
      });
      return;
    }

    console.log(`✅ [x402 Stage 5] Settlement Confirmed on-chain! Type: "${verification.type}" | Sender: ${verification.sender} -> Receiver: ${receivingAddress} | Amount: ${verification.amount} microUnits -> HTTP 200 Response unlocked.`);

    (req as any).x402Payment = {
      txId,
      type: verification.type,
      sender: verification.sender,
      receiver: receivingAddress,
      amount: verification.amount,
      assetId: CONFIG.USDC_TESTNET_ASSET_ID,
      verified: true,
      facilitator: CONFIG.FACILITATOR_URL
    };

    next();
  };
}
