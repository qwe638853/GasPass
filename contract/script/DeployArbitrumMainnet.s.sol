// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {GasPass} from "../src/GasPass.sol";
import {MockERC20Permit} from "../test/mocks/MockERC20Permit.sol";

contract DeployArbitrumMainnet is Script {
    function run() public {
        // 獲取私鑰
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts to Arbitrum Mainnet");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 部署參數 - 請填入真實地址
        address stablecoin = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831; // USDC on Arbitrum
        address relayer = 0xc4660f40BA6Fe89b3BA7Ded44Cf1DB73D731c95e; // TODO: 填入真實 relayer 地址
        address bungeeGateway = 0xCdEa28Ee7BD5bf7710B294d9391e1b6A318d809a; // Bungee Gateway on Arbitrum
        address bungeeInbox = 0xA3BF43451CdEb6DEC588B8833838fC419CE4F54c; // TODO: 填入真實 bungee inbox 地址
        
        console.log("Deployment parameters:");
        console.log("- Stablecoin (USDC):", stablecoin);
        console.log("- Relayer:", relayer);
        console.log("- Bungee Gateway:", bungeeGateway);
        console.log("- Bungee Inbox:", bungeeInbox);
        
        // 部署 GasPass 合約
        console.log("\nDeploying GasPass contract...");
        GasPass gasPass = new GasPass(stablecoin, relayer, bungeeGateway, bungeeInbox);
        
        console.log("GasPass deployed at:", address(gasPass));
        console.log("GasPass owner:", gasPass.owner());
        console.log("GasPass relayer:", gasPass.relayer());
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Summary ===");
        console.log("Network: Arbitrum Mainnet");
        console.log("GasPass Contract:", address(gasPass));
        console.log("Owner:", gasPass.owner());
        console.log("Relayer:", gasPass.relayer());
        console.log("Stablecoin:", address(gasPass.stablecoin()));
        console.log("Bungee Gateway:", gasPass.bungeeGateway());
        console.log("Bungee Inbox:", gasPass.bungeeInbox());
        
        console.log("\n=== Next Steps ===");
        console.log("1. Verify contract on Arbiscan");
        console.log("2. Set correct relayer address");
        console.log("3. Set correct bungee inbox address");
        console.log("4. Test contract functionality");
        
        console.log("=== Verification Command ===");
        console.log("forge verify-contract");
        console.log(address(gasPass));
        console.log("src/GasPass.sol:GasPass");
        console.log("--chain-id 42161");
        console.log("--etherscan-api-key $ARBISCAN_API_KEY");
    }
}
