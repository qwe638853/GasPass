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
        GasPass gasPass = new GasPass(stablecoin, relayer);
        vm.stopBroadcast();

        console.log("GasPass deployed at:", address(gasPass));
        console.log("Deployment completed successfully!");
        
        // 輸出用於驗證的資訊
        console.log(unicode"\n=== 部署資訊 ===");
        console.log(unicode"合約地址:", address(gasPass));
        console.log(unicode"穩定幣地址:", stablecoin);
        console.log(unicode"Relayer地址:", relayer);
        console.log(unicode"部署者地址:", deployer);
    }
}


