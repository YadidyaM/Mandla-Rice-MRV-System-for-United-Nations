/**
 * Home Page Component
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircleIcon, 
  CurrencyDollarIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  HeartIcon,
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import CarbonCredit3D from '../components/ui/CarbonCredit3D';

const features = [
  {
    name: 'Blockchain Verified',
    description: 'Carbon credits verified on blockchain for transparency and trust',
    icon: ShieldCheckIcon,
  },
  {
    name: 'AI-Powered MRV',
    description: 'Automated measurement, reporting, and verification using satellite data',
    icon: CheckCircleIcon,
  },
  {
    name: 'Direct Income',
    description: 'Farmers earn direct income from sustainable rice farming practices',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Global Impact',
    description: 'Contributing to global climate goals while supporting local communities',
    icon: GlobeAltIcon,
  },
];

const advancedFeatures = [
  {
    name: 'Real-time Analytics',
    description: 'Advanced dashboards with real-time farm data and carbon credit tracking',
    icon: ChartBarIcon,
  },
  {
    name: 'Team Management',
    description: 'Collaborate with farm workers and agricultural experts seamlessly',
    icon: UserGroupIcon,
  },
  {
    name: 'System Administration',
    description: 'Comprehensive admin tools for UNDP and government officials',
    icon: CogIcon,
  },
  {
    name: 'Document Management',
    description: 'Secure storage and management of farm documents and certifications',
    icon: DocumentTextIcon,
  },
  {
    name: 'Research Integration',
    description: 'Access to cutting-edge agricultural research and best practices',
    icon: AcademicCapIcon,
  },
  {
    name: 'Enterprise Solutions',
    description: 'Scalable solutions for large agricultural organizations and cooperatives',
    icon: BuildingOfficeIcon,
  },
];

const teamMembers = [
  {
    name: 'Yadidya Medepalli',
    role: 'AI Engineer',
    description: 'Leading the development of AI-powered MRV systems and blockchain integration',
    linkedin: 'https://www.linkedin.com/in/yadidya-medepalli/',
    github: 'https://github.com/YadidyaM',
    image: '/pics/yad.png'
  },
  {
    name: 'Monica Jayakumar',
    role: 'AI & Data Engineer',
    description: 'Specializing in data engineering, satellite data processing, and analytics',
    linkedin: 'https://www.linkedin.com/in/monicajayakumar/',
    github: 'https://github.com/Monica2403',
    image: '/pics/Untitled design.png'
  },
  {
    name: 'Amrin Asokan',
    role: 'Sustainability',
    description: 'Driving sustainable farming practices and environmental impact assessment',
    linkedin: 'https://www.linkedin.com/in/amrin-asokan/',
    github: 'https://github.com/TheSlayStation',
    image: '/pics/amr.png'
  }
];

const enhancedTestimonials = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    role: 'Rice Farmer, Mandla',
    image: '/pics/farmer1.jpg',
    content: 'This platform has transformed how I manage my farm. The carbon credits provide additional income while helping the environment.',
    rating: 5,
    location: 'Mandla, MP'
  },
  {
    id: 2,
    name: 'Dr. Priya Sharma',
    role: 'Agricultural Officer',
    image: '/pics/officer1.jpg',
    content: 'The MRV system provides accurate data that helps us make informed decisions about sustainable farming practices.',
    rating: 5,
    location: 'Bhopal, MP'
  },
  {
    id: 3,
    name: 'Amit Patel',
    role: 'Farm Manager',
    image: '/pics/manager1.jpg',
    content: 'The blockchain verification gives us confidence that our carbon credits are legitimate and valuable.',
    rating: 5,
    location: 'Indore, MP'
  },
  {
    id: 4,
    name: 'Sunita Devi',
    role: 'Organic Farmer',
    image: '/pics/farmer2.jpg',
    content: 'I love how easy it is to track my farm\'s environmental impact and earn rewards for sustainable practices.',
    rating: 5,
    location: 'Jabalpur, MP'
  }
];

export default function HomePage() {
  const { t } = useTranslation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [stats, setStats] = useState({ farmers: 0, carbonReduced: 0, income: 0, satisfaction: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Auto-play testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % enhancedTestimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Animate stats when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          animateStats();
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animateStats = () => {
    const targetStats = { farmers: 150, carbonReduced: 250, income: 250000, satisfaction: 95 };
    const duration = 2000;
    const steps = 60;
    const stepValue = Object.keys(targetStats).reduce((acc: any, key) => {
      acc[key] = targetStats[key as keyof typeof targetStats] / steps;
      return acc;
    }, {});

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setStats({
        farmers: Math.min(Math.round(stepValue.farmers * currentStep), targetStats.farmers),
        carbonReduced: Math.min(Math.round(stepValue.carbonReduced * currentStep), targetStats.carbonReduced),
        income: Math.min(Math.round(stepValue.income * currentStep), targetStats.income),
        satisfaction: Math.min(Math.round(stepValue.satisfaction * currentStep), targetStats.satisfaction)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % enhancedTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + enhancedTestimonials.length) % enhancedTestimonials.length);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary-100/30 to-blue-100/30 dark:from-primary-800/20 dark:to-blue-800/20 rounded-full -translate-x-48 -translate-y-48 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-green-100/30 to-primary-100/30 dark:from-green-800/20 dark:to-primary-800/20 rounded-full translate-x-40 translate-y-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-5xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 dark:from-primary-400 dark:via-blue-400 dark:to-purple-400 animate-fade-in">
                Mandla Rice MRV
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-primary-500 to-blue-500 mx-auto mt-4 rounded-full animate-slide-in"></div>
            </div>
            
            <p className="mt-8 text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              Empowering tribal farmers in Mandla with blockchain-verified carbon credits 
              through sustainable rice farming practices. Building climate solutions for the UN Challenge 2024.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Link
                to="/auth/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Get Started as Farmer</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </Link>
              
              <Link
                to="/auth/login"
                className="group px-8 py-4 border-2 border-primary-600 text-primary-600 font-semibold rounded-xl hover:bg-primary-600 hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                Login to Dashboard
              </Link>
            </div>
            
            {/* Enhanced Stats with Animation */}
            <div ref={statsRef} className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {isVisible ? stats.farmers : 0}+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Farmers</div>
                <div className="w-16 h-1 bg-primary-600 mx-auto mt-2 rounded-full"></div>
              </div>
              <div className="text-center transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {isVisible ? stats.carbonReduced : 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">tCO2e Reduced</div>
                <div className="w-16 h-1 bg-green-600 mx-auto mt-2 rounded-full"></div>
              </div>
              <div className="text-center transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ₹{isVisible ? (stats.income / 1000).toFixed(1) : 0}K
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Income Generated</div>
                <div className="w-16 h-1 bg-blue-600 mx-auto mt-2 rounded-full"></div>
              </div>
              <div className="text-center transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {isVisible ? stats.satisfaction : 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</div>
                <div className="w-16 h-1 bg-purple-600 mx-auto mt-2 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3D Carbon Credit Visualization */}
      <section className="py-16 bg-gradient-to-r from-green-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Experience Carbon Credits in 3D
            </h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Watch as digital carbon credits come to life with our interactive 3D visualization. 
              Each floating token represents real environmental impact and sustainable farming practices.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <CarbonCredit3D className="shadow-2xl rounded-2xl" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Simple, transparent, and effective carbon credit generation
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div 
                key={feature.name} 
                className="group relative bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-primary-200 dark:hover:border-primary-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex justify-center">
                    <div className="p-4 bg-primary-100 dark:bg-primary-900/50 rounded-full group-hover:bg-primary-200 dark:group-hover:bg-primary-800/70 transition-colors duration-300">
                      <feature.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    {feature.name}
                  </h3>
                  <p className="mt-4 text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <div className="w-full h-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Professional Features
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Enterprise-grade tools for modern agricultural management
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {advancedFeatures.map((feature, index) => (
              <div 
                key={feature.name} 
                className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl p-8 transform hover:-translate-y-3 transition-all duration-500 overflow-hidden"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-blue-50/50 dark:from-primary-900/10 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex justify-center">
                    <div className="p-4 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-blue-900/30 rounded-2xl group-hover:from-primary-200 group-hover:to-blue-200 dark:group-hover:from-primary-800/50 dark:group-hover:to-blue-800/50 transition-all duration-500 transform group-hover:rotate-6">
                      <feature.icon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    {feature.name}
                  </h3>
                  <p className="mt-4 text-base text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="text-sm text-primary-600 font-medium">Learn More →</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Meet Our Team
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              The talented engineers behind Document Graph Builder
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <div key={member.name} className="text-center group">
                <div className="relative mx-auto w-32 h-32 mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-lg font-medium text-primary-600 mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {member.description}
                </p>
                
                <div className="flex justify-center space-x-4">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                    </svg>
                    LinkedIn
                  </a>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                    GitHub
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Interactive Testimonials Carousel */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              What Our Users Say
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Real feedback from farmers and agricultural professionals
            </p>
          </div>

          <div className="mt-20 relative">
            {/* Testimonial Cards */}
            <div className="relative overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}>
                {enhancedTestimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <div className="max-w-4xl mx-auto">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/20 dark:to-blue-900/20 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-primary-100 dark:from-green-900/20 dark:to-primary-900/20 rounded-full translate-y-12 -translate-x-12"></div>
                        
                        <div className="relative z-10">
                          {/* Quote Icon */}
                          <div className="flex justify-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center">
                              <HeartIcon className="h-8 w-8 text-white" />
                            </div>
                          </div>
                          
                          {/* Testimonial Content */}
                          <blockquote className="text-center mb-8">
                            <p className="text-xl text-gray-700 dark:text-gray-300 italic leading-relaxed">
                              "{testimonial.content}"
                            </p>
                          </blockquote>
                          
                          {/* Author Info */}
                          <div className="text-center">
                            <div className="flex justify-center mb-4">
                              <img
                                src={testimonial.image}
                                alt={testimonial.name}
                                className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/64x64/3B82F6/FFFFFF?text=' + testimonial.name.charAt(0);
                                }}
                              />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {testimonial.name}
                            </h4>
                            <p className="text-primary-600 dark:text-primary-400 font-medium mb-1">
                              {testimonial.role}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {testimonial.location}
                            </p>
                            
                            {/* Rating Stars */}
                            <div className="flex justify-center mt-3">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button
                onClick={prevTestimonial}
                className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 border border-gray-200 dark:border-gray-700"
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              
              <button
                onClick={toggleAutoPlay}
                className="p-3 bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
              >
                {isAutoPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </button>
              
              <button
                onClick={nextTestimonial}
                className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 border border-gray-200 dark:border-gray-700"
              >
                <ChevronRightIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 space-x-2">
              {enhancedTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? 'bg-primary-600 w-8'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Interactive CTA */}
      <section className="py-24 bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-36 -translate-y-36"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="transform hover:scale-105 transition-transform duration-500">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Join the Climate Solution?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Start earning carbon credits from your sustainable farming practices today. 
              Join hundreds of farmers already making a difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/auth/register"
                className="group relative px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Register Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </Link>
              
              <Link
                to="/auth/login"
                className="group px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-105"
              >
                Login to Dashboard
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/80">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-5 h-5" />
                <span className="text-sm">Blockchain Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="text-sm">UN Challenge 2024</span>
              </div>
              <div className="flex items-center space-x-2">
                <GlobeAltIcon className="w-5 h-5" />
                <span className="text-sm">Global Impact</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Mandla Rice MRV System</h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                Empowering tribal farmers with blockchain-verified carbon credits through sustainable rice farming practices. 
                Building climate solutions for the UN Challenge 2024.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/farms" className="text-gray-400 hover:text-white transition-colors">Farm Management</a></li>
                <li><a href="/marketplace" className="text-gray-400 hover:text-white transition-colors">Carbon Marketplace</a></li>
                <li><a href="/mrv" className="text-gray-400 hover:text-white transition-colors">MRV System</a></li>
                <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">Help & Support</a></li>
              </ul>
            </div>

            {/* Partners */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Partners</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">UNDP India</li>
                <li className="text-gray-400">Bill & Melinda Gates Foundation</li>
                <li className="text-gray-400">IIT Delhi</li>
                <li className="text-gray-400">Government of Madhya Pradesh</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              © 2024 Mandla Rice MRV System. All rights reserved. | UN Climate Challenge 2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
