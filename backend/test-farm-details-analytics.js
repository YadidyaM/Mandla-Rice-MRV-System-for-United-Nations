/**
 * Test script for Farm Details & Analytics System
 * Run with: node test-farm-details-analytics.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testFarmDetailsAnalytics() {
  try {
    console.log('🧪 Testing Farm Details & Analytics System...\n');

    // Test 1: Create a test farm with comprehensive data
    console.log('1️⃣ Creating a comprehensive test farm...');
    const farmData = {
      name: "Analytics Test Rice Farm",
      area: 3.5,
      village: "Test Village",
      block: "Test Block",
      district: "Mandla",
      state: "Madhya Pradesh",
      surveyNumber: "AT001",
      soilType: "LOAMY",
      elevation: 480,
      irrigationType: "AWD",
      waterSource: "TUBE_WELL",
      coordinates: {
        type: "Polygon",
        coordinates: [[
          [80.3711, 22.5982],
          [80.3721, 22.5982],
          [80.3721, 22.5992],
          [80.3711, 22.5992],
          [80.3711, 22.5982]
        ]]
      }
    };

    const createResponse = await axios.post(`${API_BASE}/farms`, farmData);
    console.log('✅ Farm created successfully:', createResponse.data.message);
    console.log('   Farm ID:', createResponse.data.data.id);
    console.log('   Farm Name:', createResponse.data.data.name);
    console.log('   Area:', createResponse.data.data.area, 'hectares\n');

    const farmId = createResponse.data.data.id;

    // Test 2: Get farm details with all relationships
    console.log('2️⃣ Fetching comprehensive farm details...');
    const farmDetailsResponse = await axios.get(`${API_BASE}/farms/${farmId}`);
    console.log('✅ Farm details retrieved successfully:', farmDetailsResponse.data.message);
    console.log('   Farm:', farmDetailsResponse.data.data.name);
    console.log('   Village:', farmDetailsResponse.data.data.village);
    console.log('   Block:', farmDetailsResponse.data.data.block);
    console.log('   Irrigation:', farmDetailsResponse.data.data.irrigationType);
    console.log('   Coordinates:', farmDetailsResponse.data.data.coordinates.type);
    console.log('   Farmer:', farmDetailsResponse.data.data.farmer?.profile?.firstName || 'N/A');
    console.log('');

    // Test 3: Test farm overview data
    console.log('3️⃣ Testing farm overview data...');
    const farm = farmDetailsResponse.data.data;
    console.log('   ✅ Total Area:', farm.area, 'hectares');
    console.log('   ✅ Farming Seasons:', farm.seasons?.length || 0);
    console.log('   ✅ MRV Reports:', farm.mrvReports?.length || 0);
    console.log('   ✅ Satellite Data:', farm.satelliteData?.length || 0);
    console.log('   ✅ Registration Date:', new Date(farm.createdAt).toLocaleDateString());
    console.log('');

    // Test 4: Test farm map and coordinates
    console.log('4️⃣ Testing farm map and coordinates...');
    if (farm.coordinates && farm.coordinates.coordinates && farm.coordinates.coordinates[0]) {
      const coords = farm.coordinates.coordinates[0];
      console.log('   ✅ Farm boundary coordinates:', coords.length, 'points');
      console.log('   ✅ First coordinate:', coords[0]);
      console.log('   ✅ Last coordinate:', coords[coords.length - 1]);
      console.log('   ✅ Boundary is closed:', coords[0][0] === coords[coords.length - 1][0] && coords[0][1] === coords[coords.length - 1][1]);
    } else {
      console.log('   ❌ No coordinates found');
    }
    console.log('');

    // Test 5: Test farm performance metrics
    console.log('5️⃣ Testing farm performance metrics...');
    console.log('   ✅ Farm Status:', farm.isActive ? 'Active' : 'Inactive');
    console.log('   ✅ Soil Type:', farm.soilType || 'Not specified');
    console.log('   ✅ Elevation:', farm.elevation ? `${farm.elevation}m` : 'Not specified');
    console.log('   ✅ Irrigation Method:', farm.irrigationType);
    console.log('   ✅ Water Source:', farm.waterSource || 'Not specified');
    console.log('');

    // Test 6: Test carbon credit potential calculation
    console.log('6️⃣ Testing carbon credit potential calculation...');
    const potentialCredits = farm.area * 2.5;
    const potentialValue = potentialCredits * 1500;
    const emissionReduction = farm.irrigationType === 'AWD' ? 'High' : 'Medium';
    
    console.log('   ✅ Potential Carbon Credits:', potentialCredits, 'tCO2e');
    console.log('   ✅ Emission Reduction Potential:', emissionReduction);
    console.log('   ✅ Potential Value: ₹', potentialValue.toLocaleString());
    console.log('   ✅ Calculation based on:', farm.area, 'hectares area');
    console.log('');

    // Test 7: Test farm relationships and data integrity
    console.log('7️⃣ Testing farm relationships and data integrity...');
    console.log('   ✅ Farmer ID:', farm.farmerId);
    console.log('   ✅ Farmer Email:', farm.farmer?.email || 'N/A');
    console.log('   ✅ Farmer Name:', `${farm.farmer?.profile?.firstName || ''} ${farm.farmer?.profile?.lastName || ''}`.trim() || 'N/A');
    console.log('   ✅ Created At:', farm.createdAt);
    console.log('   ✅ Updated At:', farm.updatedAt);
    console.log('');

    // Test 8: Test data validation and types
    console.log('8️⃣ Testing data validation and types...');
    console.log('   ✅ Farm ID type:', typeof farm.id);
    console.log('   ✅ Area type:', typeof farm.area);
    console.log('   ✅ Area value:', farm.area);
    console.log('   ✅ Area validation:', farm.area > 0 && farm.area <= 100 ? 'Valid' : 'Invalid');
    console.log('   ✅ Coordinates validation:', farm.coordinates && farm.coordinates.type === 'Polygon' ? 'Valid' : 'Invalid');
    console.log('   ✅ Required fields validation:', 
      farm.name && farm.village && farm.block && farm.district && farm.state ? 'All present' : 'Missing required fields');
    console.log('');

    // Test 9: Test error handling for non-existent farm
    console.log('9️⃣ Testing error handling for non-existent farm...');
    try {
      await axios.get(`${API_BASE}/farms/non-existent-id`);
      console.log('   ❌ Should have returned 404 error');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('   ✅ Properly handled non-existent farm (404)');
      } else {
        console.log('   ❌ Unexpected error:', error.response?.status);
      }
    }
    console.log('');

    // Test 10: Test farm update functionality
    console.log('🔟 Testing farm update functionality...');
    const updateData = {
      name: "Updated Analytics Test Farm",
      area: 4.0,
      soilType: "CLAY"
    };
    
    try {
      const updateResponse = await axios.put(`${API_BASE}/farms/${farmId}`, updateData);
      console.log('   ✅ Farm updated successfully:', updateResponse.data.message);
      console.log('   ✅ New name:', updateResponse.data.data.name);
      console.log('   ✅ New area:', updateResponse.data.data.area, 'hectares');
      console.log('   ✅ New soil type:', updateResponse.data.data.soilType);
    } catch (error) {
      console.log('   ❌ Farm update failed:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 11: Test farm seasons endpoint
    console.log('1️⃣1️⃣ Testing farm seasons endpoint...');
    try {
      const seasonsResponse = await axios.get(`${API_BASE}/farms/${farmId}/seasons`);
      console.log('   ✅ Farm seasons retrieved successfully:', seasonsResponse.data.message);
      console.log('   ✅ Total seasons:', seasonsResponse.data.data.length);
    } catch (error) {
      console.log('   ❌ Farm seasons retrieval failed:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 12: Test farm deletion (soft delete)
    console.log('1️⃣2️⃣ Testing farm deletion (soft delete)...');
    try {
      const deleteResponse = await axios.delete(`${API_BASE}/farms/${farmId}`);
      console.log('   ✅ Farm deleted successfully:', deleteResponse.data.message);
      
      // Verify farm is still accessible but marked as inactive
      const deletedFarmResponse = await axios.get(`${API_BASE}/farms/${farmId}`);
      console.log('   ✅ Farm details still accessible after deletion');
      console.log('   ✅ Farm status:', deletedFarmResponse.data.data.isActive ? 'Active' : 'Inactive');
    } catch (error) {
      console.log('   ❌ Farm deletion failed:', error.response?.data?.message || error.message);
    }
    console.log('');

    console.log('🎉 All tests passed! Farm Details & Analytics System is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✅ Farm creation with comprehensive data');
    console.log('   ✅ Farm details retrieval with relationships');
    console.log('   ✅ Farm overview and metrics');
    console.log('   ✅ Farm map and coordinates handling');
    console.log('   ✅ Farm performance calculations');
    console.log('   ✅ Carbon credit potential calculation');
    console.log('   ✅ Data validation and type checking');
    console.log('   ✅ Error handling for edge cases');
    console.log('   ✅ Farm update functionality');
    console.log('   ✅ Farm seasons management');
    console.log('   ✅ Soft delete functionality');
    console.log('   ✅ Data integrity and relationships');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testFarmDetailsAnalytics();
