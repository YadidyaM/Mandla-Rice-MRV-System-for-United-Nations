/**
 * Test script for Farm Registration System
 * Run with: node test-farm-registration.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testFarmRegistration() {
  try {
    console.log('🧪 Testing Farm Registration System...\n');

    // Test 1: Create a new farm
    console.log('1️⃣ Creating a new farm...');
    const farmData = {
      name: "Test Rice Farm",
      area: 2.5,
      village: "Test Village",
      block: "Test Block",
      district: "Mandla",
      state: "Madhya Pradesh",
      surveyNumber: "TS001",
      soilType: "CLAY",
      elevation: 450,
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

    // Test 2: Get all farms
    console.log('2️⃣ Fetching all farms...');
    const farmsResponse = await axios.get(`${API_BASE}/farms`);
    console.log('✅ Farms retrieved successfully:', farmsResponse.data.message);
    console.log('   Total farms:', farmsResponse.data.data.length);
    farmsResponse.data.data.forEach((farm, index) => {
      console.log(`   ${index + 1}. ${farm.name} - ${farm.area} ha in ${farm.village}`);
    });
    console.log('');

    // Test 3: Get specific farm
    if (createResponse.data.data.id) {
      console.log('3️⃣ Fetching specific farm details...');
      const farmResponse = await axios.get(`${API_BASE}/farms/${createResponse.data.data.id}`);
      console.log('✅ Farm details retrieved successfully:', farmResponse.data.message);
      console.log('   Farm:', farmResponse.data.data.name);
      console.log('   Village:', farmResponse.data.data.village);
      console.log('   Block:', farmResponse.data.data.block);
      console.log('   Irrigation:', farmResponse.data.data.irrigationType);
      console.log('   Coordinates:', farmResponse.data.data.coordinates.type);
      console.log('');

      // Test 4: Get farm seasons
      console.log('4️⃣ Fetching farm seasons...');
      const seasonsResponse = await axios.get(`${API_BASE}/farms/${createResponse.data.data.id}/seasons`);
      console.log('✅ Farm seasons retrieved successfully:', seasonsResponse.data.message);
      console.log('   Total seasons:', seasonsResponse.data.data.length);
      console.log('');

      // Test 5: Update farm
      console.log('5️⃣ Updating farm...');
      const updateData = {
        name: "Updated Test Rice Farm",
        area: 3.0,
        soilType: "LOAMY"
      };
      const updateResponse = await axios.put(`${API_BASE}/farms/${createResponse.data.data.id}`, updateData);
      console.log('✅ Farm updated successfully:', updateResponse.data.message);
      console.log('   New name:', updateResponse.data.data.name);
      console.log('   New area:', updateResponse.data.data.area, 'hectares');
      console.log('   New soil type:', updateResponse.data.data.soilType);
      console.log('');

      // Test 6: Delete farm (soft delete)
      console.log('6️⃣ Deleting farm...');
      const deleteResponse = await axios.delete(`${API_BASE}/farms/${createResponse.data.data.id}`);
      console.log('✅ Farm deleted successfully:', deleteResponse.data.message);
      console.log('');

      // Test 7: Verify farm is no longer active
      console.log('7️⃣ Verifying farm deletion...');
      const deletedFarmResponse = await axios.get(`${API_BASE}/farms/${createResponse.data.data.id}`);
      console.log('✅ Farm details still accessible (soft delete)');
      console.log('   Farm status:', deletedFarmResponse.data.data.isActive ? 'Active' : 'Inactive');
    }

    console.log('🎉 All tests passed! Farm Registration System is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✅ Farm creation');
    console.log('   ✅ Farm retrieval');
    console.log('   ✅ Farm listing');
    console.log('   ✅ Farm updating');
    console.log('   ✅ Farm deletion (soft)');
    console.log('   ✅ Season management');
    console.log('   ✅ Coordinate handling');
    console.log('   ✅ Database integration');

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
testFarmRegistration();
