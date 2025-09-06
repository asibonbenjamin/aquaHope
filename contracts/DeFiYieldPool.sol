// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DeFi Yield Pool for AquaHope Donations
 * @dev Manages donation funds in DeFi protocols to generate yield for maintenance
 * Integrates with Aave for lending and yield generation
 */

// ✅ Aave Pool interface
interface IAavePool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);

    function getUserAccountData(address user)
        external
        view
        returns (
            uint256 totalCollateralETH,
            uint256 totalDebtETH,
            uint256 availableBorrowsETH,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        );
}

// ✅ Minimal ERC20 interface for WETH
interface IERC20Minimal {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

// ✅ WETH interface
interface IWETH {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function transfer(address to, uint256 amount) external returns (bool);
}

contract DeFiYieldPool is Ownable, ReentrancyGuard {
    // Aave V3 addresses (these would be different for each network)
    address public constant AAVE_POOL =
        0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2; // Mainnet Aave V3 pool
    address public constant WETH =
        0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; // Mainnet WETH

    // Pool state
    uint256 public totalDeposited;
    uint256 public totalYieldGenerated;
    uint256 public totalWithdrawnForProjects;

    // Yield distribution
    uint256 public constant MAINTENANCE_PERCENTAGE = 30; // 30% for maintenance
    uint256 public constant PROJECT_PERCENTAGE = 70; // 70% for new projects

    // Tracking
    mapping(address => uint256) public donorContributions;
    mapping(address => uint256) public donorYieldEarned;

    // Events
    event FundsDeposited(address indexed donor, uint256 amount);
    event YieldGenerated(uint256 amount);
    event FundsWithdrawnForProject(address indexed project, uint256 amount);
    event MaintenanceFundsWithdrawn(uint256 amount);

    /**
     * @dev Deposit ETH into the yield pool
     * @param donor The address of the donor
     */
    function depositFunds(address donor)
        external
        payable
        onlyOwner
        nonReentrant
    {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        require(donor != address(0), "Invalid donor address");

        // Convert ETH to WETH
        IWETH(WETH).deposit{value: msg.value}();

        // Approve Aave to spend WETH
        IERC20Minimal(WETH).approve(AAVE_POOL, msg.value);

        // Supply to Aave
        IAavePool(AAVE_POOL).supply(WETH, msg.value, address(this), 0);

        // Update tracking
        totalDeposited += msg.value;
        donorContributions[donor] += msg.value;

        emit FundsDeposited(donor, msg.value);
    }

    /**
     * @dev Withdraw funds for a specific project
     */
    function withdrawForProject(address projectAddress, uint256 amount)
        external
        onlyOwner
        nonReentrant
    {
        require(projectAddress != address(0), "Invalid project address");
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= totalDeposited, "Insufficient funds");

        // Withdraw from Aave
        uint256 withdrawnAmount = IAavePool(AAVE_POOL).withdraw(
            WETH,
            amount,
            address(this)
        );

        // Convert WETH back to ETH
        IWETH(WETH).withdraw(withdrawnAmount);

        // Transfer to project
        payable(projectAddress).transfer(withdrawnAmount);

        totalWithdrawnForProjects += withdrawnAmount;

        emit FundsWithdrawnForProject(projectAddress, withdrawnAmount);
    }

    /**
     * @dev Withdraw maintenance funds
     */
    function withdrawMaintenanceFunds(uint256 amount)
        external
        onlyOwner
        nonReentrant
    {
        require(amount > 0, "Amount must be greater than 0");

        // Calculate available yield
        uint256 availableYield = getAvailableYield();
        require(amount <= availableYield, "Insufficient yield available");

        // Withdraw from Aave
        uint256 withdrawnAmount = IAavePool(AAVE_POOL).withdraw(
            WETH,
            amount,
            address(this)
        );

        // Convert WETH back to ETH
        IWETH(WETH).withdraw(withdrawnAmount);

        // Transfer to owner for maintenance
        payable(owner()).transfer(withdrawnAmount);

        emit MaintenanceFundsWithdrawn(withdrawnAmount);
    }

    /**
     * @dev Get the current yield generated
     */
    function getAvailableYield() public view returns (uint256) {
        return totalDeposited / 100; // assume 1% yield for demo
    }

    function getPoolStats()
        external
        view
        returns (
            uint256 deposited,
            uint256 yield,
            uint256 withdrawn
        )
    {
        return (totalDeposited, totalYieldGenerated, totalWithdrawnForProjects);
    }

    function getDonorStats(address donor)
        external
        view
        returns (uint256 contribution, uint256 yieldEarned)
    {
        return (donorContributions[donor], donorYieldEarned[donor]);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 totalBalance = IERC20Minimal(WETH).balanceOf(address(this));

        if (totalBalance > 0) {
            IAavePool(AAVE_POOL).withdraw(WETH, totalBalance, address(this));
            IWETH(WETH).withdraw(totalBalance);
            payable(owner()).transfer(totalBalance);
        }
    }

    receive() external payable {}
}


