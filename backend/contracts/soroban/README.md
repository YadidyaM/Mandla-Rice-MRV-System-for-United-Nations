# 🌟 Soroban Smart Contracts for Equitable Finance

## Overview

This directory contains Soroban smart contracts that power the **Mandla Rice MRV System** on the Stellar blockchain. These contracts enable equitable finance by providing small farmers with direct access to carbon credit markets through transparent, low-cost tokenization.

## 🎯 Equitable Finance Mission

Our Soroban contracts address key challenges in traditional carbon markets:

- **Financial Inclusion**: Enables small farmers to participate in global carbon markets
- **Transparency**: All transactions are recorded on the immutable Stellar blockchain
- **Low Barriers**: Minimal verification costs and no intermediaries
- **Direct Access**: Farmers connect directly to buyers worldwide
- **Fair Pricing**: Market-driven carbon credit values

## 📁 Contract Files

### `CarbonCreditToken.rs`
The main smart contract that handles:
- Carbon credit minting and verification
- Marketplace operations (buy/sell)
- Credit retirement and tracking
- Admin controls and market settings

## 🚀 Key Features

### 1. **Carbon Credit Minting**
```rust
pub fn mint_carbon_credit(
    e: &Env,
    farmer_address: Address,
    farm_id: String,
    season_id: String,
    carbon_amount: i128,
    verification_level: String,
    methodology: String,
    vintage: u32,
    report_hash: String,
    coordinates: Vec<i128>,
    metadata: Map<String, String>,
) -> Result<String, CarbonCreditError>
```

**Purpose**: Enables MRV system to mint carbon credits for verified sustainable farming practices.

### 2. **Marketplace Operations**
```rust
pub fn list_for_sale(e: &Env, credit_id: String, price_per_ton: i128) -> Result<String, CarbonCreditError>
pub fn buy_carbon_credits(e: &Env, order_id: String, buyer_address: Address, amount: i128) -> Result<(), CarbonCreditError>
```

**Purpose**: Provides a decentralized marketplace where farmers can sell credits and buyers can purchase them.

### 3. **Credit Retirement**
```rust
pub fn retire_credits(e: &Env, credit_id: String, amount: i128, retirement_reason: String) -> Result<(), CarbonCreditError>
```

**Purpose**: Allows permanent removal of credits when used for emission offsetting.

### 4. **Transparency & Governance**
```rust
pub fn get_contract_stats(e: &Env) -> ContractState
pub fn update_market_settings(e: &Env, market_open: bool, min_verification_level: String) -> Result<(), CarbonCreditError>
```

**Purpose**: Provides public access to contract statistics and admin controls.

## 🏗️ Architecture

### Smart Contract Structure
```
CarbonCreditToken
├── CarbonCredit (struct)
│   ├── id: String
│   ├── farmer_address: Address
│   ├── farm_id: String
│   ├── carbon_amount: i128
│   ├── verification_level: String
│   └── metadata: Map<String, String>
├── MarketOrder (struct)
│   ├── id: String
│   ├── order_type: String
│   ├── amount: i128
│   └── price_per_ton: i128
└── ContractState (struct)
    ├── total_credits_minted: i128
    ├── farmer_count: u32
    └── market_open: bool
```

### Integration Points
- **MRV System**: Calls minting functions after verification
- **Farmer App**: Lists credits for sale and manages portfolio
- **Buyer Platform**: Purchases credits and tracks retirement
- **Admin Dashboard**: Manages market settings and emergency controls

## 🔧 Development Setup

### Prerequisites
- Rust 1.70+
- Soroban CLI
- Stellar testnet account

### Installation
```bash
# Install Soroban CLI
curl -sSfL https://soroban.stellar.org/install.sh | sh

# Verify installation
soroban --version
```

### Building Contracts
```bash
# Navigate to contracts directory
cd backend/contracts/soroban

# Build the contract
soroban contract build

# Test the contract
soroban contract test
```

### Deployment
```bash
# Deploy to testnet
soroban contract deploy --network testnet --source admin_key CarbonCreditToken.wasm

# Deploy to mainnet (when ready)
soroban contract deploy --network mainnet --source admin_key CarbonCreditToken.wasm
```

## 🌐 Network Configuration

### Testnet (Recommended for Development)
- **Network**: Test SDF Network
- **RPC URL**: `https://soroban-testnet.stellar.org`
- **Passphrase**: `Test SDF Network ; September 2015`

