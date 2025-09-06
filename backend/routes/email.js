const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const blockchainService = require('../services/blockchainService');
const Joi = require('joi');

// Validation schemas
const sendTokenEmailSchema = Joi.object({
  donorEmail: Joi.string().email().required(),
  donorName: Joi.string().min(1).max(100).required(),
  tokenCode: Joi.string().min(8).max(16).required(),
  donationAmount: Joi.string().required(),
  location: Joi.string().min(1).max(100).required()
});

const sendBadgeEmailSchema = Joi.object({
  donorEmail: Joi.string().email().required(),
  donorName: Joi.string().min(1).max(100).required(),
  badgeType: Joi.string().valid('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond').required(),
  nftTokenId: Joi.string().required(),
  donationAmount: Joi.string().required()
});

const sendVotingNotificationSchema = Joi.object({
  donorEmail: Joi.string().email().required(),
  donorName: Joi.string().min(1).max(100).required(),
  proposalTitle: Joi.string().min(1).max(200).required(),
  proposalId: Joi.string().required()
});

/**
 * @route POST /api/email/send-token
 * @desc Send token email to donor
 * @access Private (Admin only)
 */
router.post('/send-token', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = sendTokenEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { donorEmail, donorName, tokenCode, donationAmount, location } = value;

    // Send email
    const result = await emailService.sendTokenEmail(
      donorEmail,
      donorName,
      tokenCode,
      donationAmount,
      location
    );

    res.json({
      success: true,
      message: 'Token email sent successfully',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error sending token email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send token email',
      message: error.message
    });
  }
});

/**
 * @route POST /api/email/send-badge
 * @desc Send badge email to donor
 * @access Private (Admin only)
 */
router.post('/send-badge', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = sendBadgeEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { donorEmail, donorName, badgeType, nftTokenId, donationAmount } = value;

    // Send email
    const result = await emailService.sendBadgeEmail(
      donorEmail,
      donorName,
      badgeType,
      nftTokenId,
      donationAmount
    );

    res.json({
      success: true,
      message: 'Badge email sent successfully',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error sending badge email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send badge email',
      message: error.message
    });
  }
});

/**
 * @route POST /api/email/send-voting-notification
 * @desc Send voting notification to donors
 * @access Private (Admin only)
 */
router.post('/send-voting-notification', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = sendVotingNotificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { donorEmail, donorName, proposalTitle, proposalId } = value;

    // Send email
    const result = await emailService.sendVotingNotification(
      donorEmail,
      donorName,
      proposalTitle,
      proposalId
    );

    res.json({
      success: true,
      message: 'Voting notification sent successfully',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error sending voting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send voting notification',
      message: error.message
    });
  }
});

/**
 * @route POST /api/email/process-donation
 * @desc Process donation and send emails
 * @access Private (Admin only)
 */
router.post('/process-donation', async (req, res) => {
  try {
    const { donationIndex } = req.body;

    if (!donationIndex && donationIndex !== 0) {
      return res.status(400).json({
        success: false,
        error: 'Donation index is required'
      });
    }

    // Get donation details from blockchain
    const donation = await blockchainService.getDonationByTokenCode(donationIndex);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }

    // Generate token code
    const tokenCode = emailService.generateTokenCode();

    // Send token email
    await emailService.sendTokenEmail(
      donation.email,
      donation.name,
      tokenCode,
      donation.amount,
      donation.location
    );

    // Mint tokens and badge
    const mintResult = await blockchainService.mintTokensAndBadge(donationIndex);

    // Send badge email (assuming badge was minted successfully)
    if (mintResult.success) {
      // You would need to get the actual badge type and NFT ID from the blockchain
      const badgeType = donation.amount >= 100 ? 'Diamond' : 
                       donation.amount >= 10 ? 'Platinum' :
                       donation.amount >= 1 ? 'Gold' :
                       donation.amount >= 0.1 ? 'Silver' : 'Bronze';

      await emailService.sendBadgeEmail(
        donation.email,
        donation.name,
        badgeType,
        'TBD', // NFT Token ID would be returned from minting
        donation.amount
      );
    }

    res.json({
      success: true,
      message: 'Donation processed successfully',
      tokenCode: tokenCode,
      mintResult: mintResult
    });
  } catch (error) {
    console.error('Error processing donation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process donation',
      message: error.message
    });
  }
});

/**
 * @route GET /api/email/test
 * @desc Test email service configuration
 * @access Private (Admin only)
 */
router.get('/test', async (req, res) => {
  try {
    // Test email configuration
    const testResult = await emailService.sendTokenEmail(
      'test@example.com',
      'Test User',
      'TEST1234',
      '0.1',
      'Test Location'
    );

    res.json({
      success: true,
      message: 'Email service test successful',
      result: testResult
    });
  } catch (error) {
    console.error('Email service test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Email service test failed',
      message: error.message
    });
  }
});

module.exports = router;



