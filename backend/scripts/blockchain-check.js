import 'dotenv/config';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.WEB3_PROVIDER_URL);
const wallet = new ethers.Wallet(process.env.WEB3_PRIVATE_KEY, provider);

const main = async () => {
  try {
    console.log('🔍 Checking Polygon Amoy connectivity...\n');
    
    // Check network
    const net = await provider.getNetwork();
    console.log('✅ Chain ID:', net.chainId.toString());
    console.log('✅ Network:', net.name || 'Polygon Amoy Testnet');
    
    // Check wallet
    const addr = await wallet.getAddress();
    console.log('✅ Wallet Address:', addr);
    
    // Check balance
    const bal = await provider.getBalance(addr);
    console.log('✅ Balance (MATIC):', ethers.formatEther(bal));
    
    // Check gas price
    const gasPrice = await provider.getFeeData();
    console.log('✅ Gas Price (Gwei):', ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'));
    
    console.log('\n🎯 All systems ready for Polygon Amoy!');
    
  } catch (error) {
    console.error('❌ Blockchain check failed:', error.message);
    process.exit(1);
  }
};

main();
