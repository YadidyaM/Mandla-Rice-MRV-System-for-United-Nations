import 'dotenv/config';
import { ethers } from 'ethers';

// Basic ERC1155 ABI - minimal functions
const basicABI = [
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
  "function isApprovedForAll(address account, address operator) view returns (bool)",
  "function uri(uint256 id) view returns (string)",
  // AccessControl functions
  "function hasRole(bytes32 role, address account) view returns (bool)",
  // Pausable functions  
  "function paused() view returns (bool)",
  // Events
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)"
];

const main = async () => {
  try {
    console.log('🔍 Testing Basic Contract Functions...\n');
    
    const provider = new ethers.JsonRpcProvider(process.env.WEB3_PROVIDER_URL);
    const wallet = new ethers.Wallet(process.env.WEB3_PRIVATE_KEY, provider);
    const contractAddress = process.env.CARBON_CREDIT_CONTRACT_ADDRESS || "0x851a15a57F6fE3E2390e386664C7d9fC505Ca207";
    
    console.log('📍 Contract:', contractAddress);
    console.log('📍 Wallet:', wallet.address);
    
    const contract = new ethers.Contract(contractAddress, basicABI, provider);
    
    // Test 1: ERC1155 Interface Support
    console.log('\n1️⃣ Testing ERC1155 interface support...');
    try {
      const erc1155InterfaceId = "0xd9b67a26";
      const supportsERC1155 = await contract.supportsInterface(erc1155InterfaceId);
      console.log('✅ Supports ERC1155:', supportsERC1155);
    } catch (error) {
      console.log('❌ Interface test failed:', error.message.substring(0, 100) + '...');
    }
    
    // Test 2: Check Balance
    console.log('\n2️⃣ Testing balance check...');
    try {
      const balance = await contract.balanceOf(wallet.address, 1);
      console.log('✅ Token ID 1 balance:', balance.toString());
    } catch (error) {
      console.log('❌ Balance test failed:', error.message.substring(0, 100) + '...');
    }
    
    // Test 3: Check if paused
    console.log('\n3️⃣ Testing pausable state...');
    try {
      const isPaused = await contract.paused();
      console.log('✅ Contract paused:', isPaused);
    } catch (error) {
      console.log('❌ Pause test failed:', error.message.substring(0, 100) + '...');
    }
    
    // Test 4: Check role (using zero hash as test)
    console.log('\n4️⃣ Testing role check...');
    try {
      const zeroRole = "0x0000000000000000000000000000000000000000000000000000000000000000";
      const hasRole = await contract.hasRole(zeroRole, wallet.address);
      console.log('✅ Has zero role:', hasRole);
    } catch (error) {
      console.log('❌ Role test failed:', error.message.substring(0, 100) + '...');
    }
    
    console.log('\n🎉 Basic contract testing completed!');
    console.log('\n📝 Next Steps:');
    console.log('   • If tests pass: Contract is working properly');
    console.log('   • If tests fail: Need to check ABI compatibility');
    console.log('   • Ready to integrate with backend services');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
};

main();
