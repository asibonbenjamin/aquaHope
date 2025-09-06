const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');
const Joi = require('joi');

// Validation schemas
const tokenCodeSchema = Joi.object({
  tokenCode: Joi.string().min(8).max(16).required()
});

const proposalSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(1).max(1000).required(),
  location: Joi.string().min(1).max(100).required(),
  budget: Joi.number().positive().required()
});

const voteSchema = Joi.object({
  proposalId: Joi.number().integer().positive().required(),
  support: Joi.boolean().required()
});

/**
 * @route GET /api/blockchain/network-info
 * @desc Get blockchain network information
 * @access Public
 */
router.get('/network-info', async (req, res) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo();
    const contractAddresses = await blockchainService.getContractAddresses();

    res.json({
      success: true,
      network: networkInfo,
      contracts: contractAddresses
    });
  } catch (error) {
    console.error('Error getting network info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get network information',
      message: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/donation-by-token-code
 * @desc Get donation details by token code
 * @access Public
 */
router.post('/donation-by-token-code', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = tokenCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { tokenCode } = value;
    const donation = await blockchainService.getDonationByTokenCode(tokenCode);

    res.json({
      success: true,
      donation: donation
    });
  } catch (error) {
    console.error('Error getting donation by token code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get donation details',
      message: error.message
    });
  }
});

/**
 * @route GET /api/blockchain/donor-voting-power/:address
 * @desc Get donor's voting power
 * @access Public
 */
router.get('/donor-voting-power/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }

    const votingPower = await blockchainService.getDonorVotingPower(address);
    const tokenBalance = await blockchainService.getDonorTokenBalance(address);

    res.json({
      success: true,
      address: address,
      votingPower: votingPower,
      tokenBalance: tokenBalance
    });
  } catch (error) {
    console.error('Error getting voting power:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get voting power',
      message: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/create-proposal
 * @desc Create a new governance proposal
 * @access Private (Admin only)
 */
router.post('/create-proposal', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = proposalSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { title, description, location, budget } = value;
    const result = await blockchainService.createProposal(title, description, location, budget);

    res.json({
      success: true,
      message: 'Proposal created successfully',
      txHash: result.txHash
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create proposal',
      message: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/vote
 * @desc Vote on a proposal
 * @access Private (Admin only)
 */
router.post('/vote', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = voteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { proposalId, support } = value;
    const result = await blockchainService.voteOnProposal(proposalId, support);

    res.json({
      success: true,
      message: 'Vote cast successfully',
      txHash: result.txHash
    });
  } catch (error) {
    console.error('Error voting on proposal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to vote on proposal',
      message: error.message
    });
  }
});

/**
 * @route GET /api/blockchain/proposal/:id
 * @desc Get proposal details
 * @access Public
 */
router.get('/proposal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proposalId = parseInt(id);

    if (isNaN(proposalId) || proposalId < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid proposal ID'
      });
    }

    const proposal = await blockchainService.getProposal(proposalId);

    res.json({
      success: true,
      proposal: proposal
    });
  } catch (error) {
    console.error('Error getting proposal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get proposal details',
      message: error.message
    });
  }
});

/**
 * @route GET /api/blockchain/badge/:tokenId
 * @desc Get badge metadata
 * @access Public
 */
router.get('/badge/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const nftTokenId = parseInt(tokenId);

    if (isNaN(nftTokenId) || nftTokenId < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID'
      });
    }

    const metadata = await blockchainService.getBadgeMetadata(nftTokenId);

    res.json({
      success: true,
      metadata: metadata
    });
  } catch (error) {
    console.error('Error getting badge metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get badge metadata',
      message: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/mint-tokens-badge
 * @desc Mint tokens and badge for a donation
 * @access Private (Admin only)
 */
router.post('/mint-tokens-badge', async (req, res) => {
  try {
    const { donationIndex } = req.body;

    if (donationIndex === undefined || donationIndex === null) {
      return res.status(400).json({
        success: false,
        error: 'Donation index is required'
      });
    }

    const result = await blockchainService.mintTokensAndBadge(donationIndex);

    res.json({
      success: true,
      message: 'Tokens and badge minted successfully',
      txHash: result.txHash
    });
  } catch (error) {
    console.error('Error minting tokens and badge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mint tokens and badge',
      message: error.message
    });
  }
});

module.exports = router;

