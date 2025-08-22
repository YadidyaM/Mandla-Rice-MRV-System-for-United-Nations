import 'dotenv/config';
import { ethers } from 'ethers';

const main = async () => {
  try {
    console.log('🔍 Verifying Contract on Polygon Amoy Explorer...\n');
    
    const contractAddress = process.env.CARBON_CREDIT_CONTRACT_ADDRESS || "0x851a15a57F6fE3E2390e386664C7d9fC505Ca207";
    
    console.log('📍 Contract Address:', contractAddress);
    console.log('🔗 Polygon Amoy Explorer URL:');
    console.log(`   https://amoy.polygonscan.com/address/${contractAddress}`);
    
    console.log('\n📝 What to check on the explorer:');
    console.log('   1. ✅ Contract Creation Transaction');
    console.log('   2. ✅ Contract Code (should show bytecode)');
    console.log('   3. ✅ Contract Verification Status');
    console.log('   4. ✅ Contract Type (should be ERC1155 compatible)');
    console.log('   5. ✅ Transaction History');
    
    console.log('\n🎯 If the contract shows:');
    console.log('   • ✅ "Contract" tab with bytecode → Contract is deployed');
    console.log('   • ✅ Creation transaction → Successfully deployed');
    console.log('   • ❌ "Not verified" → Need to verify on explorer');
    console.log('   • ❌ "No code" → Wrong address or network');
    
    const provider = new ethers.JsonRpcProvider(process.env.WEB3_PROVIDER_URL);
    
    // Get basic info
    const code = await provider.getCode(contractAddress);
    const balance = await provider.getBalance(contractAddress);
    const txCount = await provider.getTransactionCount(contractAddress);
    
    console.log('\n📊 On-chain Verification:');
    console.log(`   Code Size: ${(code.length - 2) / 2} bytes`);
    console.log(`   Balance: ${ethers.formatEther(balance)} MATIC`);
    console.log(`   Tx Count: ${txCount}`);
    
    if (code === '0x') {
      console.log('\n❌ NO CONTRACT FOUND!');
      console.log('   This address has no smart contract code.');
      console.log('   Please check:');
      console.log('   • Correct network (Polygon Amoy)');
      console.log('   • Correct address from Remix deployment');
      console.log('   • Deployment transaction was successful');
    } else {
      console.log('\n✅ CONTRACT VERIFIED ON-CHAIN');
      console.log('   The contract exists and has code.');
      console.log('   Issue might be with ABI or function calls.');
      
      console.log('\n🔧 Troubleshooting Steps:');
      console.log('   1. Verify contract on PolygonScan for better debugging');
      console.log('   2. Check if contract constructor completed successfully');
      console.log('   3. Ensure contract is not in a failed state');
      console.log('   4. Try calling functions from PolygonScan "Read Contract" tab');
    }
    
    console.log('\n🌐 Additional Resources:');
    console.log('   • Polygon Amoy Faucet: https://faucet.polygon.technology/');
    console.log('   • Polygon Amoy RPC: https://polygon-amoy.g.alchemy.com/v2/');
    console.log('   • PolygonScan Amoy: https://amoy.polygonscan.com/');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
};

main();
