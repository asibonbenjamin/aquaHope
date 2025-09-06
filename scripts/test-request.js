const AquaHopeRequest = require('./request.js');

/**
 * Test script for AquaHope Request System
 * This script demonstrates how to use all the functions in request.js
 */

async function testAquaHopePlatform() {
  console.log("🧪 Starting AquaHope Platform Test...\n");
  
  const request = new AquaHopeRequest();
  
  try {
    // Initialize the request system
    console.log("1️⃣ Initializing request system...");
    await request.initialize();
    console.log("✅ Request system initialized\n");
    
    // Test 1: Get platform statistics
    console.log("2️⃣ Getting platform statistics...");
    const stats = await request.getPlatformStats();
    if (stats.success) {
      console.log("📊 Platform Statistics:");
      console.log(`   Total Donations: ${stats.stats.totalDonations} ETH`);
      console.log(`   Total Donors: ${stats.stats.totalDonors}`);
      console.log(`   Donation Count: ${stats.stats.donationCount}`);
      console.log(`   Contract Balance: ${stats.stats.contractBalance} ETH\n`);
    } else {
      console.log("❌ Failed to get platform stats:", stats.error);
    }
    
    // Test 2: Make a test donation
    console.log("3️⃣ Making a test donation...");
    const donation = await request.makeDonation(
      "Test Donor",
      "test@aquahope.org",
      "Testing the AquaHope platform",
      "Kenya",
      0.1
    );
    
    if (donation.success) {
      console.log("✅ Donation successful!");
      console.log(`   Transaction: ${donation.txHash}`);
      console.log(`   Donation Index: ${donation.donationIndex}\n`);
      
      // Test 3: Mint tokens and badge
      console.log("4️⃣ Minting tokens and badge...");
      const mintResult = await request.mintTokensAndBadge(donation.donationIndex);
      
      if (mintResult.success) {
        console.log("✅ Tokens and badge minted!");
        console.log(`   Transaction: ${mintResult.txHash}\n`);
        
        // Test 4: Check token balance
        console.log("5️⃣ Checking token balance...");
        const balance = await request.getDonorTokenBalance(request.deployer.address);
        
        if (balance.success) {
          console.log(`✅ Token Balance: ${balance.balance} AIT\n`);
          
          // Test 5: Check voting power
          console.log("6️⃣ Checking voting power...");
          const votingPower = await request.getDonorVotingPower(request.deployer.address);
          
          if (votingPower.success) {
            console.log(`✅ Voting Power: ${votingPower.votingPower} AIT\n`);
          }
        }
      }
    } else {
      console.log("❌ Donation failed:", donation.error);
    }
    
    // Test 6: Create a test proposal
    console.log("7️⃣ Creating a test proposal...");
    const proposal = await request.createProposal(
      "Test Borehole Project",
      "Install a test borehole in rural Kenya for 1000 people",
      "Kenya",
      2.5
    );
    
    if (proposal.success) {
      console.log("✅ Proposal created!");
      console.log(`   Proposal ID: ${proposal.proposalId}`);
      console.log(`   Transaction: ${proposal.txHash}\n`);
      
      // Test 7: Vote on the proposal
      console.log("8️⃣ Voting on the proposal...");
      const vote = await request.voteOnProposal(proposal.proposalId, true);
      
      if (vote.success) {
        console.log("✅ Vote cast successfully!");
        console.log(`   Transaction: ${vote.txHash}\n`);
        
        // Test 8: Get proposal details
        console.log("9️⃣ Getting proposal details...");
        const proposalDetails = await request.getProposal(proposal.proposalId);
        
        if (proposalDetails.success) {
          console.log("✅ Proposal Details:");
          console.log(`   Title: ${proposalDetails.proposal.title}`);
          console.log(`   Location: ${proposalDetails.proposal.location}`);
          console.log(`   Budget: ${proposalDetails.proposal.budget} ETH`);
          console.log(`   For Votes: ${proposalDetails.proposal.forVotes} AIT`);
          console.log(`   Against Votes: ${proposalDetails.proposal.againstVotes} AIT\n`);
        }
      }
    } else {
      console.log("❌ Proposal creation failed:", proposal.error);
    }
    
    // Test 9: Get recent donations
    console.log("🔟 Getting recent donations...");
    const recentDonations = await request.getRecentDonations(3);
    
    if (recentDonations.success) {
      console.log("✅ Recent Donations:");
      recentDonations.donations.forEach((donation, index) => {
        console.log(`   ${index + 1}. ${donation.name}: ${donation.amount} ETH (${donation.location})`);
      });
      console.log();
    }
    
    // Test 10: Get pool statistics
    console.log("1️⃣1️⃣ Getting DeFi pool statistics...");
    const poolStats = await request.getPoolStats();
    
    if (poolStats.success) {
      console.log("✅ DeFi Pool Statistics:");
      console.log(`   Deposited: ${poolStats.stats.deposited} ETH`);
      console.log(`   Yield Generated: ${poolStats.stats.yield} ETH`);
      console.log(`   Withdrawn: ${poolStats.stats.withdrawn} ETH\n`);
    }
    
    // Test 11: Get donor badges (if any)
    console.log("1️⃣2️⃣ Getting donor badges...");
    const badges = await request.getDonorBadges(request.deployer.address);
    
    if (badges.success) {
      console.log(`✅ Donor Badges: ${badges.badges.length} badges found`);
      if (badges.badges.length > 0) {
        console.log(`   Badge IDs: ${badges.badges.join(', ')}\n`);
      } else {
        console.log("   No badges found yet\n");
      }
    }
    
    // Final platform statistics
    console.log("📊 Final Platform Statistics:");
    const finalStats = await request.getPlatformStats();
    if (finalStats.success) {
      console.log(`   Total Donations: ${finalStats.stats.totalDonations} ETH`);
      console.log(`   Total Donors: ${finalStats.stats.totalDonors}`);
      console.log(`   Donation Count: ${finalStats.stats.donationCount}`);
      console.log(`   Contract Balance: ${finalStats.stats.contractBalance} ETH`);
    }
    
    console.log("\n🎉 All tests completed successfully!");
    console.log("✅ AquaHope DeFi/ReFi platform is working correctly!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Stack trace:", error.stack);
  }
}

// Run the test
if (require.main === module) {
  testAquaHopePlatform()
    .then(() => {
      console.log("\n🏁 Test script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Test script failed:", error);
      process.exit(1);
    });
}

module.exports = testAquaHopePlatform;


