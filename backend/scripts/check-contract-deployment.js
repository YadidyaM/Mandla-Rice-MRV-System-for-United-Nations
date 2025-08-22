import 'dotenv/config';
import { ethers } from 'ethers';

const main = async () => {
  try {
    console.log('🔍 Checking Contract Deployment Status...\n');
    
    const provider = new ethers.JsonRpcProvider(process.env.WEB3_PROVIDER_URL);
    const contractAddress = process.env.CARBON_CREDIT_CONTRACT_ADDRESS || "0x851a15a57F6fE3E2390e386664C7d9fC505Ca207";
    
    console.log('📍 Contract Address:', contractAddress);
    console.log('🌐 Network: Polygon Amoy (Chain ID: 80002)\n');
    
    // Check if there's code at the address
    const code = await provider.getCode(contractAddress);
    console.log('1️⃣ Contract Code Length:', code.length);
    
    if (code === '0x') {
      console.log('❌ No contract found at this address!');
      console.log('   This could mean:');
      console.log('   • Contract was not deployed');
      console.log('   • Wrong address provided');
      console.log('   • Contract was self-destructed');
      console.log('   • Wrong network');
      console.log('\n💡 Please check:');
      console.log('   1. Verify the contract address from Remix deployment');
      console.log('   2. Ensure you deployed to Polygon Amoy (Chain ID: 80002)');
      console.log('   3. Check the transaction on PolygonScan Amoy');
    } else {
      console.log('✅ Contract found! Code present at address');
      console.log('   Contract bytecode size:', (code.length - 2) / 2, 'bytes');
      
      // Try to get transaction count to verify it's a contract
      const txCount = await provider.getTransactionCount(contractAddress);
      console.log('   Transaction count:', txCount);
      
      // Get balance
      const balance = await provider.getBalance(contractAddress);
      console.log('   Contract balance:', ethers.formatEther(balance), 'MATIC');
      
      console.log('\n✅ Contract is properly deployed!');
    }
    
    // Additional network verification
    const network = await provider.getNetwork();
    console.log('\n🌐 Network Details:');
    console.log('   Chain ID:', network.chainId.toString());
    console.log('   Network Name:', network.name);
    console.log('   Block Number:', await provider.getBlockNumber());
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
    process.exit(1);
  }
};

main();
