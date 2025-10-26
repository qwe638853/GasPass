// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {GasPass} from "../src/GasPass.sol";
import {GasPassTypes} from "../src/types/GasPassTypes.sol";
import {IBungeeInbox} from "../src/bungee/IBungeeInbox.sol";
import {BungeeInboxRequest} from "../src/bungee/BasicRequestLib.sol"; // Provides createSORHash(req)
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AutoRefuelToOPScript is Script {
    function run() public {
        // === Read environment variables ===
        address gasPassAddr   = vm.envAddress("GASPASS_ADDRESS");
        uint256 agentPk       = vm.envUint("PRIVATE_KEY"); // ★ Must be the private key of policy.agent
        uint256 tokenId       = 2;      // 3525 tokenId to refuel
        address receiver  = vm.addr(agentPk); // Receiving address on Optimism chain (can be EOA or contract)
        // You can modify GAS_AMOUNT_USDC; default 1 USDC = 1_000_000 (6 decimals)
        uint256 gasAmountUSDC = vm.envOr("GAS_AMOUNT_USDC", uint256(3_000_000));
        // Avoid expiration (adjustable)
        uint256 deadlineDelta = vm.envOr("DEADLINE_SECONDS", uint256(10 minutes));
        // Advanced option (generally use 0)
        uint256 minDestGas    = vm.envOr("MIN_DEST_GAS", uint256(0));

        uint256 originChainId = block.chainid; // Should be 42161 (Arbitrum)
        uint256 targetChainId = 10;            // Optimism Mainnet

        GasPass gasPass = GasPass(gasPassAddr);

        // Read important contract addresses
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
         // === Check policy and balance (optional but useful) ===
        console.log("policyAgent:", policyAgent);
        console.log("agentPk:", vm.addr(agentPk));
        require(policyAgent == vm.addr(agentPk), "agent mismatch with policy");
        require(gasAmt == gasAmountUSDC, "policy gasAmount != GAS_AMOUNT_USDC");
        console.log("gasAmt:", gasAmt);
        
        uint256 currentTimestamp = block.timestamp;
        uint256 deadline = currentTimestamp + deadlineDelta;
        // Prevent stack-too-deep by splitting variables
        uint256 inputAmount = gasAmountUSDC;
        uint256 chainSlug_  = targetChainId;
        uint256 nonce = uint256(
            uint32(
                bytes4(
                    keccak256(
                        abi.encodePacked(
                            currentTimestamp,
                            block.number,
                            gasPassAddr,           // Script contract address (doesn't matter, just for entropy)
                            inputAmount,
                            chainSlug_,
                            gasleft()
                        )
                    )
                )
            )
        );
        console.log("nonce:", nonce);

        // === Construct IBungeeInbox.Request ===
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
            inputAmount:          3000000,           
            outputToken:          0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE,             
            minOutputAmount:      743949992662506 ,                       
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

        // Hash that will be verified in the contract
        bytes32 expectedSorHash = BungeeInboxRequest.createSORHash(req);

        // === Call autoRefuel ===
        vm.startBroadcast(agentPk);
        gasPass.autoRefuel(tokenId, inbox, req, expectedSorHash, targetChainId);
        vm.stopBroadcast();

        console.log(" autoRefuel submitted");
    }
}
