const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🚀 Deploying AquaHope DeFi/ReFi System...");

  // Deploy contracts in order
  console.log("\n1️⃣ Deploying AquaHope Impact Token (AIT)...");
  const AquaHopeImpactToken = await hre.ethers.getContractFactory("AquaHopeImpactToken");
  const aitToken = await AquaHopeImpactToken.deploy();
  await aitToken.waitForDeployment();
  const aitTokenAddress = await aitToken.getAddress();
  console.log("✅ AIT Token deployed to:", aitTokenAddress);

  console.log("\n2️⃣ Deploying DeFi Yield Pool...");
  const DeFiYieldPool = await hre.ethers.getContractFactory("DeFiYieldPool");
  const yieldPool = await DeFiYieldPool.deploy();
  await yieldPool.waitForDeployment();
  const yieldPoolAddress = await yieldPool.getAddress();
  console.log("✅ Yield Pool deployed to:", yieldPoolAddress);

  console.log("\n3️⃣ Deploying Governance Contract...");
  const AquaHopeGovernance = await hre.ethers.getContractFactory("AquaHopeGovernance");
  const governance = await AquaHopeGovernance.deploy(aitTokenAddress);
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("✅ Governance deployed to:", governanceAddress);

  console.log("\n4️⃣ Deploying Donor Badge NFT...");
  const DonorBadgeNFT = await hre.ethers.getContractFactory("DonorBadgeNFT");
  const badgeNFT = await DonorBadgeNFT.deploy();
  await badgeNFT.waitForDeployment();
  const badgeNFTAddress = await badgeNFT.getAddress();
  console.log("✅ Badge NFT deployed to:", badgeNFTAddress);

  console.log("\n5️⃣ Deploying Main Donation Contract...");
  const AquaHopeDonation = await hre.ethers.getContractFactory("AquaHopeDonation");
  const donation = await AquaHopeDonation.deploy();
  await donation.waitForDeployment();
  const donationAddress = await donation.getAddress();
  console.log("✅ Donation Contract deployed to:", donationAddress);

  // Set integration contracts
  console.log("\n6️⃣ Setting up contract integrations...");
  const [deployer] = await hre.ethers.getSigners();
  
  await donation.setIntegrationContracts(
    aitTokenAddress,
    yieldPoolAddress,
    governanceAddress,
    badgeNFTAddress
  );
  console.log("✅ Contract integrations configured");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      donation: donationAddress,
      aitToken: aitTokenAddress,
      yieldPool: yieldPoolAddress,
      governance: governanceAddress,
      badgeNFT: badgeNFTAddress
    }
  };

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments');
  }

  // Save to JSON file
  fs.writeFileSync(
    `./deployments/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Update frontend configuration
  const contractConfig = `// Contract configuration - Auto-generated
export const CONTRACT_CONFIG = {
  // Main donation contract
  DONATION_ADDRESS: "${donationAddress}",
  
  // Integration contracts
  AIT_TOKEN_ADDRESS: "${aitTokenAddress}",
  YIELD_POOL_ADDRESS: "${yieldPoolAddress}",
  GOVERNANCE_ADDRESS: "${governanceAddress}",
  BADGE_NFT_ADDRESS: "${badgeNFTAddress}",
  
  // Contract ABIs - these will be generated after compilation
  DONATION_ABI: [
    // Add your contract ABI here
  ],
  AIT_TOKEN_ABI: [
    // Add your contract ABI here
  ],
  GOVERNANCE_ABI: [
    // Add your contract ABI here
  ],
  BADGE_NFT_ABI: [
    // Add your contract ABI here
  ]
};

// Network configurations
export const NETWORKS = {
  localhost: {
    chainId: 1337,
    name: "Localhost",
    rpcUrl: "http://localhost:8545"
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
  },
  mainnet: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID"
  }
};

// DeFi/ReFi Configuration
export const DEFI_CONFIG = {
  TOKENS_PER_ETH: 1000, // 1000 AIT per ETH donated
  VOTING_PERIOD: 7 * 24 * 60 * 60, // 7 days in seconds
  YIELD_MAINTENANCE_PERCENTAGE: 30, // 30% of yield for maintenance
  YIELD_PROJECT_PERCENTAGE: 70, // 70% of yield for new projects
  BADGE_THRESHOLDS: {
    BRONZE: 0.01, // 0.01 ETH
    SILVER: 0.1,  // 0.1 ETH
    GOLD: 1,      // 1 ETH
    PLATINUM: 10, // 10 ETH
    DIAMOND: 100  // 100 ETH
  }
};`;

  fs.writeFileSync('./frontend/src/contracts/contractConfig.js', contractConfig);

  console.log("\n🎉 Deployment Complete!");
  console.log("📋 Contract Addresses:");
  console.log(`   Donation: ${donationAddress}`);
  console.log(`   AIT Token: ${aitTokenAddress}`);
  console.log(`   Yield Pool: ${yieldPoolAddress}`);
  console.log(`   Governance: ${governanceAddress}`);
  console.log(`   Badge NFT: ${badgeNFTAddress}`);
  
  console.log("\n📁 Files Updated:");
  console.log("   - frontend/src/contracts/contractConfig.js");
  console.log(`   - deployments/${hre.network.name}.json`);
  
  console.log("\n🔧 Next Steps:");
  console.log("   1. Update your .env files with the contract addresses");
  console.log("   2. Configure email service in backend/.env");
  console.log("   3. Start the backend server: cd backend && npm start");
  console.log("   4. Start the frontend: cd frontend && npm run dev");
  console.log("   5. Test the donation flow and token generation");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

