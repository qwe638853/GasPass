// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {GasPass} from "../src/GasPass.sol";

contract SetRelayerArbitrum is Script {
    function run() public {
        // Get private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Contract address - please fill in the deployed GasPass contract address
        address gasPassAddress = vm.envAddress("GASPASS_ADDRESS");
        
        // New relayer address - please fill in the real relayer address
        address newRelayer = vm.envAddress("NEW_RELAYER_ADDRESS");
        
        console.log("Setting relayer for GasPass contract");
        console.log("GasPass contract:", gasPassAddress);
        console.log("Current deployer:", deployer);
        console.log("New relayer:", newRelayer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        GasPass gasPass = GasPass(gasPassAddress);
        
        // Check current relayer
        address currentRelayer = gasPass.relayer();
        console.log("Current relayer:", currentRelayer);
        
        // Set new relayer
        console.log("Setting new relayer...");
        gasPass.setRelayer(newRelayer);
        
        // Verify setting
        address updatedRelayer = gasPass.relayer();
        console.log("Updated relayer:", updatedRelayer);
        
        vm.stopBroadcast();
        
        console.log("\n=== Relayer Update Summary ===");
        console.log("GasPass Contract:", gasPassAddress);
        console.log("Old Relayer:", currentRelayer);
        console.log("New Relayer:", updatedRelayer);
        console.log("Update Successful:", updatedRelayer == newRelayer);
        
        if (updatedRelayer == newRelayer) {
            console.log("Relayer set successfully!");
        } else {
            console.log("Relayer set failed!");
        }
    }
}
