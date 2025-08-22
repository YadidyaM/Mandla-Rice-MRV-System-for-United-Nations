# Farm Details & Analytics System

## Overview

The Farm Details & Analytics System provides farmers with a comprehensive view of their registered farms, including interactive maps, satellite imagery, MRV history, performance analytics, and carbon credit potential calculations. This system transforms raw farm data into actionable insights for better farming decisions.

## Features

### 🗺️ Interactive Farm Map
- **Boundary Visualization**: Display farm boundaries with precise GPS coordinates
- **Interactive Popups**: Click on farm areas for detailed information
- **Zoom & Pan**: Navigate around the farm with smooth map controls
- **Coordinate Validation**: Ensures farm boundaries are properly closed polygons

### 📊 Comprehensive Analytics Dashboard
- **Performance Metrics**: Total area, farming seasons, MRV reports, satellite images
- **Yield Trends**: Visual representation of crop yields over seasons
- **Carbon Credit Potential**: Calculate potential carbon credits and monetary value
- **Emission Reduction**: Assess emission reduction potential based on farming methods

### 📡 Satellite Data Integration
- **Flood Detection**: Monitor flood status using satellite imagery
- **Temporal Analysis**: Track changes over time with historical data
- **Status Indicators**: Visual status indicators for different flood conditions
- **Data Timeline**: Chronological view of satellite monitoring data

### 📋 MRV Reports Management
- **Report Status**: Track MRV report processing and verification status
- **Verification Workflow**: Monitor approval and rejection processes
- **Historical Data**: Access complete MRV report history
- **Status Tracking**: Real-time status updates with visual indicators

### 📈 Performance Analytics
- **Seasonal Analysis**: Compare performance across different farming seasons
- **Yield Optimization**: Identify trends and patterns in crop yields
- **Resource Utilization**: Track farming methods and their effectiveness
- **Financial Projections**: Estimate potential carbon credit earnings

## Technical Architecture

### Frontend Components

#### FarmDetailsPage.tsx
```typescript
export default function FarmDetailsPage() {
  // Tab-based navigation system
  // Interactive map with Leaflet integration
  // Real-time data fetching and display
  // Responsive analytics dashboard
  // Status management and visual indicators
}
```

#### Tab Navigation System
```typescript
const tabs = [
  { id: 'overview', label: 'Overview', icon: EyeIcon },
  { id: 'satellite', label: 'Satellite Data', icon: CameraIcon },
  { id: 'mrv', label: 'MRV Reports', icon: DocumentTextIcon },
  { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
];
```

#### Interactive Map Integration
```typescript
<MapContainer center={farmCenter} zoom={14}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Polygon positions={farmBoundary} pathOptions={polygonStyle}>
    <Popup>
      <FarmInfoPopup farm={farm} />
    </Popup>
  </Polygon>
</MapContainer>
```

### Backend Services

#### Enhanced FarmController
```typescript
export class FarmController {
  async getFarm(req: Request, res: Response): Promise<void> {
    // Fetch farm with all related data
    // Include seasons, MRV reports, satellite data
    // Calculate performance metrics
    // Validate data integrity
  }
}
```

#### Data Relationships
```typescript
interface FarmDetails {
  id: string;
  name: string;
  area: number;
  coordinates: GeoJSONPolygon;
  farmer?: User;
  seasons?: FarmingSeason[];
  mrvReports?: MRVReport[];
  satelliteData?: SatelliteData[];
}
```

## Data Models

### Core Entities

