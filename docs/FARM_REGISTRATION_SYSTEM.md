# Farm Registration System

## Overview

The Farm Registration System is a comprehensive solution for farmers to register their farms in the Mandla Rice MRV System. It includes an interactive map interface for drawing farm boundaries, form validation, and database integration.

## Features

### 🗺️ Interactive Map Integration
- **Leaflet Map**: OpenStreetMap-based interactive map
- **Boundary Drawing**: Click to draw farm boundaries with visual feedback
- **Area Calculation**: Automatic area calculation in hectares
- **GPS Coordinates**: Precise location tracking with GeoJSON format

### 📝 Comprehensive Form
- **Farm Details**: Name, area, village, block, district, state
- **Technical Information**: Survey number, soil type, elevation
- **Irrigation Details**: Irrigation type and water source
- **Form Validation**: Zod schema validation with error handling

### 🔒 Security & Validation
- **Authentication**: User authentication middleware
- **Data Validation**: Server-side validation with Joi schemas
- **Input Sanitization**: Proper data type handling and sanitization
- **Access Control**: Farm ownership verification

### 💾 Database Integration
- **Prisma ORM**: Type-safe database operations
- **GeoJSON Support**: Native support for geographic data
- **Relationships**: Proper linking with users, seasons, and MRV reports
- **Soft Delete**: Safe deletion with data preservation

## Technical Architecture

### Frontend Components

#### AddFarmPage.tsx
```typescript
// Main farm registration page with form and map
export default function AddFarmPage() {
  // Form handling with react-hook-form and zod validation
  // Interactive map with Leaflet integration
  // Real-time area calculation
  // Form submission with API integration
}
```

#### Map Integration
```typescript
// Leaflet map with custom click handlers
<MapContainer center={mapCenter} zoom={12}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <MapClickHandler onMapClick={handleMapClick} />
  <Polygon positions={farmBoundary} />
  <Marker positions={boundaryPoints} />
</MapContainer>
```

### Backend Services

#### FarmController
```typescript
export class FarmController {
  async createFarm(req: Request, res: Response): Promise<void>
  async getFarms(req: Request, res: Response): Promise<void>
  async getFarm(req: Request, res: Response): Promise<void>
  async updateFarm(req: Request, res: Response): Promise<void>
  async deleteFarm(req: Request, res: Response): Promise<void>
  async getFarmSeasons(req: Request, res: Response): Promise<void>
}
```

#### Authentication Middleware
```typescript
export const authMiddleware = async (req: Request, res: Response, next: NextFunction)
export const requireAuth = (req: Request, res: Response, next: NextFunction)
```

## API Endpoints

### POST /farms
Create a new farm
```json
{
  "name": "Rice Farm",
  "area": 2.5,
  "village": "Mandla",
  "block": "Mandla",
  "district": "Mandla",
  "state": "Madhya Pradesh",
  "coordinates": {
    "type": "Polygon",
    "coordinates": [[[lng, lat], [lng, lat], ...]]
  }
}
```

### GET /farms
Get all farms for authenticated user

### GET /farms/:id
Get specific farm details

### PUT /farms/:id
Update farm information

### DELETE /farms/:id
Soft delete farm (sets isActive to false)

### GET /farms/:id/seasons
Get farming seasons for a specific farm

## Data Models

### Farm Schema
```typescript
interface Farm {
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
}
```

### Validation Schema
```typescript
export const farmSchema = z.object({
  name: z.string().min(2).max(100),
  area: z.number().positive().max(100),
  coordinates: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.array(z.number())))
  }),
  // ... other fields
});
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Prisma CLI

### Frontend Dependencies
```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "react-hook-form": "^7.52.2",
  "zod": "^3.23.8",
  "@hookform/resolvers": "^3.9.0"
}
```

### Backend Dependencies
```json
{
  "express": "^4.18.0",
  "prisma": "^5.0.0",
  "joi": "^17.9.0"
}
```

### Setup Steps
1. Install dependencies: `npm install`
2. Set up environment variables
3. Run database migrations: `npx prisma migrate dev`
4. Start backend server: `npm run dev`
5. Start frontend: `npm run dev`

## Testing

### Manual Testing
1. Navigate to `/farms/add` in the frontend
2. Fill out the farm registration form
3. Draw farm boundary on the map
4. Submit the form
5. Verify farm appears in the farms list

### Automated Testing
```bash
# Run the test script
node test-farm-registration.js

