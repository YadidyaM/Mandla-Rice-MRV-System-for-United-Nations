// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Stellar Soroban Contracts ^0.4.1
// Carbon Credit Token for Equitable Finance - Mandla Rice MRV System
#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Map, String, Symbol, Vec,
    symbol, vec, map, contracterror, panic_with_error, IntoVal, TryFromVal, Val,
};
use stellar_macros::default_impl;
use stellar_tokens::fungible::{Base, FungibleToken};

/// Carbon Credit Token Contract for Equitable Finance
/// This contract enables small farmers to participate in carbon markets
/// through transparent, low-cost tokenization of their environmental contributions

#[contract]
pub struct CarbonCreditToken;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum CarbonCreditError {
    /// Insufficient balance for operation
    InsufficientBalance = 1,
    /// Operation not authorized
    NotAuthorized = 2,
    /// Invalid carbon credit data
    InvalidCreditData = 3,
    /// Credit already exists
    CreditAlreadyExists = 4,
    /// Verification failed
    VerificationFailed = 5,
    /// Market not open
    MarketNotOpen = 6,
}

/// Carbon Credit metadata structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CarbonCredit {
    /// Unique identifier for the carbon credit
    pub id: String,
    /// Farmer address who generated the credit
    pub farmer_address: Address,
    /// Farm identifier
    pub farm_id: String,
    /// Season identifier
    pub season_id: String,
    /// Carbon sequestration amount in tons CO2e
    pub carbon_amount: i128,
    /// Verification level (Basic, Standard, Premium, Gold)
    pub verification_level: String,
    /// Methodology used (IPCC 2019, etc.)
    pub methodology: String,
    /// Vintage year
    pub vintage: u32,
    /// IPFS hash of MRV report
    pub report_hash: String,
    /// Timestamp of credit creation
    pub created_at: u64,
    /// Credit status (Pending, Verified, Retired, Cancelled)
    pub status: String,
    /// Geographic coordinates (latitude, longitude)
    pub coordinates: Vec<i128>,
    /// Additional metadata
    pub metadata: Map<String, String>,
}

/// Market order structure for carbon credit trading
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MarketOrder {
    /// Order identifier
    pub id: String,
    /// Order type (Buy/Sell)
    pub order_type: String,
    /// Carbon credit amount
    pub amount: i128,
    /// Price per ton CO2e in XLM
    pub price_per_ton: i128,
    /// Order status
    pub status: String,
    /// Order timestamp
    pub timestamp: u64,
}

/// Contract state structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractState {
    /// Total carbon credits minted
    pub total_credits_minted: i128,
    /// Total carbon credits retired
    pub total_credits_retired: i128,
    /// Total market volume
    pub total_market_volume: i128,
    /// Number of participating farmers
    pub farmer_count: u32,
    /// Contract admin address
    pub admin: Address,
    /// Market open status
    pub market_open: bool,
    /// Minimum verification level for trading
    pub min_verification_level: String,
}

#[contractimpl]
impl CarbonCreditToken {
    /// Initialize the carbon credit token contract
    pub fn __constructor(e: &Env) {
        // Set token metadata
        Base::set_metadata(
            e, 
            6, // 6 decimal places for precision
            String::from_str(e, "Mandla Carbon Credit"), 
            String::from_str(e, "MCC")
        );
        
        // Initialize contract state
        let admin = e.current_contract_address();
        let state = ContractState {
            total_credits_minted: 0,
            total_credits_retired: 0,
            total_market_volume: 0,
            farmer_count: 0,
            admin,
            market_open: true,
            min_verification_level: String::from_str(e, "Basic"),
        };
        
        e.storage().instance().set(&state);
    }

