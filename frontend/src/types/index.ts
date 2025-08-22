/**
 * Core Type Definitions for Mandla Rice MRV System
 */

// User Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  dateOfBirth?: string;
  language: string;
  village?: string;
  block?: string;
  district: string;
  state: string;
  pincode?: string;
  coordinates?: Coordinates;
  tribalGroup?: string;
  caste?: string;
  isMarginalised: boolean;
  shgMembership?: string;
  farmingExperience?: number;
  totalLandArea?: number;
  irrigationAccess: boolean;
  hasSmartphone: boolean;
  whatsappNumber?: string;
  preferredContact: ContactMethod;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'FARMER' | 'FIELD_OFFICER' | 'VERIFIER' | 'ADMIN' | 'SUPER_ADMIN' | 'NGO_PARTNER' | 'GOVERNMENT_OFFICIAL';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type ContactMethod = 'PHONE' | 'WHATSAPP' | 'SMS' | 'EMAIL' | 'IN_PERSON';

// Geographic Types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

// Farm Types
export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  area: number;
  coordinates: GeoJSONPolygon;
  elevation?: number;
  soilType?: string;
  surveyNumber?: string;
  village: string;
  block: string;
  district: string;
  state: string;
  cropPattern?: CropPattern;
  irrigationType: IrrigationType;
  waterSource?: WaterSource;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  farmer?: User;
  seasons?: FarmingSeason[];
  mrvReports?: MRVReport[];
  satelliteData?: SatelliteData[];
}

export interface CropPattern {
  kharif?: string[];
  rabi?: string[];
  zaid?: string[];
}

export type IrrigationType = 'FLOOD' | 'AWD' | 'SRI' | 'DRIP' | 'SPRINKLER' | 'RAINFED';
export type WaterSource = 'TUBE_WELL' | 'OPEN_WELL' | 'CANAL' | 'RIVER' | 'POND' | 'RAINWATER';

// Farming Season Types
export interface FarmingSeason {
  id: string;
  farmId: string;
  season: SeasonType;
  year: number;
  crop: string;
  variety?: string;
  sowingDate?: string;
  transplantDate?: string;
  harvestDate?: string;
  farmingMethod: FarmingMethod;
  irrigationCycles?: IrrigationCycle[];
  fertilizers?: FertilizerApplication[];
  pesticides?: PesticideApplication[];
  organicInputs?: OrganicInput[];
  expectedYield?: number;
  actualYield?: number;
  yieldUnit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  farm?: Farm;
  mrvReports?: MRVReport[];
  carbonCredits?: CarbonCredit[];
}

export type SeasonType = 'KHARIF' | 'RABI' | 'ZAID';
export type FarmingMethod = 'CONVENTIONAL' | 'AWD' | 'SRI' | 'ORGANIC' | 'INTEGRATED';

export interface IrrigationCycle {
  date: string;
  method: string;
  duration?: number;
  waterDepth?: number;
}

export interface FertilizerApplication {
  date: string;
  type: string;
  quantity: number;
  unit: string;
}

export interface PesticideApplication {
  date: string;
  type: string;
  quantity: number;
  unit: string;
}

export interface OrganicInput {
  date: string;
  type: string;
  quantity: number;
  unit: string;
}

// MRV Types
export interface MRVReport {
  id: string;
  farmId: string;
  farmerId: string;
  seasonId: string;
  reportType: MRVType;
  status: MRVStatus;
  baselineEmissions?: number;
  projectEmissions?: number;
  emissionReductions?: number;
  uncertaintyRange?: number;
  methodology: string;
  tier: number;
  scalingFactors?: Record<string, number>;
  emissionFactors?: Record<string, number>;
  farmerData?: any[];
  satelliteData?: any;
  fieldMeasurements?: any[];
  qualityFlags?: string[];
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verificationDate?: string;
  verificationNotes?: string;
  ipfsHash?: string;
  signedReportHash?: string;
  createdAt: string;
  updatedAt: string;
  farm?: Farm;
  farmer?: User;
  season?: FarmingSeason;
  carbonCredits?: CarbonCredit[];
}

