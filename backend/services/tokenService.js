const { ethers } = require('ethers');
const { CONTRACT_CONFIG } = require('../config/contractConfig');

/**
 * Token Service for AquaHope Platform
 * Handles AIT token operations and NFT badge management
 */
class TokenService {
  constructor() {
    this.provider = null;
    this.aitTokenContract = null;
    this.badgeNFTContract = null;
    this.initialized = false;
  }

  /**
   * Initialize the token service
   */
  async initialize() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
      
      // Initialize AIT Token contract
      if (CONTRACT_CONFIG.AIT_TOKEN_ADDRESS && CONTRACT_CONFIG.AIT_TOKEN_ABI) {
        this.aitTokenContract = new ethers.Contract(
          CONTRACT_CONFIG.AIT_TOKEN_ADDRESS,
          CONTRACT_CONFIG.AIT_TOKEN_ABI,
          this.provider
        );
      }

      // Initialize Badge NFT contract
      if (CONTRACT_CONFIG.BADGE_NFT_ADDRESS && CONTRACT_CONFIG.BADGE_NFT_ABI) {
        this.badgeNFTContract = new ethers.Contract(
          CONTRACT_CONFIG.BADGE_NFT_ADDRESS,
          CONTRACT_CONFIG.BADGE_NFT_ABI,
          this.provider
        );
      }

      this.initialized = true;
      console.log('✅ Token Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Token Service:', error);
      this.initialized = false;
    }
  }

  /**
   * Get donor's AIT token balance
   * @param {string} donorAddress - Donor's wallet address
   * @returns {Promise<Object>} - Balance information
   */
  async getDonorTokenBalance(donorAddress) {
    try {
      if (!this.initialized || !this.aitTokenContract) {
        throw new Error('Token service not initialized');
      }

      const balance = await this.aitTokenContract.balanceOf(donorAddress);
      const decimals = await this.aitTokenContract.decimals();
      
      return {
        success: true,
        balance: ethers.formatUnits(balance, decimals),
        rawBalance: balance.toString()
      };
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get donor's voting power
   * @param {string} donorAddress - Donor's wallet address
   * @returns {Promise<Object>} - Voting power information
   */
  async getDonorVotingPower(donorAddress) {
    try {
      if (!this.initialized || !this.aitTokenContract) {
        throw new Error('Token service not initialized');
      }

      const votingPower = await this.aitTokenContract.getVotingPower(donorAddress);
      const decimals = await this.aitTokenContract.decimals();
      
      return {
        success: true,
        votingPower: ethers.formatUnits(votingPower, decimals),
        rawVotingPower: votingPower.toString()
      };
    } catch (error) {
      console.error('Failed to get voting power:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get donor's NFT badges
   * @param {string} donorAddress - Donor's wallet address
   * @returns {Promise<Object>} - Badge information
   */
  async getDonorBadges(donorAddress) {
    try {
      if (!this.initialized || !this.badgeNFTContract) {
        throw new Error('Token service not initialized');
      }

      const badges = await this.badgeNFTContract.getDonorBadges(donorAddress);
      
      return {
        success: true,
        badges: badges.map(id => id.toString())
      };
    } catch (error) {
      console.error('Failed to get donor badges:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get badge metadata
   * @param {string} tokenId - Badge token ID
   * @returns {Promise<Object>} - Badge metadata
   */
  async getBadgeMetadata(tokenId) {
    try {
      if (!this.initialized || !this.badgeNFTContract) {
        throw new Error('Token service not initialized');
      }

      const metadata = await this.badgeNFTContract.getBadgeMetadata(tokenId);
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
      console.error('Failed to get badge metadata:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate token code for email delivery
   * @param {string} donorAddress - Donor's wallet address
   * @returns {Promise<Object>} - Token code information
   */
  async generateTokenCode(donorAddress) {
    try {
      if (!this.initialized || !this.aitTokenContract) {
        throw new Error('Token service not initialized');
      }

      const tokenCode = await this.aitTokenContract.generateTokenCode(donorAddress);
      
      return {
        success: true,
        tokenCode: tokenCode.toString()
      };
    } catch (error) {
      console.error('Failed to generate token code:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if token code is valid
   * @param {string} tokenCode - Token code to validate
   * @returns {Promise<Object>} - Validation result
   */
  async validateTokenCode(tokenCode) {
    try {
      if (!this.initialized || !this.aitTokenContract) {
        throw new Error('Token service not initialized');
      }

      const isValid = await this.aitTokenContract.isTokenCodeUsed(tokenCode);
      
      return {
        success: true,
        isValid: !isValid // Token code is valid if it's NOT used
      };
    } catch (error) {
      console.error('Failed to validate token code:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get token statistics
   * @returns {Promise<Object>} - Token statistics
   */
  async getTokenStats() {
    try {
      if (!this.initialized || !this.aitTokenContract) {
        throw new Error('Token service not initialized');
      }

      const totalSupply = await this.aitTokenContract.totalSupply();
      const decimals = await this.aitTokenContract.decimals();
      const name = await this.aitTokenContract.name();
      const symbol = await this.aitTokenContract.symbol();
      
      return {
        success: true,
        stats: {
          totalSupply: ethers.formatUnits(totalSupply, decimals),
          name,
          symbol,
          decimals: decimals.toString()
        }
      };
    } catch (error) {
      console.error('Failed to get token stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const tokenService = new TokenService();

module.exports = tokenService;
