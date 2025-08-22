const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Mandla Rice Carbon Credit contract...");

  // Get the contract factory
  const MandlaRiceCarbonCredit = await ethers.getContractFactory("MandlaRiceCarbonCredit");

  // Deploy parameters
  const baseURI = "https://api.mandla-mrv.org/metadata/";
  const [deployer] = await ethers.getSigners();
  const adminAddress = deployer.address;

  console.log("📍 Deploying with the account:", adminAddress);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(adminAddress)).toString());
  console.log("🌐 Base URI:", baseURI);

  // Deploy the contract
  const contract = await MandlaRiceCarbonCredit.deploy(baseURI, adminAddress);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ MandlaRiceCarbonCredit deployed to:", contractAddress);

  // Verify contract setup
  console.log("\n🔍 Verifying contract setup...");
  const name = await contract.name();
  const symbol = await contract.symbol();
  const version = await contract.version();
  
  console.log("📛 Name:", name);
  console.log("🏷️  Symbol:", symbol);
  console.log("📌 Version:", version);

  // Check roles
  const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
  const MINTER_ROLE = await contract.MINTER_ROLE();
  const PAUSER_ROLE = await contract.PAUSER_ROLE();
  const VERIFIER_ROLE = await contract.VERIFIER_ROLE();
  
  const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, adminAddress);
  const hasMinterRole = await contract.hasRole(MINTER_ROLE, adminAddress);
  const hasPauserRole = await contract.hasRole(PAUSER_ROLE, adminAddress);
  const hasVerifierRole = await contract.hasRole(VERIFIER_ROLE, adminAddress);

  console.log("\n👤 Role assignments:");
  console.log("   Admin role:", hasAdminRole ? "✅" : "❌");
  console.log("   Minter role:", hasMinterRole ? "✅" : "❌");
  console.log("   Pauser role:", hasPauserRole ? "✅" : "❌");
  console.log("   Verifier role:", hasVerifierRole ? "✅" : "❌");

  // Sample interaction
  console.log("\n🧪 Testing basic functionality...");
  
  try {
    // Check if contract is not paused
    const isPaused = await contract.paused();
    console.log("   Contract paused:", isPaused ? "❌ Yes" : "✅ No");

    // Test minting a sample credit (with mock data)
    console.log("   Testing credit minting...");
    const farmerId = deployer.address; // Using deployer as sample farmer
    const quantity = 100; // 1.00 tCO2e
    const vintage = 2024;
    const methodology = "IPCC 2019 Refinement";
    const farmId = "FARM_001";
    const seasonId = "KHARIF_2024";
    const mrvReportHash = "QmSampleHash123";

    const tx = await contract.mintCredit(
      farmerId,
      quantity,
      vintage,
      methodology,
      farmId,
      seasonId,
      mrvReportHash
    );
    
    const receipt = await tx.wait();
    console.log("   ✅ Sample credit minted! Transaction hash:", receipt?.hash);

    // Check the minted token
    const tokenId = 1; // First token
    const balance = await contract.balanceOf(farmerId, tokenId);
    console.log("   📊 Token balance:", balance.toString());

    const metadata = await contract.creditMetadata(tokenId);
    console.log("   🏷️  Credit quantity:", metadata.quantity.toString());
    console.log("   📅 Vintage year:", metadata.vintage.toString());
    console.log("   🔬 Methodology:", metadata.methodology);

  } catch (error) {
    console.log("   ⚠️  Test transaction failed:", error);
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Summary:");
  console.log("   Address:", contractAddress);
  console.log("   Network:", (await ethers.provider.getNetwork()).name);
  console.log("   Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("   Admin:", adminAddress);
  console.log("   Base URI:", baseURI);

  console.log("\n📝 Next steps:");
  console.log("   1. Verify contract on block explorer");
  console.log("   2. Grant roles to appropriate addresses");
  console.log("   3. Update backend with contract address");
  console.log("   4. Test integration with MRV system");

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: adminAddress,
    deploymentTime: new Date().toISOString(),
    baseURI,
    transactionHash: undefined, // Will be filled by hardhat
  };

  console.log("\n💾 Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
