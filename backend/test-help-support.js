import axios from 'axios';

const API_BASE = 'http://localhost:4000/api/v1/help';

const logTest = (testName, status, details = '') => {
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${testName}: ${status}${details ? ` - ${details}` : ''}`);
};

const logSection = (sectionName) => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🧪 ${sectionName}`);
  console.log(`${'='.repeat(50)}`);
};

const logSummary = (passed, total) => {
  const percentage = ((passed / total) * 100).toFixed(1);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 TEST SUMMARY: ${passed}/${total} tests passed (${percentage}%)`);
  console.log(`${'='.repeat(50)}`);
};

// Test Help Categories
const testHelpCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE}/categories`);
    
    if (response.status === 200 && response.data.success) {
      const categories = response.data.data;
      
      // Validate structure
      const hasRequiredFields = categories.every(cat => 
        cat.id && cat.title && cat.icon && cat.description && cat.topics
      );
      
      if (hasRequiredFields && categories.length >= 5) {
        logTest('Help Categories', 'PASS', `Retrieved ${categories.length} categories`);
        return true;
      } else {
        logTest('Help Categories', 'FAIL', 'Invalid category structure');
        return false;
      }
    } else {
      logTest('Help Categories', 'FAIL', 'Invalid response format');
      return false;
    }
  } catch (error) {
    logTest('Help Categories', 'FAIL', error.message);
    return false;
  }
};

// Test Help Articles
const testHelpArticles = async () => {
  const testTopics = ['account-setup', 'first-farm', 'credit-basics', 'common-issues'];
  let passed = 0;
  
  for (const topic of testTopics) {
    try {
      const response = await axios.get(`${API_BASE}/articles/${topic}`);
      
      if (response.status === 200 && response.data.success) {
        const article = response.data.data;
        
        if (article.title && article.content && article.relatedTopics) {
          logTest(`Help Article - ${topic}`, 'PASS');
          passed++;
        } else {
          logTest(`Help Article - ${topic}`, 'FAIL', 'Invalid article structure');
        }
      } else {
        logTest(`Help Article - ${topic}`, 'FAIL', 'Invalid response format');
      }
    } catch (error) {
      logTest(`Help Article - ${topic}`, 'FAIL', error.message);
    }
  }
  
  return passed === testTopics.length;
};

// Test Help Search
const testHelpSearch = async () => {
  try {
    const response = await axios.get(`${API_BASE}/search?query=account`);
    
    if (response.status === 200 && response.data.success) {
      const data = response.data.data;
      
      if (data.query && data.results && Array.isArray(data.results) && data.totalResults >= 0) {
        logTest('Help Search', 'PASS', `Found ${data.totalResults} results for "account"`);
        return true;
      } else {
        logTest('Help Search', 'FAIL', 'Invalid search response structure');
        return false;
      }
    } else {
      logTest('Help Search', 'FAIL', 'Invalid response format');
      return false;
    }
  } catch (error) {
    logTest('Help Search', 'FAIL', error.message);
    return false;
  }
};

// Test Search Validation
const testSearchValidation = async () => {
  try {
    const response = await axios.get(`${API_BASE}/search`);
    
    if (response.status === 400) {
      logTest('Search Validation', 'PASS', 'Correctly rejected empty query');
      return true;
    } else {
      logTest('Search Validation', 'FAIL', 'Should reject empty query');
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logTest('Search Validation', 'PASS', 'Correctly rejected empty query');
      return true;
    } else {
      logTest('Search Validation', 'FAIL', error.message);
      return false;
    }
  }
};

// Test FAQs
const testFAQs = async () => {
  try {
    const response = await axios.get(`${API_BASE}/faqs`);
    
    if (response.status === 200 && response.data.success) {
      const faqs = response.data.data;
      
      if (Array.isArray(faqs) && faqs.length > 0) {
        const hasValidStructure = faqs.every(faq => 
          faq.category && faq.questions && Array.isArray(faq.questions)
        );
        
        if (hasValidStructure) {
          logTest('FAQs', 'PASS', `Retrieved ${faqs.length} FAQ categories`);
          return true;
        } else {
          logTest('FAQs', 'FAIL', 'Invalid FAQ structure');
          return false;
        }
      } else {
        logTest('FAQs', 'FAIL', 'No FAQ data returned');
        return false;
      }
    } else {
      logTest('FAQs', 'FAIL', 'Invalid response format');
      return false;
    }
  } catch (error) {
    logTest('FAQs', 'FAIL', error.message);
    return false;
  }
};

