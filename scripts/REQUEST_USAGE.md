# AquaHope Request.js Usage Guide

The `request.js` file provides a complete interface for interacting with the AquaHope DeFi/ReFi platform. It includes all necessary functions for donations, token management, governance, and more.

## 🚀 Quick Start

### 1. Initialize the Request System
```bash
# Make sure contracts are deployed first
npx hardhat run scripts/deploy.js --network localhost

# Run the request script
npx hardhat run scripts/request.js --network localhost
```

### 2. Use in Your Own Scripts
```javascript
const AquaHopeRequest = require('./request.js');

async function myScript() {
  const request = new AquaHopeRequest();
  await request.initialize();
  
  // Use any of the functions below
  const stats = await request.getPlatformStats();
  console.log(stats);
}
```

## 📋 Available Functions

### 💰 Donation Functions

#### Make a Donation
```javascript
const donation = await request.makeDonation(
  "John Doe",           // Donor name
  "john@example.com",   // Email for token delivery
  "Supporting clean water", // Message
  "Kenya",              // Preferred location
  0.5                   // Amount in ETH
);
```

#### Get Donation Details
```javascript
// Get by index
const donation = await request.getDonation(0);

// Get by token code
const donation = await request.getDonationByTokenCode("ABC12345");
```

#### Mint Tokens and Badge
```javascript
const result = await request.mintTokensAndBadge(0); // donation index
```

### 🪙 Token Functions

#### Get Token Balance
```javascript
const balance = await request.getDonorTokenBalance("0x...");
console.log(`Balance: ${balance.balance} AIT`);
```

#### Get Voting Power
```javascript
const power = await request.getDonorVotingPower("0x...");
console.log(`Voting Power: ${power.votingPower} AIT`);
```

#### Generate Token Code
```javascript
const code = await request.generateTokenCode("0x...");
console.log(`Token Code: ${code.tokenCode}`);
```

### 🗳️ Governance Functions

#### Create Proposal
```javascript
const proposal = await request.createProposal(
  "New Borehole in Uganda",     // Title
  "Install borehole for 5000 people", // Description
  "Uganda",                     // Location
  3.0                          // Budget in ETH
);
```

#### Vote on Proposal
```javascript
const vote = await request.voteOnProposal(0, true); // proposalId, support
```

#### Get Proposal Details
```javascript
const proposal = await request.getProposal(0);
console.log(proposal.proposal);
```

#### Execute Proposal
```javascript
const result = await request.executeProposal(0);
```

### 🏆 NFT Badge Functions

#### Get Badge Metadata
```javascript
const metadata = await request.getBadgeMetadata(0); // tokenId
console.log(metadata.metadata);
```

#### Get Donor's Badges
```javascript
const badges = await request.getDonorBadges("0x...");
console.log(`Badges: ${badges.badges}`);
```

### 💎 DeFi Yield Functions

#### Get Pool Statistics
```javascript
const stats = await request.getPoolStats();
console.log(`Deposited: ${stats.stats.deposited} ETH`);
console.log(`Yield: ${stats.stats.yield} ETH`);
```

#### Get Donor Yield Stats
```javascript
const yieldStats = await request.getDonorYieldStats("0x...");
console.log(`Contribution: ${yieldStats.stats.contribution} ETH`);
console.log(`Yield Earned: ${yieldStats.stats.yieldEarned} ETH`);
```

### 📊 Utility Functions

#### Get Platform Statistics
```javascript
const stats = await request.getPlatformStats();
console.log(`Total Donations: ${stats.stats.totalDonations} ETH`);
console.log(`Total Donors: ${stats.stats.totalDonors}`);
console.log(`Donation Count: ${stats.stats.donationCount}`);
```

#### Get Recent Donations
```javascript
const donations = await request.getRecentDonations(5); // last 5 donations
console.log(donations.donations);
```

### 👤 Admin Functions

#### Withdraw Funds
```javascript
const result = await request.withdrawFunds(); // owner only
```

#### Update Owner
```javascript
const result = await request.updateOwner("0x..."); // new owner address
```

## 🧪 Testing Functions

### Run Complete Test Flow
```javascript
const testResult = await request.runTestFlow();
console.log("Test completed:", testResult.success);
```

This function:
1. Makes a test donation
2. Mints tokens and badge
3. Checks token balance
4. Creates a test proposal
5. Votes on the proposal
6. Gets platform statistics

## 📝 Example Scripts

