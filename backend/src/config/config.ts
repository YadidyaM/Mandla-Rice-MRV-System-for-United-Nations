/**
 * Configuration Management for Mandla Rice MRV System
 * Centralized configuration with environment variable validation and type safety
 */

import dotenv from 'dotenv';
import Joi from 'joi';

// Load environment variables
dotenv.config();

// Environment validation schema using Joi
const envSchema = Joi.object({
  // Server Configuration
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),
  API_VERSION: Joi.string().default('v1'),
  APP_URL: Joi.string().uri().default('http://localhost:4000'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),

  // Database Configuration
  DATABASE_URL: Joi.string().required(),
  POSTGRES_USER: Joi.string().optional(),
  POSTGRES_PASSWORD: Joi.string().optional(),
  POSTGRES_DB: Joi.string().optional(),
  POSTGRES_HOST: Joi.string().default('localhost'),
  POSTGRES_PORT: Joi.number().default(5432),

  // Redis Configuration
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),

  // Security & Authentication
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  BCRYPT_SALT_ROUNDS: Joi.number().default(12),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // OpenAI / LangChain Configuration
  OPENAI_API_KEY: Joi.string().required(),
  LANGCHAIN_TRACING_V2: Joi.string().default('true'),
  LANGCHAIN_API_KEY: Joi.string().optional().allow(''),
  LANGCHAIN_PROJECT: Joi.string().default('mandla-rice-mrv'),

  // Blockchain Configuration (Polygon Amoy Testnet)
  WEB3_PROVIDER_URL: Joi.string().uri().required(),
  CHAIN_ID: Joi.string().default('80002'),
  WEB3_PRIVATE_KEY: Joi.string().required(),
  CARBON_CREDIT_CONTRACT_ADDRESS: Joi.string().optional().allow(''),
  GAS_LIMIT: Joi.number().default(500000),
  GAS_PRICE: Joi.number().default(20000000000),

  // Soroban Configuration (Stellar Blockchain)
  SOROBAN_RPC_URL: Joi.string().uri().default('https://soroban-testnet.stellar.org'),
  SOROBAN_CONTRACT_ID: Joi.string().optional().allow(''),
  SOROBAN_NETWORK_PASSPHRASE: Joi.string().default('Test SDF Network ; September 2015'),
  SOROBAN_ENABLED: Joi.boolean().default(true),

  // IPFS Configuration (Multiple providers supported)
  PINATA_API_KEY: Joi.string().optional().allow(''),
  PINATA_SECRET_API_KEY: Joi.string().optional().allow(''),
  IPFS_GATEWAY_URL: Joi.string().uri().default('https://gateway.pinata.cloud/ipfs/'),
  
  // IPFS Alternatives
  WEB3_STORAGE_TOKEN: Joi.string().optional().allow(''),
  WEB3_STORAGE_GATEWAY: Joi.string().uri().default('https://w3s.link/ipfs/'),
  NFT_STORAGE_TOKEN: Joi.string().optional().allow(''),
  NFT_STORAGE_GATEWAY: Joi.string().uri().default('https://nftstorage.link/ipfs/'),
  INFURA_IPFS_PROJECT_ID: Joi.string().optional().allow(''),
  INFURA_IPFS_PROJECT_SECRET: Joi.string().optional().allow(''),
  INFURA_IPFS_GATEWAY: Joi.string().uri().default('https://ipfs.infura.io/ipfs/'),

  // Remote Sensing & Geospatial (CDSE - Copernicus Data Space Ecosystem)
  CDSE_API_URL: Joi.string().uri().default('https://catalogue.dataspace.copernicus.eu/stac'),
  CDSE_CLIENT_ID: Joi.string().optional().allow(''),
  CDSE_CLIENT_SECRET: Joi.string().optional().allow(''),
  CDSE_AUTH_URL: Joi.string().uri().default('https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token'),
  CDSE_STAC_URL: Joi.string().uri().default('https://catalogue.dataspace.copernicus.eu/stac'),
  
  // Sentinel Collections
  CDSE_SENTINEL_1_COLLECTION: Joi.string().default('SENTINEL-1'),
  CDSE_SENTINEL_2_COLLECTION: Joi.string().default('SENTINEL-2'),
  CDSE_SENTINEL_3_COLLECTION: Joi.string().default('SENTINEL-3'),
  CDSE_SENTINEL_5P_COLLECTION: Joi.string().default('SENTINEL-5P'),
  CDSE_SENTINEL_6_COLLECTION: Joi.string().default('SENTINEL-6'),
  
  // NASA Earth Data
  NASA_EARTHDATA_USERNAME: Joi.string().optional().allow(''),
  NASA_EARTHDATA_PASSWORD: Joi.string().optional().allow(''),
  NASA_EARTHDATA_TOKEN: Joi.string().optional().allow(''),

  // External APIs
  WHATSAPP_ACCESS_TOKEN: Joi.string().optional().allow(''),
  WHATSAPP_PHONE_NUMBER_ID: Joi.string().optional().allow(''),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: Joi.string().optional().allow(''),
  TWILIO_ACCOUNT_SID: Joi.string().optional().allow(''),
  TWILIO_AUTH_TOKEN: Joi.string().optional().allow(''),
  TWILIO_PHONE_NUMBER: Joi.string().optional().allow(''),

  // File Storage
  UPLOAD_DIR: Joi.string().default('./uploads'),
  MAX_FILE_SIZE: Joi.number().default(10485760),
  ALLOWED_FILE_TYPES: Joi.string().default('image/jpeg,image/png,application/pdf,text/csv,application/vnd.ms-excel'),

  // Logging Configuration
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_DIR: Joi.string().default('./logs'),
  LOG_MAX_SIZE: Joi.string().default('20m'),
  LOG_MAX_FILES: Joi.string().default('14d'),

  // Email Configuration
  SMTP_HOST: Joi.string().default('smtp.gmail.com'),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().optional().allow(''),
  SMTP_PASS: Joi.string().optional().allow(''),

  // Monitoring & Analytics
  SENTRY_DSN: Joi.string().optional().allow(''),
  GOOGLE_ANALYTICS_ID: Joi.string().optional().allow(''),

  // Carbon Emission Model Parameters
  IPCC_TIER: Joi.number().default(2),
  BASELINE_EMISSION_FACTOR: Joi.number().default(1.30),
  AWD_SCALING_FACTOR: Joi.number().default(0.52),
  SRI_SCALING_FACTOR: Joi.number().default(0.68),
  UNCERTAINTY_THRESHOLD: Joi.number().default(0.25),
  GWP_METHANE: Joi.number().default(28),

  // UN/UNDP Integration
  UNDP_API_URL: Joi.string().uri().default('https://api.undp.org/v1'),
  UNDP_API_KEY: Joi.string().optional().allow(''),
  BILL_GATES_FOUNDATION_API_KEY: Joi.string().optional().allow(''),

  // Geographic Configuration
  DEFAULT_COUNTRY: Joi.string().default('IN'),
  DEFAULT_STATE: Joi.string().default('MP'),
  DEFAULT_DISTRICT: Joi.string().default('Mandla'),
  COORDINATE_SYSTEM: Joi.string().default('EPSG:4326'),
  BUFFER_DISTANCE_METERS: Joi.number().default(100),

  // Scheduling & Jobs
  CRON_MRV_SCHEDULE: Joi.string().default('0 2 * * 0'),
  CRON_CREDIT_BATCH_SCHEDULE: Joi.string().default('0 6 * * 1'),
  CRON_SATELLITE_FETCH_SCHEDULE: Joi.string().default('0 4 * * *'),

  // Feature Flags
  ENABLE_BLOCKCHAIN: Joi.boolean().default(true),
  ENABLE_SATELLITE_DATA: Joi.boolean().default(true),
  ENABLE_WHATSAPP_BOT: Joi.boolean().default(true),
  ENABLE_IVR_SYSTEM: Joi.boolean().default(true),
  ENABLE_CARBON_TRADING: Joi.boolean().default(true),
  ENABLE_MULTI_LANGUAGE: Joi.boolean().default(true),
});

