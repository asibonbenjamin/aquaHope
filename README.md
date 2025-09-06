# AquaHope DeFi/ReFi Platform 🌊

A comprehensive decentralized application (dApp) that combines **DeFi** (Decentralized Finance) and **ReFi** (Regenerative Finance) to fund clean water projects in African villages. Donors receive impact tokens, voting rights, and NFT badges while their donations generate sustainable yield.

## 🌟 Key Features

### DeFi Integration
- **Yield Generation**: Donations are deposited into Aave protocol for sustainable yield
- **Liquidity Pools**: Funds work while waiting to be used for projects
- **Maintenance Fund**: 30% of yield goes to borehole maintenance
- **Project Fund**: 70% of yield funds new water projects

### ReFi (Regenerative Finance)
- **Impact Tokens**: 1000 AIT (AquaHope Impact Tokens) per ETH donated
- **Voting Power**: Use AIT tokens to vote on future borehole locations
- **NFT Badges**: Unique donor recognition based on contribution level
- **Governance**: Decentralized decision-making for project locations
- **Email Integration**: Automatic token delivery and notifications

### Token System
- **AquaHope Impact Token (AIT)**: ERC-20 token for voting and governance
- **Donor Badge NFT**: ERC-721 NFT showing contribution level and impact
- **Voting Mechanism**: Democratic governance for project decisions
- **Social Proof**: Shareable badges and impact tracking

## 🏗️ Architecture

### Smart Contracts
- **Donation.sol**: Main donation contract with full DeFi/ReFi integration
- **AquaHopeImpactToken.sol**: ERC-20 token for voting power
- **DeFiYieldPool.sol**: Aave integration for yield generation
- **AquaHopeGovernance.sol**: Voting system for project decisions
- **DonorBadgeNFT.sol**: ERC-721 NFT for donor recognition

### Frontend
- **React + Vite**: Modern, fast frontend
- **Ethers.js**: Blockchain interaction
- **MetaMask Integration**: Wallet connection and transactions
- **Responsive Design**: Works on desktop and mobile

### Backend
- **Node.js + Express**: RESTful API
- **Email Service**: Automated token delivery
- **Blockchain Service**: Smart contract interaction
- **Token Management**: AIT and NFT handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MetaMask browser extension
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd aquaHope

# Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
```

### Configuration

1. **Backend Setup**:
```bash
cd backend
cp env.example .env
# Edit .env with your email service and blockchain details
```

2. **Deploy Contracts**:
```bash
# Start local blockchain
npx hardhat node

# Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

3. **Start Services**:
```bash
# Backend (Terminal 1)
cd backend && npm start

# Frontend (Terminal 2)
cd frontend && npm run dev
```

## 📖 Usage Guide

### For Donors

1. **Connect Wallet**: Connect MetaMask to the platform
2. **Make Donation**: 
   - Enter donation amount in ETH
   - Provide email for token delivery
   - Select preferred project location
   - Add optional message
3. **Receive Tokens**: Check email for token code and claim AIT tokens
4. **Vote on Projects**: Use AIT tokens to vote on future borehole locations
5. **Track Impact**: View your NFT badge and contribution history

### For Administrators

1. **Monitor Donations**: View all donations and token distributions
2. **Create Proposals**: Submit new borehole location proposals
3. **Manage Yield**: Monitor DeFi yield generation and distribution
4. **Email Management**: Send notifications and token codes

## 🔧 Configuration

### Email Service Setup

#### Gmail (Recommended for testing)
```env
EMAIL_SERVICE=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

#### SendGrid (Production)
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-api-key
```

### Blockchain Networks

#### Local Development
```env
NETWORK=localhost
LOCALHOST_RPC_URL=http://localhost:8545
```

#### Sepolia Testnet
```env
NETWORK=sepolia
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

#### Mainnet
```env
NETWORK=mainnet
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
```

## 🎯 Token Economics

### AIT Token Distribution
- **1 ETH = 1000 AIT tokens**
- **Voting Power**: 1 AIT = 1 vote
- **Transferable**: Tokens can be transferred between addresses
- **Governance**: Required for creating and voting on proposals

### Badge Levels
- **Bronze**: 0.01 - 0.1 ETH
- **Silver**: 0.1 - 1 ETH
- **Gold**: 1 - 10 ETH
- **Platinum**: 10 - 100 ETH
- **Diamond**: 100+ ETH

### Yield Distribution
- **30%**: Maintenance fund for existing boreholes
- **70%**: New project funding
- **Automatic**: Distributed via smart contracts

## 🛡️ Security Features

- **Reentrancy Protection**: All contracts use ReentrancyGuard
- **Access Control**: Owner-only functions for critical operations
- **Input Validation**: Comprehensive parameter validation
- **Emergency Functions**: Pause and emergency withdrawal capabilities
- **Audit Ready**: Clean, documented code for security audits

## 📊 Monitoring & Analytics

- **Donation Tracking**: Real-time donation statistics
- **Yield Monitoring**: DeFi yield generation tracking
- **Voting Analytics**: Governance participation metrics
- **Impact Metrics**: Water project completion tracking

## 🔄 Development Workflow

### Smart Contract Development
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia
```

### Frontend Development
```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev          # Development with nodemon
npm start            # Production server
npm test             # Run tests
```

## 🚀 Deployment

### Local Development
1. Start Hardhat node
2. Deploy contracts
3. Start backend and frontend
4. Connect MetaMask to localhost

### Testnet Deployment
1. Configure Sepolia network
2. Get test ETH from faucet
3. Deploy contracts to Sepolia
4. Update frontend configuration

### Mainnet Deployment
1. Complete security audit
2. Configure mainnet settings
3. Deploy contracts
4. Set up monitoring
5. Launch platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Solidity best practices
- Write comprehensive tests
- Document all functions
- Use meaningful commit messages
- Update README for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Aave Protocol**: For DeFi yield generation
- **OpenZeppelin**: For secure smart contract libraries
- **Ethers.js**: For blockchain interaction
- **React Community**: For the amazing frontend framework

## 📞 Support

- **Documentation**: [Setup Guide](SETUP_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

## 🌍 Impact

This platform enables:
- **Sustainable Funding**: DeFi yield ensures long-term project sustainability
- **Democratic Governance**: Community-driven decision making
- **Transparent Impact**: Blockchain-verified donation tracking
- **Scalable Solutions**: Automated systems for global water access

---

**AquaHope** - Bringing Clean Water to African Villages Through DeFi & ReFi 🌊💙

*Built with ❤️ for a better world*