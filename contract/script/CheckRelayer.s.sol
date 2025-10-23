// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {GasPass} from "../src/GasPass.sol";

contract CheckRelayer is Script {
    function run() external view {
        address gasPassAddress = vm.envAddress("GASPASS_ADDRESS");
        require(gasPassAddress != address(0), "GASPASS_ADDRESS not set");
        
        GasPass gasPass = GasPass(gasPassAddress);
        
        console.log("GasPass Contract Address:", gasPassAddress);
        console.log("Current Relayer Address:", gasPass.relayer());
        console.log("USDC Address:", address(gasPass.stablecoin()));
    }
}