// Convert string environment variables to appropriate types
const processEnv = {
  ...process.env,
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
  POSTGRES_PORT: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : undefined,
  REDIS_PORT: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined,
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : undefined,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) : undefined,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) : undefined,
  GAS_LIMIT: process.env.GAS_LIMIT ? parseInt(process.env.GAS_LIMIT, 10) : undefined,
  GAS_PRICE: process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE, 10) : undefined,
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE, 10) : undefined,
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  IPCC_TIER: process.env.IPCC_TIER ? parseInt(process.env.IPCC_TIER, 10) : undefined,
  BASELINE_EMISSION_FACTOR: process.env.BASELINE_EMISSION_FACTOR ? parseFloat(process.env.BASELINE_EMISSION_FACTOR) : undefined,
  AWD_SCALING_FACTOR: process.env.AWD_SCALING_FACTOR ? parseFloat(process.env.AWD_SCALING_FACTOR) : undefined,
  SRI_SCALING_FACTOR: process.env.SRI_SCALING_FACTOR ? parseFloat(process.env.SRI_SCALING_FACTOR) : undefined,
  UNCERTAINTY_THRESHOLD: process.env.UNCERTAINTY_THRESHOLD ? parseFloat(process.env.UNCERTAINTY_THRESHOLD) : undefined,
  GWP_METHANE: process.env.GWP_METHANE ? parseInt(process.env.GWP_METHANE, 10) : undefined,
  BUFFER_DISTANCE_METERS: process.env.BUFFER_DISTANCE_METERS ? parseInt(process.env.BUFFER_DISTANCE_METERS, 10) : undefined,
  ENABLE_BLOCKCHAIN: process.env.ENABLE_BLOCKCHAIN === 'true',
  ENABLE_SATELLITE_DATA: process.env.ENABLE_SATELLITE_DATA === 'true',
  ENABLE_WHATSAPP_BOT: process.env.ENABLE_WHATSAPP_BOT === 'true',
  ENABLE_IVR_SYSTEM: process.env.ENABLE_IVR_SYSTEM === 'true',
  ENABLE_CARBON_TRADING: process.env.ENABLE_CARBON_TRADING === 'true',
  ENABLE_MULTI_LANGUAGE: process.env.ENABLE_MULTI_LANGUAGE === 'true',
};

