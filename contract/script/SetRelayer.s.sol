// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import { GasPass } from "../src/GasPass.sol";

contract SetRelayer is Script {
    function run() external {
        uint256 ownerPk = vm.envUint("PRIVATE_KEY");
        address newRelayer = vm.envAddress("RELAYER");
        
        // 合約地址
        address gasPassAddress = 0x98519ccdb35C9ed521bbcd00435fE2ab2D1305f7;
        
        require(ownerPk != 0, "PRIVATE_KEY not set");
        require(newRelayer != address(0), "RELAYER not set");
        
        address owner = vm.addr(ownerPk);
        console.log("Owner:", owner);
        console.log("New Relayer:", newRelayer);
        console.log("GasPass Contract:", gasPassAddress);
        
        vm.startBroadcast(ownerPk);
        
        GasPass gasPass = GasPass(gasPassAddress);
        
        // 呼叫 setRelayer 函數
        gasPass.setRelayer(newRelayer);
        
        vm.stopBroadcast();
        
        console.log("Relayer set successfully!");
        console.log("New relayer address:", newRelayer);
    }
}
