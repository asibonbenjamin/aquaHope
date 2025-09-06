// Contract configuration
export const CONTRACT_CONFIG = {
  // Update this address after deploying the contract
  CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
  
  // Contract ABI - this will be generated after compilation
  CONTRACT_ABI: [
    {
      "inputs": [],
      "stateVariable": true,
      "name": "owner",
      "outputs": [{"type": "address", "name": ""}],
      "type": "function"
    },
    {
      "inputs": [],
      "stateVariable": true,
      "name": "totalDonations",
      "outputs": [{"type": "uint256", "name": ""}],
      "type": "function"
    },
    {
      "inputs": [],
      "stateVariable": true,
      "name": "totalDonors",
      "outputs": [{"type": "uint256", "name": ""}],
      "type": "function"
    },
    {
      "inputs": [
        {"type": "string", "name": "_name"},
        {"type": "string", "name": "_message"}
      ],
      "name": "donate",
      "outputs": [],
      "type": "function",
      "stateMutability": "payable"
    },
    {
      "inputs": [],
      "name": "getDonationCount",
      "outputs": [{"type": "uint256"}],
      "type": "function"
    },
    {
      "inputs": [{"type": "uint256", "name": "_index"}],
      "name": "getDonation",
      "outputs": [
        {"type": "address", "name": "donor"},
        {"type": "uint256", "name": "amount"},
        {"type": "string", "name": "name"},
        {"type": "uint256", "name": "timestamp"},
        {"type": "string", "name": "message"}
      ],
      "type": "function"
    },
    {
      "inputs": [{"type": "uint256", "name": "_count"}],
      "name": "getRecentDonations",
      "outputs": [
        {
          "type": "tuple[]",
          "name": "",
          "components": [
            {"type": "address", "name": "donor"},
            {"type": "uint256", "name": "amount"},
            {"type": "string", "name": "name"},
            {"type": "uint256", "name": "timestamp"},
            {"type": "string", "name": "message"}
          ]
        }
      ],
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getContractBalance",
      "outputs": [{"type": "uint256"}],
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawFunds",
      "outputs": [],
      "type": "function"
    },
    {
      "inputs": [{"type": "address", "name": "_newOwner"}],
      "name": "updateOwner",
      "outputs": [],
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "type": "address", "name": "donor"},
        {"indexed": false, "type": "uint256", "name": "amount"},
        {"indexed": false, "type": "string", "name": "name"},
        {"indexed": false, "type": "string", "name": "message"},
        {"indexed": false, "type": "uint256", "name": "timestamp"}
      ],
      "name": "DonationReceived",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "type": "address", "name": "owner"},
        {"indexed": false, "type": "uint256", "name": "amount"}
      ],
      "name": "FundsWithdrawn",
      "type": "event"
    }
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
