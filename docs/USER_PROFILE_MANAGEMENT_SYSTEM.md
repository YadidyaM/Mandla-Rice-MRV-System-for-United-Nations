# User Profile Management System

## Overview

The User Profile Management System provides farmers with comprehensive control over their personal information, preferences, and account settings. This system enables users to manage their profiles, update contact information, set language preferences, configure farming-related settings, and maintain account security.

## Features

### 👤 Personal Information Management
- **Profile Editing**: Update personal details including name, date of birth, education
- **Profile Photo**: Upload and manage profile pictures with preview functionality
- **Demographic Information**: Manage tribal group, family size, and land ownership details
- **Farming Experience**: Track years of farming experience and expertise level

### 📞 Contact Information Management
- **Address Details**: Update village, block, district, and state information
- **Contact Preferences**: Choose preferred communication method (WhatsApp, SMS, Call, Email)
- **Read-only Fields**: Email and phone number are protected from unauthorized changes
- **Geographic Data**: Comprehensive location tracking for better service delivery

### 🌍 Language & Preference Management
- **Multi-language Support**: English, Hindi, and Gondi language options
- **Real-time Language Switching**: Instant language changes with visual feedback
- **Cultural Sensitivity**: Support for local languages and tribal communities
- **Accessibility**: Language preferences stored and applied across the system

### 🚜 Farming Preferences Configuration
- **Irrigation Access**: Track availability of irrigation facilities
- **Technology Access**: Monitor smartphone and digital device access
- **Marginalized Status**: Identify and support marginalized farmers
- **Resource Assessment**: Evaluate farming infrastructure and capabilities

### 🔒 Security & Account Management
- **Password Management**: Secure password change with current password verification
- **Account Status**: Monitor account activity and security status
- **Data Protection**: Secure handling of sensitive personal information
- **Access Control**: Role-based access to different profile sections

## Technical Architecture

### Frontend Components

#### ProfilePage.tsx
```typescript
export default function ProfilePage() {
  // Tab-based navigation system
  // Form state management with validation
  // File upload handling for profile photos
  // Real-time language switching
  // Security settings management
}
```

#### Tab Navigation System
```typescript
const tabs = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'contact', label: 'Contact', icon: EnvelopeIcon },
  { id: 'preferences', label: 'Preferences', icon: GlobeAltIcon },
  { id: 'security', label: 'Security', icon: ShieldCheckIcon },
];
```

#### Profile Photo Management
```typescript
const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    setProfilePhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }
};
```

### Backend Services

#### Enhanced AuthController
```typescript
export class AuthController {
  async getProfile(req: Request, res: Response): Promise<void> {
    // Fetch user profile with all related data
    // Include profile details, preferences, and settings
    // Validate user permissions and access rights
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    // Handle profile updates with validation
    // Process file uploads for profile photos
    // Update database with new information
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    // Verify current password
    // Validate new password strength
    // Update password securely
  }
}
```

#### Data Models
```typescript
interface UserProfile {
  id: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  profile: {
    firstName: string;
    lastName: string;
    language: string;
    village: string;
    block: string;
    district: string;
    state: string;
    tribalGroup?: string;
    isMarginalised: boolean;
    irrigationAccess: boolean;
    hasSmartphone: boolean;
    preferredContact: string;
    profilePhoto?: string;
    dateOfBirth?: string;
    education?: string;
    farmingExperience?: number;
    familySize?: number;
    landOwnership?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

## Data Models

### Core Entities

#### User Profile
```typescript
interface UserProfile {
  id: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  profile: ProfileDetails;
  createdAt: string;
  updatedAt: string;
}
```

#### Profile Details
```typescript
interface ProfileDetails {
  firstName: string;
  lastName: string;
  language: string;
  village: string;
  block: string;
  district: string;
  state: string;
  tribalGroup?: string;
  isMarginalised: boolean;
  irrigationAccess: boolean;
  hasSmartphone: boolean;
  preferredContact: string;
  profilePhoto?: string;
  dateOfBirth?: string;
  education?: string;
  farmingExperience?: number;
  familySize?: number;
  landOwnership?: string;
}
```

#### Form Data Interfaces
```typescript
interface ProfileFormData {
  firstName: string;
  lastName: string;
  language: string;
  village: string;
  block: string;
  district: string;
  state: string;
  tribalGroup: string;
  isMarginalised: boolean;
  irrigationAccess: boolean;
  hasSmartphone: boolean;
  preferredContact: string;
  dateOfBirth: string;
  education: string;
  farmingExperience: number;
  familySize: number;
  landOwnership: string;
}

interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

## User Interface

### Tab-Based Navigation

#### Profile Tab
- **Personal Information**: Name, date of birth, education level
- **Profile Photo**: Upload and preview functionality
- **Demographic Data**: Tribal group, family size, land ownership
- **Farming Experience**: Years of experience and expertise

#### Contact Tab
- **Address Information**: Village, block, district, state
- **Contact Methods**: Email, phone, preferred communication
- **Geographic Data**: Location tracking and validation
- **Update Controls**: Edit and save functionality

#### Preferences Tab
- **Language Selection**: English, Hindi, Gondi with visual indicators
- **Farming Preferences**: Irrigation access, technology availability
- **Social Status**: Marginalized farmer identification
- **Resource Assessment**: Infrastructure and capability tracking

#### Security Tab
- **Password Management**: Change password with validation
- **Account Status**: Security monitoring and alerts
- **Access Control**: Permission management
- **Security Tips**: Best practices and recommendations

### Responsive Design

#### Mobile Optimization
```css
/* Responsive grid layouts */
.grid-cols-1 md:grid-cols-2

/* Mobile-friendly navigation */
.flex space-x-8 overflow-x-auto

/* Touch-friendly buttons */
.min-h-[44px] /* iOS touch target minimum */
```

#### Accessibility Features
```typescript
// Screen reader support
aria-label="Profile photo upload"
aria-describedby="profile-info"

// Keyboard navigation
tabIndex={0}
onKeyDown={handleKeyDown}

// Color contrast compliance
text-green-800 bg-green-100 /* WCAG AA compliant */
```

## API Integration

### Data Fetching

#### Profile Retrieval
```typescript
const fetchUserProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data.data;
};
```

#### Profile Update
```typescript
const handleProfileUpdate = async () => {
  const formData = new FormData();
  
  // Add profile data
  Object.entries(profileForm).forEach(([key, value]) => {
    formData.append(key, value.toString());
  });
  
  // Add profile photo if selected
  if (profilePhoto) {
    formData.append('profilePhoto', profilePhoto);
  }

  const response = await api.put('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
```

### Error Handling
```typescript
try {
  const user = await fetchUserProfile();
  setUser(user);
} catch (error: any) {
  toast.error('Failed to fetch profile');
  console.error('Error fetching profile:', error);
}
```

## Form Management

### State Management

#### Profile Form State
```typescript
const [profileForm, setProfileForm] = useState<ProfileFormData>({
  firstName: '',
  lastName: '',
  language: 'en',
  village: '',
  block: '',
  district: '',
  state: '',
  tribalGroup: '',
  isMarginalised: false,
  irrigationAccess: false,
  hasSmartphone: false,
  preferredContact: 'WHATSAPP',
  dateOfBirth: '',
  education: '',
  farmingExperience: 0,
  familySize: 0,
  landOwnership: ''
});
```

#### Form Validation
```typescript
// Required field validation
if (!profileForm.firstName || !profileForm.lastName) {
  toast.error('First name and last name are required');
  return;
}

// Password validation
if (securityForm.newPassword.length < 8) {
  toast.error('Password must be at least 8 characters long');
  return;
}

if (securityForm.newPassword !== securityForm.confirmPassword) {
  toast.error('New passwords do not match');
  return;
}
```

### File Upload Handling

#### Profile Photo Management
```typescript
const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setProfilePhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }
};
```

## Language Management

### Multi-language Support

