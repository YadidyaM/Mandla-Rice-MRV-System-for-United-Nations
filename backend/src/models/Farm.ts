/**
 * Farm Model for MongoDB
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IFarm extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  area: number;
  irrigationType: string;
  waterSource: string;
  soilType: string;
  surveyNumber?: string;
  elevation?: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const farmSchema = new Schema<IFarm>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: Number,
    required: true,
    min: [0.01, 'Farm area must be at least 0.01 hectares']
  },
  irrigationType: {
    type: String,
    required: true,
    enum: ['rainfed', 'irrigated', 'mixed']
  },
  waterSource: {
    type: String,
    required: true,
    enum: ['rain', 'well', 'canal', 'river', 'pond', 'other']
  },
  soilType: {
    type: String,
    required: true,
    enum: ['clay', 'loam', 'sandy', 'silty', 'mixed']
  },
  surveyNumber: {
    type: String,
    trim: true
  },
  elevation: {
    type: Number,
    min: [0, 'Elevation cannot be negative']
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: [-90, 'Invalid latitude'],
      max: [90, 'Invalid latitude']
    },
    longitude: {
      type: Number,
      required: true,
      min: [-180, 'Invalid longitude'],
      max: [180, 'Invalid longitude']
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Geospatial index for location-based queries
farmSchema.index({ location: '2dsphere' });
farmSchema.index({ userId: 1 });
farmSchema.index({ isActive: 1 });

// Pre-save middleware to set location coordinates
farmSchema.pre('save', function(next) {
  if (this.coordinates) {
    this.location.coordinates = [this.coordinates.longitude, this.coordinates.latitude];
  }
  next();
});

export const Farm = mongoose.model<IFarm>('Farm', farmSchema);
