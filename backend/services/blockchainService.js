const { ethers } = require('ethers');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.initializeProvider();
  }

  initializeProvider() {
    try {
      // Initialize provider based on network
      if (process.env.NETWORK === 'localhost') {
        this.provider = new ethers.JsonRpcProvider('http://localhost:8545');
      } else if (process.env.NETWORK === 'sepolia') {
        this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
      } else if (process.env.NETWORK === 'mainnet') {
        this.provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
      } else {
        throw new Error('Invalid network configuration');
      }

      // Initialize signer if private key is provided
      if (process.env.PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        console.log('✅ Blockchain service initialized with signer');
      } else {
        console.log('⚠️  Blockchain service initialized without signer (read-only)');
      }

      this.initializeContracts();
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  initializeContracts() {
    try {
      // Contract ABIs (simplified for this example)
      const donationABI = [
        "function donate(string memory _name, string memory _email, string memory _message, string memory _location) external payable",
        "function mintTokensAndBadge(uint256 donationIndex) external",
        "function getDonation(uint256 _index) external view returns (address, uint256, string memory, string memory, uint256, string memory, string memory, bool, bool, uint256)",
        "function getDonationByTokenCode(uint256 _tokenCode) external view returns (address, uint256, string memory, string memory, uint256, string memory, string memory, bool, bool)",
        "function getDonationCount() external view returns (uint256)",
        "event DonationReceived(address indexed donor, uint256 amount, string name, string email, string message, string location, uint256 timestamp, uint256 tokenCode)"
      ];

      const aitTokenABI = [
        "function mintTokensForDonation(address donor, uint256 ethAmount, string memory email) external",
        "function balanceOf(address account) external view returns (uint256)",
        "function getVotingPower(address donor) external view returns (uint256)"
      ];

      const governanceABI = [
        "function createProposal(string memory title, string memory description, string memory location, uint256 budget) external returns (uint256)",
        "function vote(uint256 proposalId, bool support) external",
        "function getProposal(uint256 proposalId) external view returns (uint256, string memory, string memory, string memory, uint256, address, uint256, uint256, uint256, uint256, bool, bool)"
      ];

      const badgeNFTABI = [
        "function mintBadge(address donor, uint256 donationAmount, string memory location, string memory message) external returns (uint256)",
        "function getBadgeMetadata(uint256 tokenId) external view returns (uint8, uint256, string memory, uint256, string memory, bool)"
      ];

      // Initialize contracts
      if (process.env.DONATION_CONTRACT_ADDRESS) {
        this.contracts.donation = new ethers.Contract(
          process.env.DONATION_CONTRACT_ADDRESS,
          donationABI,
          this.signer || this.provider
        );
      }

      if (process.env.AIT_TOKEN_ADDRESS) {
        this.contracts.aitToken = new ethers.Contract(
          process.env.AIT_TOKEN_ADDRESS,
          aitTokenABI,
          this.signer || this.provider
        );
      }

      if (process.env.GOVERNANCE_CONTRACT_ADDRESS) {
        this.contracts.governance = new ethers.Contract(
          process.env.GOVERNANCE_CONTRACT_ADDRESS,
          governanceABI,
          this.signer || this.provider
        );
      }

      if (process.env.BADGE_NFT_ADDRESS) {
        this.contracts.badgeNFT = new ethers.Contract(
          process.env.BADGE_NFT_ADDRESS,
          badgeNFTABI,
          this.signer || this.provider
        );
      }

      console.log('✅ Smart contracts initialized');
    } catch (error) {
      console.error('❌ Failed to initialize contracts:', error);
      throw error;
    }
  }

  async getDonationByTokenCode(tokenCode) {
    try {
      if (!this.contracts.donation) {
        throw new Error('Donation contract not initialized');
      }

      const donation = await this.contracts.donation.getDonationByTokenCode(tokenCode);
      return {
        donor: donation[0],
        amount: ethers.formatEther(donation[1]),
        name: donation[2],
        email: donation[3],
        timestamp: donation[4],
        message: donation[5],
        location: donation[6],
        tokensMinted: donation[7],
        badgeMinted: donation[8]
      };
    } catch (error) {
      console.error('❌ Failed to get donation by token code:', error);
      throw error;
    }
  }

  async mintTokensAndBadge(donationIndex) {
    try {
      if (!this.contracts.donation || !this.signer) {
        throw new Error('Donation contract or signer not initialized');
      }

      const tx = await this.contracts.donation.mintTokensAndBadge(donationIndex);
      await tx.wait();
      
      console.log('✅ Tokens and badge minted successfully');
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('❌ Failed to mint tokens and badge:', error);
      throw error;
    }
  }

  async getDonorVotingPower(donorAddress) {
    try {
      if (!this.contracts.aitToken) {
        throw new Error('AIT token contract not initialized');
      }

      const votingPower = await this.contracts.aitToken.getVotingPower(donorAddress);
      return ethers.formatEther(votingPower);
    } catch (error) {
      console.error('❌ Failed to get voting power:', error);
      throw error;
    }
  }

  async getDonorTokenBalance(donorAddress) {
    try {
      if (!this.contracts.aitToken) {
        throw new Error('AIT token contract not initialized');
      }

      const balance = await this.contracts.aitToken.balanceOf(donorAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('❌ Failed to get token balance:', error);
      throw error;
    }
  }

  async createProposal(title, description, location, budget) {
    try {
      if (!this.contracts.governance || !this.signer) {
        throw new Error('Governance contract or signer not initialized');
      }

      const tx = await this.contracts.governance.createProposal(
        title,
        description,
        location,
        ethers.parseEther(budget.toString())
      );
      await tx.wait();

      console.log('✅ Proposal created successfully');
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('❌ Failed to create proposal:', error);
      throw error;
    }
  }

  async voteOnProposal(proposalId, support) {
    try {
      if (!this.contracts.governance || !this.signer) {
        throw new Error('Governance contract or signer not initialized');
      }

      const tx = await this.contracts.governance.vote(proposalId, support);
      await tx.wait();

      console.log('✅ Vote cast successfully');
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('❌ Failed to vote on proposal:', error);
      throw error;
    }
  }

  async getProposal(proposalId) {
    try {
      if (!this.contracts.governance) {
        throw new Error('Governance contract not initialized');
      }

      const proposal = await this.contracts.governance.getProposal(proposalId);
      return {
        id: proposal[0],
        title: proposal[1],
        description: proposal[2],
        location: proposal[3],
        budget: ethers.formatEther(proposal[4]),
        proposer: proposal[5],
        startTime: proposal[6],
        endTime: proposal[7],
        forVotes: ethers.formatEther(proposal[8]),
        againstVotes: ethers.formatEther(proposal[9]),
        executed: proposal[10],
        cancelled: proposal[11]
      };
    } catch (error) {
      console.error('❌ Failed to get proposal:', error);
      throw error;
    }
  }

  async getBadgeMetadata(tokenId) {
    try {
      if (!this.contracts.badgeNFT) {
        throw new Error('Badge NFT contract not initialized');
      }

      const metadata = await this.contracts.badgeNFT.getBadgeMetadata(tokenId);
      const badgeTypes = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
      
      return {
        badgeType: badgeTypes[metadata[0]],
        donationAmount: ethers.formatEther(metadata[1]),
        location: metadata[2],
        timestamp: metadata[3],
        message: metadata[4],
        isVerified: metadata[5]
      };
    } catch (error) {
      console.error('❌ Failed to get badge metadata:', error);
      throw error;
    }
  }

  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      return {
        name: network.name,
        chainId: network.chainId.toString(),
        blockNumber: blockNumber
      };
    } catch (error) {
      console.error('❌ Failed to get network info:', error);
      throw error;
    }
  }

  async getContractAddresses() {
    return {
      donation: process.env.DONATION_CONTRACT_ADDRESS,
      aitToken: process.env.AIT_TOKEN_ADDRESS,
      governance: process.env.GOVERNANCE_CONTRACT_ADDRESS,
      badgeNFT: process.env.BADGE_NFT_ADDRESS
    };
  }
}

module.exports = new BlockchainService();



