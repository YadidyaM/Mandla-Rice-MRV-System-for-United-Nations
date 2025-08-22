import 'dotenv/config';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.WEB3_PROVIDER_URL);
const wallet = new ethers.Wallet(process.env.WEB3_PRIVATE_KEY, provider);

// Carbon Credit Contract ABI
const ABI = [
  "function registerFarm(string farmId, string location)",
  "function mintCarbonCredit(string farmId, uint256 emissionReduction, string metadataURI)",
  "function verifyCarbonCredit(uint256 tokenId, string verificationMethod)",
  "function getCarbonCredit(uint256 tokenId) view returns (tuple(uint256,address,string,uint256,uint256,string,bool,bool,string))",
  "function getFarm(string farmId) view returns (tuple(string,address,uint256,uint256,bool,string,uint256))",
  "function totalCarbonCredits() view returns (uint256)",
  "function totalEmissionReduction() view returns (uint256)"
];

const main = async () => {
  try {
    if (!process.env.CONTRACT_ADDRESS) {
      console.error('❌ CONTRACT_ADDRESS not set in .env');
      process.exit(1);
    }
    
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);
    console.log('🔍 Testing Carbon Credit Contract...\n');
    console.log('Contract Address:', process.env.CONTRACT_ADDRESS);
    console.log('Wallet Address:', await wallet.getAddress());
    
    // Check total credits
    const totalCredits = await contract.totalCarbonCredits();
    console.log('Total Carbon Credits:', totalCredits.toString());
    
    // Check total emission reduction
    const totalReduction = await contract.totalEmissionReduction();
    console.log('Total Emission Reduction (kg CO2e):', totalReduction.toString());
    
    // Test farm registration
    const farmId = `FARM_${Date.now()}`;
    const location = "22.5982,80.3711"; // Mandla, MP coordinates
    
    console.log(`\n🏡 Registering farm: ${farmId}`);
    const tx = await contract.registerFarm(farmId, location);
    await tx.wait();
    console.log('✅ Farm registered successfully');
    
    // Get farm details
    const farm = await contract.getFarm(farmId);
    console.log('Farm Details:', {
      farmId: farm[0],
      farmer: farm[1],
      totalCredits: farm[2].toString(),
      totalRetired: farm[3].toString(),
      active: farm[4],
      location: farm[5],
      registrationDate: new Date(Number(farm[6]) * 1000).toISOString()
    });
    
    // Test carbon credit minting
    const emissionReduction = ethers.parseUnits("100", 0); // 100 kg CO2e
    const metadataURI = "ipfs://QmTestHash123"; // Mock IPFS hash
    
    console.log(`\n🌱 Minting carbon credit: ${ethers.formatUnits(emissionReduction, 0)} kg CO2e`);
    const mintTx = await contract.mintCarbonCredit(farmId, emissionReduction, metadataURI);
    await mintTx.wait();
    console.log('✅ Carbon credit minted successfully');
    
    // Get the minted credit
    const newTotalCredits = await contract.totalCarbonCredits();
    const credit = await contract.getCarbonCredit(newTotalCredits);
    console.log('New Carbon Credit:', {
      tokenId: credit[0].toString(),
      farmer: credit[1],
      farmId: credit[2],
      emissionReduction: ethers.formatUnits(credit[3], 0) + ' kg CO2e',
      timestamp: new Date(Number(credit[4]) * 1000).toISOString(),
      metadataURI: credit[5],
      verified: credit[6],
      retired: credit[7],
      verificationMethod: credit[8]
    });
    
    console.log('\n🎉 All tests passed! Your carbon credit system is working!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
};

main();
