// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title AquaHope Impact Token (AIT)
 * @dev ERC-20 token that represents proof of donation and voting power
 * Each token represents a donor's contribution to clean water projects
 */
contract AquaHopeImpactToken is ERC20, Ownable, ReentrancyGuard {
    using Strings for uint256;
    using Strings for bytes32;

    // Token details
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1M tokens
    uint256 public constant TOKENS_PER_ETH = 1000; // 1000 AIT per ETH donated
    
    // Donation tracking
    mapping(address => uint256) public donorTokens;
    mapping(address => bool) public hasDonated;
    mapping(address => string) public donorEmails;
    
    // Voting power tracking
    mapping(address => uint256) public votingPower;
    uint256 public totalVotingPower;
    
    // Events
    event TokensMinted(address indexed donor, uint256 amount, string email);
    event VotingPowerUpdated(address indexed donor, uint256 newPower);
    event EmailRegistered(address indexed donor, string email);
    
    constructor() ERC20("AquaHope Impact Token", "AIT") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint tokens for a donor based on their ETH donation
     */
    function mintTokensForDonation(
        address donor,
        uint256 ethAmount,
        string memory email
    ) external onlyOwner nonReentrant {
        require(donor != address(0), "Invalid donor address");
        require(ethAmount > 0, "Donation amount must be greater than 0");
        require(bytes(email).length > 0, "Email cannot be empty");
        
        // Calculate tokens to mint (1000 AIT per ETH)
        uint256 tokensToMint = ethAmount * TOKENS_PER_ETH;
        
        _mint(donor, tokensToMint);
        
        donorTokens[donor] += tokensToMint;
        hasDonated[donor] = true;
        donorEmails[donor] = email;
        
        votingPower[donor] += tokensToMint;
        totalVotingPower += tokensToMint;
        
        emit TokensMinted(donor, tokensToMint, email);
        emit VotingPowerUpdated(donor, votingPower[donor]);
        emit EmailRegistered(donor, email);
    }
    
    function getDonorTokens(address donor) external view returns (uint256) {
        return donorTokens[donor];
    }
    
    function getVotingPower(address donor) external view returns (uint256) {
        return votingPower[donor];
    }
    
    function isDonor(address donor) external view returns (bool) {
        return hasDonated[donor];
    }
    
    function getDonorEmail(address donor) external view returns (string memory) {
        return donorEmails[donor];
    }
    
    /**
     * @dev Override transfer to maintain voting power tracking
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        
        if (from != address(0) && to != address(0)) {
            if (votingPower[from] >= amount) {
                votingPower[from] -= amount;
                emit VotingPowerUpdated(from, votingPower[from]);
            }
            
            votingPower[to] += amount;
            emit VotingPowerUpdated(to, votingPower[to]);
        }
    }
    
    /**
     * @dev Generate a unique token code for email delivery
     */
    function generateTokenCode(address donor) external view returns (string memory) {
        require(hasDonated[donor], "Address has not donated");
        
        bytes32 hash = keccak256(abi.encodePacked(
            donor,
            block.timestamp,
            block.prevrandao,
            donorTokens[donor]
        ));
        
        // Convert to hex string and take first 8 chars
        string memory fullHash = Strings.toHexString(uint256(hash), 32);
        
        // Trim to first 10 chars ("0x" + 8)
        bytes memory strBytes = bytes(fullHash);
        bytes memory result = new bytes(10);
        for (uint256 i = 0; i < 10; i++) {
            result[i] = strBytes[i];
        }
        
        return string(result);
    }
    
    /**
     * @dev Emergency pause placeholder
     */
    function emergencyPause() external onlyOwner {
        // For a real pause, extend OpenZeppelin's Pausable
        revert("Paused: not implemented");
    }
}