#### Supported Languages
```typescript
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'gondi', name: 'गोंडी', flag: '🏞️' }
];
```

#### Language Switching
```typescript
const handleLanguageChange = (language: string) => {
  setProfileForm(prev => ({ ...prev, language }));
  i18n.changeLanguage(language);
  
  // Show success message in new language
  toast.success(t('languageChanged'));
};
```

#### i18n Integration
```typescript
// Language-specific content
const { t } = useTranslation();

// Dynamic language switching
useEffect(() => {
  if (user?.profile?.language) {
    i18n.changeLanguage(user.profile.language);
  }
}, [user?.profile?.language, i18n]);
```

## Security Features

### Password Management

#### Password Change Process
```typescript
const handlePasswordChange = async () => {
  // Validate current password
  if (!securityForm.currentPassword) {
    toast.error('Current password is required');
    return;
  }
  
  // Validate new password
  if (securityForm.newPassword.length < 8) {
    toast.error('Password must be at least 8 characters long');
    return;
  }
  
  // Confirm password match
  if (securityForm.newPassword !== securityForm.confirmPassword) {
    toast.error('New passwords do not match');
    return;
  }
  
  try {
    await api.put('/auth/change-password', {
      currentPassword: securityForm.currentPassword,
      newPassword: securityForm.newPassword
    });
    
    toast.success('Password changed successfully');
    setIsChangingPassword(false);
    setSecurityForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  } catch (error: any) {
    toast.error('Failed to change password');
  }
};
```

#### Security Validation
```typescript
// Password strength requirements
const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: []
  };
};
```

## Performance Optimizations

### Frontend Optimizations

#### Lazy Loading
```typescript
// Load components only when needed
const ProfileTab = lazy(() => import('./ProfileTab'));
const ContactTab = lazy(() => import('./ContactTab'));
const PreferencesTab = lazy(() => import('./PreferencesTab'));
const SecurityTab = lazy(() => import('./SecurityTab'));
```

#### Memoization
```typescript
// Memoize expensive calculations
const profileStats = useMemo(() => ({
  completionRate: calculateCompletionRate(profileForm),
  lastUpdated: user?.updatedAt
}), [profileForm, user?.updatedAt]);

// Memoize form validation
const formErrors = useMemo(() => 
  validateForm(profileForm), 
  [profileForm]
);
```

#### Efficient Rendering
```typescript
// Use React.memo for static components
const ProfileCard = React.memo(({ user }) => (
  <div className="profile-card">{/* Profile information */}</div>
));

// Conditional rendering to avoid unnecessary DOM updates
{isEditing && <EditForm profileForm={profileForm} />}
```

### Backend Optimizations

#### Database Queries
```typescript
// Optimized Prisma queries
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    profile: true
  }
});
```

#### Caching Strategy
```typescript
// Redis caching for profile data
const cacheKey = `profile:${userId}`;
let profile = await redis.get(cacheKey);

if (!profile) {
  profile = await fetchProfileFromDatabase(userId);
  await redis.setex(cacheKey, 3600, JSON.stringify(profile)); // 1 hour TTL
}
```

## Testing

### Automated Testing

#### Test Coverage
```bash
# Run comprehensive tests
node test-user-profile-management.js

# Expected test results:
# ✅ Profile information retrieval
# ✅ Profile update functionality
# ✅ Profile photo upload support
# ✅ Language preference management
# ✅ Contact information management
# ✅ Farming preferences configuration
# ✅ Security settings management
# ✅ Form validation and error handling
# ✅ Responsive design implementation
# ✅ Accessibility features
# ✅ Data persistence and synchronization
# ✅ User experience optimization
```

#### Manual Testing
1. Navigate to `/profile` in the frontend
2. Test all four tabs (Profile, Contact, Preferences, Security)
3. Verify form editing and saving functionality
4. Test profile photo upload and preview
5. Test language switching between English, Hindi, and Gondi
6. Verify password change functionality
7. Check responsive design on different screen sizes

## Error Handling

### Frontend Error Handling

