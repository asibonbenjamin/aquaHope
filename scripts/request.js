const { ethers } = require("hardhat");
const fs = require('fs');

/**
 * AquaHope DeFi/ReFi Platform - Complete Request Script
 * This script provides all necessary functions for the platform to work fully
 */

class AquaHopeRequest {
  constructor() {
    this.contracts = {};
    this.deployer = null;
    this.network = null;
  }

  /**
   * Initialize the request system
   */
  async initialize() {
    try {
      console.log("🚀 Initializing AquaHope Request System...");
      
      // Get deployer account
      [this.deployer] = await ethers.getSigners();
      this.network = await ethers.provider.getNetwork();
      
      console.log(`📋 Deployer: ${this.deployer.address}`);
      console.log(`🌐 Network: ${this.network.name} (Chain ID: ${this.network.chainId})`);
      
      // Load deployed contracts
      await this.loadDeployedContracts();
      
      console.log("✅ Request system initialized successfully!");
    } catch (error) {
      console.error("❌ Failed to initialize request system:", error);
      throw error;
    }
  }

  /**
   * Load deployed contracts from deployment file
   */
  async loadDeployedContracts() {
    try {
      const deploymentFile = `./deployments/${this.network.name}.json`;
      
      if (!fs.existsSync(deploymentFile)) {
        throw new Error(`Deployment file not found: ${deploymentFile}`);
      }

      const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
      
      // Load contract instances
      this.contracts.donation = await ethers.getContractAt("AquaHopeDonation", deployment.contracts.donation);
      this.contracts.aitToken = await ethers.getContractAt("AquaHopeImpactToken", deployment.contracts.aitToken);
      this.contracts.yieldPool = await ethers.getContractAt("DeFiYieldPool", deployment.contracts.yieldPool);
      this.contracts.governance = await ethers.getContractAt("AquaHopeGovernance", deployment.contracts.governance);
      this.contracts.badgeNFT = await ethers.getContractAt("DonorBadgeNFT", deployment.contracts.badgeNFT);
      
      console.log("📄 Contracts loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load contracts:", error);
      throw error;
    }
  }

  /**
   * DONATION FUNCTIONS
   */

