// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract MockERC20Permit is ERC20, ERC20Permit {
    constructor(string memory name, string memory symbol, uint8 decimals) 
        ERC20(name, symbol) 
        ERC20Permit(name) 
    {
        _mint(msg.sender, 1000000 * 10**decimals); // 1M tokens
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