#### Farm Details
```typescript
interface FarmDetails {
  id: string;
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
  irrigationType: IrrigationType;
  waterSource?: WaterSource;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### Farming Seasons
```typescript
interface FarmingSeason {
  id: string;
  season: string;
  year: number;
  crop: string;
  variety?: string;
  sowingDate?: string;
  transplantDate?: string;
  harvestDate?: string;
  farmingMethod: string;
  expectedYield?: number;
  actualYield?: number;
  createdAt: string;
}
```

#### MRV Reports
```typescript
interface MRVReport {
  id: string;
  seasonId: string;
  status: string;
  verificationStatus: string;
  createdAt: string;
}
```

#### Satellite Data
```typescript
interface SatelliteData {
  id: string;
  date: string;
  satellite: string;
  floodStatus: string;
  createdAt: string;
}
```

## Analytics Calculations

### Carbon Credit Potential

#### Basic Calculation
```typescript
const potentialCredits = farm.area * 2.5; // tCO2e per hectare
const potentialValue = potentialCredits * 1500; // ₹1500 per credit
```

#### Emission Reduction Assessment
```typescript
const emissionReduction = farm.irrigationType === 'AWD' ? 'High' : 'Medium';
// AWD (Alternate Wetting & Drying) provides higher emission reduction
```

#### Yield Performance Analysis
```typescript
const yieldPercentage = (season.actualYield / 5000) * 100; // Based on 5000 kg/ha baseline
const yieldBarWidth = Math.min(yieldPercentage, 100); // Cap at 100%
```

### Performance Metrics

#### Farm Statistics
```typescript
const farmStats = {
  totalArea: farm.area,
  totalSeasons: farm.seasons?.length || 0,
  totalMRVReports: farm.mrvReports?.length || 0,
  totalSatelliteImages: farm.satelliteData?.length || 0,
  registrationDate: farm.createdAt,
  lastUpdated: farm.updatedAt
};
```

#### Status Indicators
```typescript
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'verified':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
```

## User Interface

### Tab-Based Navigation

#### Overview Tab
- **Farm Information Cards**: Key metrics at a glance
- **Interactive Map**: Farm location and boundaries
- **Farm Details**: Comprehensive farm information
- **Recent Seasons**: Latest farming activities

#### Satellite Data Tab
- **Monitoring Timeline**: Chronological satellite data
- **Flood Status**: Visual indicators for different conditions
- **Data Sources**: Satellite information and capture dates
- **Status Overview**: Summary of monitoring results

#### MRV Reports Tab
- **Report List**: All MRV reports with status
- **Verification Status**: Approval and rejection tracking
- **Processing Timeline**: Report creation and update dates
- **Status Management**: Visual status indicators

#### Analytics Tab
- **Yield Trends**: Performance over time
- **Farm Performance**: Key performance indicators
- **Carbon Credit Potential**: Financial projections
- **Emission Reduction**: Environmental impact assessment

### Responsive Design

#### Mobile Optimization
```css
/* Responsive grid layouts */
.grid-cols-1 md:grid-cols-2 lg:grid-cols-4

/* Mobile-friendly navigation */
.flex space-x-8 overflow-x-auto

/* Touch-friendly buttons */
.min-h-[44px] /* iOS touch target minimum */
```

#### Accessibility Features
```typescript
// Screen reader support
aria-label="Farm boundary map"
aria-describedby="farm-info"

// Keyboard navigation
tabIndex={0}
onKeyDown={handleKeyDown}

// Color contrast compliance
text-green-800 bg-green-100 /* WCAG AA compliant */
```

## API Integration

### Data Fetching

#### Farm Details Endpoint
```typescript
const fetchFarmDetails = async (id: string) => {
  const response = await api.get(`/farms/${id}`);
  return response.data.data;
};
```

#### Error Handling
```typescript
try {
  const farm = await fetchFarmDetails(farmId);
  setFarm(farm);
} catch (error: any) {
  toast.error('Failed to fetch farm details');
  console.error('Error fetching farm details:', error);
}
```

### Real-Time Updates

#### Loading States
```typescript
const [loading, setLoading] = useState(true);
const [farm, setFarm] = useState<FarmDetails | null>(null);

// Show loading spinner while fetching data
if (loading) {
  return <LoadingSpinner />;
}
```

#### Data Refresh
```typescript
useEffect(() => {
  if (farmId) {
    fetchFarmDetails(farmId);
  }
}, [farmId]); // Re-fetch when farm ID changes
```

## Performance Optimizations

### Frontend Optimizations

#### Lazy Loading
```typescript
// Load map components only when needed
const MapComponent = lazy(() => import('./MapComponent'));