export type MRVType = 'EMISSION_CALCULATION' | 'VERIFICATION_REPORT' | 'MONITORING_UPDATE' | 'ANNUAL_REPORT';
export type MRVStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'PUBLISHED';
export type VerificationStatus = 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED' | 'NEEDS_REVISION';

// Carbon Credit Types
export interface CarbonCredit {
  id: string;
  tokenId: string;
  farmerId: string;
  seasonId: string;
  mrvReportId: string;
  quantity: number;
  methodology: string;
  vintage: number;
  serialNumber: string;
  contractAddress?: string;
  blockchainTxHash?: string;
  mintedAt?: string;
  status: CreditStatus;
  currentOwner?: string;
  salePrice?: number;
  soldAt?: string;
  buyer?: string;
  batchId?: string;
  createdAt: string;
  updatedAt: string;
  farmer?: User;
  season?: FarmingSeason;
  mrvReport?: MRVReport;
  batch?: CreditBatch;
}

export type CreditStatus = 'ISSUED' | 'LISTED' | 'SOLD' | 'RETIRED' | 'CANCELLED';

export interface CreditBatch {
  id: string;
  batchNumber: string;
  totalQuantity: number;
  averagePrice?: number;
  methodology: string;
  vintage: number;
  contractAddress?: string;
  batchTxHash?: string;
  status: BatchStatus;
  listedAt?: string;
  soldAt?: string;
  buyer?: string;
  createdAt: string;
  updatedAt: string;
  credits?: CarbonCredit[];
}

export type BatchStatus = 'CREATED' | 'LISTED' | 'SOLD' | 'SETTLED' | 'CANCELLED';

// Satellite Data Types
export interface SatelliteData {
  id: string;
  farmId: string;
  satellite: string;
  date: string;
  cloudCover?: number;
  ndviValue?: number;
  vhBackscatter?: number;
  vvBackscatter?: number;
  floodStatus?: FloodStatus;
  processingLevel?: string;
  tileId?: string;
  sceneId?: string;
  dataUrl?: string;
  irrigationDetected?: boolean;
  cropPhase?: CropPhase;
  anomalyFlag: boolean;
  createdAt: string;
  updatedAt: string;
  farm?: Farm;
}

export type FloodStatus = 'DRY' | 'SATURATED' | 'FLOODED' | 'UNCERTAIN';
export type CropPhase = 'LAND_PREPARATION' | 'TRANSPLANTING' | 'VEGETATIVE' | 'REPRODUCTIVE' | 'MATURATION' | 'HARVEST' | 'FALLOW';

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  titleHi?: string;
  messageHi?: string;
  titleGon?: string;
  messageGon?: string;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, any>;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export type NotificationType = 'IRRIGATION_REMINDER' | 'DATA_COLLECTION' | 'VERIFICATION_RESULT' | 'CREDIT_ISSUED' | 'PAYMENT_RECEIVED' | 'SYSTEM_UPDATE' | 'EMERGENCY';
export type NotificationChannel = 'APP' | 'SMS' | 'WHATSAPP' | 'IVR' | 'EMAIL' | 'PUSH';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Auth Types
export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
  profile: Partial<UserProfile>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Dashboard Types
export interface DashboardStats {
  totalFarms: number;
  totalCredits: number;
  totalEmissionReductions: number;
  totalIncome: number;
  recentMRVReports: MRVReport[];
  recentCredits: CarbonCredit[];
  seasonalProgress: SeasonalProgress[];
  emissionTrends: EmissionTrend[];
}

export interface SeasonalProgress {
  season: string;
  year: number;
  farmsCount: number;
  completedMRV: number;
  pendingMRV: number;
  creditsIssued: number;
}

export interface EmissionTrend {
  month: string;
  baseline: number;
  project: number;
  reduction: number;
}

// System Configuration Types
export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Error Types
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  isOperational?: boolean;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: Record<string, any>;
}

// File Upload Types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// Language Types
export type Language = 'en' | 'hi' | 'gon';

// Web3 Types
export interface Web3State {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  isCorrectNetwork: boolean;
  balance?: string;
}

export interface ContractInteraction {
  txHash?: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

// Export all types
export * from './api';
export * from './forms';