#### Network Errors
```typescript
try {
  const user = await fetchUserProfile();
  setUser(user);
} catch (error: any) {
  if (error.response?.status === 401) {
    navigate('/login');
  } else if (error.response?.status === 404) {
    setError('Profile not found');
  } else {
    toast.error('Failed to fetch profile');
  }
}
```

#### Validation Errors
```typescript
// Form validation errors
const validateProfileForm = (data: ProfileFormData) => {
  const errors: string[] = [];
  
  if (!data.firstName) errors.push('First name is required');
  if (!data.lastName) errors.push('Last name is required');
  if (!data.village) errors.push('Village is required');
  if (!data.block) errors.push('Block is required');
  
  return errors;
};
```

### Backend Error Handling

#### Database Errors
```typescript
try {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  res.json({ success: true, data: user });
} catch (error) {
  logger.error('Database error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
}
```

#### File Upload Errors
```typescript
// Validate file uploads
const validateFileUpload = (file: Express.Multer.File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only images are allowed.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }
  
  return true;
};
```

## Future Enhancements

### Planned Features

#### Advanced Profile Features
- **Profile Verification**: Government ID verification system
- **Social Connections**: Connect with other farmers in the area
- **Achievement Badges**: Recognition for farming milestones
- **Profile Analytics**: Profile completion and engagement metrics

#### Enhanced Security
- **Two-Factor Authentication**: SMS or app-based 2FA
- **Biometric Authentication**: Fingerprint or face recognition
- **Session Management**: Active session monitoring
- **Security Alerts**: Suspicious activity notifications

#### Improved User Experience
- **Profile Templates**: Pre-filled profiles for different farmer types
- **Smart Suggestions**: AI-powered profile completion suggestions
- **Offline Support**: Profile editing without internet connection
- **Voice Input**: Voice-to-text for profile information

### Technical Improvements

#### Performance
- **Progressive Web App**: Offline capabilities and app-like experience
- **Image Optimization**: Automatic image compression and resizing
- **Lazy Loading**: On-demand loading of profile sections
- **Background Sync**: Sync profile changes when online

#### Scalability
- **Microservices**: Modular profile management services
- **CDN Integration**: Fast profile photo delivery
- **Database Sharding**: Horizontal scaling for user data
- **Caching Layers**: Multi-level caching strategy

## Troubleshooting

### Common Issues

#### Profile Not Loading
```typescript
// Check authentication status
if (!user) {
  console.log('User not authenticated');
  navigate('/login');
  return;
}

// Verify API endpoint
console.log('API URL:', '/auth/profile');
console.log('Response status:', response.status);
```

#### Photo Upload Issues
```typescript
// Check file validation
if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
  toast.error('Please select a valid image file (JPEG or PNG)');
  return;
}

// Check file size
if (file.size > 5 * 1024 * 1024) {
  toast.error('File size must be less than 5MB');
  return;
}
```

#### Language Switching Problems
```typescript
// Verify language support
const supportedLanguages = ['en', 'hi', 'gondi'];
if (!supportedLanguages.includes(language)) {
  console.error('Unsupported language:', language);
  return;
}

// Check i18n configuration
console.log('Current language:', i18n.language);
console.log('Available languages:', i18n.languages);
```

### Debug Mode

#### Enable Debug Logging
```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Profile form data:', profileForm);
  console.log('Current user:', user);
  console.log('Active tab:', activeTab);
  console.log('Editing mode:', isEditing);
}
```

#### Performance Monitoring
```typescript
// Measure form submission time
const startTime = performance.now();
await handleProfileUpdate();
const endTime = performance.now();
console.log(`Profile update took: ${endTime - startTime}ms`);
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
# Navigate to profile page
# URL: /profile

# Test the system
cd backend && node test-user-profile-management.js

# Expected features:
# 👤 Personal information management
# 📞 Contact information management
# 🌍 Language preference management
# 🚜 Farming preferences configuration
# 🔒 Security and account management
# 📱 Responsive design and accessibility
```

The User Profile Management System is now ready for comprehensive user account management! 👤✨
