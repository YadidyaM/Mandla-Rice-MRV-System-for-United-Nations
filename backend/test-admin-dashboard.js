/**
 * Admin Dashboard System Test Script
 * UN Climate Challenge 2024
 * 
 * This script tests the comprehensive Admin Dashboard System including:
 * - Dashboard overview and statistics
 * - User management
 * - Farm management  
 * - Carbon credit management
 * - Transaction management
 * - System health monitoring
 * - Data export functionality
 * - Audit logs
 */

import axios from 'axios';

const API_BASE = 'http://localhost:4000/api/v1/admin';

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // Note: In a real test, you would need to include authentication headers
    // 'Authorization': 'Bearer <admin_token>'
  }
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
const logTest = (testName, passed, details = '') => {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName} - PASSED`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName} - FAILED`);
    if (details) console.log(`   Details: ${details}`);
  }
  testResults.details.push({ testName, passed, details });
};

const logSection = (title) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 ${title}`);
  console.log(`${'='.repeat(60)}`);
};

const logSummary = () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 TEST SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log(`\nFailed Tests:`);
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => console.log(`  - ${test.testName}: ${test.details}`));
  }
};

// Test functions
const testDashboardOverview = async () => {
  try {
    const response = await axios.get(`${API_BASE}/dashboard`, TEST_CONFIG);
    
    if (response.status === 200 && response.data.success) {
      const data = response.data.data;
      
      // Check if all required fields exist
      const hasOverview = data.overview && 
        typeof data.overview.totalUsers === 'number' &&
        typeof data.overview.totalFarms === 'number' &&
        typeof data.overview.totalCarbonCredits === 'number' &&
        typeof data.overview.totalTransactions === 'number';
      
      const hasSystemHealth = data.systemHealth && 
        data.systemHealth.status &&
        data.systemHealth.database;
      
      const hasRecentActivity = data.recentActivity &&
        Array.isArray(data.recentActivity.recentUsers) &&
        Array.isArray(data.recentActivity.recentCredits) &&
        Array.isArray(data.recentActivity.recentTransactions);
      
      if (hasOverview && hasSystemHealth && hasRecentActivity) {
        logTest('Dashboard Overview', true);
        console.log(`   Users: ${data.overview.totalUsers}, Farms: ${data.overview.totalFarms}`);
        console.log(`   Carbon Credits: ${data.overview.totalCarbonCredits}, Transactions: ${data.overview.totalTransactions}`);
        console.log(`   System Status: ${data.systemHealth.status}, Database: ${data.systemHealth.database}`);
      } else {
        logTest('Dashboard Overview', false, 'Missing required dashboard fields');
      }
    } else {
      logTest('Dashboard Overview', false, 'Invalid response format');
    }
  } catch (error) {
    logTest('Dashboard Overview', false, error.message);
  }
};

const testSystemStats = async () => {
  try {
    const response = await axios.get(`${API_BASE}/stats`, TEST_CONFIG);
    
    if (response.status === 200 && response.data.success) {
      const data = response.data.data;
      
      // Check if system stats contain required information
      const hasUserStats = data.userStats && Array.isArray(data.userStats);
      const hasFarmStats = data.farmStats && Array.isArray(data.farmStats);
      const hasCreditStats = data.creditStats && Array.isArray(data.creditStats);
      const hasTransactionStats = data.transactionStats && Array.isArray(data.transactionStats);
      const hasSystemInfo = data.systemInfo && data.systemInfo.nodeVersion;
      
      if (hasUserStats && hasFarmStats && hasCreditStats && hasTransactionStats && hasSystemInfo) {
        logTest('System Statistics', true);
        console.log(`   Node Version: ${data.systemInfo.nodeVersion}`);
        console.log(`   User Stats: ${data.userStats.length} categories`);
        console.log(`   Farm Stats: ${data.farmStats.length} categories`);
      } else {
        logTest('System Statistics', false, 'Missing required system stats fields');
      }
    } else {
      logTest('System Statistics', false, 'Invalid response format');
    }
  } catch (error) {
    logTest('System Statistics', false, error.message);
  }
};

const testUserManagement = async () => {
  try {
    const response = await axios.get(`${API_BASE}/users`, TEST_CONFIG);
    
    if (response.status === 200 && response.data.success) {
      const data = response.data.data;
      
      // Check if users data is properly structured
      const hasUsers = data.users && Array.isArray(data.users);
      const hasPagination = data.pagination && 
        typeof data.pagination.total === 'number' &&
        typeof data.pagination.page === 'number';
      
      if (hasUsers && hasPagination) {
        logTest('User Management', true);
        console.log(`   Total Users: ${data.pagination.total}`);
        console.log(`   Current Page: ${data.pagination.page}`);
        console.log(`   Users in Response: ${data.users.length}`);
        
        // Check if user objects have required fields
        if (data.users.length > 0) {
          const firstUser = data.users[0];
          const hasRequiredFields = firstUser.id && firstUser.email && firstUser.role;
          if (hasRequiredFields) {
            console.log(`   Sample User: ${firstUser.email} (${firstUser.role})`);
          } else {
            logTest('User Management - Data Structure', false, 'User objects missing required fields');
          }
        }
      } else {
        logTest('User Management', false, 'Missing required user management fields');
      }
    } else {
      logTest('User Management', false, 'Invalid response format');
    }
  } catch (error) {
    logTest('User Management', false, error.message);
  }
};

const testFarmManagement = async () => {
  try {
    const response = await axios.get(`${API_BASE}/farms`, TEST_CONFIG);
    
    if (response.status === 200 && response.data.success) {
      const data = response.data.data;
      
      // Check if farms data is properly structured
      const hasFarms = data.farms && Array.isArray(data.farms);
      const hasPagination = data.pagination && 
        typeof data.pagination.total === 'number';
      
      if (hasFarms && hasPagination) {
        logTest('Farm Management', true);
        console.log(`   Total Farms: ${data.pagination.total}`);
        console.log(`   Farms in Response: ${data.farms.length}`);
        
        // Check if farm objects have required fields
        if (data.farms.length > 0) {
          const firstFarm = data.farms[0];
          const hasRequiredFields = firstFarm.id && firstFarm.name && firstFarm.location;
          if (hasRequiredFields) {
            console.log(`   Sample Farm: ${firstFarm.name} in ${firstFarm.location}`);
          } else {
            logTest('Farm Management - Data Structure', false, 'Farm objects missing required fields');
          }
        }
      } else {
        logTest('Farm Management', false, 'Missing required farm management fields');
      }
    } else {
      logTest('Farm Management', false, 'Invalid response format');
    }
  } catch (error) {
    logTest('Farm Management', false, error.message);
  }
};

const testCarbonCreditManagement = async () => {
  try {
    const response = await axios.get(`${API_BASE}/carbon-credits`, TEST_CONFIG);
    
    if (response.status === 200 && response.data.success) {
      const data = response.data.data;
      
      // Check if carbon credits data is properly structured
      const hasCredits = data.credits && Array.isArray(data.credits);
      const hasPagination = data.pagination && 
        typeof data.pagination.total === 'number';
      
      if (hasCredits && hasPagination) {
        logTest('Carbon Credit Management', true);
        console.log(`   Total Carbon Credits: ${data.pagination.total}`);
        console.log(`   Credits in Response: ${data.credits.length}`);
        
        // Check if credit objects have required fields
        if (data.credits.length > 0) {
          const firstCredit = data.credits[0];
          const hasRequiredFields = firstCredit.id && firstCredit.title && firstCredit.quantity;
          if (hasRequiredFields) {
            console.log(`   Sample Credit: ${firstCredit.title} (${firstCredit.quantity} credits)`);
          } else {
            logTest('Carbon Credit Management - Data Structure', false, 'Credit objects missing required fields');
          }
        }
      } else {
        logTest('Carbon Credit Management', false, 'Missing required carbon credit fields');
      }
    } else {
      logTest('Carbon Credit Management', false, 'Invalid response format');
    }
  } catch (error) {
    logTest('Carbon Credit Management', false, error.message);
  }
};

const testTransactionManagement = async () => {
  try {
    const response = await axios.get(`${API_BASE}/transactions`, TEST_CONFIG);
    
    if (response.status === 200 && response.data.success) {
      const data = response.data.data;
      
      // Check if transactions data is properly structured
      const hasTransactions = data.transactions && Array.isArray(data.transactions);
      const hasPagination = data.pagination && 
        typeof data.pagination.total === 'number';
      
      if (hasTransactions && hasPagination) {
        logTest('Transaction Management', true);
        console.log(`   Total Transactions: ${data.pagination.total}`);
        console.log(`   Transactions in Response: ${data.transactions.length}`);
        
        // Check if transaction objects have required fields
        if (data.transactions.length > 0) {
          const firstTransaction = data.transactions[0];
          const hasRequiredFields = firstTransaction.id && firstTransaction.quantity && firstTransaction.totalAmount;
          if (hasRequiredFields) {
            console.log(`   Sample Transaction: ${firstTransaction.quantity} credits for ${firstTransaction.totalAmount}`);
          } else {
            logTest('Transaction Management - Data Structure', false, 'Transaction objects missing required fields');
          }
        }
      } else {
        logTest('Transaction Management', false, 'Missing required transaction fields');
      }
    } else {
      logTest('Transaction Management', false, 'Invalid response format');
    }
  } catch (error) {
    logTest('Transaction Management', false, error.message);
  }
};

const testSystemHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE}/system/health`, TEST_CONFIG);
    
    if (response.status === 200 && response.data.success) {
      const data = response.data.data;
      
      // Check if system health data is properly structured
      const hasStatus = data.status && typeof data.status === 'string';
      const hasDatabase = data.database && typeof data.database === 'string';
      const hasTimestamp = data.timestamp;
      const hasUptime = typeof data.uptime === 'number';
      
      if (hasStatus && hasDatabase && hasTimestamp && hasUptime) {
        logTest('System Health', true);
        console.log(`   Status: ${data.status}`);
        console.log(`   Database: ${data.database}`);
        console.log(`   Uptime: ${Math.floor(data.uptime / 3600)}h ${Math.floor((data.uptime % 3600) / 60)}m`);
        console.log(`   Timestamp: ${new Date(data.timestamp).toLocaleString()}`);
      } else {
        logTest('System Health', false, 'Missing required system health fields');
      }
    } else {
      logTest('System Health', false, 'Invalid response format');
    }
  } catch (error) {
    logTest('System Health', false, error.message);
  }
};

const testBlockchainStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE}/system/blockchain`, TEST_CONFIG);
    
    if (response.status === 200 && response.data.success) {
      const data = response.data.data;
      
      // Check if blockchain status data is properly structured
      const hasNetwork = data.network && typeof data.network === 'string';
      const hasStatus = data.status && typeof data.status === 'string';
      const hasLastBlock = typeof data.lastBlock === 'number';
      const hasGasPrice = data.gasPrice && typeof data.gasPrice === 'string';
      
      if (hasNetwork && hasStatus && hasLastBlock && hasGasPrice) {
        logTest('Blockchain Status', true);
        console.log(`   Network: ${data.network}`);
        console.log(`   Status: ${data.status}`);
        console.log(`   Last Block: ${data.lastBlock}`);
        console.log(`   Gas Price: ${data.gasPrice}`);
      } else {
        logTest('Blockchain Status', false, 'Missing required blockchain status fields');
      }
    } else {
      logTest('Blockchain Status', false, 'Invalid response format');
    }
  } catch (error) {
    logTest('Blockchain Status', false, error.message);
  }
};

const testAuditLogs = async () => {
  try {
    const response = await axios.get(`${API_BASE}/audit-logs`, TEST_CONFIG);
    
    if (response.status === 200 && response.data.success) {
      const data = response.data.data;
      
      // Check if audit logs data is properly structured
      const hasLogs = data.logs && Array.isArray(data.logs);
      const hasPagination = data.pagination && 
        typeof data.pagination.total === 'number';
      
      if (hasLogs && hasPagination) {
        logTest('Audit Logs', true);
        console.log(`   Total Audit Logs: ${data.pagination.total}`);
        console.log(`   Logs in Response: ${data.logs.length}`);
        
        // Check if log objects have required fields
        if (data.logs.length > 0) {
          const firstLog = data.logs[0];
          const hasRequiredFields = firstLog.id && firstLog.action && firstLog.timestamp;
          if (hasRequiredFields) {
            console.log(`   Sample Log: ${firstLog.action} at ${new Date(firstLog.timestamp).toLocaleString()}`);
          } else {
            logTest('Audit Logs - Data Structure', false, 'Log objects missing required fields');
          }
        }
      } else {
        logTest('Audit Logs', false, 'Missing required audit log fields');
      }
    } else {
      logTest('Audit Logs', false, 'Invalid response format');
    }
  } catch (error) {
    logTest('Audit Logs', false, error.message);
  }
};

const testDataExport = async () => {
  try {
    // Test CSV export for users
    const response = await axios.get(`${API_BASE}/export/users?format=csv`, {
      ...TEST_CONFIG,
      responseType: 'blob'
    });
    
    if (response.status === 200 && response.data) {
      logTest('Data Export - Users CSV', true);
      console.log(`   Response Type: ${response.headers['content-type']}`);
      console.log(`   Data Size: ${response.data.size} bytes`);
    } else {
      logTest('Data Export - Users CSV', false, 'Invalid export response');
    }
  } catch (error) {
    logTest('Data Export - Users CSV', false, error.message);
  }
  
  try {
    // Test JSON export for farms
    const response = await axios.get(`${API_BASE}/export/farms?format=json`, TEST_CONFIG);
    
    if (response.status === 200 && response.data.success) {
      logTest('Data Export - Farms JSON', true);
      console.log(`   Data Type: ${Array.isArray(response.data.data) ? 'Array' : 'Object'}`);
      console.log(`   Data Length: ${Array.isArray(response.data.data) ? response.data.data.length : 'N/A'}`);
    } else {
      logTest('Data Export - Farms JSON', false, 'Invalid export response');
    }
  } catch (error) {
    logTest('Data Export - Farms JSON', false, error.message);
  }
};

const testErrorHandling = async () => {
  try {
    // Test invalid endpoint
    await axios.get(`${API_BASE}/invalid-endpoint`, TEST_CONFIG);
    logTest('Error Handling - Invalid Endpoint', false, 'Should have returned 404');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logTest('Error Handling - Invalid Endpoint', true);
    } else {
      logTest('Error Handling - Invalid Endpoint', false, `Unexpected error: ${error.message}`);
    }
  }
  
  try {
    // Test invalid export type
    await axios.get(`${API_BASE}/export/invalid-type`, TEST_CONFIG);
    logTest('Error Handling - Invalid Export Type', false, 'Should have returned 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logTest('Error Handling - Invalid Export Type', true);
    } else {
      logTest('Error Handling - Invalid Export Type', false, `Unexpected error: ${error.message}`);
    }
  }
};

const testPerformance = async () => {
  const startTime = Date.now();
  
  try {
    // Test multiple concurrent requests
    const promises = [
      axios.get(`${API_BASE}/dashboard`, TEST_CONFIG),
      axios.get(`${API_BASE}/stats`, TEST_CONFIG),
      axios.get(`${API_BASE}/users`, TEST_CONFIG),
      axios.get(`${API_BASE}/farms`, TEST_CONFIG)
    ];
    
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const allSuccessful = responses.every(response => 
      response.status === 200 && response.data.success
    );
    
    if (allSuccessful) {
      logTest('Performance - Concurrent Requests', true);
      console.log(`   Duration: ${duration}ms for 4 concurrent requests`);
      console.log(`   Average: ${(duration / 4).toFixed(1)}ms per request`);
    } else {
      logTest('Performance - Concurrent Requests', false, 'Some concurrent requests failed');
    }
  } catch (error) {
    logTest('Performance - Concurrent Requests', false, error.message);
  }
};

// Main test execution
const runAllTests = async () => {
  console.log('🚀 Starting Admin Dashboard System Tests...\n');
  
  // Test core functionality
  logSection('Core Dashboard Functionality');
  await testDashboardOverview();
  await testSystemStats();
  
  // Test management systems
  logSection('Management Systems');
  await testUserManagement();
  await testFarmManagement();
  await testCarbonCreditManagement();
  await testTransactionManagement();
  
  // Test system monitoring
  logSection('System Monitoring');
  await testSystemHealth();
  await testBlockchainStatus();
  
  // Test compliance and export
  logSection('Compliance & Export');
  await testAuditLogs();
  await testDataExport();
  
  // Test error handling and performance
  logSection('Error Handling & Performance');
  await testErrorHandling();
  await testPerformance();
  
  // Display test summary
  logSummary();
};

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test execution failed:', error.message);
  process.exit(1);
});
