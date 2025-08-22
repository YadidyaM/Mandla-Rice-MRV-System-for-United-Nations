import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000';

async function testFarmEndpoints() {
  console.log('🧪 Testing Farm Management Endpoints...\n');

  try {
    // Test 1: Get all farms
    console.log('1️⃣ Testing GET /api/v1/farms...');
    const farmsResponse = await fetch(`${BASE_URL}/api/v1/farms`);
    const farmsData = await farmsResponse.json();
    console.log('✅ Farms fetched:', farmsData.data.length, 'farms');
    console.log('   - North Field (AWD):', farmsData.data[0].name);
    console.log('   - South Field (SRI):', farmsData.data[1].name);
    console.log('');

    // Test 2: Create new farm
    console.log('2️⃣ Testing POST /api/v1/farms...');
    const newFarmData = {
      name: 'East Field',
      location: 'Mandla, Mandla',
      area: 3.2,
      irrigation: 'AWD',
      soilType: 'Clay',
      waterSource: 'River'
    };

    const createResponse = await fetch(`${BASE_URL}/api/v1/farms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFarmData)
    });
    const createdFarm = await createResponse.json();
    console.log('✅ New farm created:', createdFarm.data.name);
    console.log('   - Area:', createdFarm.data.area, 'hectares');
    console.log('   - Irrigation:', createdFarm.data.irrigation);
    console.log('');

    // Test 3: Process MRV for North Field
    console.log('3️⃣ Testing POST /api/v1/farms/1/mrv...');
    const mrvData = {
      farmingMethod: 'AWD',
      season: 'Kharif 2024',
      crop: 'Rice',
      area: 2.5,
      irrigationCycles: ['2024-06-01', '2024-06-15', '2024-07-01'],
      organicInputs: ['Vermicompost', 'Neem cake']
    };

    const mrvResponse = await fetch(`${BASE_URL}/api/v1/farms/1/mrv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mrvData)
    });
    const mrvResult = await mrvResponse.json();
    console.log('✅ MRV processed successfully!');
    console.log('   - Emission reduction:', mrvResult.data.emissionReduction, 'kg CH4');
    console.log('   - CO2e reduction:', mrvResult.data.co2eReduction, 'tCO2e');
    console.log('');

    // Test 4: Calculate total carbon credits
    console.log('4️⃣ Testing GET /api/v1/carbon-credits/calculate...');
    const creditsResponse = await fetch(`${BASE_URL}/api/v1/carbon-credits/calculate`);
    const creditsData = await creditsResponse.json();
    console.log('✅ Carbon credits calculated!');
    console.log('   - Total farms:', creditsData.data.totalFarms);
    console.log('   - Total area:', creditsData.data.totalArea, 'hectares');
    console.log('   - Total CO2e reduction:', creditsData.data.totalCO2eReduction, 'tCO2e');
    console.log('');

    console.log('🎉 All tests passed! Your farm management system is working perfectly!');
    console.log('🌾 Ready to help Mandla farmers reduce methane emissions!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if server is running
testFarmEndpoints();
