import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  CurrencyDollarIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  TagIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  GlobeAltIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
  HomeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import { cn } from '../../utils/cn';

interface CarbonCredit {
  id: string;
  title: string;
  description: string;
  quantity: number;
  availableQuantity: number;
  pricePerCredit: number;
  totalPrice: number;
  currency: 'INR' | 'USD' | 'EUR';
  status: 'LISTED' | 'SOLD' | 'PENDING' | 'VERIFIED' | 'UNVERIFIED';
  verificationLevel: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'GOLD';
  farmId: string;
  farmName: string;
  farmerId: string;
  farmerName: string;
  location: string;
  projectType: 'RICE_FARMING' | 'FORESTRY' | 'RENEWABLE_ENERGY' | 'WASTE_MANAGEMENT' | 'SOIL_CARBON';
  methodology: string;
  vintage: number; // Year of carbon sequestration
  certification: string[];
  images: string[];
  documents: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  buyerId?: string;
  buyerName?: string;
  soldAt?: string;
  transactionId?: string;
  marketplaceId?: string; // Added for user's own listings
}

interface WalletInfo {
  address: string;
  type: 'phantom' | 'metamask' | 'custom';
  connected: boolean;
  balance?: number;
  currency?: string;
}

interface MarketplaceStats {
  totalCredits: number;
  totalValue: number;
  averagePrice: number;
  totalListings: number;
  activeListings: number;
  completedTransactions: number;
  totalFarmers: number;
  totalBuyers: number;
  priceTrend: 'UP' | 'DOWN' | 'STABLE';
  volumeTrend: 'UP' | 'DOWN' | 'STABLE';
  topProjectTypes: Array<{ type: string; count: number; value: number }>;
  topLocations: Array<{ location: string; count: number; value: number }>;
}

