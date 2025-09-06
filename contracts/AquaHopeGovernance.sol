// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AquaHope Governance Contract
 * @dev Handles voting on borehole locations and project decisions
 * Uses AIT tokens for voting power
 */
contract AquaHopeGovernance is Ownable, ReentrancyGuard {
    // Voting periods
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant EXECUTION_DELAY = 1 days;
    
    // Proposal structure
    struct Proposal {
        uint256 id;
        string title;
        string description;
        string location;
        uint256 budget;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool cancelled;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votes;
    }
    
    // Proposal tracking
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    // Voting power source (AIT token contract)
    address public aitToken;
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        string location,
        uint256 budget
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votes
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    
    // Modifiers
    modifier onlyAITHolder() {
        require(aitToken != address(0), "AIT token not set");
        // Check if caller has AIT tokens
        (bool success, bytes memory data) = aitToken.call(
            abi.encodeWithSignature("balanceOf(address)", msg.sender)
        );
        require(success, "Failed to check AIT balance");
        uint256 balance = abi.decode(data, (uint256));
        require(balance > 0, "Must hold AIT tokens to participate");
        _;
    }
    
    constructor(address _aitToken) {
        aitToken = _aitToken;
    }
    
    /**
     * @dev Create a new proposal for a borehole location
     * @param title The title of the proposal
     * @param description Detailed description of the project
     * @param location The location where the borehole should be built
     * @param budget The budget required for the project
     */
    function createProposal(
        string memory title,
        string memory description,
        string memory location,
        uint256 budget
    ) external onlyAITHolder nonReentrant returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(location).length > 0, "Location cannot be empty");
        require(budget > 0, "Budget must be greater than 0");
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.title = title;
        proposal.description = description;
        proposal.location = location;
        proposal.budget = budget;
        proposal.proposer = msg.sender;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + VOTING_PERIOD;
        proposal.executed = false;
        proposal.cancelled = false;
        
        emit ProposalCreated(proposalId, msg.sender, title, location, budget);
        
        return proposalId;
    }
    
    /**
     * @dev Vote on a proposal
     * @param proposalId The ID of the proposal
     * @param support True for yes, false for no
     */
    function vote(uint256 proposalId, bool support) external onlyAITHolder nonReentrant {
        require(proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal cancelled");
        
        // Get voter's AIT balance
        (bool success, bytes memory data) = aitToken.call(
            abi.encodeWithSignature("balanceOf(address)", msg.sender)
        );
        require(success, "Failed to get AIT balance");
        uint256 votingPower = abi.decode(data, (uint256));
        
        require(votingPower > 0, "No voting power");
        
        // Record vote
        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = votingPower;
        
        if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }
        
        emit VoteCast(proposalId, msg.sender, support, votingPower);
    }
    
    /**
     * @dev Execute a proposal if it has passed
     * @param proposalId The ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) external onlyOwner nonReentrant {
        require(proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp > proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal cancelled");
        require(proposal.forVotes > proposal.againstVotes, "Proposal did not pass");
        
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId);
        
        // Here you would implement the actual execution logic
        // For example, transferring funds to the project
    }
    
    /**
     * @dev Cancel a proposal (only owner)
     * @param proposalId The ID of the proposal to cancel
     */
    function cancelProposal(uint256 proposalId) external onlyOwner {
        require(proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[proposalId];
        
        require(!proposal.executed, "Cannot cancel executed proposal");
        require(!proposal.cancelled, "Proposal already cancelled");
        
        proposal.cancelled = true;
        
        emit ProposalCancelled(proposalId);
    }
    
    /**
     * @dev Get proposal details
     * @param proposalId The ID of the proposal
     */
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        string memory location,
        uint256 budget,
        address proposer,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed,
        bool cancelled
    ) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[proposalId];
        
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.location,
            proposal.budget,
            proposal.proposer,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed,
            proposal.cancelled
        );
    }
    
    /**
     * @dev Check if a user has voted on a proposal
     * @param proposalId The ID of the proposal
     * @param voter The voter's address
     */
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        return proposals[proposalId].hasVoted[voter];
    }
    
    /**
     * @dev Get the number of votes a user cast on a proposal
     * @param proposalId The ID of the proposal
     * @param voter The voter's address
     */
    function getVotes(uint256 proposalId, address voter) external view returns (uint256) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        return proposals[proposalId].votes[voter];
    }
    
    /**
     * @dev Get the current state of a proposal
     * @param proposalId The ID of the proposal
     */
    function getProposalState(uint256 proposalId) external view returns (string memory) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.cancelled) {
            return "Cancelled";
        } else if (proposal.executed) {
            return "Executed";
        } else if (block.timestamp <= proposal.endTime) {
            return "Active";
        } else if (proposal.forVotes <= proposal.againstVotes) {
            return "Defeated";
        } else {
            return "Succeeded";
        }
    }
    
    /**
     * @dev Update AIT token address (only owner)
     * @param _aitToken The new AIT token address
     */
    function setAITToken(address _aitToken) external onlyOwner {
        require(_aitToken != address(0), "Invalid AIT token address");
        aitToken = _aitToken;
    }
}