    /// Mint new carbon credits for a farmer
    /// This is the core equitable finance function - enabling small farmers to create value
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
    ) -> Result<String, CarbonCreditError> {
        // Verify caller is authorized (MRV system or admin)
        let caller = e.current_contract_address();
        let state: ContractState = e.storage().instance().get().unwrap();
        
        if caller != state.admin {
            panic_with_error!(e, CarbonCreditError::NotAuthorized);
        }

        // Validate carbon credit data
        if carbon_amount <= 0 {
            panic_with_error!(e, CarbonCreditError::InvalidCreditData);
        }

        // Generate unique credit ID
        let credit_id = format!("{}_{}_{}_{}", farm_id, season_id, vintage, e.ledger().timestamp());
        let credit_id_string = String::from_str(e, &credit_id);

        // Check if credit already exists
        if e.storage().instance().has(&credit_id_string) {
            panic_with_error!(e, CarbonCreditError::CreditAlreadyExists);
        }

        // Create carbon credit
        let credit = CarbonCredit {
            id: credit_id_string.clone(),
            farmer_address: farmer_address.clone(),
            farm_id,
            season_id,
            carbon_amount,
            verification_level,
            methodology,
            vintage,
            report_hash,
            created_at: e.ledger().timestamp(),
            status: String::from_str(e, "Verified"),
            coordinates,
            metadata,
        };

        // Store the credit
        e.storage().instance().set(&credit_id_string, &credit);

        // Update contract state
        let mut new_state = state;
        new_state.total_credits_minted += carbon_amount;
        new_state.farmer_count += 1;
        e.storage().instance().set(&new_state);

        // Mint tokens to farmer (1 token = 1 ton CO2e)
        Base::mint(e, &farmer_address, &carbon_amount);

        Ok(credit_id)
    }

    /// Get carbon credit details
    pub fn get_carbon_credit(e: &Env, credit_id: String) -> Option<CarbonCredit> {
        e.storage().instance().get(&credit_id)
    }

    /// List carbon credit for sale on marketplace
    /// Enables farmers to monetize their environmental contributions
    pub fn list_for_sale(
        e: &Env,
        credit_id: String,
        price_per_ton: i128,
    ) -> Result<String, CarbonCreditError> {
        let caller = e.current_contract_address();
        let credit: CarbonCredit = e.storage().instance().get(&credit_id)
            .ok_or(CarbonCreditError::InvalidCreditData)?;

        // Verify caller owns the credit
        if caller != credit.farmer_address {
            panic_with_error!(e, CarbonCreditError::NotAuthorized);
        }

        // Create market order
        let order_id = format!("ORDER_{}_{}", credit_id, e.ledger().timestamp());
        let order = MarketOrder {
            id: String::from_str(e, &order_id),
            order_type: String::from_str(e, "Sell"),
            amount: credit.carbon_amount,
            price_per_ton,
            status: String::from_str(e, "Active"),
            timestamp: e.ledger().timestamp(),
        };

        // Store order
        e.storage().instance().set(&String::from_str(e, &order_id), &order);

        Ok(order_id)
    }

    /// Buy carbon credits from marketplace
    /// Enables investors to support sustainable farming
    pub fn buy_carbon_credits(
        e: &Env,
        order_id: String,
        buyer_address: Address,
        amount: i128,
    ) -> Result<(), CarbonCreditError> {
        let state: ContractState = e.storage().instance().get().unwrap();
        
        if !state.market_open {
            panic_with_error!(e, CarbonCreditError::MarketNotOpen);
        }

        let order: MarketOrder = e.storage().instance().get(&order_id)
            .ok_or(CarbonCreditError::InvalidCreditData)?;

        if order.status != String::from_str(e, "Active") {
            panic_with_error!(e, CarbonCreditError::InvalidCreditData);
        }

        if amount > order.amount {
            panic_with_error!(e, CarbonCreditError::InsufficientBalance);
        }

        // Calculate total price
        let total_price = amount * order.price_per_ton;

        // Transfer tokens from buyer to seller
        Base::transfer(e, &buyer_address, &order.seller_address, &amount);

        // Update market volume
        let mut new_state = state;
        new_state.total_market_volume += total_price;
        e.storage().instance().set(&new_state);

        Ok(())
    }

    /// Retire carbon credits (permanent removal from circulation)
    /// Used when credits are used for offsetting emissions
    pub fn retire_credits(
        e: &Env,
        credit_id: String,
        amount: i128,
        retirement_reason: String,
    ) -> Result<(), CarbonCreditError> {
        let caller = e.current_contract_address();
        let mut credit: CarbonCredit = e.storage().instance().get(&credit_id)
            .ok_or(CarbonCreditError::InvalidCreditData)?;

        // Verify caller owns the credit
        if caller != credit.farmer_address {
            panic_with_error!(e, CarbonCreditError::NotAuthorized);
        }

        if amount > credit.carbon_amount {
            panic_with_error!(e, CarbonCreditError::InsufficientBalance);
        }

        // Update credit amount
        credit.carbon_amount -= amount;
        if credit.carbon_amount == 0 {
            credit.status = String::from_str(e, "Retired");
        }

        // Store updated credit
        e.storage().instance().set(&credit_id, &credit);

        // Update contract state
        let mut state: ContractState = e.storage().instance().get().unwrap();
        state.total_credits_retired += amount;
        e.storage().instance().set(&state);

        // Burn tokens
        Base::burn(e, &caller, &amount);

        Ok(())
    }

    /// Get contract statistics for transparency
    pub fn get_contract_stats(e: &Env) -> ContractState {
        e.storage().instance().get().unwrap()
    }

    /// Update market settings (admin only)
    pub fn update_market_settings(
        e: &Env,
        market_open: bool,
        min_verification_level: String,
    ) -> Result<(), CarbonCreditError> {
        let caller = e.current_contract_address();
        let state: ContractState = e.storage().instance().get().unwrap();
        
        if caller != state.admin {
            panic_with_error!(e, CarbonCreditError::NotAuthorized);
        }

        let mut new_state = state;
        new_state.market_open = market_open;
        new_state.min_verification_level = min_verification_level;
        e.storage().instance().set(&new_state);

        Ok(())
    }

    /// Emergency pause for market (admin only)
    pub fn pause_market(e: &Env) -> Result<(), CarbonCreditError> {
        let caller = e.current_contract_address();
        let state: ContractState = e.storage().instance().get().unwrap();
        
        if caller != state.admin {
            panic_with_error!(e, CarbonCreditError::NotAuthorized);
        }

        let mut new_state = state;
        new_state.market_open = false;
        e.storage().instance().set(&new_state);

        Ok(())
    }

    /// Resume market operations (admin only)
    pub fn resume_market(e: &Env) -> Result<(), CarbonCreditError> {
        let caller = e.current_contract_address();
        let state: ContractState = e.storage().instance().get().unwrap();
        
        if caller != state.admin {
            panic_with_error!(e, CarbonCreditError::NotAuthorized);
        }

        let mut new_state = state;
        new_state.market_open = true;
        e.storage().instance().set(&new_state);

        Ok(())
    }
}

#[default_impl]
#[contractimpl]
impl FungibleToken for CarbonCreditToken {
    type ContractType = Base;
}
