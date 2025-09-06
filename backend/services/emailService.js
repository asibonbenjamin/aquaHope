const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Configure email service based on environment
    if (process.env.EMAIL_SERVICE === 'gmail') {
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
        }
      });
    } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    } else if (process.env.EMAIL_SERVICE === 'smtp') {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendTokenEmail(donorEmail, donorName, tokenCode, donationAmount, location) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@aquahope.org',
        to: donorEmail,
        subject: '🎉 Your AquaHope Impact Token & Voting Code',
        html: this.generateTokenEmailHTML(donorName, tokenCode, donationAmount, location),
        text: this.generateTokenEmailText(donorName, tokenCode, donationAmount, location)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Token email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send token email:', error);
      throw error;
    }
  }

  async sendBadgeEmail(donorEmail, donorName, badgeType, nftTokenId, donationAmount) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@aquahope.org',
        to: donorEmail,
        subject: '🏆 Your AquaHope Donor Badge NFT is Ready!',
        html: this.generateBadgeEmailHTML(donorName, badgeType, nftTokenId, donationAmount),
        text: this.generateBadgeEmailText(donorName, badgeType, nftTokenId, donationAmount)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Badge email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send badge email:', error);
      throw error;
    }
  }

  async sendVotingNotification(donorEmail, donorName, proposalTitle, proposalId) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@aquahope.org',
        to: donorEmail,
        subject: '🗳️ New Proposal: Vote on Next Borehole Location',
        html: this.generateVotingEmailHTML(donorName, proposalTitle, proposalId),
        text: this.generateVotingEmailText(donorName, proposalTitle, proposalId)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Voting notification sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send voting notification:', error);
      throw error;
    }
  }

  generateTokenEmailHTML(name, tokenCode, amount, location) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Your AquaHope Impact Token</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .token-code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .token-code h2 { color: #667eea; margin: 0; font-size: 24px; }
            .highlight { background: #e8f4fd; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Thank You for Your Donation!</h1>
                <p>Your contribution is making a real difference</p>
            </div>
            <div class="content">
                <h2>Hello ${name}!</h2>
                <p>Thank you for your generous donation of <strong>${amount} ETH</strong> to support clean water projects in <strong>${location}</strong>.</p>
                
                <div class="token-code">
                    <h2>Your Impact Token Code</h2>
                    <h1 style="color: #667eea; font-family: monospace; letter-spacing: 2px;">${tokenCode}</h1>
                    <p>Use this code to claim your voting tokens and NFT badge</p>
                </div>
                
                <div class="highlight">
                    <h3>🌟 What You've Unlocked:</h3>
                    <ul>
                        <li><strong>Voting Power:</strong> Use your tokens to vote on future borehole locations</li>
                        <li><strong>NFT Badge:</strong> A unique digital badge showing your contribution</li>
                        <li><strong>Impact Tracking:</strong> See how your donation is being used</li>
                        <li><strong>Yield Generation:</strong> Your donation earns interest for maintenance</li>
                    </ul>
                </div>
                
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Visit our platform and enter your token code</li>
                    <li>Claim your AquaHope Impact Tokens (AIT)</li>
                    <li>Receive your unique donor badge NFT</li>
                    <li>Start voting on future projects!</li>
                </ol>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/claim-tokens" class="button">Claim Your Tokens</a>
                </div>
                
                <p><strong>Your donation is now generating yield in our DeFi pool, ensuring sustainable funding for water projects!</strong></p>
            </div>
            <div class="footer">
                <p>AquaHope - Bringing Clean Water to African Villages</p>
                <p>This email was sent because you made a donation. If you have any questions, please contact us.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generateTokenEmailText(name, tokenCode, amount, location) {
    return `
    Thank You for Your Donation!

    Hello ${name}!

    Thank you for your generous donation of ${amount} ETH to support clean water projects in ${location}.

    Your Impact Token Code: ${tokenCode}

    What You've Unlocked:
    - Voting Power: Use your tokens to vote on future borehole locations
    - NFT Badge: A unique digital badge showing your contribution
    - Impact Tracking: See how your donation is being used
    - Yield Generation: Your donation earns interest for maintenance

    Next Steps:
    1. Visit our platform and enter your token code
    2. Claim your AquaHope Impact Tokens (AIT)
    3. Receive your unique donor badge NFT
    4. Start voting on future projects!

    Claim your tokens at: ${process.env.FRONTEND_URL}/claim-tokens

    Your donation is now generating yield in our DeFi pool, ensuring sustainable funding for water projects!

    AquaHope - Bringing Clean Water to African Villages
    `;
  }

  generateBadgeEmailHTML(name, badgeType, nftTokenId, amount) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Your AquaHope Donor Badge</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .badge { background: #fff; border: 2px solid #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .badge h2 { color: #667eea; margin: 0; font-size: 24px; }
            .highlight { background: #e8f4fd; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏆 Your Donor Badge is Ready!</h1>
                <p>Show off your impact with this unique NFT</p>
            </div>
            <div class="content">
                <h2>Congratulations ${name}!</h2>
                <p>Your donation of <strong>${amount} ETH</strong> has earned you a <strong>${badgeType}</strong> donor badge!</p>
                
                <div class="badge">
                    <h2>🏆 ${badgeType} Donor Badge</h2>
                    <p>NFT Token ID: #${nftTokenId}</p>
                    <p>This badge represents your commitment to clean water access</p>
                </div>
                
                <div class="highlight">
                    <h3>🌟 Badge Benefits:</h3>
                    <ul>
                        <li><strong>Social Proof:</strong> Share your impact on social media</li>
                        <li><strong>Exclusive Access:</strong> Special voting rights and updates</li>
                        <li><strong>Collectible:</strong> Rare NFT that appreciates in value</li>
                        <li><strong>Verification:</strong> Blockchain-verified proof of donation</li>
                    </ul>
                </div>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/badges" class="button">View Your Badge</a>
                </div>
                
                <p><strong>Thank you for being part of the AquaHope community!</strong></p>
            </div>
            <div class="footer">
                <p>AquaHope - Bringing Clean Water to African Villages</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generateBadgeEmailText(name, badgeType, nftTokenId, amount) {
    return `
    Your Donor Badge is Ready!

    Congratulations ${name}!

    Your donation of ${amount} ETH has earned you a ${badgeType} donor badge!

    🏆 ${badgeType} Donor Badge
    NFT Token ID: #${nftTokenId}
    This badge represents your commitment to clean water access

    Badge Benefits:
    - Social Proof: Share your impact on social media
    - Exclusive Access: Special voting rights and updates
    - Collectible: Rare NFT that appreciates in value
    - Verification: Blockchain-verified proof of donation

    View your badge at: ${process.env.FRONTEND_URL}/badges

    Thank you for being part of the AquaHope community!

    AquaHope - Bringing Clean Water to African Villages
    `;
  }

  generateVotingEmailHTML(name, proposalTitle, proposalId) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Proposal: Vote Now</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .proposal { background: #fff; border: 2px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🗳️ New Proposal Available</h1>
                <p>Your vote matters for the next borehole location</p>
            </div>
            <div class="content">
                <h2>Hello ${name}!</h2>
                <p>A new proposal has been submitted for your consideration:</p>
                
                <div class="proposal">
                    <h3>${proposalTitle}</h3>
                    <p>Proposal ID: #${proposalId}</p>
                    <p>Use your AIT tokens to vote on this important decision!</p>
                </div>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/governance" class="button">Vote Now</a>
                </div>
                
                <p><strong>Your voting power is based on your AIT token holdings. The more you've donated, the more influence you have!</strong></p>
            </div>
            <div class="footer">
                <p>AquaHope - Bringing Clean Water to African Villages</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generateVotingEmailText(name, proposalTitle, proposalId) {
    return `
    New Proposal Available

    Hello ${name}!

    A new proposal has been submitted for your consideration:

    ${proposalTitle}
    Proposal ID: #${proposalId}

    Use your AIT tokens to vote on this important decision!

    Vote now at: ${process.env.FRONTEND_URL}/governance

    Your voting power is based on your AIT token holdings. The more you've donated, the more influence you have!

    AquaHope - Bringing Clean Water to African Villages
    `;
  }

  generateTokenCode() {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }
}

module.exports = new EmailService();

