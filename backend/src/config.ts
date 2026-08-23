import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4002,
  ALGOD_SERVER: process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud',
  ALGOD_PORT: process.env.ALGOD_PORT || 443,
  ALGOD_TOKEN: process.env.ALGOD_TOKEN || '',
  INDEXER_SERVER: process.env.INDEXER_SERVER || 'https://testnet-idx.algonode.cloud',
  INDEXER_PORT: process.env.INDEXER_PORT || 443,
  INDEXER_TOKEN: process.env.INDEXER_TOKEN || '',
  
  // GoPlausible x402 Facilitator & Lora Explorer
  FACILITATOR_URL: process.env.FACILITATOR_URL || 'https://facilitator.goplausible.xyz',
  LORA_EXPLORER_BASE: 'https://lora.algokit.io/testnet',

  // Distinct Resource Server Receiving Wallet (AVM_ADDRESS)
  AVM_ADDRESS: process.env.AVM_ADDRESS || 'OAFMDTGYYN7TSHDL3LGFNCGY47F6XOVW47ENBBTHV4UVC5RNDDEYJDULBU',

  // Algorand Account Mnemonic & App ID
  SENTINEL_MNEMONIC: process.env.SENTINEL_MNEMONIC || '',
  SENTINEL_APP_ID: process.env.SENTINEL_APP_ID ? parseInt(process.env.SENTINEL_APP_ID, 10) : 769717602,
  
  // DB File
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '../sentinel_db.json'),
  
  // x402 USDC Pricing & Asset Specs (ASA ID #10458941)
  USDC_TESTNET_ASSET_ID: 10458941,
  RISK_CHECK_PRICE_MICROUNITS: 1000,
  RESOURCE_PRICE_MICROUNITS: 5000,
  RISK_CHECK_PRICE_MICROALGOS: 1000,
  RESOURCE_PRICE_MICROALGOS: 5000,
};
