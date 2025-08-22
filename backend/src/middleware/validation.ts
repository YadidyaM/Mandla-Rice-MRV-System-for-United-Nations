/**
 * Validation Middleware for Mandla Rice MRV System
 * Request validation using Joi schemas with custom validation rules
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from './errorHandler';

// Custom Joi extensions for our domain-specific validations
const customJoi = Joi.extend(
  {
    type: 'coordinate',
    base: Joi.number(),
    messages: {
      'coordinate.latitude': 'Latitude must be between -90 and 90',
      'coordinate.longitude': 'Longitude must be between -180 and 180',
    },
    rules: {
      latitude: {
        validate(value, helpers) {
          if (value < -90 || value > 90) {
            return helpers.error('coordinate.latitude');
          }
          return value;
        },
      },
      longitude: {
        validate(value, helpers) {
          if (value < -180 || value > 180) {
            return helpers.error('coordinate.longitude');
          }
          return value;
        },
      },
    },
  },
  {
    type: 'phone',
    base: Joi.string(),
    messages: {
      'phone.indian': 'Must be a valid Indian phone number',
    },
    rules: {
      indian: {
        validate(value, helpers) {
          const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
          if (!indianPhoneRegex.test(value.replace(/\s+/g, ''))) {
            return helpers.error('phone.indian');
          }
          return value;
        },
      },
    },
  }
);

// Common validation schemas
export const commonSchemas = {
  id: Joi.string().alphanum().min(10).max(30),
  email: Joi.string().email().lowercase(),
  phone: customJoi.phone().indian(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')),
  date: Joi.date().iso(),
  coordinates: Joi.object({
    lat: customJoi.coordinate().latitude().required(),
    lng: customJoi.coordinate().longitude().required(),
  }),
  geoJsonPolygon: Joi.object({
    type: Joi.string().valid('Polygon').required(),
    coordinates: Joi.array().items(
      Joi.array().items(
        Joi.array().length(2).items(
          customJoi.coordinate().longitude(),
          customJoi.coordinate().latitude()
        )
      ).min(4)
    ).length(1).required(),
  }),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    email: commonSchemas.email.required(),
    phone: commonSchemas.phone.required(),
    password: commonSchemas.password.required(),
    role: Joi.string().valid('FARMER', 'FIELD_OFFICER', 'VERIFIER', 'ADMIN').default('FARMER'),
    profile: Joi.object({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'),
      dateOfBirth: commonSchemas.date,
      language: Joi.string().valid('hi', 'en', 'gon').default('hi'),
      village: Joi.string().min(2).max(100),
      block: Joi.string().min(2).max(100),
      district: Joi.string().default('Mandla'),
      state: Joi.string().default('Madhya Pradesh'),
      pincode: Joi.string().pattern(/^\d{6}$/),
      coordinates: commonSchemas.coordinates,
      tribalGroup: Joi.string().max(100),
      caste: Joi.string().max(100),
      isMarginalised: Joi.boolean().default(false),
      shgMembership: Joi.string().max(100),
      farmingExperience: Joi.number().integer().min(0).max(100),
      totalLandArea: Joi.number().positive().max(1000),
      irrigationAccess: Joi.boolean().default(false),
      hasSmartphone: Joi.boolean().default(false),
      whatsappNumber: customJoi.phone().indian(),
      preferredContact: Joi.string().valid('PHONE', 'WHATSAPP', 'SMS', 'EMAIL', 'IN_PERSON').default('PHONE'),
    }).required(),
  }),

  login: Joi.object({
    email: commonSchemas.email,
    phone: customJoi.phone().indian(),
    password: Joi.string().required(),
  }).xor('email', 'phone'),

  updateProfile: Joi.object({
    profile: Joi.object({
      firstName: Joi.string().min(2).max(50),
      lastName: Joi.string().min(2).max(50),
      gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'),
      language: Joi.string().valid('hi', 'en', 'gon'),
      village: Joi.string().min(2).max(100),
      block: Joi.string().min(2).max(100),
      pincode: Joi.string().pattern(/^\d{6}$/),
      coordinates: commonSchemas.coordinates,
      tribalGroup: Joi.string().max(100),
      shgMembership: Joi.string().max(100),
      farmingExperience: Joi.number().integer().min(0).max(100),
      totalLandArea: Joi.number().positive().max(1000),
      irrigationAccess: Joi.boolean(),
      hasSmartphone: Joi.boolean(),
      whatsappNumber: customJoi.phone().indian(),
      preferredContact: Joi.string().valid('PHONE', 'WHATSAPP', 'SMS', 'EMAIL', 'IN_PERSON'),
    }),
  }),
};

// Farm validation schemas
export const farmSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    area: Joi.number().positive().max(100).required(),
    coordinates: commonSchemas.geoJsonPolygon.required(),
    elevation: Joi.number().min(0).max(10000),
    soilType: Joi.string().max(100),
    surveyNumber: Joi.string().max(50),
    village: Joi.string().min(2).max(100).required(),
    block: Joi.string().min(2).max(100).required(),
    district: Joi.string().default('Mandla'),
    state: Joi.string().default('Madhya Pradesh'),
    cropPattern: Joi.object({
      kharif: Joi.array().items(Joi.string()),
      rabi: Joi.array().items(Joi.string()),
      zaid: Joi.array().items(Joi.string()),
    }),
    irrigationType: Joi.string().valid('FLOOD', 'AWD', 'SRI', 'DRIP', 'SPRINKLER', 'RAINFED').default('FLOOD'),
    waterSource: Joi.string().valid('TUBE_WELL', 'OPEN_WELL', 'CANAL', 'RIVER', 'POND', 'RAINWATER'),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100),
    area: Joi.number().positive().max(100),
    coordinates: commonSchemas.geoJsonPolygon,
    elevation: Joi.number().min(0).max(10000),
    soilType: Joi.string().max(100),
    surveyNumber: Joi.string().max(50),
    village: Joi.string().min(2).max(100),
    block: Joi.string().min(2).max(100),
    cropPattern: Joi.object({
      kharif: Joi.array().items(Joi.string()),
      rabi: Joi.array().items(Joi.string()),
      zaid: Joi.array().items(Joi.string()),
    }),
    irrigationType: Joi.string().valid('FLOOD', 'AWD', 'SRI', 'DRIP', 'SPRINKLER', 'RAINFED'),
    waterSource: Joi.string().valid('TUBE_WELL', 'OPEN_WELL', 'CANAL', 'RIVER', 'POND', 'RAINWATER'),
  }),
};

// Farming season validation schemas
export const seasonSchemas = {
  create: Joi.object({
    farmId: commonSchemas.id.required(),
    season: Joi.string().valid('KHARIF', 'RABI', 'ZAID').required(),
    year: Joi.number().integer().min(2020).max(new Date().getFullYear() + 1).required(),
    crop: Joi.string().max(100).default('Rice'),
    variety: Joi.string().max(100),
    sowingDate: commonSchemas.date,
    transplantDate: commonSchemas.date,
    harvestDate: commonSchemas.date,
    farmingMethod: Joi.string().valid('CONVENTIONAL', 'AWD', 'SRI', 'ORGANIC', 'INTEGRATED').default('CONVENTIONAL'),
    irrigationCycles: Joi.array().items(Joi.object({
      date: commonSchemas.date.required(),
      method: Joi.string().required(),
      duration: Joi.number().positive(),
      waterDepth: Joi.number().positive(),
    })),
    fertilizers: Joi.array().items(Joi.object({
      date: commonSchemas.date.required(),
      type: Joi.string().required(),
      quantity: Joi.number().positive().required(),
      unit: Joi.string().required(),
    })),
    organicInputs: Joi.array().items(Joi.object({
      date: commonSchemas.date.required(),
      type: Joi.string().required(),
      quantity: Joi.number().positive().required(),
      unit: Joi.string().required(),
    })),
    expectedYield: Joi.number().positive(),
    actualYield: Joi.number().positive(),
    yieldUnit: Joi.string().default('kg/ha'),
  }),
};

// MRV validation schemas
export const mrvSchemas = {
  calculate: Joi.object({
    farmId: commonSchemas.id.required(),
    seasonId: commonSchemas.id.required(),
    methodology: Joi.string().default('IPCC 2019 Refinement'),
    tier: Joi.number().integer().valid(1, 2, 3).default(2),
    scalingFactors: Joi.object({
      SFw: Joi.number().positive().max(2),
      SFp: Joi.number().positive().max(2),
      SFo: Joi.number().positive().max(2),
    }),
    emissionFactors: Joi.object({
      EFc: Joi.number().positive(),
    }),
  }),

  verify: Joi.object({
    mrvReportId: commonSchemas.id.required(),
    verificationNotes: Joi.string().max(1000),
    status: Joi.string().valid('VERIFIED', 'REJECTED', 'NEEDS_REVISION').required(),
  }),
};

// Carbon credit validation schemas
export const carbonCreditSchemas = {
  issue: Joi.object({
    mrvReportId: commonSchemas.id.required(),
    quantity: Joi.number().positive().required(),
    methodology: Joi.string().required(),
    vintage: Joi.number().integer().min(2020).max(new Date().getFullYear()).required(),
  }),

  batch: Joi.object({
    creditIds: Joi.array().items(commonSchemas.id).min(1).required(),
    averagePrice: Joi.number().positive(),
  }),
};

// Satellite data validation schemas
export const satelliteSchemas = {
  fetch: Joi.object({
    farmId: commonSchemas.id.required(),
    startDate: commonSchemas.date.required(),
    endDate: commonSchemas.date.required(),
    satellite: Joi.string().valid('Sentinel-1', 'Sentinel-2', 'Landsat-8', 'Landsat-9'),
    cloudCoverMax: Joi.number().min(0).max(100).default(20),
  }),

  analyze: Joi.object({
    farmId: commonSchemas.id.required(),
    seasonId: commonSchemas.id.required(),
    analysisType: Joi.string().valid('NDVI', 'FLOOD_DETECTION', 'CROP_MAPPING', 'YIELD_ESTIMATION').required(),
  }),
};

// WhatsApp webhook validation
export const whatsappSchemas = {
  webhook: Joi.object({
    object: Joi.string().valid('whatsapp_business_account').required(),
    entry: Joi.array().items(Joi.object({
      id: Joi.string().required(),
      changes: Joi.array().items(Joi.object({
        value: Joi.object({
          messaging_product: Joi.string().valid('whatsapp'),
          metadata: Joi.object(),
          contacts: Joi.array(),
          messages: Joi.array(),
          statuses: Joi.array(),
        }),
        field: Joi.string().valid('messages'),
      })),
    })),
  }),
};

// Validation middleware factory
export const validateRequest = (schema: Joi.ObjectSchema, target: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      throw new ValidationError('Validation failed', details);
    }

    req[target] = value;
    next();
  };
};

// Query parameter validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return validateRequest(schema, 'query');
};

// URL parameter validation middleware
export const validateParams = (schema: Joi.ObjectSchema) => {
  return validateRequest(schema, 'params');
};

// File upload validation
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    
    if (options.required && !file) {
      throw new ValidationError('File is required');
    }

    if (file) {
      if (options.maxSize && file.size > options.maxSize) {
        throw new ValidationError(`File size exceeds ${options.maxSize} bytes`);
      }

      if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
        throw new ValidationError(`File type ${file.mimetype} is not allowed`);
      }
    }

    next();
  };
};

export default {
  commonSchemas,
  userSchemas,
  farmSchemas,
  seasonSchemas,
  mrvSchemas,
  carbonCreditSchemas,
  satelliteSchemas,
  whatsappSchemas,
  validateRequest,
  validateQuery,
  validateParams,
  validateFileUpload,
};
