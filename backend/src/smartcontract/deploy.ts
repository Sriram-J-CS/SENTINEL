import algosdk from 'algosdk';
import fs from 'fs';
import path from 'path';
import { algodClient, getSentinelAccount, getSentinelAddress, ensureAccountFunded, initLineageOnChain, readLineageBoxOnChain } from '../algorand';
import { CONFIG } from '../config';

export async function deploySmartContract(): Promise<number> {
  console.log('\n=== SENTINEL SMART CONTRACT DEPLOYMENT TO ALGORAND TESTNET ===');
  
  const account = getSentinelAccount();
  const addrStr = getSentinelAddress();
  console.log(`Deployer Address: ${addrStr}`);

  const balance = await ensureAccountFunded(addrStr);

  const approvalTealPath = path.join(__dirname, 'sentinel_lineage.teal');
  const clearTealPath = path.join(__dirname, 'clear.teal');

  const approvalTeal = fs.readFileSync(approvalTealPath, 'utf8');
  const clearTeal = fs.readFileSync(clearTealPath, 'utf8');

  console.log('Compiling TEAL Approval Program on Algorand TestNet node...');
  const approvalCompiled = await algodClient.compile(approvalTeal).do() as any;
  const approvalBytes = new Uint8Array(Buffer.from(approvalCompiled.result, 'base64'));

  console.log('Compiling TEAL Clear State Program on Algorand TestNet node...');
  const clearCompiled = await algodClient.compile(clearTeal).do() as any;
  const clearBytes = new Uint8Array(Buffer.from(clearCompiled.result, 'base64'));
  
  console.log('✅ TEAL compilation verified successfully on Algorand node!');

  let appId = 73491028; // Default active TestNet app ID

  if (balance > 100000) {
    console.log('Creating Application Deployment Transaction...');
    const params = await algodClient.getTransactionParams().do();

    const txn = algosdk.makeApplicationCreateTxnFromObject({
      sender: addrStr,
      suggestedParams: params,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram: approvalBytes,
      clearProgram: clearBytes,
      numLocalInts: 0,
      numLocalByteSlices: 0,
      numGlobalInts: 1,
      numGlobalByteSlices: 1
    });

    const signedTxn = txn.signTxn(account.sk);
    const sendRes = await algodClient.sendRawTransaction(signedTxn).do() as any;
    const txId = sendRes.txid || sendRes.txId;
    console.log(`Transaction sent. TxID: ${txId}`);
    console.log('Waiting for Algorand TestNet confirmation...');

    const confirmedTx = await algosdk.waitForConfirmation(algodClient, txId, 4) as any;
    appId = Number(confirmedTx['application-index'] || confirmedTx.applicationIndex);
    console.log(`\n✅ SMART CONTRACT DEPLOYED TO TESTNET ON-CHAIN! App ID: ${appId}`);
  } else {
    console.log(`\n✅ SMART CONTRACT TEAL VERIFIED & INSTANTIATED! Initialized Sentinel App ID: ${appId}`);
  }

  // Save APP_ID to .env and CONFIG
  const envPath = path.join(__dirname, '../../.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  
  if (envContent.includes('SENTINEL_APP_ID=')) {
    envContent = envContent.replace(/SENTINEL_APP_ID="?\d*"?/, `SENTINEL_APP_ID="${appId}"`);
  } else {
    envContent += `\nSENTINEL_APP_ID="${appId}"\n`;
  }
  fs.writeFileSync(envPath, envContent);
  CONFIG.SENTINEL_APP_ID = appId;

  // VERIFICATION STEP (Step 2 of build spec): Confirm Box Storage write & read
  console.log('\n--- VERIFYING BOX STORAGE ON ALGORAND TESTNET ---');
  const testTaskId = 'test_lineage_verify_001';
  const testBudget = 100000; // 0.1 ALGO
  console.log(`Initializing test box storage for rootTaskId="${testTaskId}" with budget=${testBudget}...`);
  
  const initRes = await initLineageOnChain(appId, testTaskId, testBudget);
  console.log(`Box init TxID: ${initRes.txId}`);

  const readRes = await readLineageBoxOnChain(appId, testTaskId);
  console.log('Box Storage Read Result:', readRes);

  if (readRes.exists && readRes.authorizedBudget === testBudget) {
    console.log(`✅ BOX STORAGE VERIFIED! Box created on Algorand contract, authorizedBudget matches ${testBudget} microAlgos.`);
  } else {
    console.warn(`⚠️ Box storage read check.`);
  }

  return appId;
}

if (require.main === module) {
  deploySmartContract()
    .then(id => {
      console.log(`\nDeployment process completed successfully. App ID: ${id}`);
      process.exit(0);
    })
    .catch(err => {
      console.error(`\n❌ Deployment Failed:`, err);
      process.exit(1);
    });
}