# Expected output:
# 🧪 Testing Farm Registration System...
# ✅ Farm created successfully
# ✅ Farms retrieved successfully
# ✅ Farm details retrieved successfully
# 🎉 All tests passed!
```

## Usage Examples

### Drawing Farm Boundary
1. **Click on Map**: Click at least 3 points to form a polygon
2. **Visual Feedback**: See boundary lines and markers
3. **Area Calculation**: Click "Calculate Area" to get hectares
4. **Clear Boundary**: Use "Clear" button to start over

### Form Submission
1. **Required Fields**: Name, area, village, block
2. **Validation**: Real-time form validation with error messages
3. **Submission**: Form submits only when valid and boundary is drawn
4. **Success**: Toast notification confirms farm registration

## Error Handling

### Frontend Errors
- **Form Validation**: Real-time validation with clear error messages
- **Map Errors**: Boundary validation (minimum 3 points)
- **API Errors**: Toast notifications for server errors
- **Network Errors**: Graceful fallback and retry mechanisms

### Backend Errors
- **Validation Errors**: Joi schema validation with detailed messages
- **Database Errors**: Prisma error handling with logging
- **Authentication Errors**: Proper HTTP status codes and messages
- **Business Logic Errors**: Custom error messages for domain rules

## Security Considerations

### Data Validation
- **Input Sanitization**: All inputs validated and sanitized
- **SQL Injection**: Prisma ORM prevents SQL injection
- **XSS Protection**: React handles XSS protection
- **CSRF Protection**: Token-based CSRF protection

### Access Control
- **Authentication**: User must be authenticated
- **Authorization**: Users can only access their own farms
- **Data Isolation**: Proper user data separation
- **Audit Logging**: All operations logged for audit

## Performance Optimizations

### Frontend
- **Lazy Loading**: Map components loaded on demand
- **Debounced Input**: Form validation debounced for performance
- **Memoization**: React.memo for expensive components
- **Bundle Splitting**: Code splitting for better load times

### Backend
- **Database Indexing**: Proper indexes on frequently queried fields
- **Connection Pooling**: Database connection pooling
- **Caching**: Redis caching for frequently accessed data
- **Query Optimization**: Optimized Prisma queries with includes

## Future Enhancements

### Planned Features
- **Satellite Imagery**: Integration with satellite data
- **Mobile App**: React Native mobile application
- **Offline Support**: PWA with offline capabilities
- **Multi-language**: Hindi and Gondi language support

### Technical Improvements
- **Real-time Updates**: WebSocket integration
- **File Uploads**: Farm photo and document uploads
- **Advanced Analytics**: Farm performance metrics
- **Blockchain Integration**: Carbon credit tokenization

## Troubleshooting

### Common Issues

#### Map Not Loading
- Check internet connection
- Verify Leaflet CSS is imported
- Check browser console for errors

#### Form Submission Fails
- Verify all required fields are filled
- Ensure farm boundary is drawn (3+ points)
- Check backend server is running
- Verify database connection

#### Area Calculation Issues
- Ensure boundary is closed (first and last point same)
- Check coordinate format (longitude, latitude)
- Verify minimum 3 points are selected

### Debug Mode
```typescript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) {
  console.log('Farm boundary:', farmBoundary);
  console.log('Form data:', formData);
}
```

## Contributing

### Development Workflow
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and merge

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Jest**: Unit and integration tests

## License

This project is part of the UN Climate Challenge 2024 - Mandla Rice MRV System.

---

## Quick Start

```bash
# Clone repository
git clone <repository-url>
cd fl

# Install dependencies
npm install

# Set up environment
cp backend/env.sample backend/.env
cp frontend/env.sample frontend/.env

# Start development servers
cd backend && npm run dev
cd frontend && npm run dev

# Test the system
cd backend && node test-farm-registration.js
```

The Farm Registration System is now ready for use! 🚜✨