### Example 1: Make a Donation and Check Results
```javascript
const AquaHopeRequest = require('./request.js');

async function donationExample() {
  const request = new AquaHopeRequest();
  await request.initialize();
  
  // Make donation
  const donation = await request.makeDonation(
    "Alice Smith",
    "alice@example.com",
    "Supporting water projects",
    "Tanzania",
    1.0
  );
  
  if (donation.success) {
    console.log(`Donation successful: ${donation.txHash}`);
    
    // Mint tokens
    const mint = await request.mintTokensAndBadge(donation.donationIndex);
    console.log(`Tokens minted: ${mint.txHash}`);
    
    // Check balance
    const balance = await request.getDonorTokenBalance(request.deployer.address);
    console.log(`Token balance: ${balance.balance} AIT`);
  }
}

donationExample();
```

### Example 2: Governance Workflow
```javascript
const AquaHopeRequest = require('./request.js');

async function governanceExample() {
  const request = new AquaHopeRequest();
  await request.initialize();
  
  // Create proposal
  const proposal = await request.createProposal(
    "Emergency Water Project",
    "Urgent borehole installation needed",
    "Ethiopia",
    5.0
  );
  
  if (proposal.success) {
    console.log(`Proposal created: ${proposal.proposalId}`);
    
    // Vote on proposal
    const vote = await request.voteOnProposal(proposal.proposalId, true);
    console.log(`Vote cast: ${vote.txHash}`);
    
    // Get proposal details
    const details = await request.getProposal(proposal.proposalId);
    console.log(`For votes: ${details.proposal.forVotes}`);
    console.log(`Against votes: ${details.proposal.againstVotes}`);
  }
}

governanceExample();
```

### Example 3: Platform Monitoring
```javascript
const AquaHopeRequest = require('./request.js');

async function monitoringExample() {
  const request = new AquaHopeRequest();
  await request.initialize();
  
  // Get platform stats
  const stats = await request.getPlatformStats();
  console.log("=== Platform Statistics ===");
  console.log(`Total Donations: ${stats.stats.totalDonations} ETH`);
  console.log(`Total Donors: ${stats.stats.totalDonors}`);
  console.log(`Contract Balance: ${stats.stats.contractBalance} ETH`);
  
  // Get recent donations
  const recent = await request.getRecentDonations(3);
  console.log("\n=== Recent Donations ===");
  recent.donations.forEach((donation, index) => {
    console.log(`${index + 1}. ${donation.name}: ${donation.amount} ETH`);
  });
  
  // Get pool stats
  const pool = await request.getPoolStats();
  console.log("\n=== DeFi Pool Statistics ===");
  console.log(`Deposited: ${pool.stats.deposited} ETH`);
  console.log(`Yield Generated: ${pool.stats.yield} ETH`);
  console.log(`Withdrawn: ${pool.stats.withdrawn} ETH`);
}

monitoringExample();
```

## 🔧 Error Handling

All functions return a result object with this structure:
```javascript
{
  success: true/false,
  data: {...}, // or error: "error message"
  txHash: "0x...", // for transactions
  // ... other relevant data
}
```

Example error handling:
```javascript
const result = await request.makeDonation("John", "john@example.com", "Test", "Kenya", 0.1);

if (result.success) {
  console.log("Donation successful:", result.txHash);
} else {
  console.error("Donation failed:", result.error);
}
```

## 🚀 Running the Script

### Basic Usage
```bash
npx hardhat run scripts/request.js --network localhost
```

### With Custom Function
```bash
# Create a custom script that uses the request class
node -e "
const AquaHopeRequest = require('./scripts/request.js');
(async () => {
  const request = new AquaHopeRequest();
  await request.initialize();
  const stats = await request.getPlatformStats();
  console.log(stats);
})();
"
```

## 📋 Prerequisites

1. **Contracts Deployed**: Make sure all contracts are deployed using `deploy.js`
2. **Network Running**: Ensure Hardhat node is running for localhost
3. **Dependencies**: All required packages must be installed

## 🔍 Troubleshooting

### Common Issues

1. **"Contracts not found"**
   - Make sure contracts are deployed
   - Check deployment file exists in `./deployments/`

2. **"Insufficient funds"**
   - Ensure deployer account has enough ETH
   - Check network connection

3. **"Transaction failed"**
   - Check gas limits
   - Verify contract addresses
   - Ensure proper permissions

### Debug Mode
```javascript
// Enable detailed logging
const request = new AquaHopeRequest();
await request.initialize();

// All functions will show detailed console output
```

This request.js file provides everything you need to interact with the AquaHope platform programmatically!


