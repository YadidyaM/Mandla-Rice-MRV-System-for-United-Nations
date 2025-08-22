import 'dotenv/config';
import axios from 'axios';

const main = async () => {
  try {
    console.log('🔍 Testing Copernicus CDSE Connectivity...\n');
    
    // Step 1: Get access token
    console.log('1️⃣ Getting access token...');
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
    console.log('✅ Access token received successfully');
    console.log(`   Token expires in: ${tokenResponse.data.expires_in} seconds\n`);
    
    // Step 2: Discover available collections
    console.log('2️⃣ Discovering available collections...');
    const collectionsResponse = await axios.get(
      `${process.env.CDSE_STAC_URL}/collections`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    console.log('✅ Collections discovered successfully');
    console.log(`   Total collections: ${collectionsResponse.data.collections?.length || 0}`);
    
    // Find Sentinel collections
    const sentinelCollections = collectionsResponse.data.collections?.filter(
      col => col.id.toLowerCase().includes('sentinel')
    ) || [];
    
    console.log(`   Sentinel collections found: ${sentinelCollections.length}`);
    sentinelCollections.forEach(col => {
      console.log(`   • ${col.id} - ${col.title || 'No title'}`);
    });
    
    if (sentinelCollections.length === 0) {
      console.log('\n⚠️  No Sentinel collections found. Available collections:');
      collectionsResponse.data.collections?.slice(0, 5).forEach(col => {
        console.log(`   • ${col.id}`);
      });
      if (collectionsResponse.data.collections?.length > 5) {
        console.log(`   ... and ${collectionsResponse.data.collections.length - 5} more`);
      }
      return;
    }
    
    // Step 3: Test with first available Sentinel collection
    const testCollection = sentinelCollections[0];
    console.log(`\n3️⃣ Testing collection: ${testCollection.id}`);
    
    const itemsResponse = await axios.get(
      `${process.env.CDSE_STAC_URL}/collections/${testCollection.id}/items?limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    console.log('✅ Data access successful');
    console.log(`   Items found: ${itemsResponse.data.features?.length || 0}`);
    
    if (itemsResponse.data.features?.[0]) {
      const item = itemsResponse.data.features[0];
      console.log(`   Sample item ID: ${item.id}`);
      console.log(`   Date: ${item.properties?.datetime || 'N/A'}`);
      console.log(`   Cloud cover: ${item.properties?.['eo:cloud_cover'] || 'N/A'}%`);
    }
    
    console.log('\n🎉 CDSE connection successful!');
    console.log('\n📡 Update your .env with the correct collection names:');
    sentinelCollections.forEach(col => {
      console.log(`   CDSE_${col.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_COLLECTION="${col.id}"`);
    });
    
  } catch (error) {
    console.error('❌ CDSE test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('   Authentication failed - check your CLIENT_ID and CLIENT_SECRET');
    } else if (error.response?.status === 403) {
      console.error('   Access denied - check your CDSE account permissions');
    } else if (error.response?.status === 404) {
      console.error('   Collection not found - check collection names');
    }
    process.exit(1);
  }
};

main();
