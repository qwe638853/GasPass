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

        vm.startBroadcast(deployerPk);
        GasPass gasPass = new GasPass(stablecoin, relayer);
        vm.stopBroadcast();

        console.log("GasPass:", address(gasPass));
    }
}


