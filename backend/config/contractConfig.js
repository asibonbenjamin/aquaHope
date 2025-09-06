// Contract Configuration for Backend
// This file contains contract addresses and ABIs for the backend services

const CONTRACT_CONFIG = {
  // Contract Addresses (will be updated after deployment)
  DONATION_ADDRESS: process.env.DONATION_ADDRESS || "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  AIT_TOKEN_ADDRESS: process.env.AIT_TOKEN_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  YIELD_POOL_ADDRESS: process.env.YIELD_POOL_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  GOVERNANCE_ADDRESS: process.env.GOVERNANCE_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  BADGE_NFT_ADDRESS: process.env.BADGE_NFT_ADDRESS || "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",

  // Contract ABIs (minimal for backend operations)
  DONATION_ABI: [
    "function donate(string memory _name, string memory _email, string memory _message, string memory _location) external payable",
    "function getDonationCount() external view returns (uint256)",
    "function getDonation(uint256 _index) external view returns (tuple(address,uint256,string,string,string,uint256,string,string,bool,bool,uint256))",
    "function getDonationByTokenCode(uint256 _tokenCode) external view returns (tuple(address,uint256,string,string,string,uint256,string,string,bool,bool))",
    "function mintTokensAndBadge(uint256 donationIndex) external",
    "function totalDonations() external view returns (uint256)",
    "function totalDonors() external view returns (uint256)",
    "function getContractBalance() external view returns (uint256)",
    "function getDonorTotalContribution(address donor) external view returns (uint256)",
    "function getDonorEmail(address donor) external view returns (string memory)",
    "function getDonorEnsName(address donor) external view returns (string memory)",
    "function isTokenCodeUsed(uint256 tokenCode) external view returns (bool)",
    "event DonationReceived(address indexed donor, uint256 amount, string name, string email, string ensName, string message, string location, uint256 timestamp, uint256 tokenCode)"
  ],

  AIT_TOKEN_ABI: [
    "function balanceOf(address account) external view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "function name() external view returns (string memory)",
    "function symbol() external view returns (string memory)",
    "function decimals() external view returns (uint8)",
    "function getVotingPower(address account) external view returns (uint256)",
    "function generateTokenCode(address donor) external view returns (uint256)",
    "function isTokenCodeUsed(uint256 tokenCode) external view returns (bool)",
    "function mintTokensForDonation(address donor, uint256 amount, string memory email) external",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event TokensMinted(address indexed donor, uint256 amount)"
  ],

  YIELD_POOL_ABI: [
    "function depositFunds(address donor) external payable",
    "function getPoolStats() external view returns (tuple(uint256,uint256,uint256))",
    "function getDonorStats(address donor) external view returns (tuple(uint256,uint256))",
    "function withdrawYield(address donor) external",
    "event FundsDeposited(address indexed donor, uint256 amount)",
    "event YieldWithdrawn(address indexed donor, uint256 amount)"
  ],

  GOVERNANCE_ABI: [
    "function createProposal(string memory _title, string memory _description, string memory _location, uint256 _budget) external returns (uint256)",
    "function vote(uint256 _proposalId, bool _support) external",
    "function executeProposal(uint256 _proposalId) external",
    "function getProposal(uint256 _proposalId) external view returns (tuple(uint256,string,string,string,uint256,address,uint256,uint256,uint256,uint256,bool,bool))",
    "function getProposalCount() external view returns (uint256)",
    "function getRecentProposals(uint256 _count) external view returns (tuple(uint256,string,string,string,uint256,address,uint256,uint256,uint256,uint256,bool,bool)[])",
    "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, uint256 budget)",
    "event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, uint256 weight)",
    "event ProposalExecuted(uint256 indexed proposalId)"
  ],

  BADGE_NFT_ABI: [
    "function mintBadge(address donor, uint256 donationAmount, string memory location, string memory message) external returns (uint256)",
    "function getDonorBadges(address donor) external view returns (uint256[])",
    "function getBadgeMetadata(uint256 tokenId) external view returns (tuple(uint8,uint256,string,uint256,string,bool))",
    "function balanceOf(address owner) external view returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function tokenURI(uint256 tokenId) external view returns (string memory)",
    "function totalSupply() external view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "event BadgeMinted(address indexed donor, uint256 indexed tokenId, uint256 donationAmount)"
  ],

  // DeFi Configuration
  DEFI_CONFIG: {
    AAVE_POOL_ADDRESS: process.env.AAVE_POOL_ADDRESS || "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", // Aave V3 Pool
    WETH_ADDRESS: process.env.WETH_ADDRESS || "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    USDC_ADDRESS: process.env.USDC_ADDRESS || "0xA0b86a33E6441b8C4C8C0d4B0C8C0d4B0C8C0d4B", // USDC
    REFERRAL_CODE: process.env.AAVE_REFERRAL_CODE || 0
  },

  // ENS Configuration
  ENS_CONFIG: {
    REGISTRY_ADDRESS: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    PUBLIC_RESOLVER: "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"
  },

  // Network Configuration
  NETWORK_CONFIG: {
    CHAIN_ID: process.env.CHAIN_ID || 1337, // Localhost
    RPC_URL: process.env.RPC_URL || "http://localhost:8545",
    EXPLORER_URL: process.env.EXPLORER_URL || "http://localhost:8545"
  }
};

module.exports = { CONTRACT_CONFIG };