// Conditional rendering based on active tab
{activeTab === 'satellite' && <SatelliteDataTab />}
```

#### Memoization
```typescript
// Memoize expensive calculations
const farmCenter = useMemo(() => 
  calculateFarmCenter(farm.coordinates), 
  [farm.coordinates]
);

// Memoize status calculations
const statusColor = useMemo(() => 
  getStatusColor(status), 
  [status]
);
```

#### Efficient Rendering
```typescript
// Use React.memo for static components
const FarmCard = React.memo(({ farm }) => (
  <div className="farm-card">{/* Farm information */}</div>
));

// Conditional rendering to avoid unnecessary DOM updates
{showDetails && <DetailedView farm={farm} />}
```

### Backend Optimizations

#### Database Queries
```typescript
// Optimized Prisma queries with includes
const farm = await prisma.farm.findUnique({
  where: { id },
  include: {
    farmer: { select: { id: true, email: true, profile: true } },
    seasons: { orderBy: { createdAt: 'desc' }, take: 5 },
    mrvReports: { orderBy: { createdAt: 'desc' } },
    satelliteData: { orderBy: { date: 'desc' }, take: 10 }
  }
});
```

#### Caching Strategy
```typescript
// Redis caching for frequently accessed data
const cacheKey = `farm:${farmId}`;
let farm = await redis.get(cacheKey);

if (!farm) {
  farm = await fetchFarmFromDatabase(farmId);
  await redis.setex(cacheKey, 3600, JSON.stringify(farm)); // 1 hour TTL
}
```

## Security & Validation

### Data Validation

#### Frontend Validation
```typescript
// Zod schema validation
const farmSchema = z.object({
  name: z.string().min(2).max(100),
  area: z.number().positive().max(100),
  coordinates: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.array(z.number())))
  })
});
```

#### Backend Validation
```typescript
// Joi schema validation
export const farmSchemas = {
  get: Joi.object({
    id: commonSchemas.id.required()
  })
};
```

### Access Control

#### Authentication
```typescript
// Require authentication for all farm operations
router.get('/:id', authMiddleware, requireAuth, farmController.getFarm);
```

#### Authorization
```typescript
// Verify farm ownership
const existingFarm = await prisma.farm.findFirst({
  where: { id, farmerId: userId }
});

if (!existingFarm) {
  return res.status(404).json({
    success: false,
    message: 'Farm not found or access denied'
  });
}
```

## Testing

### Automated Testing

#### Test Coverage
```bash
# Run comprehensive tests
node test-farm-details-analytics.js

# Expected test results:
# ✅ Farm creation with comprehensive data
# ✅ Farm details retrieval with relationships
# ✅ Farm overview and metrics
# ✅ Farm map and coordinates handling
# ✅ Farm performance calculations
# ✅ Carbon credit potential calculation
# ✅ Data validation and type checking
# ✅ Error handling for edge cases
# ✅ Farm update functionality
# ✅ Farm seasons management
# ✅ Soft delete functionality
# ✅ Data integrity and relationships
```

#### Manual Testing
1. Navigate to `/farms/:id` in the frontend
2. Test all four tabs (Overview, Satellite, MRV, Analytics)
3. Verify map interactions and popups
4. Check responsive design on different screen sizes
5. Test error handling with invalid farm IDs

## Error Handling

### Frontend Error Handling

#### Network Errors
```typescript
try {
  const farm = await fetchFarmDetails(farmId);
  setFarm(farm);
} catch (error: any) {
  if (error.response?.status === 404) {
    setError('Farm not found');
  } else if (error.response?.status === 401) {
    navigate('/login');
  } else {
    toast.error('Failed to fetch farm details');
  }
}
```

#### Data Validation Errors
```typescript
// Validate farm data before rendering
if (!farm || !farm.coordinates) {
  return <ErrorComponent message="Invalid farm data" />;
}