// Test Contact Info
const testContactInfo = async () => {
  try {
    const response = await axios.get(`${API_BASE}/contact`);
    
    if (response.status === 200 && response.data.success) {
      const contact = response.data.data;
      
      const requiredFields = ['supportEmail', 'salesEmail', 'phone', 'address', 'businessHours'];
      const hasRequiredFields = requiredFields.every(field => contact[field]);
      
      if (hasRequiredFields) {
        logTest('Contact Info', 'PASS', 'Retrieved complete contact information');
        return true;
      } else {
        logTest('Contact Info', 'FAIL', 'Missing required contact fields');
        return false;
      }
    } else {
      logTest('Contact Info', 'FAIL', 'Invalid response format');
      return false;
    }
  } catch (error) {
    logTest('Contact Info', 'FAIL', error.message);
    return false;
  }
};

// Test Support Ticket Submission
const testSupportTicket = async () => {
  try {
    const ticketData = {
      subject: 'Test Support Request',
      description: 'This is a test support ticket for system validation',
      category: 'Technical Support',
      priority: 'medium',
      contactEmail: 'test@example.com'
    };
    
    const response = await axios.post(`${API_BASE}/tickets`, ticketData);
    
    if (response.status === 201 && response.data.success) {
      const ticket = response.data.data;
      
      if (ticket.id && ticket.status === 'open' && ticket.estimatedResponseTime) {
        logTest('Support Ticket Submission', 'PASS', `Ticket ${ticket.id} created successfully`);
        return true;
      } else {
        logTest('Support Ticket Submission', 'FAIL', 'Invalid ticket response structure');
        return false;
      }
    } else {
      logTest('Support Ticket Submission', 'FAIL', 'Invalid response format');
      return false;
    }
  } catch (error) {
    logTest('Support Ticket Submission', 'FAIL', error.message);
    return false;
  }
};

// Test Support Ticket Validation
const testTicketValidation = async () => {
  try {
    const invalidTicket = {
      subject: '',
      description: 'Test description',
      category: 'Technical Support',
      priority: 'medium',
      contactEmail: 'test@example.com'
    };
    
    const response = await axios.post(`${API_BASE}/tickets`, invalidTicket);
    
    if (response.status === 400) {
      logTest('Ticket Validation', 'PASS', 'Correctly rejected invalid ticket');
      return true;
    } else {
      logTest('Ticket Validation', 'FAIL', 'Should reject invalid ticket');
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logTest('Ticket Validation', 'PASS', 'Correctly rejected invalid ticket');
      return true;
    } else {
      logTest('Ticket Validation', 'FAIL', error.message);
      return false;
    }
  }
};

// Test Invalid Article Request
const testInvalidArticle = async () => {
  try {
    const response = await axios.get(`${API_BASE}/articles/invalid-topic`);
    
    if (response.status === 404) {
      logTest('Invalid Article Request', 'PASS', 'Correctly returned 404 for invalid topic');
      return true;
    } else {
      logTest('Invalid Article Request', 'FAIL', 'Should return 404 for invalid topic');
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logTest('Invalid Article Request', 'PASS', 'Correctly returned 404 for invalid topic');
      return true;
    } else {
      logTest('Invalid Article Request', 'FAIL', error.message);
      return false;
    }
  }
};

// Test Performance
const testPerformance = async () => {
  const startTime = Date.now();
  const promises = [];
  
  // Make 10 concurrent requests
  for (let i = 0; i < 10; i++) {
    promises.push(axios.get(`${API_BASE}/categories`));
  }
  
  try {
    await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration < 5000) { // Should complete within 5 seconds
      logTest('Performance Test', 'PASS', `10 concurrent requests completed in ${duration}ms`);
      return true;
    } else {
      logTest('Performance Test', 'FAIL', `10 concurrent requests took ${duration}ms (too slow)`);
      return false;
    }
  } catch (error) {
    logTest('Performance Test', 'FAIL', error.message);
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting Help & Support System Tests...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test Help Categories
  logSection('Help Categories');
  if (await testHelpCategories()) passedTests++;
  totalTests++;
  
  // Test Help Articles
  logSection('Help Articles');
  if (await testHelpArticles()) passedTests++;
  totalTests++;
  
  // Test Help Search
  logSection('Help Search');
  if (await testHelpSearch()) passedTests++;
  totalTests++;
  if (await testSearchValidation()) passedTests++;
  totalTests++;
  
  // Test FAQs
  logSection('FAQs');
  if (await testFAQs()) passedTests++;
  totalTests++;
  
  // Test Contact Info
  logSection('Contact Information');
  if (await testContactInfo()) passedTests++;
  totalTests++;
  
  // Test Support Tickets
  logSection('Support Tickets');
  if (await testSupportTicket()) passedTests++;
  totalTests++;
  if (await testTicketValidation()) passedTests++;
  totalTests++;
  
  // Test Error Handling
  logSection('Error Handling');
  if (await testInvalidArticle()) passedTests++;
  totalTests++;
  
  // Test Performance
  logSection('Performance');
  if (await testPerformance()) passedTests++;
  totalTests++;
  
  // Summary
  logSummary(passedTests, totalTests);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The Help & Support System is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
};

// Run tests
runAllTests().catch(console.error);
