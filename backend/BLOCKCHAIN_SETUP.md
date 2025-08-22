# 🌐 Blockchain Integration Setup - Polygon Amoy

## 🎯 Overview

Your Mandla Rice MRV system now has full blockchain integration on **Polygon Amoy testnet** for carbon credit management, farm registration, and MRV verification.

## 🔧 What's Been Added

- **Carbon Credit Smart Contract** (`contracts/CarbonCredit.sol`)
- **Blockchain Check Script** (`scripts/blockchain-check.js`)
- **Contract Deployment Script** (`scripts/deploy-carbon-credit.js`)
- **Contract Test Script** (`scripts/test-carbon-credit.js`)
- **Updated package.json** with blockchain commands

## 🚀 Quick Start

### 1. Environment Setup

Add these to your `.env` file:

```bash
# ===== Blockchain (Polygon Amoy – TESTNET) =====
WEB3_PROVIDER_URL="https://polygon-amoy.g.alchemy.com/v2/KqKzBuL8_IJaDsZBYYVmR"
CHAIN_ID="80002"

# Test account private key (export from MetaMask TEST account only)
WEB3_PRIVATE_KEY="0x0638b67D77715370a4bE1189c6fEA3682a822D17"

# Deployed contract address (will be filled after deployment)
CONTRACT_ADDRESS=""
```

### 2. Check Blockchain Connectivity

```bash
npm run blockchain:check
```

Expected output:
```
🔍 Checking Polygon Amoy connectivity...

✅ Chain ID: 80002
✅ Network: Polygon Amoy Testnet
✅ Wallet Address: 0x...
✅ Balance (MATIC): 0.5
✅ Gas Price (Gwei): 0.000000001

🎯 All systems ready for Polygon Amoy!
```

## 📋 Smart Contract Features

### CarbonCredit Contract

- **Farm Registration**: Farmers can register their farms with GPS coordinates
- **Carbon Credit Minting**: Mint credits based on emission reduction data
- **Verification System**: Admin verification of credits using satellite/MRV data
- **Retirement Mechanism**: Credits can be retired for specific purposes
- **Metadata Storage**: IPFS hashes for satellite imagery and MRV reports

### Key Functions

```solidity
// Register a new farm
function registerFarm(string farmId, string location)

// Mint carbon credits
function mintCarbonCredit(string farmId, uint256 emissionReduction, string metadataURI)

// Verify credits (admin only)
function verifyCarbonCredit(uint256 tokenId, string verificationMethod)

// Get credit details
function getCarbonCredit(uint256 tokenId) returns (CarbonCreditData)

// Get farm information
function getFarm(string farmId) returns (Farm)
```

## 🚀 Deployment

### Option 1: Deploy via Remix (Recommended for first time)

1. **Open Remix IDE**: https://remix.ethereum.org/
2. **Create new file**: `CarbonCredit.sol`
3. **Copy contract code** from `contracts/CarbonCredit.sol`
4. **Compile**: Solidity Compiler → Compile CarbonCredit.sol
5. **Deploy**: Deploy & Run → Environment: Injected Provider (MetaMask)
6. **Connect MetaMask** to Polygon Amoy testnet
7. **Deploy** and copy the contract address

### Option 2: Deploy via Node.js

1. **Get bytecode** from Remix compilation
2. **Paste bytecode** in `scripts/deploy-carbon-credit.js`
3. **Run deployment**:
   ```bash
   npm run blockchain:deploy
   ```

## 🧪 Testing

### Test the Deployed Contract

```bash
npm run blockchain:test
```

This will:
- ✅ Register a test farm
- ✅ Mint a test carbon credit (100 kg CO2e)
- ✅ Display all contract data
- ✅ Verify the system is working

### Expected Test Output

```
🔍 Testing Carbon Credit Contract...

🏡 Registering farm: FARM_1234567890
✅ Farm registered successfully

🌱 Minting carbon credit: 100 kg CO2e
✅ Carbon credit minted successfully

🎉 All tests passed! Your carbon credit system is working!
```

