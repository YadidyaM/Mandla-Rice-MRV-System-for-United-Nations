import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MagnifyingGlassIcon, 
  QuestionMarkCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  topics: {
    id: string;
    title: string;
    difficulty: string;
  }[];
}

interface HelpArticle {
  title: string;
  content: string;
  relatedTopics: string[];
}

interface FAQ {
  category: string;
  questions: {
    question: string;
    answer: string;
  }[];
}

interface ContactInfo {
  supportEmail: string;
  salesEmail: string;
  phone: string;
  address: string;
  businessHours: string;
  emergencySupport: string;
  socialMedia: {
    twitter: string;
    linkedin: string;
    facebook: string;
  };
  responseTimes: {
    general: string;
    urgent: string;
    critical: string;
  };
}

interface SupportTicket {
  subject: string;
  description: string;
  category: string;
  priority: string;
  contactEmail: string;
}

const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('help-center');
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState<SupportTicket>({
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
    contactEmail: ''
  });

  const tabs = [
    { id: 'help-center', label: 'Help Center', icon: QuestionMarkCircleIcon },
    { id: 'search', label: 'Search', icon: MagnifyingGlassIcon },
    { id: 'faqs', label: 'FAQs', icon: QuestionMarkCircleIcon },
    { id: 'contact', label: 'Contact', icon: EnvelopeIcon },
    { id: 'support-ticket', label: 'Support Ticket', icon: ExclamationTriangleIcon }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  const categoryOptions = [
    'General',
    'Farm Management',
    'Carbon Credits',
    'Technical Support',
    'Account & Billing',
    'Marketplace',
    'Other'
  ];

  useEffect(() => {
    fetchHelpCategories();
    fetchFAQs();
    fetchContactInfo();
  }, []);

  const fetchHelpCategories = async () => {
    try {
      const response = await axios.get('/api/v1/help/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching help categories:', error);
    }
  };

  const fetchFAQs = async () => {
    try {
      const response = await axios.get('/api/v1/help/faqs');
      setFaqs(response.data.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get('/api/v1/help/contact');
      setContactInfo(response.data.data);
    } catch (error) {
      console.error('Error fetching contact info:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/help/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data.data.results);
    } catch (error) {
      console.error('Error searching help articles:', error);
      toast.error('Failed to search help articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticle = async (topicId: string) => {
    try {
      const response = await axios.get(`/api/v1/help/articles/${topicId}`);
      setSelectedArticle(response.data.data);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Failed to fetch article');
    }
  };

  const toggleFAQ = (question: string) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(question)) {
      newExpanded.delete(question);
    } else {
      newExpanded.add(question);
    }
    setExpandedFAQs(newExpanded);
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketForm.subject || !ticketForm.description || !ticketForm.category || !ticketForm.contactEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await axios.post('/api/v1/help/tickets', ticketForm);
      toast.success('Support ticket submitted successfully!');
      setShowTicketModal(false);
      setTicketForm({
        subject: '',
        description: '',
        category: '',
        priority: 'medium',
        contactEmail: ''
      });
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error('Failed to submit support ticket');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderHelpCenter = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">How can we help you?</h2>
        <p className="text-lg text-gray-600">Find answers to common questions and learn how to use our platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">{category.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>
            <p className="text-gray-600 mb-4">{category.description}</p>
            
            <div className="space-y-2">
              {category.topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => fetchArticle(topic.id)}
                  className="w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{topic.title}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(topic.difficulty)}`}>
                      {topic.difficulty}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h2>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />
              
              {selectedArticle.relatedTopics.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Related Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.relatedTopics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => fetchArticle(topic)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Search Help Articles</h2>
        <p className="text-lg text-gray-600">Find specific information quickly</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help articles..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({searchResults.length})
            </h3>
            {searchResults.map((result) => (
              <div key={result.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">{result.title}</h4>
                <p className="text-gray-600 mb-2">{result.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{result.category}</span>
                  <span className="text-sm text-blue-600">Relevance: {result.relevance}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderFAQs = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-gray-600">Quick answers to common questions</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {faqs.map((faqCategory) => (
          <div key={faqCategory.category} className="bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 p-6 border-b border-gray-200">
              {faqCategory.category}
            </h3>
            <div className="divide-y divide-gray-200">
              {faqCategory.questions.map((faq, index) => (
                <div key={index} className="p-6">
                  <button
                    onClick={() => toggleFAQ(`${faqCategory.category}-${index}`)}
                    className="w-full text-left flex items-center justify-between hover:text-blue-600 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {expandedFAQs.has(`${faqCategory.category}-${index}`) ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedFAQs.has(`${faqCategory.category}-${index}`) && (
                    <div className="mt-4 pl-4 border-l-2 border-blue-200">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
        <p className="text-lg text-gray-600">Get in touch with our support team</p>
      </div>

      {contactInfo && (
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Support Email</p>
                    <p className="text-gray-600">{contactInfo.supportEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Sales Email</p>
                    <p className="text-gray-600">{contactInfo.salesEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">{contactInfo.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">{contactInfo.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">Business Hours</p>
                    <p className="text-gray-600">{contactInfo.businessHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Times & Social Media */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Response Times</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">General Inquiries:</span>
                    <span className="font-medium text-gray-900">{contactInfo.responseTimes.general}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Urgent Issues:</span>
                    <span className="font-medium text-gray-900">{contactInfo.responseTimes.urgent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Critical Issues:</span>
                    <span className="font-medium text-gray-900">{contactInfo.responseTimes.critical}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Social Media</h4>
                <div className="space-y-2">
                  <a href={`https://twitter.com/${contactInfo.socialMedia.twitter}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <span>Twitter</span>
                  </a>
                  <a href={`https://${contactInfo.socialMedia.linkedin}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <span>LinkedIn</span>
                  </a>
                  <a href={`https://${contactInfo.socialMedia.facebook}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <span>Facebook</span>
                  </a>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <span className="font-medium">Emergency Support</span>
                </div>
                <p className="text-blue-700 mt-2">{contactInfo.emergencySupport}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSupportTicket = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Submit Support Ticket</h2>
        <p className="text-lg text-gray-600">Need help? Submit a ticket and we'll get back to you</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setShowTicketModal(true)}
          className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
        >
          Create Support Ticket
        </button>

        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What to include in your ticket:</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Clear description of the issue or question</li>
            <li>• Steps to reproduce the problem (if applicable)</li>
            <li>• Screenshots or error messages</li>
            <li>• Your contact information</li>
            <li>• Priority level for urgent issues</li>
          </ul>
        </div>
      </div>

      {showTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Submit Support Ticket</h3>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {priorityOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={option.value}
                          checked={ticketForm.priority === option.value}
                          onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className={option.color}>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={ticketForm.contactEmail}
                    onChange={(e) => setTicketForm({ ...ticketForm, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please provide detailed information about your issue or question..."
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'help-center':
        return renderHelpCenter();
      case 'search':
        return renderSearch();
      case 'faqs':
        return renderFAQs();
      case 'contact':
        return renderContact();
      case 'support-ticket':
        return renderSupportTicket();
      default:
        return renderHelpCenter();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600">Get the help you need to make the most of our platform</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