  /**
   * Make a donation (simulate user donation)
   */
  async makeDonation(name, email, message, location, amount) {
    try {
      console.log(`💰 Making donation: ${amount} ETH from ${name}`);
      
      const tx = await this.contracts.donation.donate(
        name,
        email,
        message,
        location,
        { value: ethers.parseEther(amount.toString()) }
      );
      
      const receipt = await tx.wait();
      console.log(`✅ Donation successful! TX: ${tx.hash}`);
      
      // Get donation details
      const donationCount = await this.contracts.donation.getDonationCount();
      const donation = await this.contracts.donation.getDonation(donationCount - 1);
      
      return {
        success: true,
        txHash: tx.hash,
        donationIndex: donationCount - 1,
        donation: donation
      };
    } catch (error) {
      console.error("❌ Donation failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get donation details by index
   */
  async getDonation(index) {
    try {
      const donation = await this.contracts.donation.getDonation(index);
      return {
        success: true,
        donation: {
          donor: donation[0],
          amount: ethers.formatEther(donation[1]),
          name: donation[2],
          email: donation[3],
          timestamp: donation[4],
          message: donation[5],
          location: donation[6],
          tokensMinted: donation[7],
          badgeMinted: donation[8],
          tokenCode: donation[9]
        }
      };
    } catch (error) {
      console.error("❌ Failed to get donation:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get donation by token code
   */
  async getDonationByTokenCode(tokenCode) {
    try {
      const donation = await this.contracts.donation.getDonationByTokenCode(tokenCode);
      return {
        success: true,
        donation: {
          donor: donation[0],
          amount: ethers.formatEther(donation[1]),
          name: donation[2],
          email: donation[3],
          timestamp: donation[4],
          message: donation[5],
          location: donation[6],
          tokensMinted: donation[7],
          badgeMinted: donation[8]
        }
      };
    } catch (error) {
      console.error("❌ Failed to get donation by token code:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mint tokens and badge for a donation
   */
  async mintTokensAndBadge(donationIndex) {
    try {
      console.log(`🪙 Minting tokens and badge for donation ${donationIndex}`);
      
      const tx = await this.contracts.donation.mintTokensAndBadge(donationIndex);
      await tx.wait();
      
      console.log(`✅ Tokens and badge minted! TX: ${tx.hash}`);
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error("❌ Failed to mint tokens and badge:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * TOKEN FUNCTIONS
   */

  /**
   * Get donor's AIT token balance
   */
  async getDonorTokenBalance(donorAddress) {
    try {
      const balance = await this.contracts.aitToken.balanceOf(donorAddress);
      return {
        success: true,
        balance: ethers.formatEther(balance)
      };
    } catch (error) {
      console.error("❌ Failed to get token balance:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get donor's voting power
   */
  async getDonorVotingPower(donorAddress) {
    try {
      const votingPower = await this.contracts.aitToken.getVotingPower(donorAddress);
      return {
        success: true,
        votingPower: ethers.formatEther(votingPower)
      };
    } catch (error) {
      console.error("❌ Failed to get voting power:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate token code for email delivery
   */
  async generateTokenCode(donorAddress) {
    try {
      const tokenCode = await this.contracts.aitToken.generateTokenCode(donorAddress);
      return {
        success: true,
        tokenCode: tokenCode
      };
    } catch (error) {
      console.error("❌ Failed to generate token code:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * GOVERNANCE FUNCTIONS
   */

  /**
   * Create a new proposal
   */
  async createProposal(title, description, location, budget) {
    try {
      console.log(`📝 Creating proposal: ${title}`);
      
      const tx = await this.contracts.governance.createProposal(
        title,
        description,
        location,
        ethers.parseEther(budget.toString())
      );
      
      const receipt = await tx.wait();
      console.log(`✅ Proposal created! TX: ${tx.hash}`);
      
      // Get proposal ID from events
      const proposalId = receipt.logs[0].args[0];
      
      return {
        success: true,
        txHash: tx.hash,
        proposalId: proposalId.toString()
      };
    } catch (error) {
      console.error("❌ Failed to create proposal:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Vote on a proposal
   */
  async voteOnProposal(proposalId, support) {
    try {
      console.log(`🗳️ Voting ${support ? 'FOR' : 'AGAINST'} proposal ${proposalId}`);
      
      const tx = await this.contracts.governance.vote(proposalId, support);
      await tx.wait();
      
      console.log(`✅ Vote cast! TX: ${tx.hash}`);
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error("❌ Failed to vote:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get proposal details
   */
  async getProposal(proposalId) {
    try {
      const proposal = await this.contracts.governance.getProposal(proposalId);
      return {
        success: true,
        proposal: {
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
        }
      };
    } catch (error) {
      console.error("❌ Failed to get proposal:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute a proposal
   */
  async executeProposal(proposalId) {
    try {
      console.log(`⚡ Executing proposal ${proposalId}`);
      
      const tx = await this.contracts.governance.executeProposal(proposalId);
      await tx.wait();
      
      console.log(`✅ Proposal executed! TX: ${tx.hash}`);
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error("❌ Failed to execute proposal:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * NFT BADGE FUNCTIONS
   */

  /**
   * Get badge metadata
   */
  async getBadgeMetadata(tokenId) {
    try {
      const metadata = await this.contracts.badgeNFT.getBadgeMetadata(tokenId);
      const badgeTypes = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
      
      return {
        success: true,
        metadata: {
          badgeType: badgeTypes[metadata[0]],
          donationAmount: ethers.formatEther(metadata[1]),
          location: metadata[2],
          timestamp: metadata[3],
          message: metadata[4],
          isVerified: metadata[5]
        }
      };
    } catch (error) {
      console.error("❌ Failed to get badge metadata:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get donor's badges
   */
  async getDonorBadges(donorAddress) {
    try {
      const badges = await this.contracts.badgeNFT.getDonorBadges(donorAddress);
      return {
        success: true,
        badges: badges.map(id => id.toString())
      };
    } catch (error) {
      console.error("❌ Failed to get donor badges:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * DeFi YIELD FUNCTIONS
   */

  /**
   * Get pool statistics
   */
  async getPoolStats() {
    try {
      const stats = await this.contracts.yieldPool.getPoolStats();
      return {
        success: true,
        stats: {
          deposited: ethers.formatEther(stats[0]),
          yield: ethers.formatEther(stats[1]),
          withdrawn: ethers.formatEther(stats[2])
        }
      };
    } catch (error) {
      console.error("❌ Failed to get pool stats:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get donor's yield stats
   */
  async getDonorYieldStats(donorAddress) {
    try {
      const stats = await this.contracts.yieldPool.getDonorStats(donorAddress);
      return {
        success: true,
        stats: {
          contribution: ethers.formatEther(stats[0]),
          yieldEarned: ethers.formatEther(stats[1])
        }
      };
    } catch (error) {
      console.error("❌ Failed to get donor yield stats:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * UTILITY FUNCTIONS
   */

  /**
   * Get platform statistics
   */
  async getPlatformStats() {
    try {
      const totalDonations = await this.contracts.donation.totalDonations();
      const totalDonors = await this.contracts.donation.totalDonors();
      const donationCount = await this.contracts.donation.getDonationCount();
      const contractBalance = await this.contracts.donation.getContractBalance();
      
      return {
        success: true,
        stats: {
          totalDonations: ethers.formatEther(totalDonations),
          totalDonors: totalDonors.toString(),
          donationCount: donationCount.toString(),
          contractBalance: ethers.formatEther(contractBalance)
        }
      };
    } catch (error) {
      console.error("❌ Failed to get platform stats:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get recent donations
   */
  async getRecentDonations(count = 10) {
    try {
      const donations = await this.contracts.donation.getRecentDonations(count);
      return {
        success: true,
        donations: donations.map(donation => ({
          donor: donation.donor,
          amount: ethers.formatEther(donation.amount),
          name: donation.name,
          email: donation.email,
          timestamp: donation.timestamp,
          message: donation.message,
          location: donation.location,
          tokensMinted: donation.tokensMinted,
          badgeMinted: donation.badgeMinted,
          tokenCode: donation.tokenCode
        }))
      };
    } catch (error) {
      console.error("❌ Failed to get recent donations:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ADMIN FUNCTIONS
   */

  /**
   * Withdraw funds (owner only)
   */
  async withdrawFunds() {
    try {
      console.log("💰 Withdrawing funds...");
      
      const tx = await this.contracts.donation.emergencyWithdraw();
      await tx.wait();
      
      console.log(`✅ Funds withdrawn! TX: ${tx.hash}`);
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error("❌ Failed to withdraw funds:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update contract owner
   */
  async updateOwner(newOwner) {
    try {
      console.log(`👤 Updating owner to: ${newOwner}`);
      
      const tx = await this.contracts.donation.updateOwner(newOwner);
      await tx.wait();
      
      console.log(`✅ Owner updated! TX: ${tx.hash}`);
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error("❌ Failed to update owner:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * TESTING FUNCTIONS
   */

  /**
   * Run a complete test flow
   */
  async runTestFlow() {
    try {
      console.log("🧪 Running complete test flow...");
      
      // 1. Make a test donation
      const donation = await this.makeDonation(
        "Test Donor",
        "test@example.com",
        "Test donation for clean water",
        "Kenya",
        0.1
      );
      
      if (!donation.success) {
        throw new Error("Donation failed");
      }
      
      // 2. Mint tokens and badge
      const mintResult = await this.mintTokensAndBadge(donation.donationIndex);
      
      if (!mintResult.success) {
        throw new Error("Token minting failed");
      }
      
      // 3. Check token balance
      const balance = await this.getDonorTokenBalance(this.deployer.address);
      
      // 4. Create a test proposal
      const proposal = await this.createProposal(
        "Test Borehole in Kenya",
        "Install a new borehole in rural Kenya",
        "Kenya",
        2.5
      );
      
      if (!proposal.success) {
        throw new Error("Proposal creation failed");
      }
      
      // 5. Vote on the proposal
      const vote = await this.voteOnProposal(proposal.proposalId, true);
      
      // 6. Get platform stats
      const stats = await this.getPlatformStats();
      
      console.log("✅ Test flow completed successfully!");
      console.log("📊 Results:");
      console.log(`   - Donation: ${donation.txHash}`);
      console.log(`   - Tokens minted: ${mintResult.txHash}`);
      console.log(`   - Token balance: ${balance.balance} AIT`);
      console.log(`   - Proposal created: ${proposal.txHash}`);
      console.log(`   - Vote cast: ${vote.txHash}`);
      console.log(`   - Total donations: ${stats.stats.totalDonations} ETH`);
      
      return {
        success: true,
        results: {
          donation,
          mintResult,
          balance,
          proposal,
          vote,
          stats
        }
      };
    } catch (error) {
      console.error("❌ Test flow failed:", error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const request = new AquaHopeRequest();
  
  try {
    await request.initialize();
    
    // Example usage - uncomment what you want to test
    
    // Make a donation
    // const donation = await request.makeDonation(
    //   "John Doe",
    //   "john@example.com",
    //   "Supporting clean water projects",
    //   "Uganda",
    //   0.5
    // );
    // console.log("Donation result:", donation);
    
    // Get platform stats
    // const stats = await request.getPlatformStats();
    // console.log("Platform stats:", stats);
    
    // Run complete test flow
    const testResult = await request.runTestFlow();
    console.log("Test result:", testResult);
    
  } catch (error) {
    console.error("❌ Main execution failed:", error);
  }
}

// Export the class for use in other scripts
module.exports = AquaHopeRequest;

// Run main function if this script is executed directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