## 🔗 Integration with Your Backend

### Blockchain Service

Your existing `BlockchainService` in `src/services/blockchain/BlockchainService.ts` can now:

- **Register farms** on-chain
- **Mint carbon credits** for verified MRV data
- **Query blockchain** for credit verification
- **Track farmer portfolios** across multiple farms

### API Endpoints

The blockchain integration works with your existing routes:

- **`/api/v1/farms`** - Farm registration and management
- **`/api/v1/mrv`** - MRV data that triggers credit minting
- **`/api/v1/carbon-credits`** - Carbon credit operations

## 🌍 Polygon Amoy Benefits

### Why Polygon Amoy?

- **🌱 Eco-friendly**: Proof of Stake consensus
- **💰 Low fees**: ~0.000001 MATIC per transaction
- **⚡ Fast**: 2-second block finality
- **🔒 Secure**: Ethereum-compatible security
- **📈 Scalable**: Handles thousands of transactions per second

### Perfect for Carbon Credits

- **Low transaction costs** for smallholder farmers
- **Fast verification** of satellite data
- **Environmental alignment** with climate goals
- **Global accessibility** for UN Climate Challenge

## 🔒 Security Considerations

### Private Key Management

- **Never commit** private keys to git
- **Use test accounts** only for development
- **Rotate keys** regularly in production
- **Store securely** using environment variables

### Contract Security

- **OpenZeppelin** contracts for security best practices
- **Access control** for admin functions
- **Reentrancy protection** against attacks
- **Input validation** for all parameters

## 📊 Monitoring & Analytics

### Blockchain Events

Monitor these events in your Sentry dashboard:

- **Farm Registration**: New farms joining the system
- **Credit Minting**: Carbon credits being created
- **Verification**: Credits being verified by admins
- **Retirement**: Credits being used/retired

### Key Metrics

- **Total farms registered**
- **Total carbon credits minted**
- **Total emission reduction** (kg CO2e)
- **Verification rate** and **retirement rate**

## 🚀 Production Deployment

### Mainnet Migration

When ready for production:

1. **Change network** to Polygon mainnet
2. **Update provider URL** to mainnet RPC
3. **Deploy contracts** to mainnet
4. **Use production wallets** with proper security
5. **Enable monitoring** and alerting

### Environment Variables

```bash
# Production (Polygon Mainnet)
WEB3_PROVIDER_URL="https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY"
CHAIN_ID="137"
WEB3_PRIVATE_KEY="your_production_private_key"
CONTRACT_ADDRESS="deployed_mainnet_contract_address"
```

## 🆘 Troubleshooting

### Common Issues

1. **"Insufficient funds"**
   - Get test MATIC from Polygon Amoy faucet
   - Check wallet balance: `npm run blockchain:check`

2. **"Contract not deployed"**
   - Verify CONTRACT_ADDRESS in .env
   - Deploy contract first: `npm run blockchain:deploy`

3. **"Network mismatch"**
   - Ensure MetaMask is on Polygon Amoy testnet
   - Check CHAIN_ID is "80002"

4. **"Gas estimation failed"**
   - Check contract bytecode is correct
   - Verify contract ABI matches deployed contract

### Support

- **Polygon Amoy Faucet**: https://faucet.polygon.technology/
- **Polygon Explorer**: https://www.oklink.com/amoy
- **Remix IDE**: https://remix.ethereum.org/

## 🎉 You're Ready!

Your Mandla Rice MRV system now has:

- ✅ **Full blockchain integration** on Polygon Amoy
- ✅ **Carbon credit smart contracts** for transparency
- ✅ **Farm registration system** for traceability
- ✅ **MRV verification** on-chain
- ✅ **Low-cost transactions** for farmers
- ✅ **Environmental alignment** with your mission

**Next steps**: Deploy the contract, test the integration, and start minting carbon credits for Mandla farmers! 🌾💚
