# AquaHope DeFi/ReFi Setup Guide

This guide will help you set up the complete AquaHope DeFi/ReFi donation platform with token generation, voting, and email integration.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js (v16 or higher)
- MetaMask browser extension
- Git
- A code editor (VS Code recommended)

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd aquaHope

# Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
```

## 🔧 Environment Configuration

### Backend Configuration

1. Copy the environment template:
```bash
cd backend
cp env.example .env
```

2. Edit `backend/.env` with your details:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email Service Configuration
EMAIL_SERVICE=gmail
FROM_EMAIL=your-email@gmail.com
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Blockchain Configuration
NETWORK=localhost
PRIVATE_KEY=your-private-key-here

# Smart Contract Addresses (update after deployment)
DONATION_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
AIT_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
GOVERNANCE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
BADGE_NFT_ADDRESS=0x0000000000000000000000000000000000000000
```

### Email Service Setup

#### Option 1: Gmail (Recommended for testing)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `GMAIL_APP_PASSWORD`

#### Option 2: SendGrid (Production)

1. Sign up for SendGrid
2. Create an API key
3. Set `EMAIL_SERVICE=sendgrid` and `SENDGRID_API_KEY=your-key`

#### Option 3: Custom SMTP

1. Set `EMAIL_SERVICE=smtp`
2. Configure your SMTP settings

## ⛓️ Blockchain Setup

### 1. MetaMask Configuration

#### For Local Development:
1. Open MetaMask
2. Click on network dropdown
3. Select "Localhost 8545"
4. If not available, add custom network:
   - Network Name: `Localhost`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

#### For Testnet (Sepolia):
1. Add Sepolia testnet to MetaMask
2. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. Update `NETWORK=sepolia` in backend/.env

### 2. Private Key Setup

⚠️ **SECURITY WARNING**: Never use your main wallet's private key!

1. Create a new MetaMask wallet for development
2. Export the private key (Account Details → Export Private Key)
3. Add it to `backend/.env` as `PRIVATE_KEY`

### 3. Deploy Contracts

```bash
# Start local blockchain (in one terminal)
npx hardhat node

# Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

The deployment script will:
- Deploy all 5 contracts
- Set up integrations between contracts
- Update frontend configuration
- Save deployment info

## 🎯 Frontend Configuration

The frontend will be automatically configured after deployment. The contract addresses will be updated in `frontend/src/contracts/contractConfig.js`.

## 🚀 Running the Application

### 1. Start the Backend

```bash
cd backend
npm start
```

The backend will start on `http://localhost:3001`

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Test the Flow

1. Open `http://localhost:5173`
2. Connect MetaMask
3. Go to "Donate" page
4. Fill in donation form with email
5. Make a donation
6. Check your email for the token code
7. Go to "Claim Tokens" page
8. Enter the token code to claim AIT tokens and NFT badge
9. Visit "Governance" page to vote on proposals

## 🔍 Key Features

### DeFi Integration
- **Yield Generation**: Donations are deposited into Aave for yield
- **Sustainable Funding**: 30% of yield goes to maintenance, 70% to new projects
- **Liquidity Pools**: Funds work while waiting to be used

### ReFi (Regenerative Finance)
- **Impact Tokens**: 1000 AIT tokens per ETH donated
- **Voting Power**: Use AIT tokens to vote on borehole locations
- **NFT Badges**: Unique donor recognition based on contribution level
- **Governance**: Decentralized decision-making for project locations

### Token System
- **AquaHope Impact Token (AIT)**: ERC-20 token for voting
- **Donor Badge NFT**: ERC-721 NFT for recognition
- **Email Integration**: Automatic token delivery via email
- **Voting Mechanism**: Democratic governance for project decisions

## 🛠️ Troubleshooting

### Common Issues

1. **"Contract not deployed" error**
   - Make sure contracts are deployed
   - Check contract addresses in frontend config

2. **Email not sending**
   - Verify email service configuration
   - Check Gmail app password
   - Ensure backend is running

3. **MetaMask connection issues**
   - Make sure you're on the correct network
   - Refresh the page
   - Check if MetaMask is unlocked

4. **Transaction failures**
   - Ensure you have enough ETH for gas
   - Check network congestion
   - Verify contract addresses

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in backend/.env

## 📁 Project Structure

```
aquaHope/
├── contracts/                 # Smart contracts
│   ├── Donation.sol          # Main donation contract
│   ├── AquaHopeImpactToken.sol # AIT token
│   ├── DeFiYieldPool.sol     # Yield generation
│   ├── AquaHopeGovernance.sol # Voting system
│   └── DonorBadgeNFT.sol     # NFT badges
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── contracts/       # Contract configuration
│   │   └── wallet/          # Wallet integration
├── backend/                  # Node.js backend
│   ├── services/            # Business logic
│   ├── routes/              # API endpoints
│   └── .env                 # Environment config
├── scripts/                 # Deployment scripts
└── deployments/             # Deployment records
```

## 🔐 Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **Environment Variables**: Use .env files for sensitive data
3. **Email Credentials**: Use app passwords, not regular passwords
4. **Network Security**: Use HTTPS in production
5. **Smart Contract Audits**: Consider professional audits before mainnet

## 🚀 Production Deployment

### 1. Mainnet Deployment

```bash
# Update network configuration
NETWORK=mainnet

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

### 2. Production Environment

- Use production email service (SendGrid, AWS SES)
- Set up proper monitoring and logging
- Configure HTTPS and security headers
- Use environment-specific configurations

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review the console logs
3. Verify all environment variables
4. Ensure all services are running
5. Check network connectivity

## 🎉 Congratulations!

You now have a fully functional DeFi/ReFi donation platform with:
- Token generation and email delivery
- Voting system for governance
- NFT badges for donor recognition
- Yield generation for sustainable funding
- Complete frontend and backend integration

Happy coding! 🌊💙

