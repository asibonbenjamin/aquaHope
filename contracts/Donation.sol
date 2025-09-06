// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AquaHopeDonation is Ownable, ReentrancyGuard {
    // Core donation tracking
    uint256 public totalDonations;
    uint256 public totalDonors;
    
    // Integration contracts
    address public aitToken;
    address public yieldPool;
    address public governance;
    address public badgeNFT;
    
    // Donation structure
    struct Donation {
        address donor;
        uint256 amount;
        string name;
        string email;
        uint256 timestamp;
        string message;
        string location;
        bool tokensMinted;
        bool badgeMinted;
        uint256 tokenCode;
    }
    
    // Tracking
    mapping(address => uint256) public donorCount;
    mapping(address => uint256) public donorTotalAmount;
    mapping(address => string) public donorEmails;
    mapping(uint256 => bool) public usedTokenCodes;
    Donation[] public donations;
    
    // Events
    event DonationReceived(
        address indexed donor,
        uint256 amount,
        string name,
        string email,
        string message,
        string location,
        uint256 timestamp,
        uint256 tokenCode
    );
    
    event TokensMinted(address indexed donor, uint256 amount);
    event BadgeMinted(address indexed donor, uint256 tokenId);
    event FundsDepositedToYield(address indexed donor, uint256 amount);
    
    
    constructor() {
        // Owner is set by Ownable constructor
    }
    
    /**
     * @dev Main donation function with full DeFi/ReFi integration
     * @param _name Donor's name
     * @param _email Donor's email for token delivery
     * @param _message Donor's message
     * @param _location Preferred project location
     */
    function donate(
        string memory _name,
        string memory _email,
        string memory _message,
        string memory _location
    ) external payable nonReentrant {
        require(msg.value > 0, "Donation amount must be greater than 0");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        
        // Generate unique token code
        uint256 tokenCode = _generateTokenCode(msg.sender);
        require(!usedTokenCodes[tokenCode], "Token code collision");
        usedTokenCodes[tokenCode] = true;
        
        // Create donation record
        donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            name: _name,
            email: _email,
            timestamp: block.timestamp,
            message: _message,
            location: _location,
            tokensMinted: false,
            badgeMinted: false,
            tokenCode: tokenCode
        }));
        
        // Update totals
        totalDonations += msg.value;
        
        // Update donor stats
        if (donorCount[msg.sender] == 0) {
            totalDonors++;
        }
        donorCount[msg.sender]++;
        donorTotalAmount[msg.sender] += msg.value;
        donorEmails[msg.sender] = _email;
        
        // Deposit funds to yield pool
        if (yieldPool != address(0)) {
            (bool success, ) = yieldPool.call{value: msg.value}(
                abi.encodeWithSignature("depositFunds(address)", msg.sender)
            );
            if (success) {
                emit FundsDepositedToYield(msg.sender, msg.value);
            }
        }
        
        emit DonationReceived(
            msg.sender,
            msg.value,
            _name,
            _email,
            _message,
            _location,
            block.timestamp,
            tokenCode
        );
    }
    
    /**
     * @dev Mint tokens and badge for a donation (called by owner after email verification)
     * @param donationIndex The index of the donation in the array
     */
    function mintTokensAndBadge(uint256 donationIndex) external onlyOwner {
        require(donationIndex < donations.length, "Invalid donation index");
        Donation storage donation = donations[donationIndex];
        
        require(!donation.tokensMinted, "Tokens already minted");
        require(!donation.badgeMinted, "Badge already minted");
        
        // Mint AIT tokens
        if (aitToken != address(0)) {
            (bool success, ) = aitToken.call(
                abi.encodeWithSignature(
                    "mintTokensForDonation(address,uint256,string)",
                    donation.donor,
                    donation.amount,
                    donation.email
                )
            );
            if (success) {
                donation.tokensMinted = true;
                emit TokensMinted(donation.donor, donation.amount);
            }
        }
        
        // Mint NFT badge
        if (badgeNFT != address(0)) {
            (bool success, bytes memory data) = badgeNFT.call(
                abi.encodeWithSignature(
                    "mintBadge(address,uint256,string,string)",
                    donation.donor,
                    donation.amount,
                    donation.location,
                    donation.message
                )
            );
            if (success) {
                uint256 tokenId = abi.decode(data, (uint256));
                donation.badgeMinted = true;
                emit BadgeMinted(donation.donor, tokenId);
            }
        }
    }
    
    /**
     * @dev Generate a unique token code for email delivery
     * @param donor The donor's address
     * @return A unique token code
     */
    function _generateTokenCode(address donor) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            donor,
            block.timestamp,
            block.difficulty,
            donations.length
        )));
    }
    
    /**
     * @dev Set integration contract addresses
     */
    function setIntegrationContracts(
        address _aitToken,
        address _yieldPool,
        address _governance,
        address _badgeNFT
    ) external onlyOwner {
        aitToken = _aitToken;
        yieldPool = _yieldPool;
        governance = _governance;
        badgeNFT = _badgeNFT;
    }
    
    /**
     * @dev Get donation count
     */
    function getDonationCount() external view returns (uint256) {
        return donations.length;
    }
    
    /**
     * @dev Get donation details
     */
    function getDonation(uint256 _index) external view returns (
        address donor,
        uint256 amount,
        string memory name,
        string memory email,
        uint256 timestamp,
        string memory message,
        string memory location,
        bool tokensMinted,
        bool badgeMinted,
        uint256 tokenCode
    ) {
        require(_index < donations.length, "Invalid donation index");
        Donation memory donation = donations[_index];
        return (
            donation.donor,
            donation.amount,
            donation.name,
            donation.email,
            donation.timestamp,
            donation.message,
            donation.location,
            donation.tokensMinted,
            donation.badgeMinted,
            donation.tokenCode
        );
    }
    
    /**
     * @dev Get donation by token code
     */
    function getDonationByTokenCode(uint256 _tokenCode) external view returns (
        address donor,
        uint256 amount,
        string memory name,
        string memory email,
        uint256 timestamp,
        string memory message,
        string memory location,
        bool tokensMinted,
        bool badgeMinted
    ) {
        for (uint256 i = 0; i < donations.length; i++) {
            if (donations[i].tokenCode == _tokenCode) {
                Donation memory donation = donations[i];
                return (
                    donation.donor,
                    donation.amount,
                    donation.name,
                    donation.email,
                    donation.timestamp,
                    donation.message,
                    donation.location,
                    donation.tokensMinted,
                    donation.badgeMinted
                );
            }
        }
        revert("Donation not found");
    }
    
    /**
     * @dev Get recent donations
     */
    function getRecentDonations(uint256 _count) external view returns (Donation[] memory) {
        uint256 length = donations.length;
        if (_count > length) {
            _count = length;
        }
        
        Donation[] memory recentDonations = new Donation[](_count);
        uint256 startIndex = length - _count;
        
        for (uint256 i = 0; i < _count; i++) {
            recentDonations[i] = donations[startIndex + i];
        }
        
        return recentDonations;
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get donor's total contribution
     */
    function getDonorTotalContribution(address donor) external view returns (uint256) {
        return donorTotalAmount[donor];
    }
    
    /**
     * @dev Get donor's email
     */
    function getDonorEmail(address donor) external view returns (string memory) {
        return donorEmails[donor];
    }
    
    /**
     * @dev Check if token code is used
     */
    function isTokenCodeUsed(uint256 tokenCode) external view returns (bool) {
        return usedTokenCodes[tokenCode];
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {
        // Allow direct ETH transfers but don't create donation records
    }
}