// Validate environment variables
const { error, value: env } = envSchema.validate(processEnv, { allowUnknown: true });

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Configuration object with organized structure
export const config = {
  // Server settings
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  apiVersion: env.API_VERSION,
  appUrl: env.APP_URL,
  frontendUrl: env.FRONTEND_URL,

  // Database settings
  database: {
    url: env.DATABASE_URL,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    name: env.POSTGRES_DB,
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
  },

  // Redis settings
  redis: {
    url: env.REDIS_URL,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  },

  // Authentication & Security
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  // AI & LangChain
  langchain: {
    openaiApiKey: env.OPENAI_API_KEY,
    tracingV2: env.LANGCHAIN_TRACING_V2 === 'true',
    apiKey: env.LANGCHAIN_API_KEY,
    project: env.LANGCHAIN_PROJECT,
  },

  // Blockchain (Polygon Amoy Testnet)
  blockchain: {
    providerUrl: env.WEB3_PROVIDER_URL,
    chainId: env.CHAIN_ID,
    privateKey: env.WEB3_PRIVATE_KEY,
    carbonCreditContractAddress: env.CARBON_CREDIT_CONTRACT_ADDRESS,
    gasLimit: env.GAS_LIMIT,
    gasPrice: env.GAS_PRICE,
  },
  soroban: {
    rpcUrl: env.SOROBAN_RPC_URL,
    contractId: env.SOROBAN_CONTRACT_ID,
    networkPassphrase: env.SOROBAN_NETWORK_PASSPHRASE,
    enabled: env.SOROBAN_ENABLED,
  },

  // IPFS (Multiple providers supported)
  ipfs: {
    pinata: {
      apiKey: env.PINATA_API_KEY,
      secretKey: env.PINATA_SECRET_API_KEY,
      gatewayUrl: env.IPFS_GATEWAY_URL,
    },
    web3Storage: {
      token: env.WEB3_STORAGE_TOKEN,
      gatewayUrl: env.WEB3_STORAGE_GATEWAY,
    },
    nftStorage: {
      token: env.NFT_STORAGE_TOKEN,
      gatewayUrl: env.NFT_STORAGE_GATEWAY,
    },
    infura: {
      projectId: env.INFURA_IPFS_PROJECT_ID,
      projectSecret: env.INFURA_IPFS_PROJECT_SECRET,
      gatewayUrl: env.INFURA_IPFS_GATEWAY,
    },
    defaultGateway: env.IPFS_GATEWAY_URL,
  },

  // Remote Sensing & Geospatial
  remoteSensing: {
    cdse: {
      apiUrl: env.CDSE_API_URL,
      clientId: env.CDSE_CLIENT_ID,
      clientSecret: env.CDSE_CLIENT_SECRET,
      authUrl: env.CDSE_AUTH_URL,
      stacUrl: env.CDSE_STAC_URL,
      collections: {
        sentinel1: env.CDSE_SENTINEL_1_COLLECTION,
        sentinel2: env.CDSE_SENTINEL_2_COLLECTION,
        sentinel3: env.CDSE_SENTINEL_3_COLLECTION,
        sentinel5P: env.CDSE_SENTINEL_5P_COLLECTION,
        sentinel6: env.CDSE_SENTINEL_6_COLLECTION,
      },
    },
    nasa: {
      username: env.NASA_EARTHDATA_USERNAME,
      password: env.NASA_EARTHDATA_PASSWORD,
      token: env.NASA_EARTHDATA_TOKEN,
    },
  },

  // External APIs
  externalApis: {
    whatsapp: {
      accessToken: env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
      webhookVerifyToken: env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    },
    twilio: {
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      phoneNumber: env.TWILIO_PHONE_NUMBER,
    },
  },

  // File Storage
  storage: {
    uploadDir: env.UPLOAD_DIR,
    maxFileSize: env.MAX_FILE_SIZE,
    allowedFileTypes: env.ALLOWED_FILE_TYPES.split(','),
  },

  // Logging
  logging: {
    level: env.LOG_LEVEL,
    dir: env.LOG_DIR,
    maxSize: env.LOG_MAX_SIZE,
    maxFiles: env.LOG_MAX_FILES,
  },

  // Email
  email: {
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT,
    smtpUser: env.SMTP_USER,
    smtpPass: env.SMTP_PASS,
  },

  // Monitoring
  monitoring: {
    sentryDsn: env.SENTRY_DSN,
    googleAnalyticsId: env.GOOGLE_ANALYTICS_ID,
  },

  // Carbon Model Parameters
  carbonModel: {
    ipccTier: env.IPCC_TIER,
    baselineEmissionFactor: env.BASELINE_EMISSION_FACTOR,
    awdScalingFactor: env.AWD_SCALING_FACTOR,
    sriScalingFactor: env.SRI_SCALING_FACTOR,
    uncertaintyThreshold: env.UNCERTAINTY_THRESHOLD,
    gwpMethane: env.GWP_METHANE,
  },

  // UN/UNDP Integration
  undp: {
    apiUrl: env.UNDP_API_URL,
    apiKey: env.UNDP_API_KEY,
    countryCode: env.UNDP_COUNTRY_CODE,
    defaultYear: env.UNDP_DEFAULT_YEAR,
    indicators: env.UNDP_INDICATORS,
    billGatesFoundationApiKey: env.BILL_GATES_FOUNDATION_API_KEY,
  },

  // Geographic
  geography: {
    defaultCountry: env.DEFAULT_COUNTRY,
    defaultState: env.DEFAULT_STATE,
    defaultDistrict: env.DEFAULT_DISTRICT,
    coordinateSystem: env.COORDINATE_SYSTEM,
    bufferDistanceMeters: env.BUFFER_DISTANCE_METERS,
  },

  // Scheduling
  scheduling: {
    mrvSchedule: env.CRON_MRV_SCHEDULE,
    creditBatchSchedule: env.CRON_CREDIT_BATCH_SCHEDULE,
    satelliteFetchSchedule: env.CRON_SATELLITE_FETCH_SCHEDULE,
  },

  // Feature Flags
  features: {
    enableBlockchain: env.ENABLE_BLOCKCHAIN,
    enableSatelliteData: env.ENABLE_SATELLITE_DATA,
    enableWhatsappBot: env.ENABLE_WHATSAPP_BOT,
    enableIvrSystem: env.ENABLE_IVR_SYSTEM,
    enableCarbonTrading: env.ENABLE_CARBON_TRADING,
    enableMultiLanguage: env.ENABLE_MULTI_LANGUAGE,
  },
} as const;

// Type definitions for configuration
export type Config = typeof config;

// Validation utility
export const validateConfig = (): void => {
  try {
    const { error } = envSchema.validate(processEnv, { allowUnknown: true });
    if (error) {
      throw error;
    }
    console.log('✅ Configuration validation passed');
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    process.exit(1);
  }
};

// Default export
export default config;
