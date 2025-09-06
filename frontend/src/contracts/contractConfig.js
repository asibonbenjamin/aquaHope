// Contract configuration - Auto-generated
export const CONTRACT_CONFIG = {
  // Main donation contract
  DONATION_ADDRESS: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
  
  // Integration contracts
  AIT_TOKEN_ADDRESS: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  YIELD_POOL_ADDRESS: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
  GOVERNANCE_ADDRESS: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
  BADGE_NFT_ADDRESS: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
  
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
};