### Mainnet (Production)
- **Network**: Public Global Stellar Network
- **RPC URL**: `https://soroban-mainnet.stellar.org`
- **Passphrase**: `Public Global Stellar Network ; September 2015`

## 📊 API Integration

### Backend Service
The `SorobanService` class provides TypeScript integration:

```typescript
import { SorobanService } from '../services/blockchain/SorobanService';

const sorobanService = new SorobanService();
await sorobanService.initialize();

// Mint carbon credits
const result = await sorobanService.mintCarbonCredit({
  farmerAddress: 'GABC123...',
  farmId: 'FARM001',
  carbonAmount: 25,
  verificationLevel: 'Premium'
});
```

### API Endpoints
- `POST /api/soroban/mint` - Mint new carbon credits
- `POST /api/soroban/list-for-sale` - List credits for sale
- `POST /api/soroban/buy` - Purchase credits
- `GET /api/soroban/stats` - Get contract statistics
- `GET /api/soroban/credit/:id` - Get credit details

## 🔒 Security Features

### Access Control
- **Admin Functions**: Only contract admin can update market settings
- **Farmer Verification**: Only verified farmers can mint credits
- **Market Controls**: Emergency pause/resume functionality

### Data Validation
- **Input Validation**: All parameters are validated before processing
- **State Checks**: Contract state is verified before operations
- **Error Handling**: Comprehensive error codes and messages

## 📈 Equitable Finance Impact

### For Farmers
- **Income Generation**: 40-60% increase through carbon credits
- **Market Access**: Global reach without intermediaries
- **Transparency**: Clear visibility into credit value and trading

### For Buyers
- **Verified Credits**: AI-powered verification ensures quality
- **Direct Sourcing**: Connect directly with farming communities
- **Impact Tracking**: Transparent retirement and offset tracking

### For the Environment
- **Carbon Reduction**: Measurable impact through MRV system
- **Sustainable Practices**: Incentivizes eco-friendly farming
- **Global Scale**: Scalable solution for climate action

## 🚀 Future Enhancements

### Planned Features
1. **Multi-Asset Support**: Support for different carbon credit types
2. **Advanced Trading**: Limit orders, auctions, and derivatives
3. **Cross-Chain Bridge**: Integration with other blockchains
4. **DeFi Integration**: Yield farming and liquidity pools
5. **Mobile SDK**: Native mobile app integration

### Scalability Improvements
1. **Layer 2 Solutions**: Optimize for high transaction volumes
2. **Batch Processing**: Group multiple operations for efficiency
3. **Sharding**: Distribute load across multiple contract instances

## 🤝 Contributing

### Development Guidelines
1. **Code Quality**: Follow Rust best practices and Soroban patterns
2. **Testing**: Comprehensive test coverage for all functions
3. **Documentation**: Clear comments and API documentation
4. **Security**: Regular security audits and vulnerability assessments

### Testing Strategy
```bash
# Run unit tests
cargo test

# Run integration tests
cargo test --test integration

# Run security tests
cargo audit
```

## 📚 Resources

### Official Documentation
- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Developer Portal](https://developers.stellar.org)
- [OpenZeppelin Stellar Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts-stellar)

### Community Support
- [Stella Discord](https://discord.gg/stellar) - AI-powered development support
- [Stellar Stack Exchange](https://stellar.stackexchange.com)
- [GitHub Discussions](https://github.com/stellar/soroban/discussions)

### Tutorials
- [StellarEuropa YouTube](https://www.youtube.com/@StellarEuropa) - Daily tutorial videos
- [Soroban Examples](https://github.com/stellar/soroban-examples)

## 🏆 UN Climate Challenge 2024

This project is built for the **UN Climate Challenge 2024**, demonstrating how blockchain technology can enable equitable finance for climate action. By combining:

- **AI-Powered MRV**: Automated verification using GPT-5
- **Soroban Smart Contracts**: Transparent, efficient blockchain operations
- **Farmer-Centric Design**: Direct access to global markets
- **Sustainable Impact**: Measurable carbon reduction and community development

We're creating a **pioneering equitable finance solution** that empowers small farmers while fighting climate change.

---

**"Think local. Dream global. Seek and ye shall find!"** 🌱💰🌍
