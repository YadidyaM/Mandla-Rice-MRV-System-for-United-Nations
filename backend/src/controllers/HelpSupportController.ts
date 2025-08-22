import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class HelpSupportController {
  /**
   * Get help categories and topics
   */
  async getHelpCategories(req: Request, res: Response) {
    try {
      const categories = [
        {
          id: 'getting-started',
          title: 'Getting Started',
          icon: '🚀',
          description: 'Learn the basics of using our platform',
          topics: [
            { id: 'account-setup', title: 'Account Setup', difficulty: 'Beginner' },
            { id: 'first-farm', title: 'Creating Your First Farm', difficulty: 'Beginner' },
            { id: 'navigation', title: 'Platform Navigation', difficulty: 'Beginner' }
          ]
        },
        {
          id: 'farm-management',
          title: 'Farm Management',
          icon: '🌾',
          description: 'Manage your farms and agricultural data',
          topics: [
            { id: 'farm-registration', title: 'Farm Registration', difficulty: 'Intermediate' },
            { id: 'data-entry', title: 'Data Entry & Updates', difficulty: 'Intermediate' },
            { id: 'satellite-data', title: 'Satellite Data Integration', difficulty: 'Advanced' }
          ]
        },
        {
          id: 'carbon-credits',
          title: 'Carbon Credits',
          icon: '🌱',
          description: 'Understanding and trading carbon credits',
          topics: [
            { id: 'credit-basics', title: 'Carbon Credit Basics', difficulty: 'Intermediate' },
            { id: 'verification', title: 'Verification Process', difficulty: 'Advanced' },
            { id: 'marketplace', title: 'Marketplace Trading', difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'technical-support',
          title: 'Technical Support',
          icon: '🔧',
          description: 'Technical issues and troubleshooting',
          topics: [
            { id: 'common-issues', title: 'Common Issues', difficulty: 'All Levels' },
            { id: 'browser-support', title: 'Browser Compatibility', difficulty: 'All Levels' },
            { id: 'mobile-app', title: 'Mobile App Support', difficulty: 'All Levels' }
          ]
        },
        {
          id: 'account-billing',
          title: 'Account & Billing',
          icon: '💳',
          description: 'Account management and payment',
          topics: [
            { id: 'profile-settings', title: 'Profile Settings', difficulty: 'Beginner' },
            { id: 'subscription', title: 'Subscription Plans', difficulty: 'Intermediate' },
            { id: 'payment-methods', title: 'Payment Methods', difficulty: 'Intermediate' }
          ]
        }
      ];

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      logger.error('Error fetching help categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch help categories'
      });
    }
  }

  /**
   * Get help article by topic
   */
  async getHelpArticle(req: Request, res: Response) {
    try {
      const { topicId } = req.params;
      
      const articles = {
        'account-setup': {
          title: 'Account Setup Guide',
          content: `
            <h2>Setting Up Your Account</h2>
            <p>Welcome to our platform! Follow these steps to get started:</p>
            
            <h3>Step 1: Registration</h3>
            <ul>
              <li>Click the "Sign Up" button on the homepage</li>
              <li>Enter your email address and create a strong password</li>
              <li>Verify your email address</li>
            </ul>
            
            <h3>Step 2: Profile Completion</h3>
            <ul>
              <li>Fill in your personal information</li>
              <li>Add your professional details</li>
              <li>Upload a profile picture (optional)</li>
            </ul>
            
            <h3>Step 3: Verification</h3>
            <ul>
              <li>Complete identity verification</li>
              <li>Add your phone number for 2FA</li>
              <li>Set up security questions</li>
            </ul>
            
            <h3>Next Steps</h3>
            <p>Once your account is set up, you can:</p>
            <ul>
              <li>Register your first farm</li>
              <li>Explore the marketplace</li>
              <li>Connect with other farmers</li>
            </ul>
          `,
          relatedTopics: ['first-farm', 'profile-settings', 'navigation']
        },
        'first-farm': {
          title: 'Creating Your First Farm',
          content: `
            <h2>Farm Registration Process</h2>
            <p>Learn how to register your first farm and start tracking your agricultural data:</p>
            
            <h3>Prerequisites</h3>
            <ul>
              <li>Complete account setup</li>
              <li>Have farm location details ready</li>
              <li>Prepare crop information</li>
            </ul>
            
            <h3>Registration Steps</h3>
            <ol>
              <li><strong>Basic Information:</strong> Enter farm name, type, and location</li>
              <li><strong>Land Details:</strong> Specify area, soil type, and irrigation</li>
              <li><strong>Crop Information:</strong> Add current and planned crops</li>
              <li><strong>Documentation:</strong> Upload relevant documents</li>
              <li><strong>Verification:</strong> Submit for review</li>
            </ol>
            
            <h3>Required Documents</h3>
            <ul>
              <li>Land ownership/lease documents</li>
              <li>Soil test reports</li>
              <li>Crop planning documents</li>
              <li>Environmental compliance certificates</li>
            </ul>
            
            <h3>Tips for Success</h3>
            <ul>
              <li>Provide accurate location coordinates</li>
              <li>Include detailed crop information</li>
              <li>Upload clear, readable documents</li>
              <li>Respond promptly to verification requests</li>
            </ul>
          `,
          relatedTopics: ['farm-registration', 'data-entry', 'satellite-data']
        },
        'credit-basics': {
          title: 'Understanding Carbon Credits',
          content: `
            <h2>Carbon Credit Fundamentals</h2>
            <p>Carbon credits are a way to measure and trade the environmental benefits of sustainable farming practices:</p>
            
            <h3>What Are Carbon Credits?</h3>
            <p>Carbon credits represent one metric ton of CO2 equivalent (CO2e) that has been removed from the atmosphere or prevented from being emitted through sustainable agricultural practices.</p>
            
            <h3>How They Work</h3>
            <ul>
              <li><strong>Generation:</strong> Sustainable practices create carbon credits</li>
              <li><strong>Verification:</strong> Third-party verification ensures quality</li>
              <li><strong>Trading:</strong> Credits can be sold on the marketplace</li>
              <li><strong>Retirement:</strong> Credits are permanently removed when used</li>
            </ul>
            
            <h3>Eligible Practices</h3>
            <ul>
              <li>Cover cropping and crop rotation</li>
              <li>Conservation tillage</li>
              <li>Agroforestry</li>
              <li>Precision agriculture</li>
              <li>Organic farming</li>
            </ul>
            
            <h3>Verification Levels</h3>
            <ul>
              <li><strong>Basic:</strong> Self-reported data with basic validation</li>
              <li><strong>Standard:</strong> Third-party verification with field visits</li>
              <li><strong>Premium:</strong> Advanced monitoring with satellite data</li>
              <li><strong>Gold:</strong> Highest level with blockchain verification</li>
            </ul>
          `,
          relatedTopics: ['verification', 'marketplace', 'farm-management']
        },
        'common-issues': {
          title: 'Common Issues & Solutions',
          content: `
            <h2>Troubleshooting Guide</h2>
            <p>Find solutions to the most common issues users encounter:</p>
            
            <h3>Login Problems</h3>
            <ul>
              <li><strong>Forgot Password:</strong> Use the password reset link on the login page</li>
              <li><strong>Account Locked:</strong> Contact support if you've been locked out</li>
              <li><strong>2FA Issues:</strong> Check your phone number and try backup codes</li>
            </ul>
            
            <h3>Farm Registration Issues</h3>
            <ul>
              <li><strong>Location Errors:</strong> Ensure coordinates are in decimal format</li>
              <li><strong>Document Upload:</strong> Check file size (max 10MB) and format (PDF, JPG, PNG)</li>
              <li><strong>Verification Delays:</strong> Allow 3-5 business days for review</li>
            </ul>
            
            <h3>Marketplace Problems</h3>
            <ul>
              <li><strong>Transaction Failures:</strong> Check your wallet balance and gas fees</li>
              <li><strong>Credit Verification:</strong> Ensure your credits meet marketplace requirements</li>
              <li><strong>Payment Issues:</strong> Verify your payment method and billing address</li>
            </ul>
            
            <h3>Performance Issues</h3>
            <ul>
              <li><strong>Slow Loading:</strong> Clear browser cache and cookies</li>
              <li><strong>Mobile Problems:</strong> Update to the latest app version</li>
              <li><strong>Browser Compatibility:</strong> Use Chrome, Firefox, Safari, or Edge</li>
            </ul>
          `,
          relatedTopics: ['technical-support', 'account-billing', 'farm-management']
        }
      };

      const article = articles[topicId as keyof typeof articles];
      
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Help topic not found'
        });
      }

      res.json({
        success: true,
        data: article
      });
    } catch (error) {
      logger.error('Error fetching help article:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch help article'
      });
    }
  }

  /**
   * Search help articles
   */
  async searchHelp(req: Request, res: Response) {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      // Mock search results - in production, this would search a database
      const searchResults = [
        {
          id: 'account-setup',
          title: 'Account Setup Guide',
          category: 'Getting Started',
          excerpt: 'Learn how to set up your account and get started with our platform...',
          relevance: 95
        },
        {
          id: 'first-farm',
          title: 'Creating Your First Farm',
          category: 'Farm Management',
          excerpt: 'Step-by-step guide to registering your first farm and entering data...',
          relevance: 88
        },
        {
          id: 'credit-basics',
          title: 'Understanding Carbon Credits',
          category: 'Carbon Credits',
          excerpt: 'Learn the fundamentals of carbon credits and how they work...',
          relevance: 82
        }
      ];

      res.json({
        success: true,
        data: {
          query,
          results: searchResults,
          totalResults: searchResults.length
        }
      });
    } catch (error) {
      logger.error('Error searching help articles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search help articles'
      });
    }
  }

  /**
   * Submit support ticket
   */
  async submitSupportTicket(req: Request, res: Response) {
    try {
      const { subject, description, category, priority, contactEmail } = req.body;

      // Validate required fields
      if (!subject || !description || !category || !priority || !contactEmail) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // In production, this would save to a database
      const ticket = {
        id: `TICKET-${Date.now()}`,
        subject,
        description,
        category,
        priority,
        contactEmail,
        status: 'open',
        createdAt: new Date().toISOString(),
        estimatedResponseTime: '24-48 hours'
      };

      logger.info('Support ticket submitted:', ticket);

      res.status(201).json({
        success: true,
        message: 'Support ticket submitted successfully',
        data: ticket
      });
    } catch (error) {
      logger.error('Error submitting support ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit support ticket'
      });
    }
  }

  /**
   * Get FAQ categories and questions
   */
  async getFAQs(req: Request, res: Response) {
    try {
      const faqs = [
        {
          category: 'General',
          questions: [
            {
              question: 'What is this platform?',
              answer: 'Our platform is a comprehensive agricultural management system that helps farmers track their operations, generate carbon credits, and participate in the carbon marketplace.'
            },
            {
              question: 'Is the platform free to use?',
              answer: 'We offer both free and premium plans. Basic features are free, while advanced features require a subscription.'
            },
            {
              question: 'How do I get started?',
              answer: 'Sign up for an account, complete your profile, and register your first farm to get started.'
            }
          ]
        },
        {
          category: 'Farm Management',
          questions: [
            {
              question: 'How many farms can I register?',
              answer: 'You can register unlimited farms on your account. Each farm can have multiple fields and crops.'
            },
            {
              question: 'What data do I need to provide?',
              answer: 'Basic farm information, location coordinates, crop details, and relevant documentation are required.'
            },
            {
              question: 'How often should I update my farm data?',
              answer: 'We recommend updating your farm data at least monthly, or whenever there are significant changes.'
            }
          ]
        },
        {
          category: 'Carbon Credits',
          questions: [
            {
              question: 'How are carbon credits calculated?',
              answer: 'Carbon credits are calculated based on your farming practices, crop types, and land management techniques using verified scientific models.'
            },
            {
              question: 'How long does verification take?',
              answer: 'Verification typically takes 3-5 business days for basic verification and 1-2 weeks for advanced verification levels.'
            },
            {
              question: 'Can I sell my carbon credits?',
              answer: 'Yes, verified carbon credits can be sold on our marketplace to interested buyers.'
            }
          ]
        },
        {
          category: 'Technical',
          questions: [
            {
              question: 'What browsers are supported?',
              answer: 'We support Chrome, Firefox, Safari, and Edge. For the best experience, use the latest version.'
            },
            {
              question: 'Is there a mobile app?',
              answer: 'Yes, we have mobile apps for both iOS and Android devices.'
            },
            {
              question: 'How do I report a bug?',
              answer: 'Use the support ticket system or contact our technical support team directly.'
            }
          ]
        }
      ];

      res.json({
        success: true,
        data: faqs
      });
    } catch (error) {
      logger.error('Error fetching FAQs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch FAQs'
      });
    }
  }

  /**
   * Get contact information and support channels
   */
  async getContactInfo(req: Request, res: Response) {
    try {
      const contactInfo = {
        supportEmail: 'support@agriplatform.com',
        salesEmail: 'sales@agriplatform.com',
        phone: '+1 (555) 123-4567',
        address: '123 Agriculture Street, Farming City, FC 12345',
        businessHours: 'Monday - Friday: 9:00 AM - 6:00 PM EST',
        emergencySupport: 'Available 24/7 for critical issues',
        socialMedia: {
          twitter: '@AgriPlatform',
          linkedin: 'linkedin.com/company/agriplatform',
          facebook: 'facebook.com/agriplatform'
        },
        responseTimes: {
          general: '24-48 hours',
          urgent: '4-8 hours',
          critical: '1-2 hours'
        }
      };

      res.json({
        success: true,
        data: contactInfo
      });
    } catch (error) {
      logger.error('Error fetching contact info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contact information'
      });
    }
  }
}

export default new HelpSupportController();
