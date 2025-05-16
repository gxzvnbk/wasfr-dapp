// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(
        uint amountIn, 
        address[] calldata path
    ) external view returns (uint[] memory amounts);
}

interface IAaveLendingPool {
    function flashLoan(
        address receiverAddress,
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata modes,
        address onBehalfOf,
        bytes calldata params,
        uint16 referralCode
    ) external;
}

contract ArbitrageExecutor is Ownable, ReentrancyGuard {
    // Events
    event ArbitrageExecuted(
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountIn,
        uint256 profit
    );
    
    event FlashLoanExecuted(
        address indexed asset,
        uint256 amount,
        uint256 fee
    );
    
    // DEX router addresses
    mapping(string => address) public dexRouters;
    
    // Aave lending pool address
    address public aaveLendingPool;
    
    // Fee percentage (in basis points, e.g., 30 = 0.3%)
    uint256 public feePercentage = 30;
    
    constructor() {
        // Initialize with default routers - these should be updated for the correct network
        dexRouters["Uniswap"] = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D; // Mainnet Uniswap V2
        dexRouters["SushiSwap"] = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F; // Mainnet SushiSwap
    }
    
    /**
     * @dev Set a DEX router address
     * @param name The name of the DEX
     * @param routerAddress The address of the DEX router
     */
    function setDexRouter(string memory name, address routerAddress) external onlyOwner {
        require(routerAddress != address(0), "Invalid router address");
        dexRouters[name] = routerAddress;
    }
    
    /**
     * @dev Set the Aave lending pool address
     * @param lendingPoolAddress The address of the Aave lending pool
     */
    function setAaveLendingPool(address lendingPoolAddress) external onlyOwner {
        require(lendingPoolAddress != address(0), "Invalid lending pool address");
        aaveLendingPool = lendingPoolAddress;
    }
    
    /**
     * @dev Set the fee percentage (in basis points)
     * @param newFeePercentage The new fee percentage
     */
    function setFeePercentage(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 100, "Fee percentage too high");
        feePercentage = newFeePercentage;
    }
    
    /**
     * @dev Execute an arbitrage trade between two DEXes
     * @param sourceDex The name of the source DEX
     * @param targetDex The name of the target DEX
     * @param tokenA The address of the input token
     * @param tokenB The address of the output token
     * @param amountIn The amount of tokenA to swap
     * @param minAmountOut The minimum amount of tokenB to receive from the first swap
     * @param deadline The deadline for the transaction
     */
    function executeArbitrage(
        string memory sourceDex,
        string memory targetDex,
        address tokenA,
        address tokenB,
        uint256 amountIn,
        uint256 minAmountOut,
        uint256 deadline
    ) external onlyOwner nonReentrant {
        require(dexRouters[sourceDex] != address(0), "Source DEX not configured");
        require(dexRouters[targetDex] != address(0), "Target DEX not configured");
        require(tokenA != address(0) && tokenB != address(0), "Invalid token addresses");
        
        // Transfer tokens from the sender to this contract
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountIn);
        
        // Approve the source DEX router to spend tokenA
        IERC20(tokenA).approve(dexRouters[sourceDex], amountIn);
        
        // Create the token path for the first swap
        address[] memory path1 = new address[](2);
        path1[0] = tokenA;
        path1[1] = tokenB;
        
        // Execute the first swap on the source DEX
        IUniswapV2Router sourceRouter = IUniswapV2Router(dexRouters[sourceDex]);
        uint256[] memory amounts1 = sourceRouter.swapExactTokensForTokens(
            amountIn,
            minAmountOut,
            path1,
            address(this),
            deadline
        );
        
        uint256 amountOut = amounts1[1];
        
        // Approve the target DEX router to spend tokenB
        IERC20(tokenB).approve(dexRouters[targetDex], amountOut);
        
        // Create the token path for the second swap
        address[] memory path2 = new address[](2);
        path2[0] = tokenB;
        path2[1] = tokenA;
        
        // Execute the second swap on the target DEX
        IUniswapV2Router targetRouter = IUniswapV2Router(dexRouters[targetDex]);
        uint256[] memory amounts2 = targetRouter.swapExactTokensForTokens(
            amountOut,
            0, // No minimum amount for the second swap
            path2,
            address(this),
            deadline
        );
        
        uint256 finalAmount = amounts2[1];
        
        // Calculate profit
        uint256 profit = 0;
        if (finalAmount > amountIn) {
            profit = finalAmount - amountIn;
            
            // Calculate fee
            uint256 fee = (profit * feePercentage) / 10000;
            uint256 userProfit = profit - fee;
            
            // Transfer profit back to the user
            IERC20(tokenA).transfer(msg.sender, amountIn + userProfit);
            
            // Keep the fee in the contract
        } else {
            // No profit, return the original amount
            IERC20(tokenA).transfer(msg.sender, finalAmount);
        }
        
        emit ArbitrageExecuted(tokenA, tokenB, amountIn, profit);
    }
    
    /**
     * @dev Execute a flash loan arbitrage
     * @param asset The address of the asset to borrow
     * @param amount The amount to borrow
     * @param sourceDex The name of the source DEX
     * @param targetDex The name of the target DEX
     * @param tokenA The address of the input token (same as asset)
     * @param tokenB The address of the output token
     * @param minAmountOut The minimum amount of tokenB to receive from the first swap
     * @param deadline The deadline for the transaction
     */
    function executeFlashLoanArbitrage(
        address asset,
        uint256 amount,
        string memory sourceDex,
        string memory targetDex,
        address tokenA,
        address tokenB,
        uint256 minAmountOut,
        uint256 deadline
    ) external onlyOwner {
        require(aaveLendingPool != address(0), "Aave lending pool not configured");
        require(asset == tokenA, "Asset must be the same as tokenA");
        
        // Prepare flash loan parameters
        address[] memory assets = new address[](1);
        assets[0] = asset;
        
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0; // 0 = no debt, 1 = stable, 2 = variable
        
        // Encode the arbitrage parameters
        bytes memory params = abi.encode(
            sourceDex,
            targetDex,
            tokenA,
            tokenB,
            minAmountOut,
            deadline
        );
        
        // Execute flash loan
        IAaveLendingPool(aaveLendingPool).flashLoan(
            address(this),
            assets,
            amounts,
            modes,
            address(this),
            params,
            0 // referral code
        );
    }
    
    /**
     * @dev Withdraw tokens from the contract
     * @param token The address of the token to withdraw
     * @param amount The amount to withdraw
     */
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw ETH from the contract
     * @param amount The amount to withdraw
     */
    function withdrawETH(uint256 amount) external onlyOwner {
        payable(msg.sender).transfer(amount);
    }
    
    // Function to receive ETH
    receive() external payable {}
}
