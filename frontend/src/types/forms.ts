/**
 * Form-specific type definitions
 */

import { z } from 'zod';

// Input schema for the form
export const loginInputSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email'],
});

// Output schema after validation
export const loginSchema = loginInputSchema.transform(data => ({
  email: data.email || undefined,
  phone: data.phone || undefined,
  password: data.password,
}));

// Type inference from schemas
export type LoginInputData = z.infer<typeof loginInputSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  profile: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
    village: z.string().min(2, 'Village name is required'),
    block: z.string().min(2, 'Block name is required'),
    district: z.string().min(2, 'District name is required'),
    state: z.string().min(2, 'State name is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode').optional(),
    tribalGroup: z.string().optional(),
    shgMembership: z.string().optional(),
    farmingExperience: z.number().min(0).max(100).optional(),
    totalLandArea: z.number().positive().max(1000).optional(),
    irrigationAccess: z.boolean().default(false),
    hasSmartphone: z.boolean().default(false),
    whatsappNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid WhatsApp number').optional(),
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const farmSchema = z.object({
  name: z.string().min(2, 'Farm name must be at least 2 characters'),
  area: z.string().min(1, 'Area is required'),
  village: z.string().min(2, 'Village name is required'),
  block: z.string().min(2, 'Block name is required'),
  district: z.string().min(2, 'District name is required'),
  state: z.string().min(2, 'State name is required'),
  surveyNumber: z.string().optional(),
  soilType: z.string().optional(),
  elevation: z.string().optional(),
  irrigationType: z.enum(['FLOOD', 'AWD', 'SRI', 'DRIP', 'SPRINKLER', 'RAINFED']),
  waterSource: z.enum(['TUBE_WELL', 'OPEN_WELL', 'CANAL', 'RIVER', 'POND', 'RAINWATER']).optional(),
  coordinates: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.array(z.number().min(-180).max(180)))),
  }).optional(),
}).refine((data) => {
  // Coordinates are required for submission but optional for form validation
  return true; // Always pass validation, we'll check coordinates in onSubmit
}, {
  message: "Coordinates will be validated on submission",
  path: ["coordinates"]
});

export const seasonSchema = z.object({
  farmId: z.string().min(1, 'Farm selection is required'),
  season: z.enum(['KHARIF', 'RABI', 'ZAID']),
  year: z.number().min(2020).max(new Date().getFullYear() + 1),
  crop: z.string().default('Rice'),
  variety: z.string().optional(),
  sowingDate: z.string().optional(),
  transplantDate: z.string().optional(),
  harvestDate: z.string().optional(),
  farmingMethod: z.enum(['CONVENTIONAL', 'AWD', 'SRI', 'ORGANIC', 'INTEGRATED']),
  expectedYield: z.number().positive().optional(),
  actualYield: z.number().positive().optional(),
});

// Type inference from schemas
export type RegisterFormData = z.infer<typeof registerSchema>;
export type FarmFormData = z.infer<typeof farmSchema>;
export type SeasonFormData = z.infer<typeof seasonSchema>;

// Form state types
export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  help?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
