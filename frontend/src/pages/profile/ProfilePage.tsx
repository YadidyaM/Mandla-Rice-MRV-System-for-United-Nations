import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import { cn } from '../../utils/cn';

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

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Form states
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

  const [securityForm, setSecurityForm] = useState<SecurityFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserProfile();
    
    // Listen for profile updates from other components
    const handleProfileUpdate = (event: CustomEvent) => {
      if (event.detail?.profile) {
        setUser(event.detail.profile);
        populateProfileForm(event.detail.profile);
      }
    };
    
    // Listen for storage changes (when profile is updated in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfile' && e.newValue) {
        try {
          const updatedProfile = JSON.parse(e.newValue);
          setUser(updatedProfile);
          populateProfileForm(updatedProfile);
        } catch (error) {
          console.error('Error parsing updated profile:', error);
        }
      }
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
      window.removeEventListener('storage', handleProfileUpdate as EventListener);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Try to get profile from localStorage first (for dynamic updates)
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setUser(parsedProfile);
        populateProfileForm(parsedProfile);
        console.log('Loaded profile from localStorage');
      }
      
      // Then try to fetch from API
      try {
        const response = await api.get('/auth/me');
        const userData = response.data.data;
        
        if (userData && userData.profile) {
          setUser(userData);
          populateProfileForm(userData);
          
          // Store in localStorage for dynamic access
          localStorage.setItem('userProfile', JSON.stringify(userData));
          console.log('Profile fetched from API and stored');
        }
      } catch (apiError: any) {
        console.error('API fetch failed, using stored or fallback data:', apiError);
        
        // If no stored profile, use fallback
        if (!storedProfile) {
          const fallbackUser = generateDynamicFallbackProfile();
          setUser(fallbackUser);
          populateProfileForm(fallbackUser);
          localStorage.setItem('userProfile', JSON.stringify(fallbackUser));
          toast('Using demo profile data', { icon: 'ℹ️' });
        }
      }
    } catch (error: any) {
      console.error('Error in profile loading:', error);
      
      // Final fallback
      const fallbackUser = generateDynamicFallbackProfile();
      setUser(fallbackUser);
      populateProfileForm(fallbackUser);
      localStorage.setItem('userProfile', JSON.stringify(fallbackUser));
      toast('Using demo profile data', { icon: 'ℹ️' });
    } finally {
      setLoading(false);
    }
  };

  const populateProfileForm = (userData: UserProfile) => {
    if (userData.profile) {
      setProfileForm({
        firstName: userData.profile.firstName || '',
        lastName: userData.profile.lastName || '',
        language: userData.profile.language || 'en',
        village: userData.profile.village || '',
        block: userData.profile.block || '',
        district: userData.profile.district || '',
        state: userData.profile.state || '',
        tribalGroup: userData.profile.tribalGroup || '',
        isMarginalised: userData.profile.isMarginalised || false,
        irrigationAccess: userData.profile.irrigationAccess || false,
        hasSmartphone: userData.profile.hasSmartphone || false,
        preferredContact: userData.profile.preferredContact || 'WHATSAPP',
        dateOfBirth: userData.profile.dateOfBirth || '',
        education: userData.profile.education || '',
        farmingExperience: userData.profile.farmingExperience || 0,
        familySize: userData.profile.familySize || 0,
        landOwnership: userData.profile.landOwnership || ''
      });
    }
  };

  const generateDynamicFallbackProfile = (): UserProfile => {
    // Generate dynamic fallback data based on current time and user preferences
    const currentYear = new Date().getFullYear();
    const randomExperience = Math.floor(Math.random() * 20) + 5; // 5-25 years
    const randomFamilySize = Math.floor(Math.random() * 5) + 3; // 3-8 members
    
    // Random names for variety
    const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Meera', 'Arjun', 'Kavya', 'Rahul', 'Anjali'];
    const lastNames = ['Patel', 'Sharma', 'Singh', 'Kumar', 'Verma', 'Yadav', 'Gupta', 'Mishra', 'Joshi', 'Choudhary'];
    const villages = ['Mandla', 'Bichhiya', 'Nainpur', 'Ghughari', 'Bamhani', 'Niwas', 'Tendukheda', 'Mawai', 'Karanjia', 'Bijadandi'];
    const tribalGroups = ['Gond', 'Baiga', 'Korku', 'Bhil', 'Kol', 'Sahariya', 'Abhuj Maria', 'Muria', 'Halba', 'Dhurwa'];
    
    const fallbackUser: UserProfile = {
      id: `demo-user-${Date.now()}`,
      email: `user${Math.floor(Math.random() * 1000)}@example.com`,
      phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      role: 'farmer',
      isActive: true,
      profile: {
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        language: ['en', 'hi', 'gondi'][Math.floor(Math.random() * 3)],
        village: villages[Math.floor(Math.random() * villages.length)],
        block: villages[Math.floor(Math.random() * villages.length)],
        district: 'Mandla',
        state: 'Madhya Pradesh',
        tribalGroup: tribalGroups[Math.floor(Math.random() * tribalGroups.length)],
        isMarginalised: Math.random() > 0.7, // 30% chance of being marginalized
        irrigationAccess: Math.random() > 0.3, // 70% chance of having irrigation
        hasSmartphone: Math.random() > 0.2, // 80% chance of having smartphone
        preferredContact: ['WHATSAPP', 'SMS', 'CALL', 'EMAIL'][Math.floor(Math.random() * 4)],
        dateOfBirth: `${currentYear - randomExperience - 18}-01-01`, // Dynamic age based on experience
        education: ['Illiterate', 'Primary', 'Secondary', 'High School', 'Graduate'][Math.floor(Math.random() * 5)],
        farmingExperience: randomExperience,
        familySize: randomFamilySize,
        landOwnership: ['Owned', 'Leased', 'Sharecropping', 'Community Land'][Math.floor(Math.random() * 4)]
      },
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last year
      updatedAt: new Date().toISOString()
    };
    
    return fallbackUser;
  };

  const generateNewRandomProfile = () => {
    const newProfile = generateDynamicFallbackProfile();
    setUser(newProfile);
    populateProfileForm(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
    toast.success('New random profile generated!');
  };

  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      // Update local state immediately for better UX
      const updatedUser = {
        ...user!,
        profile: {
          ...user!.profile,
          ...profileForm
        },
        updatedAt: new Date().toISOString()
      };
      
      setUser(updatedUser);
      
      // Store updated profile in localStorage
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      
      // Try to update via API
      try {
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
        
        // Update with server response if successful
        if (response.data.data) {
          setUser(response.data.data);
          localStorage.setItem('userProfile', JSON.stringify(response.data.data));
        }
        
        toast.success('Profile updated successfully');
      } catch (apiError: any) {
        console.error('API update failed, but local changes saved:', apiError);
        toast.success('Profile updated locally (API sync pending)');
      }
      
      setIsEditing(false);
      setProfilePhoto(null);
      setPreviewPhoto(null);
      
      // Update language if changed
      if (profileForm.language !== i18n.language) {
        i18n.changeLanguage(profileForm.language);
      }
      
      // Dispatch custom event for other components to sync
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: { profile: updatedUser } 
      }));
      
    } catch (error: any) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (securityForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
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
      console.error('Error changing password:', error);
    }
  };

  const handleLanguageChange = (language: string) => {
    setProfileForm(prev => ({ ...prev, language }));
    i18n.changeLanguage(language);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
              <p className="text-gray-600">Manage your personal information and preferences</p>
            </div>
                         <div className="flex items-center space-x-3">
               <button
                 onClick={fetchUserProfile}
                 disabled={loading}
                 className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                 title="Refresh Profile Data"
               >
                 <ArrowPathIcon className={cn("w-4 h-4", loading && "animate-spin")} />
                 <span>Refresh</span>
               </button>
               
               <button
                 onClick={generateNewRandomProfile}
                 className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                 title="Generate New Random Profile"
               >
                 <UserIcon className="w-4 h-4" />
                 <span>New Profile</span>
               </button>
               
               <span className={cn(
                 "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                 user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
               )}>
                 {user.isActive ? 'Active' : 'Inactive'}
               </span>
             </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: UserIcon },
              { id: 'contact', label: 'Contact', icon: EnvelopeIcon },
              { id: 'preferences', label: 'Preferences', icon: GlobeAltIcon },
              { id: 'security', label: 'Security', icon: ShieldCheckIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 {/* Profile Tab */}
         {activeTab === 'profile' && (
           <div className="space-y-6">
             {/* Profile Statistics */}
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
               <h3 className="text-lg font-semibold text-blue-900 mb-4">Profile Statistics</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="text-center">
                   <div className="text-2xl font-bold text-blue-600">{user.profile?.farmingExperience || 0}</div>
                   <div className="text-sm text-blue-700">Years Experience</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl font-bold text-indigo-600">{user.profile?.familySize || 0}</div>
                   <div className="text-sm text-indigo-700">Family Members</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl font-bold text-green-600">{user.profile?.irrigationAccess ? 'Yes' : 'No'}</div>
                   <div className="text-sm text-green-700">Irrigation Access</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl font-bold text-purple-600">{user.profile?.hasSmartphone ? 'Yes' : 'No'}</div>
                   <div className="text-sm text-purple-700">Smartphone Access</div>
                 </div>
               </div>
             </div>
             
             <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md"
                  >
                    {isEditing ? <XMarkIcon className="w-4 h-4" /> : <PencilIcon className="w-4 h-4" />}
                    <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Profile Photo Section */}
                <div className="flex items-center space-x-6 mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {previewPhoto || user.profile?.profilePhoto ? (
                        <img
                          src={previewPhoto || user.profile?.profilePhoto}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
                        <CameraIcon className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {user.profile?.firstName} {user.profile?.lastName}
                    </h4>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Profile Form */}
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={profileForm.dateOfBirth}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                      <select
                        value={profileForm.education}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, education: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select Education</option>
                        <option value="ILLITERATE">Illiterate</option>
                        <option value="PRIMARY">Primary</option>
                        <option value="SECONDARY">Secondary</option>
                        <option value="HIGHER_SECONDARY">Higher Secondary</option>
                        <option value="GRADUATE">Graduate</option>
                        <option value="POST_GRADUATE">Post Graduate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Farming Experience (Years)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={profileForm.farmingExperience}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, farmingExperience: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Family Size</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={profileForm.familySize}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, familySize: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Land Ownership</label>
                      <select
                        value={profileForm.landOwnership}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, landOwnership: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select Land Ownership</option>
                        <option value="OWNED">Owned</option>
                        <option value="LEASED">Leased</option>
                        <option value="SHARECROPPING">Sharecropping</option>
                        <option value="COMMUNITY">Community Land</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tribal Group</label>
                      <input
                        type="text"
                        value={profileForm.tribalGroup}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, tribalGroup: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., Gond, Baiga, Korku"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <p className="text-gray-900">{user.profile?.firstName || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <p className="text-gray-900">{user.profile?.lastName || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <p className="text-gray-900">{user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toLocaleDateString() : 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                      <p className="text-gray-900">{user.profile?.education || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Farming Experience</label>
                      <p className="text-gray-900">{user.profile?.farmingExperience ? `${user.profile.farmingExperience} years` : 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Family Size</label>
                      <p className="text-gray-900">{user.profile?.familySize || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Land Ownership</label>
                      <p className="text-gray-900">{user.profile?.landOwnership || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tribal Group</label>
                      <p className="text-gray-900">{user.profile?.tribalGroup || 'Not specified'}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileUpdate}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md"
                  >
                    {isEditing ? <XMarkIcon className="w-4 h-4" /> : <PencilIcon className="w-4 h-4" />}
                    <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={user.phone}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Phone cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                      <input
                        type="text"
                        value={profileForm.village}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, village: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
                      <input
                        type="text"
                        value={profileForm.block}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, block: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                      <input
                        type="text"
                        value={profileForm.district}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, district: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
                      <select
                        value={profileForm.preferredContact}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, preferredContact: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="SMS">SMS</option>
                        <option value="CALL">Phone Call</option>
                        <option value="EMAIL">Email</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <p className="text-gray-900">{user.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                      <p className="text-gray-900">{user.profile?.village || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
                      <p className="text-gray-900">{user.profile?.block || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                      <p className="text-gray-900">{user.profile?.district || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <p className="text-gray-900">{user.profile?.state || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact</label>
                      <p className="text-gray-900">{user.profile?.preferredContact || 'Not specified'}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileUpdate}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Preferences & Settings</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md"
                  >
                    {isEditing ? <XMarkIcon className="w-4 h-4" /> : <PencilIcon className="w-4 h-4" />}
                    <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-6">
                    {/* Language Preference */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Language Preference</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { code: 'en', name: 'English', flag: '🇺🇸' },
                          { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
                          { code: 'gondi', name: 'गोंडी', flag: '🏞️' }
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={cn(
                              "flex items-center space-x-3 p-3 border rounded-lg text-left transition-colors",
                              profileForm.language === lang.code
                                ? "border-primary-500 bg-primary-50 text-primary-700"
                                : "border-gray-300 hover:border-gray-400"
                            )}
                          >
                            <span className="text-2xl">{lang.flag}</span>
                            <span className="font-medium">{lang.name}</span>
                            {profileForm.language === lang.code && (
                              <CheckIcon className="w-5 h-5 text-primary-600 ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Farming Preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Access to Irrigation</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="irrigationAccess"
                              checked={profileForm.irrigationAccess === true}
                              onChange={() => setProfileForm(prev => ({ ...prev, irrigationAccess: true }))}
                              className="mr-2 text-primary-600"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="irrigationAccess"
                              checked={profileForm.irrigationAccess === false}
                              onChange={() => setProfileForm(prev => ({ ...prev, irrigationAccess: false }))}
                              className="mr-2 text-primary-600"
                            />
                            No
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Smartphone Access</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="hasSmartphone"
                              checked={profileForm.hasSmartphone === true}
                              onChange={() => setProfileForm(prev => ({ ...prev, hasSmartphone: true }))}
                              className="mr-2 text-primary-600"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="hasSmartphone"
                              checked={profileForm.hasSmartphone === false}
                              onChange={() => setProfileForm(prev => ({ ...prev, hasSmartphone: false }))}
                              className="mr-2 text-primary-600"
                            />
                            No
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Additional Preferences */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Marginalized Farmer Status</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="isMarginalised"
                            checked={profileForm.isMarginalised === true}
                            onChange={() => setProfileForm(prev => ({ ...prev, isMarginalised: true }))}
                            className="mr-2 text-primary-600"
                          />
                          Yes, I am a marginalized farmer
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="isMarginalised"
                            checked={profileForm.isMarginalised === false}
                            onChange={() => setProfileForm(prev => ({ ...prev, isMarginalised: false }))}
                            className="mr-2 text-primary-600"
                          />
                          No, I am not a marginalized farmer
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Language Preference */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language Preference</label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">
                          {profileForm.language === 'en' ? '🇺🇸' : profileForm.language === 'hi' ? '🇮🇳' : '🏞️'}
                        </span>
                        <span className="font-medium">
                          {profileForm.language === 'en' ? 'English' : profileForm.language === 'hi' ? 'हिंदी' : 'गोंडी'}
                        </span>
                      </div>
                    </div>

                    {/* Farming Preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Access to Irrigation</label>
                        <p className="text-gray-900">{user.profile?.irrigationAccess ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Smartphone Access</label>
                        <p className="text-gray-900">{user.profile?.hasSmartphone ? 'Yes' : 'No'}</p>
                      </div>
                    </div>

                    {/* Additional Preferences */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Marginalized Farmer Status</label>
                      <p className="text-gray-900">{user.profile?.isMarginalised ? 'Yes, I am a marginalized farmer' : 'No, I am not a marginalized farmer'}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileUpdate}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                  <button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md"
                  >
                    {isChangingPassword ? <XMarkIcon className="w-4 h-4" /> : <PencilIcon className="w-4 h-4" />}
                    <span>{isChangingPassword ? 'Cancel' : 'Change Password'}</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {isChangingPassword ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={securityForm.currentPassword}
                          onChange={(e) => setSecurityForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={securityForm.newPassword}
                          onChange={(e) => setSecurityForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={securityForm.confirmPassword}
                          onChange={(e) => setSecurityForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                      <button
                        onClick={() => setIsChangingPassword(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePasswordChange}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start">
                        <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">Password Security</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Keep your password secure and change it regularly. Use a combination of letters, numbers, and special characters.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-start">
                        <CheckIcon className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-green-800">Account Status</h4>
                          <p className="text-sm text-green-700 mt-1">
                            Your account is currently active and secure. Last updated: {new Date(user.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
