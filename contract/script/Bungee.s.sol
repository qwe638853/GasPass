// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {GasPass} from "../src/GasPass.sol";
import {GasPassTypes} from "../src/types/GasPassTypes.sol";
import {IBungeeInbox} from "../src/bungee/IBungeeInbox.sol";
import {BungeeInboxRequest} from "../src/bungee/BasicRequestLib.sol"; // 提供 createSORHash(req)
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AutoRefuelToOPScript is Script {
    function run() public {
        // === 讀取環境變數 ===
        address gasPassAddr   = vm.envAddress("GASPASS_ADDRESS");
        uint256 agentPk       = vm.envUint("PRIVATE_KEY"); // ★ 一定要是 policy.agent 的私鑰
        uint256 tokenId       = 1;      // 要 refuel 的 3525 tokenId
        address receiver  = vm.addr(agentPk); // Optimism 鏈上的接收地址（EOA/合約皆可）
        // 你可以改 GAS_AMOUNT_USDC；預設 1 USDC = 1_000_000（6 decimals）
        uint256 gasAmountUSDC = vm.envOr("GAS_AMOUNT_USDC", uint256(2_000_000));
        // 避免過期（可調整）
        uint256 deadlineDelta = vm.envOr("DEADLINE_SECONDS", uint256(10 minutes));
        // 進階選項（一般用 0）
        uint256 minDestGas    = vm.envOr("MIN_DEST_GAS", uint256(0));

        uint256 originChainId = block.chainid; // 應為 42161（Arbitrum）
        uint256 targetChainId = 10;            // Optimism Mainnet

        GasPass gasPass = GasPass(gasPassAddr);

        // 讀取合約重要地址
        address inbox    = gasPass.bungeeInbox();
        address gateway  = gasPass.bungeeGateway();
        address stable   = address(gasPass.stablecoin());

        console.log("Agent     :", vm.addr(agentPk));
        console.log("TokenId   :", tokenId);
        console.log("Origin    :", originChainId);
        console.log("Target    :", targetChainId);
        console.log("Inbox     :", inbox);
        console.log("Gateway   :", gateway);
        console.log("Stablecoin:", stable);
        console.log("Receiver  :", receiver);
        console.log("GasAmount (USDC-6):", gasAmountUSDC);

       
        
        
        (uint128 gasAmt, uint128 thres, address policyAgent, uint256 last) = gasPass.chainPolicies(tokenId, targetChainId);
         // === 檢查 policy 與餘額（可選但實用） ===
        console.log("policyAgent:", policyAgent);
        console.log("agentPk:", vm.addr(agentPk));
        require(policyAgent == vm.addr(agentPk), "agent mismatch with policy");
        require(gasAmt == gasAmountUSDC, "policy gasAmount != GAS_AMOUNT_USDC");
        console.log("gasAmt:", gasAmt);
        
        uint256 currentTimestamp = block.timestamp;
        uint256 deadline = currentTimestamp + deadlineDelta;
        // 防止 stack-too-deep，拆變數
        uint256 inputAmount = gasAmountUSDC;
        uint256 chainSlug_  = targetChainId;
        uint256 nonce = uint256(
            uint32(
                bytes4(
                    keccak256(
                        abi.encodePacked(
                            currentTimestamp,
                            block.number,
                            gasPassAddr,           // script 合約地址 (無所謂，只是 entropy)
                            inputAmount,
                            chainSlug_,
                            gasleft()
                        )
                    )
                )
            )
        );
        console.log("nonce:", nonce);

        // === 構造 IBungeeInbox.Request ===
        IBungeeInbox.BasicRequest memory basic = IBungeeInbox.BasicRequest({
            originChainId:        originChainId,
            destinationChainId:   targetChainId,
            deadline:             block.timestamp + deadlineDelta,
            nonce:                nonce, 
            sender:               inbox,            
            receiver:             receiver,
            delegate:             receiver,              
            bungeeGateway:        gateway,                 
            switchboardId:        1,                       
            inputToken:           stable,                 
            inputAmount:          2000000,           
            outputToken:          0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE,             
            minOutputAmount:      612500000000000000 ,                       
            refuelAmount:         0        
        });

        IBungeeInbox.Request memory req = IBungeeInbox.Request({
            basicReq:             basic,
            swapOutputToken:      address(0),              
            minSwapOutput:        0,
            metadata:             bytes32(0),
            affiliateFees:        bytes(""),
            minDestGas:           0,
            destinationPayload:   bytes(""),
            exclusiveTransmitter: address(0)
        });

        // 合約內會驗證的 hash
        bytes32 expectedSorHash = BungeeInboxRequest.createSORHash(req);

        // === 呼叫 autoRefuel ===
        vm.startBroadcast(agentPk);
        gasPass.autoRefuel(tokenId, inbox, req, expectedSorHash, targetChainId);
        vm.stopBroadcast();

        console.log(" autoRefuel submitted");
    }
}
