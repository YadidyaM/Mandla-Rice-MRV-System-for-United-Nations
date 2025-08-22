import 'dotenv/config';
import { ethers } from 'ethers';

const main = async () => {
  try {
    console.log('🔍 Testing Polygon Amoy Basic Connectivity...\n');
    
    // Test 1: Provider Connection
    console.log('1️⃣ Testing RPC provider connection...');
    const provider = new ethers.JsonRpcProvider(process.env.WEB3_PROVIDER_URL || "https://polygon-amoy.g.alchemy.com/v2/KqKzBuL8_IJaDsZBYYVmR");
    
    const network = await provider.getNetwork();
    console.log('✅ Network connected successfully');
    console.log(`   Chain ID: ${network.chainId.toString()}`);
    console.log(`   Network: ${network.name || 'Polygon Amoy Testnet'}`);
    
    // Test 2: Latest Block
    console.log('\n2️⃣ Testing block access...');
    const latestBlock = await provider.getBlockNumber();
    console.log('✅ Latest block number:', latestBlock);
    
    // Test 3: Gas Price
    console.log('\n3️⃣ Testing gas price...');
    const gasPrice = await provider.getFeeData();
    console.log('✅ Gas price (Gwei):', ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'));
    
    // Test 4: Test Wallet Creation (without private key)
    console.log('\n4️⃣ Testing wallet creation...');
    const testWallet = ethers.Wallet.createRandom(provider);
    console.log('✅ Test wallet created successfully');
    console.log(`   Address: ${testWallet.address}`);
    console.log(`   Balance: ${ethers.formatEther(await provider.getBalance(testWallet.address))} MATIC`);
    
    console.log('\n🎯 Basic blockchain connectivity is working!');
    console.log('\n📝 Next steps:');
    console.log('   1. Create a .env file with your test wallet private key');
    console.log('   2. Get test MATIC from https://faucet.polygon.technology/');
    console.log('   3. Run the full blockchain test');
    
  } catch (error) {
    console.error('❌ Blockchain test failed:', error.message);
    if (error.message.includes('fetch')) {
      console.error('   Network connection failed - check your RPC URL');
    } else if (error.message.includes('rate limit')) {
      console.error('   Rate limit exceeded - try again later');
    }
    process.exit(1);
  }
};

main();
