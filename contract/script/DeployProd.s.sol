// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import { GasPass } from "../src/GasPass.sol";

contract DeployProd is Script {
    function run() external {
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");
        address relayer = vm.envAddress("RELAYER");
        address stablecoin = vm.envAddress("STABLECOIN");

        require(deployerPk != 0, "PRIVATE_KEY not set");
        require(relayer != address(0), "RELAYER not set");
        require(stablecoin != address(0), "STABLECOIN not set");

        address deployer = vm.addr(deployerPk);
        console.log("Deploying GasPass to Arbitrum Mainnet...");
        console.log("Deployer:", deployer);
        console.log("Relayer:", relayer);
        console.log("Stablecoin (USDC):", stablecoin);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPk);
        GasPass gasPass = new GasPass(stablecoin, relayer, address(0x1000000000000000000000000000000000000000), address(0xB000000000000000000000000000000000000000));
        vm.stopBroadcast();

        console.log("GasPass deployed at:", address(gasPass));
        console.log("Deployment completed successfully!");
        
        // Output information for verification
        console.log("\n=== Deployment Information ===");
        console.log("Contract Address:", address(gasPass));
        console.log("Stablecoin Address:", stablecoin);
        console.log("Relayer Address:", relayer);
        console.log("Deployer Address:", deployer);
    }
}


