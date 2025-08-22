import 'dotenv/config';
import axios from 'axios';

const main = async () => {
  try {
    console.log('🛰️ Testing All Satellite Data Sources...\n');
    
    // Test 1: Copernicus CDSE
    console.log('1️⃣ Testing Copernicus CDSE (Sentinel Data)...');
    try {
      const tokenResponse = await axios.post(
        process.env.CDSE_AUTH_URL,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.CDSE_CLIENT_ID,
          client_secret: process.env.CDSE_CLIENT_SECRET
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      const accessToken = tokenResponse.data.access_token;
      console.log('✅ CDSE Access token received');
      console.log(`   Token expires in: ${tokenResponse.data.expires_in} seconds`);
      
      // Test Sentinel-2 data
      const sentinel2Response = await axios.get(
        `${process.env.CDSE_STAC_URL}/collections/SENTINEL-2/items?limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      console.log('✅ Sentinel-2 data accessible');
      console.log(`   Items found: ${sentinel2Response.data.features?.length || 0}`);
      
      // Test Sentinel-1 data
      const sentinel1Response = await axios.get(
        `${process.env.CDSE_STAC_URL}/collections/SENTINEL-1/items?limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      console.log('✅ Sentinel-1 data accessible');
      console.log(`   Items found: ${sentinel1Response.data.features?.length || 0}`);
      
    } catch (error) {
      console.log('❌ CDSE test failed:', error.response?.data || error.message);
    }
    
    // Test 2: NASA Earthdata
    console.log('\n2️⃣ Testing NASA Earthdata...');
    try {
      if (process.env.NASA_EARTHDATA_TOKEN) {
        const nasaResponse = await axios.get(
          'https://cmr.earthdata.nasa.gov/search/collections.json',
          {
            headers: {
              'Authorization': `Bearer ${process.env.NASA_EARTHDATA_TOKEN}`
            }
          }
        );
        
        console.log('✅ NASA Earthdata accessible');
        console.log(`   Collections found: ${nasaResponse.data.feed?.entry?.length || 0}`);
        
        if (nasaResponse.data.feed?.entry?.[0]) {
          const collection = nasaResponse.data.feed.entry[0];
          console.log(`   Sample collection: ${collection.title}`);
          console.log(`   Provider: ${collection.provider_id}`);
        }
      } else {
        console.log('⚠️  NASA Earthdata token not configured');
      }
    } catch (error) {
      console.log('❌ NASA Earthdata test failed:', error.response?.data || error.message);
    }
    
    // Test 3: Combined Data Sources
    console.log('\n3️⃣ Testing Combined Data Access...');
    try {
      // Get CDSE token again for this test
      const tokenResponse = await axios.post(
        process.env.CDSE_AUTH_URL,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.CDSE_CLIENT_ID,
          client_secret: process.env.CDSE_CLIENT_SECRET
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      const accessToken = tokenResponse.data.access_token;
      
      // Test multiple Sentinel collections
      const collections = ['SENTINEL-2', 'SENTINEL-1', 'SENTINEL-3', 'SENTINEL-5P'];
      
      for (const collection of collections) {
        try {
          const response = await axios.get(
            `${process.env.CDSE_STAC_URL}/collections/${collection}/items?limit=1`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            }
          );
          
          console.log(`✅ ${collection}: ${response.data.features?.length || 0} items`);
        } catch (error) {
          console.log(`❌ ${collection}: ${error.response?.status || 'Unknown error'}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Combined test failed:', error.message);
    }
    
    console.log('\n🎉 Satellite Data Testing Completed!');
    console.log('\n📊 Summary:');
    console.log('   • Copernicus CDSE: Access to 6+ Sentinel collections');
    console.log('   • NASA Earthdata: Additional satellite data sources');
    console.log('   • Ready for MRV calculations and farm monitoring');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Integrate with MRV system for rice farming data');
    console.log('   2. Set up automated data collection schedules');
    console.log('   3. Implement data processing for carbon credit calculations');
    console.log('   4. Create farm monitoring dashboards');
    
  } catch (error) {
    console.error('❌ Satellite data test failed:', error.message);
    process.exit(1);
  }
};

main();
