// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {GasPass} from "../src/GasPass.sol";

contract SetRelayerArbitrum is Script {
    function run() public {
        // 獲取私鑰
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // 合約地址 - 請填入部署後的 GasPass 合約地址
        address gasPassAddress = vm.envAddress("GASPASS_ADDRESS");
        
        // 新的 relayer 地址 - 請填入真實的 relayer 地址
        address newRelayer = vm.envAddress("NEW_RELAYER_ADDRESS");
        
        console.log("Setting relayer for GasPass contract");
        console.log("GasPass contract:", gasPassAddress);
        console.log("Current deployer:", deployer);
        console.log("New relayer:", newRelayer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        GasPass gasPass = GasPass(gasPassAddress);
        
        // 檢查當前 relayer
        address currentRelayer = gasPass.relayer();
        console.log("Current relayer:", currentRelayer);
        
        // 設置新的 relayer
        console.log("Setting new relayer...");
        gasPass.setRelayer(newRelayer);
        
        // 驗證設置
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
