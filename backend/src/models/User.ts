/**
 * User Model for MongoDB
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  phone: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    gender?: string;
    village: string;
    block: string;
    district?: string;
    state?: string;
    pincode?: string;
    tribalGroup?: string;
    shgMembership?: string;
    farmingExperience?: number;
    totalLandArea?: number;
    irrigationAccess?: boolean;
    hasSmartphone?: boolean;
    whatsappNumber?: string;
    preferredContact?: string;
  };
  role: 'FARMER' | 'ADMIN' | 'VERIFIER';
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): any;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters long']
  },
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long']
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters long']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: false
    },
    village: {
      type: String,
      required: true,
      trim: true
    },
    block: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      trim: true,
      default: 'Mandla'
    },
    state: {
      type: String,
      trim: true,
      default: 'Madhya Pradesh'
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit PIN code']
    },
    tribalGroup: {
      type: String,
      trim: true
    },
    shgMembership: {
      type: String,
      trim: true
    },
    farmingExperience: {
      type: Number,
      min: [0, 'Farming experience cannot be negative']
    },
    totalLandArea: {
      type: Number,
      min: [0, 'Land area cannot be negative']
    },
    irrigationAccess: {
      type: Boolean,
      default: false
    },
    hasSmartphone: {
      type: Boolean,
      default: false
    },
    whatsappNumber: {
      type: String,
      trim: true
    },
    preferredContact: {
      type: String,
      enum: ['email', 'phone', 'whatsapp'],
      default: 'phone'
    }
  },
  role: {
    type: String,
    enum: ['FARMER', 'ADMIN', 'VERIFIER'],
    default: 'FARMER'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ 'profile.village': 1 });
userSchema.index({ 'profile.block': 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export const User = mongoose.model<IUser>('User', userSchema);
