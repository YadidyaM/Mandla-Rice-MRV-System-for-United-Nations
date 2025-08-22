/**
 * Simple Express Server for Mandla Rice MRV System
 * This is a working version without TypeScript compilation issues
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware added
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://mandlamrv.netlify.app',
    'https://mandla-rice-mrv-377709c13120.herokuapp.com'
  ],
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Mandla Rice MRV System',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'Mandla Rice MRV System API',
    version: 'v1',
    description: 'UN Climate Challenge - Blockchain & AI-powered MRV system for rice methane reduction',
    endpoints: {
      health: '/health',
      auth: {
        register: '/auth/register (demo mode)',
        login: '/auth/login (demo mode - use any email + password123)',
        logout: '/auth/logout',
        refresh: '/auth/refresh',
        me: '/auth/me',
        profile: '/auth/profile (PUT)',
        changePassword: '/auth/change-password (PUT)'
      },
      farms: {
        list: '/farms',
        create: '/farms (POST)',
        details: '/farms/:id',
        mrv: '/farms/:id/mrv (POST)',
        mrvHistory: '/farms/:id/mrv (GET)'
      },
      carbonCredits: {
        calculate: '/carbon-credits/calculate'
      },
      marketplace: {
        credits: '/marketplace/credits',
        stats: '/marketplace/stats',
        transactions: '/marketplace/transactions',
        purchase: '/marketplace/purchase (POST)'
      },
      notifications: {
        list: '/notifications',
        preferences: '/notifications/preferences',
        stats: '/notifications/stats',
        read: '/notifications/:id/read (PUT)',
        markAllRead: '/notifications/mark-all-read (PUT)',
        pin: '/notifications/:id/pin (PUT)',
        archive: '/notifications/:id/archive (PUT)'
      }
    },
    note: 'Demo mode: Full farm management and MRV system working!'
  });
});

// Simple demo user for testing
const demoUser = {
  id: '1',
  email: 'admin@example.com',
  phone: '9876543210',
  profile: {
    firstName: 'Admin',
    lastName: 'User',
    village: 'Mandla',
    block: 'Mandla',
    district: 'Mandla',
    state: 'Madhya Pradesh'
  },
  role: 'ADMIN'
};

// Simple registration endpoint (demo only - just returns success)
app.post('/auth/register', (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, mobile } = req.body;

    // Support both old and new field names
    const phone = phoneNumber || mobile;
    const firstNameValue = firstName || 'User';
    const lastNameValue = lastName || '';

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields',
          details: 'Email and password are required'
        }
      });
    }

    // In demo mode, just return success for any valid data
    const demoUserResponse = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      phone: phone || '1234567890',
      profile: {
        firstName: firstNameValue,
        lastName: lastNameValue,
        village: 'Default Village',
        block: 'Default Block',
        district: 'Mandla',
        state: 'Madhya Pradesh'
      },
      role: 'FARMER',
      isActive: true,
      createdAt: new Date()
    };

    console.log(`Demo user registered: ${demoUserResponse.email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully (demo mode)',
      data: { 
        user: demoUserResponse,
        tokens: {
          accessToken: `demo_token_${Date.now()}`,
          refreshToken: `demo_refresh_${Date.now()}`
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Registration failed',
        details: error.message
      }
    });
  }
});

// Simple login endpoint (demo only)
app.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required'
        }
      });
    }

    // Simple demo login (accepts any email with password 'password123')
    if (password === 'password123') {
      const token = `demo_token_${Date.now()}`;
      
      res.json({
        success: true,
        message: 'Login successful (demo mode)',
        data: {
          user: demoUser,
          tokens: {
            accessToken: token,
            refreshToken: `demo_refresh_${Date.now()}`
          }
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials (use any email + password123)',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed',
        details: error.message
      }
    });
  }
});

// Add missing auth endpoints that frontend expects
app.post('/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Refresh token is required'
      }
    });
  }

  // In demo mode, generate new tokens
  const newTokens = {
    accessToken: `demo_token_${Date.now()}`,
    refreshToken: `demo_refresh_${Date.now()}`
  };

  res.json({
    success: true,
    data: {
      tokens: newTokens
    }
  });
});

app.get('/auth/me', (req, res) => {
  // In demo mode, return demo user
  res.json({
    success: true,
    data: demoUser
  });
});

app.put('/auth/profile', (req, res) => {
  const { profile } = req.body;
  
  if (!profile) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Profile data is required'
      }
    });
  }

  // In demo mode, return updated user
  const updatedUser = { ...demoUser, profile };
  
  res.json({
    success: true,
    data: updatedUser
  });
});

// Add missing change password endpoint
app.put('/auth/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Current password and new password are required'
      }
    });
  }

  // In demo mode, accept any current password
  if (currentPassword === 'password123') {
    res.json({
      success: true,
      message: 'Password changed successfully (demo mode)'
    });
  } else {
    res.status(400).json({
      success: false,
      error: {
        message: 'Current password is incorrect (use password123 in demo mode)'
      }
    });
  }
});

// Demo farm data storage
const farms = [
  {
    id: '1',
    name: 'Farm A - North Field',
    village: 'Mandla',
    block: 'Mandla',
    district: 'Mandla',
    state: 'Madhya Pradesh',
    area: 2.5,
    irrigationType: 'AWD',
    lastMRV: '2024-01-15',
    status: 'Active',
    coordinates: { lat: 22.5989, lng: 80.3711 },
    soilType: 'Clay Loam',
    waterSource: 'Canal',
    farmerId: '1',
    createdAt: '2024-01-01T00:00:00.000Z',
    isActive: true
  },
  {
    id: '2',
    name: 'Farm B - South Field',
    village: 'Bijadandi',
    block: 'Bijadandi',
    district: 'Mandla',
    state: 'Madhya Pradesh',
    area: 1.8,
    irrigationType: 'SRI',
    lastMRV: '2024-01-10',
    status: 'Active',
    coordinates: { lat: 22.5989, lng: 80.3711 },
    soilType: 'Sandy Loam',
    waterSource: 'Well',
    farmerId: '1',
    createdAt: '2024-01-01T00:00:00.000Z',
    isActive: true
  }
];

// Farm management endpoints
app.get('/farms', (req, res) => {
  try {
    res.json({
      success: true,
      data: farms
    });
  } catch (error) {
    console.error('Fetch farms error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch farms',
        details: error.message
      }
    });
  }
});

app.post('/farms', (req, res) => {
  try {
    const { name, area, village, block, district, state, surveyNumber, soilType, elevation, irrigationType, waterSource, coordinates } = req.body;

    // Validate required fields
    if (!name || !area || !village || !block || !irrigationType) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields',
          details: 'Name, area, village, block, and irrigation type are required'
        }
      });
    }

    // Validate area is a valid number (accept both string and number)
    const areaValue = typeof area === 'string' ? parseFloat(area) : area;
    if (isNaN(areaValue) || areaValue <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid area value',
          details: 'Area must be a positive number'
        }
      });
    }

    // Create new farm
    const newFarm = {
      id: (farms.length + 1).toString(),
      name,
      area: areaValue,
      village,
      block,
      district: district || 'Mandla',
      state: state || 'Madhya Pradesh',
      surveyNumber: surveyNumber || '',
      soilType: soilType || 'Unknown',
      elevation: elevation ? (typeof elevation === 'string' ? parseFloat(elevation) : elevation) : 0,
      irrigationType,
      waterSource: waterSource || 'TUBE_WELL',
      coordinates: coordinates || { lat: 22.5989, lng: 80.3711 },
      lastMRV: new Date().toISOString().split('T')[0],
      status: 'Active',
      farmerId: '1',
      createdAt: new Date().toISOString(),
      isActive: true
    };

    farms.push(newFarm);

    console.log(`New farm created: ${newFarm.name} with area: ${newFarm.area} hectares`);

    res.status(201).json({
      success: true,
      message: 'Farm created successfully',
      data: newFarm
    });

  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create farm',
        details: error.message
      }
    });
  }
});

app.get('/farms/:id', (req, res) => {
  try {
    const farmId = req.params.id;
    const farm = farms.find(f => f.id === farmId);

    if (!farm) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Farm not found',
          code: 'FARM_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: farm
    });

  } catch (error) {
    console.error('Fetch farm error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch farm',
        details: error.message
      }
    });
  }
});

// Carbon credits calculation endpoint
app.get('/carbon-credits/calculate', (req, res) => {
  try {
    // Calculate total emissions reduction across all farms
    let totalBaselineEmissions = 0;
    let totalProjectEmissions = 0;
    let totalEmissionReduction = 0;
    let totalCO2eReduction = 0;

    farms.forEach(farm => {
      const baseline = farm.area * 1.3;
      let project = baseline;
      
      if (farm.irrigationType === 'AWD') {
        project = baseline * 0.52;
      } else if (farm.irrigationType === 'SRI') {
        project = baseline * 0.68;
      }

      totalBaselineEmissions += baseline;
      totalProjectEmissions += project;
      totalEmissionReduction += (baseline - project);
      totalCO2eReduction += (baseline - project) * 25 / 1000;
    });

    const carbonCredits = {
      totalFarms: farms.length,
      totalArea: farms.reduce((sum, farm) => sum + farm.area, 0),
      totalBaselineEmissions: parseFloat(totalBaselineEmissions.toFixed(2)),
      totalProjectEmissions: parseFloat(totalProjectEmissions.toFixed(2)),
      totalEmissionReduction: parseFloat(totalEmissionReduction.toFixed(2)),
      totalCO2eReduction: parseFloat(totalCO2eReduction.toFixed(3)),
      methodology: 'IPCC 2019 Refinement Tier 2',
      calculationDate: new Date().toISOString()
    };

    res.json({
      success: true,
      data: carbonCredits
    });

  } catch (error) {
    console.error('Calculate carbon credits error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to calculate carbon credits',
        details: error.message
      }
    });
  }
});

// MRV (Measurement, Reporting, and Verification) endpoints
app.post('/farms/:id/mrv', (req, res) => {
  try {
    const farmId = req.params.id;
    const { farmingMethod, season, crop, area, irrigationCycles, organicInputs } = req.body;

    const farm = farms.find(f => f.id === farmId);
    if (!farm) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Farm not found',
          code: 'FARM_NOT_FOUND'
        }
      });
    }

    // Calculate emissions reduction (simplified IPCC methodology)
    const baselineEmissions = area * 1.3; // kg CH4/ha/season (conventional flooding)
    let projectEmissions = baselineEmissions;
    
    if (farmingMethod === 'AWD') {
      projectEmissions = baselineEmissions * 0.52; // 48% reduction
    } else if (farmingMethod === 'SRI') {
      projectEmissions = baselineEmissions * 0.68; // 32% reduction
    }

    const emissionReduction = baselineEmissions - projectEmissions;
    const co2eReduction = emissionReduction * 25 / 1000; // Convert to tCO2e (GWP = 25)

    // Create MRV report
    const mrvReport = {
      id: `MRV_${farmId}_${Date.now()}`,
      farmId,
      farmName: farm.name,
      season: season || 'Kharif 2024',
      crop: crop || 'Rice',
      farmingMethod,
      area,
      baselineEmissions: parseFloat(baselineEmissions.toFixed(2)),
      projectEmissions: parseFloat(projectEmissions.toFixed(2)),
      emissionReduction: parseFloat(emissionReduction.toFixed(2)),
      co2eReduction: parseFloat(co2eReduction.toFixed(3)),
      methodology: 'IPCC 2019 Refinement Tier 2',
      status: 'PROCESSED',
      processedAt: new Date().toISOString(),
      irrigationCycles: irrigationCycles || [],
      organicInputs: organicInputs || []
    };

    // Update farm's last MRV date
    farm.lastMRV = new Date().toISOString().split('T')[0];

    console.log(`MRV processed for farm ${farm.name}: ${co2eReduction} tCO2e reduction`);

    res.json({
      success: true,
      message: 'MRV processed successfully',
      data: mrvReport
    });

  } catch (error) {
    console.error('Process MRV error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to process MRV',
        details: error.message
      }
    });
  }
});

app.get('/farms/:id/mrv', (req, res) => {
  try {
    const farmId = req.params.id;
    const farm = farms.find(f => f.id === farmId);

    if (!farm) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Farm not found',
          code: 'FARM_NOT_FOUND'
        }
      });
    }

    // Return mock MRV history (in real app, this would come from database)
    const mrvHistory = [
      {
        id: `MRV_${farmId}_1`,
        farmId,
        farmName: farm.name,
        season: 'Kharif 2024',
        crop: 'Rice',
        farmingMethod: farm.irrigationType === 'AWD' ? 'AWD' : 'SRI',
        area: farm.area,
        baselineEmissions: parseFloat((farm.area * 1.3).toFixed(2)),
        projectEmissions: parseFloat((farm.area * (farm.irrigationType === 'AWD' ? 0.52 : 0.68) * 1.3).toFixed(2)),
        emissionReduction: parseFloat((farm.area * 1.3 * (farm.irrigationType === 'AWD' ? 0.48 : 0.32)).toFixed(2)),
        co2eReduction: parseFloat((farm.area * 1.3 * (farm.irrigationType === 'AWD' ? 0.48 : 0.32) * 25 / 1000).toFixed(3)),
        methodology: 'IPCC 2019 Refinement Tier 2',
        status: 'PROCESSED',
        processedAt: farm.lastMRV
      }
    ];

    res.json({
      success: true,
      data: mrvHistory
    });

  } catch (error) {
    console.error('Fetch MRV history error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch MRV history',
        details: error.message
      }
    });
  }
});

// Marketplace routes
app.get('/marketplace/credits', (req, res) => {
  try {
    // Mock carbon credits data
    const credits = [
      {
        id: 'credit_1',
        title: 'Sustainable Rice Farming Project - AWD',
        description: 'Carbon credits from Alternate Wetting and Drying rice cultivation in Mandla district',
        quantity: 100,
        availableQuantity: 75,
        pricePerCredit: 500,
        totalPrice: 50000,
        currency: 'INR',
        status: 'LISTED',
        verificationLevel: 'STANDARD',
        farmId: 'farm_1',
        farmName: 'Green Valley Farm',
        farmerId: 'farmer_1',
        farmerName: 'Rajesh Gond',
        location: 'Mandla, Madhya Pradesh',
        projectType: 'RICE_FARMING',
        methodology: 'IPCC 2019 Refinement Tier 2',
        vintage: 2024,
        certification: ['VCS', 'Gold Standard'],
        images: ['/images/farm1.jpg'],
        documents: ['/documents/mrv_report_1.pdf'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'credit_2',
        title: 'Forest Conservation Project',
        description: 'Carbon sequestration through community forest management',
        quantity: 200,
        availableQuantity: 150,
        pricePerCredit: 750,
        totalPrice: 150000,
        currency: 'INR',
        status: 'LISTED',
        verificationLevel: 'PREMIUM',
        farmId: 'farm_2',
        farmName: 'Community Forest Project',
        farmerId: 'farmer_2',
        farmerName: 'Priya Patel',
        location: 'Mandla, Madhya Pradesh',
        projectType: 'FORESTRY',
        methodology: 'REDD+ Methodology',
        vintage: 2024,
        certification: ['VCS', 'Gold Standard'],
        images: ['/images/forest1.jpg'],
        documents: ['/documents/forest_report_1.pdf'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      message: 'Carbon credits retrieved successfully',
      data: credits
    });
  } catch (error) {
    console.error('Error fetching carbon credits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch carbon credits',
      error: error.message
    });
  }
});

app.get('/marketplace/stats', (req, res) => {
  try {
    const stats = {
      totalCredits: 300,
      totalValue: 200000,
      averagePrice: 667,
      totalListings: 2,
      activeListings: 2,
      completedTransactions: 0,
      totalFarmers: 2,
      totalBuyers: 0,
      priceTrend: 'STABLE',
      volumeTrend: 'UP',
      topProjectTypes: [
        { type: 'RICE_FARMING', count: 1, value: 50000 },
        { type: 'FORESTRY', count: 1, value: 150000 }
      ],
      topLocations: [
        { location: 'Mandla, Madhya Pradesh', count: 2, value: 200000 }
      ]
    };

    res.json({
      success: true,
      message: 'Marketplace statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marketplace statistics',
      error: error.message
    });
  }
});

app.get('/marketplace/transactions', (req, res) => {
  try {
    const transactions = [
      {
        id: 'tx_1',
        creditId: 'credit_1',
        creditTitle: 'Sustainable Rice Farming Project - AWD',
        sellerId: 'farmer_1',
        sellerName: 'Rajesh Gond',
        buyerId: 'buyer_1',
        buyerName: 'EcoCorp Ltd',
        quantity: 25,
        pricePerCredit: 500,
        totalAmount: 12500,
        currency: 'INR',
        status: 'COMPLETED',
        paymentMethod: 'ESCROW',
        escrowId: 'ESCROW_1234567890',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

// Add missing marketplace purchase endpoint
app.post('/marketplace/purchase', (req, res) => {
  try {
    const { creditId, quantity, buyerId, buyerName, paymentMethod } = req.body;
    
    if (!creditId || !quantity || !buyerId || !buyerName) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields',
          details: 'Credit ID, quantity, buyer ID, and buyer name are required'
        }
      });
    }

    // In demo mode, create a mock transaction
    const transaction = {
      id: `tx_${Date.now()}`,
      creditId,
      buyerId,
      buyerName,
      quantity: parseInt(quantity),
      status: 'PENDING',
      paymentMethod: paymentMethod || 'ESCROW',
      escrowId: `ESCROW_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Purchase initiated successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to process purchase',
        details: error.message
      }
    });
  }
});

// Notification endpoints
app.get('/notifications', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        type: 'SUCCESS',
        title: 'Farm Registration Successful',
        message: 'Your farm "North Field" has been successfully registered and is now under MRV monitoring.',
        priority: 'MEDIUM',
        category: 'FARM',
        isRead: false,
        isArchived: false,
        isPinned: false,
        userId: 'user_1',
        metadata: { farmName: 'North Field' },
        deliveryMethods: ['IN_APP', 'EMAIL'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'INFO',
        title: 'MRV Report Processing',
        message: 'Your MRV report for Farm A is being processed. Expected completion: 2-3 business days.',
        priority: 'LOW',
        category: 'MRV',
        isRead: true,
        isArchived: false,
        isPinned: false,
        userId: 'user_1',
        metadata: { farmName: 'Farm A', reportId: 'MRV_001' },
        deliveryMethods: ['IN_APP'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        type: 'WARNING',
        title: 'Weather Alert',
        message: 'Heavy rainfall expected in your region. Consider adjusting irrigation schedules.',
        priority: 'HIGH',
        category: 'WEATHER',
        isRead: false,
        isArchived: false,
        isPinned: true,
        userId: 'user_1',
        metadata: { weatherCondition: 'Heavy Rain', location: 'Mandla' },
        deliveryMethods: ['IN_APP', 'SMS', 'WHATSAPP'],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  });
});

app.get('/notifications/preferences', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'pref_1',
      userId: 'user_1',
      inApp: true,
      email: true,
      sms: false,
      whatsapp: true,
      categories: {
        SYSTEM: true,
        FARM: true,
        MRV: true,
        CARBON: true,
        WEATHER: true,
        MARKET: true,
        SECURITY: true
      },
      priorities: {
        LOW: true,
        MEDIUM: true,
        HIGH: true,
        URGENT: true
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '07:00'
      },
      language: 'en',
      timezone: 'Asia/Kolkata'
    }
  });
});

app.get('/notifications/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      total: 3,
      unread: 2,
      archived: 0,
      pinned: 1,
      byCategory: {
        FARM: 1,
        MRV: 1,
        WEATHER: 1
      },
      byPriority: {
        LOW: 1,
        MEDIUM: 1,
        HIGH: 1
      },
      byType: {
        SUCCESS: 1,
        INFO: 1,
        WARNING: 1
      }
    }
  });
});

app.put('/notifications/:id/read', (req, res) => {
  res.json({ success: true, message: 'Notification marked as read' });
});

app.put('/notifications/mark-all-read', (req, res) => {
  res.json({ success: true, message: 'All notifications marked as read' });
});

app.put('/notifications/:id/pin', (req, res) => {
  res.json({ success: true, message: 'Notification pin status updated' });
});

app.put('/notifications/:id/archive', (req, res) => {
  res.json({ success: true, message: 'Notification archived' });
});

app.put('/notifications/preferences', (req, res) => {
  res.json({ success: true, message: 'Preferences updated successfully' });
});

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: ['/health', '/api', '/api/v1/*']
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Mandla Rice MRV System Backend Started Successfully!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 API URL: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/health

🌾 UN Climate Challenge 2024
🎯 Goal: Empowering Mandla farmers with blockchain-verified carbon credits
💚 Impact: Reducing methane emissions from rice farming in India

✅ Integrations Ready:
   • Farm Registration & Management
   • MRV Calculations
   • Carbon Credits
   • Marketplace
   • Notifications
   • Authentication
  `);
});

export default app;