// Validate coordinates structure
if (!farm.coordinates.coordinates || farm.coordinates.coordinates.length === 0) {
  return <ErrorComponent message="Invalid farm coordinates" />;
}
```

### Backend Error Handling

#### Database Errors
```typescript
try {
  const farm = await prisma.farm.findUnique({ where: { id } });
  if (!farm) {
    return res.status(404).json({
      success: false,
      message: 'Farm not found'
    });
  }
  res.json({ success: true, data: farm });
} catch (error) {
  logger.error('Database error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
}
```

#### Validation Errors
```typescript
const { error, value } = farmSchemas.get.validate(req.params);
if (error) {
  return res.status(400).json({
    success: false,
    message: 'Validation error',
    errors: error.details
  });
}
```

## Future Enhancements

### Planned Features

#### Advanced Analytics
- **Machine Learning**: Predictive yield analysis
- **Weather Integration**: Climate impact assessment
- **Market Analysis**: Price trend predictions
- **Comparative Analysis**: Benchmark against similar farms

#### Enhanced Visualization
- **3D Maps**: Elevation and terrain visualization
- **Time Series Charts**: Historical trend analysis
- **Heat Maps**: Performance visualization
- **Interactive Dashboards**: Customizable analytics views

#### Real-Time Features
- **Live Monitoring**: Real-time satellite data updates
- **Push Notifications**: Important alerts and updates
- **Collaborative Features**: Share insights with other farmers
- **Mobile App**: Native mobile application

### Technical Improvements

#### Performance
- **GraphQL**: Efficient data fetching
- **WebSockets**: Real-time updates
- **Service Workers**: Offline capabilities
- **CDN Integration**: Faster content delivery

#### Scalability
- **Microservices**: Modular architecture
- **Load Balancing**: Distributed processing
- **Database Sharding**: Horizontal scaling
- **Caching Layers**: Multi-level caching

## Troubleshooting

### Common Issues

#### Map Not Displaying
```typescript
// Check coordinate format
if (farm.coordinates?.coordinates?.[0]) {
  const coords = farm.coordinates.coordinates[0];
  console.log('Coordinates:', coords);
  console.log('Coordinate count:', coords.length);
}
```

#### Data Not Loading
```typescript
// Verify API endpoint
console.log('API URL:', `/farms/${farmId}`);
console.log('Response status:', response.status);
console.log('Response data:', response.data);
```

#### Performance Issues
```typescript
// Check data size
console.log('Farm data size:', JSON.stringify(farm).length);
console.log('Seasons count:', farm.seasons?.length);
console.log('MRV reports count:', farm.mrvReports?.length);
```

### Debug Mode

#### Enable Debug Logging
```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Farm data:', farm);
  console.log('Active tab:', activeTab);
  console.log('Loading state:', loading);
}
```

#### Performance Monitoring
```typescript
// Measure render time
const startTime = performance.now();
// ... component render ...
const endTime = performance.now();
console.log(`Render time: ${endTime - startTime}ms`);
```

## Contributing

### Development Workflow

1. **Feature Branch**: Create feature branch from main
2. **Implementation**: Implement changes with tests
3. **Documentation**: Update relevant documentation
4. **Testing**: Run comprehensive test suite
5. **Code Review**: Submit pull request for review
6. **Merge**: Merge after approval and CI checks

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Jest**: Unit and integration tests
- **Storybook**: Component documentation

## License

This project is part of the UN Climate Challenge 2024 - Mandla Rice MRV System.

---

## Quick Start

```bash
# Navigate to farm details page
# URL: /farms/:farmId

# Test the system
cd backend && node test-farm-details-analytics.js

# Expected features:
# 🗺️ Interactive farm map with boundaries
# 📊 Comprehensive analytics dashboard
# 📡 Satellite data monitoring
# 📋 MRV reports management
# 💰 Carbon credit potential calculation
# 📈 Performance trend analysis
```

The Farm Details & Analytics System is now ready for comprehensive farm management! 🚜📊✨