interface Transaction {
  id: string;
  creditId: string;
  creditTitle: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  quantity: number;
  pricePerCredit: number;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'ESCROW' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  paymentMethod: 'ESCROW' | 'DIRECT' | 'BANK_TRANSFER' | 'UPI';
  escrowId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface FilterOptions {
  priceRange: [number, number];
  projectType: string[];
  location: string[];
  verificationLevel: string[];
  vintage: number[];
  status: string[];
}

export default function MarketplacePage() {
  const { t } = useTranslation();
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 10000],
    projectType: [],
    location: [],
    verificationLevel: [],
    vintage: [],
    status: []
  });
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [showCreditDetails, setShowCreditDetails] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);

  useEffect(() => {
    fetchMarketplaceData();
    
    // Set up real-time data synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'carbonCredits' || e.key === 'marketplaceListings' || e.key === 'farmsData') {
        fetchMarketplaceData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Set up interval to check for localStorage changes (for same-tab updates)
    const intervalId = setInterval(() => {
      const currentCarbonCredits = localStorage.getItem('carbonCredits');
      const currentMarketplaceListings = localStorage.getItem('marketplaceListings');
      const currentFarmsData = localStorage.getItem('farmsData');
      
      if (currentCarbonCredits || currentMarketplaceListings || currentFarmsData) {
        fetchMarketplaceData();
      }
    }, 5000); // Check every 5 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Get data from localStorage (dynamic system)
      const carbonCredits = JSON.parse(localStorage.getItem('carbonCredits') || '[]');
      const marketplaceListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');
      const farmsData = JSON.parse(localStorage.getItem('farmsData') || '[]');
      
      // Create marketplace credits from listings and carbon credits
      const marketplaceCredits: CarbonCredit[] = [];
      
      // Add user's own listings
      marketplaceListings.forEach((listing: any) => {
        const credit: CarbonCredit = {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          quantity: listing.quantity,
          availableQuantity: listing.availableQuantity,
          pricePerCredit: listing.pricePerCredit,
          totalPrice: listing.totalPrice,
          currency: listing.currency,
          status: listing.status,
          verificationLevel: listing.verificationLevel,
          farmId: listing.farmId,
          farmName: listing.farmName,
          farmerId: listing.sellerId,
          farmerName: listing.sellerName,
          location: listing.location,
          projectType: listing.projectType,
          methodology: listing.methodology,
          vintage: listing.vintage,
          certification: ['IPCC 2019 Refinement Tier 2'],
                     images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop'],
          documents: ['/placeholder-document.pdf'],
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt || listing.createdAt,
          marketplaceId: listing.marketplaceId
        };
        marketplaceCredits.push(credit);
      });
      
             // Add sample marketplace credits from other farmers/companies
       const sampleCredits: CarbonCredit[] = [
         {
           id: 'sample_1',
           title: 'Organic Rice Farming - SRI Method',
           description: 'High-quality carbon credits from organic rice farming using System of Rice Intensification. Located in fertile regions with excellent soil quality.',
           quantity: 2500,
           availableQuantity: 2500,
           pricePerCredit: 480,
           totalPrice: 1200000,
           currency: 'INR',
           status: 'LISTED',
           verificationLevel: 'GOLD',
           farmId: 'sample_farm_1',
           farmName: 'Green Valley Organic Farm',
           farmerId: 'farmer_001',
           farmerName: 'Rajesh Patel',
           location: 'Maharashtra',
           projectType: 'RICE_FARMING',
           methodology: 'IPCC 2019 Refinement Tier 2',
           vintage: 2024,
           certification: ['Organic Certified', 'IPCC 2019 Refinement Tier 2'],
           images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop'],
           documents: ['/placeholder-document.pdf'],
           createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
           updatedAt: new Date().toISOString()
         },
         {
           id: 'sample_2',
           title: 'Sustainable Forestry Project',
           description: 'Carbon sequestration through sustainable forest management and reforestation efforts. Long-term environmental impact with verified growth metrics.',
           quantity: 5000,
           availableQuantity: 5000,
           pricePerCredit: 650,
           totalPrice: 3250000,
           currency: 'INR',
           status: 'LISTED',
           verificationLevel: 'PREMIUM',
           farmId: 'sample_farm_2',
           farmName: 'Forest Conservation Trust',
           farmerId: 'company_001',
           farmerName: 'EcoForest Solutions Ltd',
           location: 'Madhya Pradesh',
           projectType: 'FORESTRY',
           methodology: 'IPCC 2019 Refinement Tier 2',
           vintage: 2024,
           certification: ['FSC Certified', 'IPCC 2019 Refinement Tier 2'],
           images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'],
           documents: ['/placeholder-document.pdf'],
           createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
           updatedAt: new Date().toISOString()
         },
         {
           id: 'sample_3',
           title: 'Solar Energy Carbon Credits',
           description: 'Clean energy carbon credits from solar power generation. Displacing fossil fuel emissions with renewable energy solutions.',
           quantity: 8000,
           availableQuantity: 8000,
           pricePerCredit: 720,
           totalPrice: 5760000,
           currency: 'INR',
           status: 'LISTED',
           verificationLevel: 'STANDARD',
           farmId: 'sample_farm_3',
           farmName: 'SunPower Energy Co',
           farmerId: 'company_002',
           farmerName: 'Renewable Energy Corp',
           location: 'Gujarat',
           projectType: 'RENEWABLE_ENERGY',
           methodology: 'IPCC 2019 Refinement Tier 2',
           vintage: 2024,
           certification: ['ISO 14001', 'IPCC 2019 Refinement Tier 2'],
           images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop'],
           documents: ['/placeholder-document.pdf'],
           createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
           updatedAt: new Date().toISOString()
         }
       ];
      
      const allCredits = [...marketplaceCredits, ...sampleCredits];
      setCredits(allCredits);
      
      // Calculate marketplace stats
      const statsData: MarketplaceStats = {
        totalCredits: allCredits.reduce((sum, c) => sum + c.availableQuantity, 0),
        totalValue: allCredits.reduce((sum, c) => sum + (c.pricePerCredit * c.availableQuantity), 0),
        averagePrice: allCredits.length > 0 ? allCredits.reduce((sum, c) => sum + c.pricePerCredit, 0) / allCredits.length : 0,
        totalListings: allCredits.length,
        activeListings: allCredits.filter(c => c.status === 'LISTED').length,
        completedTransactions: 0, // Will be updated when transactions are implemented
        totalFarmers: new Set(allCredits.map(c => c.farmerId)).size,
        totalBuyers: 0, // Will be updated when transactions are implemented
        priceTrend: 'UP' as const,
        volumeTrend: 'STABLE' as const,
        topProjectTypes: [
          { type: 'RICE_FARMING', count: allCredits.filter(c => c.projectType === 'RICE_FARMING').length, value: allCredits.filter(c => c.projectType === 'RICE_FARMING').reduce((sum, c) => sum + (c.pricePerCredit * c.availableQuantity), 0) },
          { type: 'FORESTRY', count: allCredits.filter(c => c.projectType === 'FORESTRY').length, value: allCredits.filter(c => c.projectType === 'FORESTRY').reduce((sum, c) => sum + (c.pricePerCredit * c.availableQuantity), 0) },
          { type: 'RENEWABLE_ENERGY', count: allCredits.filter(c => c.projectType === 'RENEWABLE_ENERGY').length, value: allCredits.filter(c => c.projectType === 'RENEWABLE_ENERGY').reduce((sum, c) => sum + (c.pricePerCredit * c.availableQuantity), 0) }
        ],
        topLocations: [
          { location: 'Maharashtra', count: allCredits.filter(c => c.location === 'Maharashtra').length, value: allCredits.filter(c => c.location === 'Maharashtra').reduce((sum, c) => sum + (c.pricePerCredit * c.availableQuantity), 0) },
          { location: 'Madhya Pradesh', count: allCredits.filter(c => c.location === 'Madhya Pradesh').length, value: allCredits.filter(c => c.location === 'Madhya Pradesh').reduce((sum, c) => sum + (c.pricePerCredit * c.availableQuantity), 0) },
          { location: 'Gujarat', count: allCredits.filter(c => c.location === 'Gujarat').length, value: allCredits.filter(c => c.location === 'Gujarat').reduce((sum, c) => sum + (c.pricePerCredit * c.availableQuantity), 0) }
        ]
      };
      
      setStats(statsData);
      
      // Create sample transactions
      const sampleTransactions: Transaction[] = [
        {
          id: 'tx_1',
          creditId: 'sample_1',
          creditTitle: 'Organic Rice Farming - SRI Method',
          sellerId: 'farmer_001',
          sellerName: 'Rajesh Patel',
          buyerId: 'buyer_001',
          buyerName: 'GreenTech Solutions',
          quantity: 500,
          pricePerCredit: 480,
          totalAmount: 240000,
          currency: 'INR',
          status: 'COMPLETED',
          paymentMethod: 'ESCROW',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      setTransactions(sampleTransactions);
      
    } catch (error: any) {
      toast.error('Failed to fetch marketplace data');
      console.error('Error fetching marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (credit: CarbonCredit, quantity: number) => {
    if (!walletInfo?.connected) {
      setShowWalletModal(true);
      return;
    }

    try {
      // Show wallet confirmation modal
      const confirmed = await showWalletConfirmation(credit, quantity);
      
      if (confirmed) {
        // Process the purchase with wallet
        await processWalletPurchase(credit, quantity);
        
        toast.success('Purchase completed successfully!');
      setShowPurchaseModal(false);
      setPurchaseQuantity(1);
        fetchMarketplaceData();
      }
    } catch (error: any) {
      toast.error(`Purchase failed: ${error.message}`);
      console.error('Purchase error:', error);
    }
  };

  const connectWallet = async (walletType: 'phantom' | 'metamask' | 'custom') => {
    try {
      setWalletConnecting(true);
      
      switch (walletType) {
        case 'phantom':
          await connectPhantomWallet();
          break;
        case 'metamask':
          await connectMetamaskWallet();
          break;
        case 'custom':
          await connectCustomWallet();
          break;
        default:
          throw new Error('Unsupported wallet type');
      }
    } catch (error: any) {
      // Don't show error toast for user cancellations
      if (!error.message?.includes('cancelled') && !error.message?.includes('rejected')) {
        toast.error(`Failed to connect ${walletType} wallet: ${error.message}`);
      }
      console.error('Wallet connection error:', error);
    } finally {
      setWalletConnecting(false);
    }
  };

  const connectPhantomWallet = async () => {
    // Check if Phantom is installed
    if (!(window as any).solana || !(window as any).solana.isPhantom) {
      const installConfirmed = window.confirm(
        'Phantom wallet is not installed. Would you like to install it now?\n\n' +
        'Click OK to open the Phantom installation page, or Cancel to try a different wallet.'
      );
      
      if (installConfirmed) {
        window.open('https://phantom.app/', '_blank');
      }
      throw new Error('Phantom wallet not installed. Please install it first or try a different wallet.');
    }

    try {
      const response = await (window as any).solana.connect();
      const publicKey = response.publicKey.toString();
      
      setWalletInfo({
        address: publicKey,
        type: 'phantom',
        connected: true,
        balance: 0, // You can fetch actual SOL balance here
        currency: 'SOL'
      });
      
      toast.success('Phantom wallet connected successfully!');
      setShowWalletModal(false);
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Connection cancelled by user');
      } else if (error.message?.includes('User rejected')) {
        throw new Error('Connection rejected by user');
      } else {
        throw new Error('Failed to connect Phantom wallet. Please try again.');
      }
    }
  };

  const connectMetamaskWallet = async () => {
    if (!(window as any).ethereum) {
      const installConfirmed = window.confirm(
        'MetaMask is not installed. Would you like to install it now?\n\n' +
        'Click OK to open the MetaMask installation page, or Cancel to try a different wallet.'
      );
      
      if (installConfirmed) {
        window.open('https://metamask.io/', '_blank');
      }
      throw new Error('MetaMask not installed. Please install it first or try a different wallet.');
    }

    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      if (!account) {
        throw new Error('No accounts found. Please unlock MetaMask and try again.');
      }
      
      setWalletInfo({
        address: account,
        type: 'metamask',
        connected: true,
        balance: 0, // You can fetch actual ETH balance here
        currency: 'ETH'
      });
      
      toast.success('MetaMask wallet connected successfully!');
      setShowWalletModal(false);
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Connection cancelled by user');
      } else if (error.message?.includes('User rejected')) {
        throw new Error('Connection rejected by user');
      } else if (error.message?.includes('No accounts found')) {
        throw new Error('No accounts found. Please unlock MetaMask and try again.');
      } else {
        throw new Error('Failed to connect MetaMask wallet. Please try again.');
      }
    }
  };

  const connectCustomWallet = async () => {
    // For custom wallet integration, you can implement your own logic
    // This could be a custom modal for wallet address input
    const customAddress = prompt('Please enter your wallet address (e.g., 0x1234... or 5H...):');
    
    if (customAddress && customAddress.trim() && customAddress.trim().length >= 10) {
      setWalletInfo({
        address: customAddress.trim(),
        type: 'custom',
        connected: true,
        balance: 0,
        currency: 'CUSTOM'
      });
      
      toast.success('Custom wallet connected successfully!');
      setShowWalletModal(false);
    } else if (customAddress === null) {
      // User cancelled the prompt
      return;
    } else {
      throw new Error('Please enter a valid wallet address (minimum 10 characters)');
    }
  };

  const disconnectWallet = () => {
    setWalletInfo(null);
    toast.success('Wallet disconnected');
  };

  const showWalletConfirmation = (credit: CarbonCredit, quantity: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const totalAmount = credit.pricePerCredit * quantity;
      
      const confirmed = window.confirm(
        `Confirm Purchase:\n\n` +
        `Credit: ${credit.title}\n` +
        `Quantity: ${quantity}\n` +
        `Price per credit: ₹${credit.pricePerCredit.toLocaleString()}\n` +
        `Total Amount: ₹${totalAmount.toLocaleString()}\n\n` +
        `Wallet: ${walletInfo?.type.toUpperCase()}\n` +
        `Address: ${walletInfo?.address.slice(0, 8)}...${walletInfo?.address.slice(-6)}\n\n` +
        `Do you want to proceed with this purchase?`
      );
      
      resolve(confirmed);
    });
  };

  const processWalletPurchase = async (credit: CarbonCredit, quantity: number) => {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, you would:
    // 1. Create a smart contract transaction
    // 2. Sign it with the connected wallet
    // 3. Submit it to the blockchain
    // 4. Wait for confirmation
    
    // For now, we'll simulate the process
    console.log(`Processing purchase: ${quantity} credits from ${credit.id} via ${walletInfo?.type} wallet`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNVERIFIED':
        return 'bg-red-100 text-red-800';
      case 'SOLD':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getVerificationIcon = (level: string) => {
    switch (level) {
      case 'GOLD':
        return <StarIcon className="w-6 h-6 text-yellow-500" />;
      case 'PREMIUM':
        return <StarIcon className="w-5 h-5 text-purple-500" />;
      case 'STANDARD':
        return <ShieldCheckIcon className="w-5 h-5 text-blue-500" />;
      case 'BASIC':
        return <ShieldCheckIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <ShieldCheckIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
              case 'RICE_FARMING':
          return <HomeIcon className="w-5 h-5 text-green-600" />;
      case 'FORESTRY':
        return <GlobeAltIcon className="w-5 h-5 text-green-600" />;
      case 'RENEWABLE_ENERGY':
        return <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />;
      case 'WASTE_MANAGEMENT':
        return <HomeIcon className="w-5 h-5 text-purple-600" />;
              case 'SOIL_CARBON':
        return <HomeIcon className="w-5 h-5 text-amber-600" />;
        default:
          return <HomeIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getProjectImage = (type: string) => {
    switch (type) {
      case 'RICE_FARMING':
        return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop';
      case 'FORESTRY':
        return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop';
      case 'RENEWABLE_ENERGY':
        return 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop';
      case 'WASTE_MANAGEMENT':
        return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
      case 'SOIL_CARBON':
        return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop';
      default:
        return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop';
    }
  };

  const filteredCredits = credits.filter(credit => {
    // Search filter
    if (searchQuery && !credit.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !credit.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !credit.farmName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Price range filter
    if (credit.pricePerCredit < filters.priceRange[0] || credit.pricePerCredit > filters.priceRange[1]) {
      return false;
    }

    // Project type filter
    if (filters.projectType.length > 0 && !filters.projectType.includes(credit.projectType)) {
      return false;
    }

    // Location filter
    if (filters.location.length > 0 && !filters.location.includes(credit.location)) {
      return false;
    }

    // Verification level filter
    if (filters.verificationLevel.length > 0 && !filters.verificationLevel.includes(credit.verificationLevel)) {
      return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(credit.status)) {
      return false;
    }

    return true;
  });

  const sortedCredits = [...filteredCredits].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.pricePerCredit - b.pricePerCredit;
      case 'price-high':
        return b.pricePerCredit - a.pricePerCredit;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'verification':
        const levelOrder = { 'GOLD': 4, 'PREMIUM': 3, 'STANDARD': 2, 'BASIC': 1 };
        return levelOrder[b.verificationLevel] - levelOrder[a.verificationLevel];
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading marketplace...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Carbon Credit Marketplace</h1>
              <p className="text-gray-600">Buy and sell verified carbon credits from sustainable farming projects</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Wallet Connection Status */}
              {walletInfo?.connected ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {walletInfo.type.toUpperCase()} Connected
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Connect Wallet</span>
                </button>
              )}

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <FunnelIcon className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md"
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                      <div className="bg-gray-600 rounded-sm"></div>
                      <div className="bg-gray-600 rounded-sm"></div>
                      <div className="bg-gray-600 rounded-sm"></div>
                      <div className="bg-gray-600 rounded-sm"></div>
                    </div>
                    <span>List</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 flex flex-col gap-0.5">
                      <div className="bg-gray-600 rounded-sm h-1"></div>
                      <div className="bg-gray-600 rounded-sm h-1"></div>
                      <div className="bg-gray-600 rounded-sm h-1"></div>
                    </div>
                    <span>Grid</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalCredits.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Credits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">₹{stats.totalValue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">₹{stats.averagePrice.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Avg Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.activeListings}</div>
                <div className="text-sm text-gray-600">Active Listings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.completedTransactions}</div>
                <div className="text-sm text-gray-600">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.totalFarmers}</div>
                <div className="text-sm text-gray-600">Farmers</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'marketplace', label: 'Marketplace', count: credits.length },
               { id: 'my-listings', label: 'My Listings', count: credits.filter(c => c.farmerId === 'current-user' || c.marketplaceId).length },
              { id: 'my-purchases', label: 'My Purchases', count: transactions.filter(t => t.buyerId === 'current-user').length },
              { id: 'transactions', label: 'Transactions', count: transactions.length },
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
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    activeTab === tab.id
                      ? "bg-primary-100 text-primary-800"
                      : "bg-gray-100 text-gray-800"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search carbon credits, farms, or projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="verification">Verification Level</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], parseInt(e.target.value) || 10000] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                  <select
                    multiple
                    value={filters.projectType}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, projectType: selected }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="RICE_FARMING">Rice Farming</option>
                    <option value="FORESTRY">Forestry</option>
                    <option value="RENEWABLE_ENERGY">Renewable Energy</option>
                    <option value="WASTE_MANAGEMENT">Waste Management</option>
                    <option value="SOIL_CARBON">Soil Carbon</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    multiple
                    value={filters.location}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, location: selected }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Mandla">Mandla</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                  </select>
                </div>

                {/* Verification Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification Level</label>
                  <select
                    multiple
                    value={filters.verificationLevel}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, verificationLevel: selected }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="BASIC">Basic</option>
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="GOLD">Gold</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing {sortedCredits.length} of {credits.length} carbon credit listings
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Price trends:</span>
                {stats?.priceTrend === 'UP' && (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                )}
                {stats?.priceTrend === 'DOWN' && (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                )}
                {stats?.priceTrend === 'STABLE' && (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-0 border-l-0 transform rotate-45"></div>
                )}
              </div>
            </div>

            {/* Credits Grid/List */}
            {sortedCredits.length === 0 ? (
              <div className="text-center py-12">
                                 <HomeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No carbon credits found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </div>
            ) : (
              <div className={cn(
                "grid gap-6",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}>
                {sortedCredits.map((credit) => (
                  <div
                    key={credit.id}
                    className={cn(
                      "bg-white rounded-lg shadow border transition-all duration-200 hover:shadow-lg",
                      viewMode === 'list' ? "flex" : "block"
                    )}
                  >
                    {/* Credit Image */}
                    <div className={cn(
                      "relative",
                      viewMode === 'list' ? "w-48 h-32" : "w-full h-48"
                    )}>
                      <img
                         src={credit.images[0] || getProjectImage(credit.projectType)}
                        alt={credit.title}
                        className="w-full h-full object-cover rounded-t-lg"
                         onError={(e) => {
                           const target = e.target as HTMLImageElement;
                           target.src = getProjectImage(credit.projectType);
                         }}
                      />
                       {/* Gradient overlay for better text readability */}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-t-lg"></div>
                      <div className="absolute top-2 right-2">
                        {getVerificationIcon(credit.verificationLevel)}
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          getStatusColor(credit.status)
                        )}>
                          {credit.status}
                        </span>
                      </div>
                       {/* Project type badge at bottom */}
                       <div className="absolute bottom-2 left-2">
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 backdrop-blur-sm">
                           {credit.projectType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Credit Content */}
                    <div className={cn(
                      "p-4",
                      viewMode === 'list' ? "flex-1" : ""
                    )}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {credit.title}
                        </h3>
                         <div className="flex items-center space-x-1">
                           <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                             {credit.verificationLevel}
                           </span>
                          {getVerificationIcon(credit.verificationLevel)}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {credit.description}
                      </p>

                      {/* Project Details */}
                      <div className="flex items-center space-x-2 mb-3">
                         <div className="flex items-center space-x-1">
                        {getProjectTypeIcon(credit.projectType)}
                           <span className="text-sm font-medium text-gray-700">
                          {credit.projectType.replace('_', ' ')}
                        </span>
                         </div>
                         <span className="text-sm text-gray-400">•</span>
                         <div className="flex items-center space-x-1">
                           <GlobeAltIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{credit.location}</span>
                         </div>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            ₹{credit.pricePerCredit.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">per credit</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {credit.availableQuantity.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">credits available</div>
                        </div>
                      </div>

                      {/* Total Value */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Total Value:</span>
                          <span className="text-lg font-bold text-gray-900">
                            ₹{(credit.pricePerCredit * credit.availableQuantity).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCredit(credit);
                            setShowCreditDetails(true);
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                        {credit.status === 'LISTED' && (
                          <button
                            onClick={() => {
                              setSelectedCredit(credit);
                              setShowPurchaseModal(true);
                            }}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                          >
                            <ShoppingCartIcon className="w-4 h-4" />
                            <span>Buy Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-listings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My Listings</h3>
              <button 
                onClick={() => window.location.href = '/app/credits'}
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Create New Listing</span>
              </button>
            </div>

            {/* User's Listings */}
            {(() => {
              const userListings = credits.filter(c => c.farmerId === 'current-user' || c.marketplaceId);
              
              if (userListings.length === 0) {
                return (
          <div className="text-center py-12">
            <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings Yet</h3>
                    <p className="text-gray-600 mb-4">You haven't listed any carbon credits for sale yet.</p>
                    <button 
                      onClick={() => window.location.href = '/app/credits'}
                      className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                    >
              <PlusIcon className="w-4 h-4" />
                      <span>Go to Carbon Credits</span>
            </button>
                  </div>
                );
              }

              return (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {userListings.map((credit) => (
                    <div
                      key={credit.id}
                      className="bg-white rounded-lg shadow border transition-all duration-200 hover:shadow-lg"
                    >
                                             {/* Credit Image with Status */}
                       <div className="relative">
                         <img
                           src={credit.images[0] || getProjectImage(credit.projectType)}
                           alt={credit.title}
                           className="w-full h-48 object-cover rounded-t-lg"
                           onError={(e) => {
                             const target = e.target as HTMLImageElement;
                             target.src = getProjectImage(credit.projectType);
                           }}
                         />
                         {/* Gradient overlay for better text readability */}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-t-lg"></div>
                         <div className="absolute top-2 right-2">
                           {getVerificationIcon(credit.verificationLevel)}
                         </div>
                         <div className="absolute top-2 left-2">
                           <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                             {credit.status}
                           </span>
                         </div>
                         <div className="absolute bottom-2 left-2">
                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 backdrop-blur-sm">
                             {credit.projectType.replace('_', ' ')}
                           </span>
                         </div>
                       </div>

                      {/* Credit Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {credit.title}
                          </h3>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {credit.description}
                        </p>

                        {/* Project Details with Icons */}
                        <div className="flex items-center space-x-2 mb-3">
                          {getProjectTypeIcon(credit.projectType)}
                          <span className="text-sm text-gray-600">
                            {credit.projectType.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{credit.location}</span>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              ₹{credit.pricePerCredit.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">per credit</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {credit.availableQuantity.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">credits available</div>
                          </div>
                        </div>

                        {/* Total Value */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Total Value:</span>
                            <span className="text-lg font-bold text-gray-900">
                              ₹{(credit.pricePerCredit * credit.availableQuantity).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCredit(credit);
                              setShowCreditDetails(true);
                            }}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                                                      <button
                              onClick={() => {
                                // Edit listing functionality
                                toast('Edit listing feature coming soon!');
                              }}
                              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                            >
                            <TagIcon className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'my-purchases' && (
          <div className="text-center py-12">
            <ShoppingCartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">My Purchases</h3>
            <p className="text-gray-600">Track your carbon credit purchases and transactions</p>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Transactions</h3>
            <p className="text-gray-600">View all marketplace transactions and their status</p>
          </div>
        )}
      </div>

      {/* Credit Details Modal */}
      {showCreditDetails && selectedCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedCredit.title}</h2>
                <button
                  onClick={() => setShowCreditDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Images */}
                <div>
                  <img
                     src={selectedCredit.images[0] || getProjectImage(selectedCredit.projectType)}
                    alt={selectedCredit.title}
                    className="w-full h-64 object-cover rounded-lg"
                     onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.src = getProjectImage(selectedCredit.projectType);
                     }}
                  />
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedCredit.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Project Type</span>
                      <p className="text-gray-900">{selectedCredit.projectType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Location</span>
                      <p className="text-gray-900">{selectedCredit.location}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Vintage</span>
                      <p className="text-gray-900">{selectedCredit.vintage}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Verification</span>
                      <p className="text-gray-900">{selectedCredit.verificationLevel}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Price per credit:</span>
                        <span className="text-2xl font-bold text-green-600">₹{selectedCredit.pricePerCredit.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Available quantity:</span>
                        <span className="text-lg font-semibold">{selectedCredit.availableQuantity.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total value:</span>
                        <span className="text-xl font-bold text-gray-900">₹{(selectedCredit.pricePerCredit * selectedCredit.availableQuantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {selectedCredit.status === 'LISTED' && (
                    <button
                      onClick={() => {
                        setShowCreditDetails(false);
                        setShowPurchaseModal(true);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                    >
                      <ShoppingCartIcon className="w-5 h-5" />
                      <span>Purchase Credits</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && selectedCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Purchase Carbon Credits</h2>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedCredit.title}</h3>
                  <p className="text-sm text-gray-600">{selectedCredit.farmName}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Price per credit:</span>
                    <span className="font-semibold">₹{selectedCredit.pricePerCredit.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-semibold">{selectedCredit.availableQuantity.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity to purchase
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedCredit.availableQuantity}
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 font-medium">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-900">
                      ₹{(selectedCredit.pricePerCredit * purchaseQuantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Wallet Status Check */}
                {!walletInfo?.connected && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Please connect your wallet to make a purchase
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowPurchaseModal(false);
                        setShowWalletModal(true);
                      }}
                      className="mt-2 w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                    >
                      Connect Wallet
                    </button>
                  </div>
                )}

                {/* Wallet Info Display */}
                {walletInfo?.connected && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Wallet Connected</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <div>Type: {walletInfo.type.toUpperCase()}</div>
                      <div>Address: {walletInfo.address.slice(0, 8)}...{walletInfo.address.slice(-6)}</div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePurchase(selectedCredit, purchaseQuantity)}
                    disabled={!walletInfo?.connected}
                    className={cn(
                      "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                      walletInfo?.connected
                        ? "text-white bg-primary-600 hover:bg-primary-700"
                        : "text-gray-400 bg-gray-200 cursor-not-allowed"
                    )}
                  >
                    {walletInfo?.connected ? 'Confirm Purchase' : 'Connect Wallet First'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Connect Wallet</h2>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Choose your preferred wallet to connect and make purchases:
                </p>
                
                {/* Helpful Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Wallet Connection Tips:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Phantom:</strong> Best for Solana blockchain</li>
                        <li>• <strong>MetaMask:</strong> Best for Ethereum/Polygon</li>
                        <li>• <strong>Custom:</strong> Enter any wallet address manually</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Phantom Wallet */}
                <button
                  onClick={() => connectWallet('phantom')}
                  disabled={walletConnecting}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg font-bold">P</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Phantom</div>
                      <div className="text-sm text-gray-500">Solana blockchain</div>
                    </div>
                  </div>
                  {walletConnecting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>

                {/* MetaMask Wallet */}
                <button
                  onClick={() => connectWallet('metamask')}
                  disabled={walletConnecting}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg font-bold">M</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">MetaMask</div>
                      <div className="text-sm text-gray-500">Ethereum blockchain</div>
                    </div>
                  </div>
                  {walletConnecting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>

                {/* Custom Wallet */}
                <button
                  onClick={() => connectWallet('custom')}
                  disabled={walletConnecting}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg font-bold">C</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Custom Wallet</div>
                      <div className="text-sm text-gray-500">Enter wallet address</div>
                    </div>
                  </div>
                  {walletConnecting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    By connecting your wallet, you agree to our terms of service and privacy policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Declare global types for wallet interfaces
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
    };
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (params: any) => void) => void;
      removeListener: (event: string, callback: (params: any) => void) => void;
    };
  }
}
