// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {GasPass} from "../src/GasPass.sol";
import {GasPassTypes} from "../src/types/GasPassTypes.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

interface IERC20PermitDomain is IERC20Permit {
    // Most ERC20Permit tokens provide this; fallback in try/catch if not available
    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function name() external view returns (string memory);
}
/// @notice Interacts with GasPass contract on Arbitrum mainnet, uses USDC permit + GasPass EIP712 signature for deposit
contract DepositWithSigScript is Script {
    bytes32 constant EIP712DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 constant EIP2612_PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    function run() public {
        // ---------- Environment and accounts ----------
        uint256 userPk     = vm.envUint("PRIVATE_KEY");           // User: signs USDC permit and GasPass EIP-712
        uint256 relayerPk  = vm.envUint("RELAYER_PRIVATE_KEY");   // Broadcaster: submits on-chain transaction (must match if contract restricts relayer)
        address user       = vm.addr(userPk);
        address relayer    = vm.addr(relayerPk);

        address gasPassAddress     = vm.envAddress("GASPASS_ADDRESS");
        address stablecoinAddress  = vm.envAddress("STABLECOIN_ADDRESS");

        uint256 tokenId            = 1; // Change to your card ID
        uint256 amount             = vm.envOr("AMOUNT_USDC", uint256(500_000)); // 0.5 USDC
        uint256 deadline           = block.timestamp + 1 hours;

        console.log("User:", user);
        console.log("Relayer:", relayer);
        console.log("GasPass:", gasPassAddress);
        console.log("Stablecoin(USDC):", stablecoinAddress);
        console.log("TokenId:", tokenId);
        console.log("Amount (USDC-6):", amount);

        GasPass gasPass = GasPass(gasPassAddress);
        IERC20PermitDomain usdc = IERC20PermitDomain(stablecoinAddress);

        // ---------- 1) Sign permit for USDC (EIP-2612) ----------
        uint256 usdcNonce = usdc.nonces(user);

        // Use token's DOMAIN_SEPARATOR (safest)
        bytes32 usdcDomainSeparator;
        bool hasDS = true;
        try usdc.DOMAIN_SEPARATOR() returns (bytes32 sep) {
            usdcDomainSeparator = sep;
        } catch {
            hasDS = false;
        }
        require(hasDS, "USDC: missing DOMAIN_SEPARATOR");

        bytes32 structHashPermit = keccak256(abi.encode(
            EIP2612_PERMIT_TYPEHASH,
            user,                 // owner
            gasPassAddress,       // spender
            amount,
            usdcNonce,
            deadline
        ));
        bytes32 digestPermit = keccak256(abi.encodePacked("\x19\x01", usdcDomainSeparator, structHashPermit));

        (uint8 pv, bytes32 pr, bytes32 ps) = vm.sign(userPk, digestPermit);

        GasPassTypes.StablecoinPermitData memory permitData = GasPassTypes.StablecoinPermitData({
            owner: user,
            spender: gasPassAddress,
            value: amount,
            deadline: deadline,
            v: pv,
            r: pr,
            s: ps
        });

        // For GasPass binding (as per your contract definition)
        bytes32 permitHash = keccak256(abi.encode(
            gasPass.STABLECOIN_PERMIT_TYPEHASH(),
            permitData.owner,
            permitData.spender,
            permitData.value,
            permitData.deadline,
            permitData.v,
            permitData.r,
            permitData.s
        ));

        // ---------- 2) Sign GasPass depositWithSig EIP-712 ----------
        uint256 depNonce = gasPass.ownerNonces(user);

        GasPassTypes.DepositWithSigTypedData memory depData = GasPassTypes.DepositWithSigTypedData({
            tokenId: tokenId,
            amount: amount,
            permitData: permitData,
            nonce: depNonce,
            deadline: deadline
        });

        // Get EIP-712 domain (prefer ERC-5267)
        (string memory gpName, string memory gpVersion, uint256 gpChainId, address gpVerifying) =
            ("GasPass", "1", block.chainid, gasPassAddress);
        try gasPass.eip712Domain() returns (
            bytes1 /*fields*/,
            string memory _name,
            string memory _version,
            uint256 _chainId,
            address _verifyingContract,
            bytes32 /*salt*/,
            uint256[] memory /*extensions*/
        ) {
            gpName = _name;
            gpVersion = _version;
            gpChainId = _chainId;
            gpVerifying = _verifyingContract;
        } catch { /* fallback to defaults */ }

        bytes32 gasPassDomainSeparator = keccak256(abi.encode(
            EIP712DOMAIN_TYPEHASH,
            keccak256(bytes(gpName)),
            keccak256(bytes(gpVersion)),
            gpChainId,
            gpVerifying
        ));

        bytes32 structHashDeposit = keccak256(abi.encode(
            gasPass.DEPOSIT_WITH_SIG_TYPEHASH(),
            depData.tokenId,
            depData.amount,
            permitHash,
            depData.nonce,
            depData.deadline
        ));
        bytes32 digestDeposit = keccak256(
            abi.encodePacked("\x19\x01", gasPassDomainSeparator, structHashDeposit)
        );

        (uint8 dv, bytes32 dr, bytes32 ds) = vm.sign(userPk, digestDeposit);
        bytes memory depSignature = abi.encodePacked(dr, ds, dv);

        console.log("USDC permit v,r,s:", pv, vm.toString(pr), vm.toString(ps));
        console.log("GasPass deposit v,r,s:", dv, vm.toString(dr), vm.toString(ds));

        // ---------- 3) Broadcast transaction ----------
        vm.startBroadcast(relayerPk);
        gasPass.depositWithSig(depData, depSignature);
        vm.stopBroadcast();

        // ---------- Display results ----------
        uint256 newValue = gasPass.balanceOf(tokenId);
        console.log("Deposit success. tokenId:", tokenId);
        console.log("New value(balanceOf tokenId):", newValue);
    }
}

/// @notice Interacts with GasPass contract on Arbitrum mainnet, uses USDC permit + GasPass EIP712 signature
contract MintWithSigScript is Script {
    bytes32 constant EIP712DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 constant EIP2612_PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    function run() public {
        // ---------- Environment and accounts ----------
        uint256 userPk     = vm.envUint("PRIVATE_KEY");
        uint256 relayerPk  = vm.envUint("RELAYER_PRIVATE_KEY");
        address user       = vm.addr(userPk);
        address relayer    = vm.addr(relayerPk);

        address gasPassAddress     = vm.envAddress("GASPASS_ADDRESS");
        address stablecoinAddress  = vm.envAddress("STABLECOIN_ADDRESS");

        console.log("User:", user);
        console.log("Relayer:", relayer);
        console.log("GasPass:", gasPassAddress);
        console.log("Stablecoin(USDC):", stablecoinAddress);

        GasPass gasPass = GasPass(gasPassAddress);
        IERC20PermitDomain usdc = IERC20PermitDomain(stablecoinAddress);

        // ---------- Parameters ----------
        uint256 value = 2_000_000; // 1 USDC (6 decimals)
        uint256 deadline = block.timestamp + 1 hours;

        // ---------- 1) Sign permit for USDC first (EIP-2612) ----------
        uint256 usdcNonce = usdc.nonces(user);

        // Try to read token's built-in DOMAIN_SEPARATOR (safest, avoids name/version/chainId mismatch)
        bytes32 usdcDomainSeparator;
        bool hasDS = true;
        try usdc.DOMAIN_SEPARATOR() returns (bytes32 sep) {
            usdcDomainSeparator = sep;
        } catch {
            hasDS = false;
        }
        require(hasDS, "USDC token does not expose DOMAIN_SEPARATOR; please add manual domain calc if needed.");

        bytes32 structHashPermit = keccak256(abi.encode(
            EIP2612_PERMIT_TYPEHASH,
            user,                 // owner
            gasPassAddress,       // spender
            value,
            usdcNonce,
            deadline
        ));
        bytes32 digestPermit = keccak256(
            abi.encodePacked("\x19\x01", usdcDomainSeparator, structHashPermit)
        );

        (uint8 pv, bytes32 pr, bytes32 ps) = vm.sign(userPk, digestPermit);

        // Prepare permitData for GasPass (this is the USDC signature)
        GasPassTypes.StablecoinPermitData memory permitData = GasPassTypes.StablecoinPermitData({
            owner: user,
            spender: gasPassAddress,
            value: value,
            deadline: deadline,
            v: pv,
            r: pr,
            s: ps
        });

        // This hash is used by GasPass to bind the permit signature (as per your contract definition, includes v/r/s)
        bytes32 permitHash = keccak256(abi.encode(
            gasPass.STABLECOIN_PERMIT_TYPEHASH(),
            permitData.owner,
            permitData.spender,
            permitData.value,
            permitData.deadline,
            permitData.v,
            permitData.r,
            permitData.s
        ));

        // ---------- 2) Sign GasPass mintWithSig EIP-712 ----------
        uint256 mintNonce = gasPass.ownerNonces(user);
        address agent = 0xF0f26bAfEf9D969a5A1660959C886907D6312cF7; // Currently using self as agent is OK

        GasPassTypes.MintWithSigTypedData memory mintData = GasPassTypes.MintWithSigTypedData({
            to: user,
            value: value,
            permitData: permitData,
            agent: agent,
            nonce: mintNonce,
            deadline: deadline
        });

        // Try to get correct domain using ERC-5267 (avoid hardcoding name/version)
        (string memory gpName, string memory gpVersion, uint256 gpChainId, address gpVerifying) =
            ("GasPass", "1", block.chainid, gasPassAddress);
        // eip712Domain() may exist in contract (OpenZeppelin EIP712 v5+ or custom implementation)
        try gasPass.eip712Domain() returns (
            bytes1 /*fields*/,
            string memory _name,
            string memory _version,
            uint256 _chainId,
            address _verifyingContract,
            bytes32 /*salt*/,
            uint256[] memory /*extensions*/
        ) {
            gpName = _name;
            gpVersion = _version;
            gpChainId = _chainId;
            gpVerifying = _verifyingContract;
        } catch {
            // If ERC-5267 is not supported, use default ("GasPass","1",block.chainid,gasPass)
        }

        bytes32 gasPassDomainSeparator = keccak256(abi.encode(
            EIP712DOMAIN_TYPEHASH,
            keccak256(bytes(gpName)),
            keccak256(bytes(gpVersion)),
            gpChainId,
            gpVerifying
        ));

        bytes32 structHashMint = keccak256(abi.encode(
            gasPass.MINT_WITH_SIG_TYPEHASH(),
            mintData.to,
            mintData.value,
            permitHash,
            mintData.agent,
            mintData.nonce,
            mintData.deadline
        ));
        bytes32 digestMint = keccak256(
            abi.encodePacked("\x19\x01", gasPassDomainSeparator, structHashMint)
        );

        (uint8 mv, bytes32 mr, bytes32 ms) = vm.sign(userPk, digestMint);
        bytes memory mintSignature = abi.encodePacked(mr, ms, mv);

        console.log("USDC permit v,r,s:", pv, vm.toString(pr), vm.toString(ps));
        console.log("GasPass mint v,r,s:", mv, vm.toString(mr), vm.toString(ms));

        // ---------- 3) Relayer broadcasts transaction ----------
        vm.startBroadcast(relayerPk);
        gasPass.mintWithSig(mintData, mintSignature);
        vm.stopBroadcast();

        // ---------- Display results ----------
        uint256 newId = gasPass.tokenByIndex(gasPass.totalSupply() - 1);
        console.log("Mint success. tokenId:", newId);
        console.log("Balance (value):", gasPass.balanceOf(newId));
    }
}


contract SetRelayerScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address gasPassAddress = vm.envAddress("GASPASS_ADDRESS");
        address newRelayer = vm.envAddress("RELAYER_ADDRESS");
        vm.startBroadcast(deployerPrivateKey);
        GasPass gasPass = GasPass(gasPassAddress);
        gasPass.setRelayer(newRelayer);
        console.log("Setting relayer for GasPass contract");
        console.log("GasPass contract:", gasPassAddress);
        console.log("Current deployer:", deployer);
        console.log("New relayer:", newRelayer);
    }
}

contract SetRefuelPolicyScript is Script {
    function run() public {
        // env
        address gasPass = vm.envAddress("GASPASS_ADDRESS");
        uint256 ownerPk = vm.envUint("PRIVATE_KEY"); // ★ Must be the owner of tokenId
        uint256 tokenId = 1;
        uint256 targetChainId = 10;
        uint128 gasAmount = 500000;   // Amount of native tokens to refuel on target chain (wei)
        uint128 threshold = 1000000;     // Trigger threshold (wei)
        address agent = vm.addr(ownerPk);                // Agent bound to owner

        console.log("Setting policy...");
        console.log("contract:", gasPass);
        console.log("owner   :", vm.addr(ownerPk));
        console.log("tokenId :", tokenId);
        console.log("chainId :", targetChainId);
        console.log("gasAmt  :", gasAmount);
        console.log("thres   :", threshold);
        console.log("agent   :", agent);

        // Check agent binding status
        address currentWallet = GasPass(gasPass).agentToWallet(agent);
        console.log("Current agent wallet:", currentWallet);
        
        if (currentWallet == address(0)) {
            console.log("ERROR: Agent not bound! Need to bind agent first.");
            console.log("Please run the mint script again to bind the agent.");
            revert("Agent not bound");
        } else if (currentWallet != vm.addr(ownerPk)) {
            console.log("ERROR: Agent bound to different wallet:", currentWallet);
            revert("Agent bound to different wallet");
        } else {
            console.log("SUCCESS: Agent properly bound to wallet");
        }

        vm.startBroadcast(ownerPk);
        GasPass(gasPass).setRefuelPolicy(
            tokenId,
            targetChainId,
            gasAmount,
            threshold,
            agent
        );
        vm.stopBroadcast();

        // Read back to confirm
        (uint128 g, uint128 th, address a, uint256 last) = GasPass(gasPass).chainPolicies(tokenId, targetChainId);
        console.log("  setRefuelPolicy ok");
        console.log("   gasAmount  :", g);
        console.log("   threshold  :", th);
        console.log("   agent      :", a);
        console.log("   lastRefuel :", last);
    }
}


contract WithdrawAllUSDCScript is Script {
    function run() public {
        uint256 ownerPk = vm.envUint("PRIVATE_KEY");
        uint256 tokenId = 1;  // Modify based on your own prepaid card ID
        address to = vm.addr(ownerPk);
        address gasPassAddress = vm.envAddress("GASPASS_ADDRESS");
        vm.startBroadcast(ownerPk);
        GasPass(gasPassAddress).withdrawAllUSDC(tokenId, to);
        console.log("Withdraw success. tokenId:", tokenId);
        console.log("Balance (value):", GasPass(gasPassAddress).balanceOf(tokenId));
        vm.stopBroadcast();
    }
}

contract WithdrawUSDCScript is Script {
    function run() public {
        uint256 ownerPk = vm.envUint("PRIVATE_KEY");
        address gasPassAddress = vm.envAddress("GASPASS_ADDRESS");
        vm.startBroadcast(ownerPk);
        GasPass(gasPassAddress).withdrawUSDC();
        console.log("Withdraw success.");
        console.log("Balance (value):", GasPass(gasPassAddress).balanceOf(address(gasPassAddress)));
        vm.stopBroadcast();
    }
}

contract CancelRefuelPolicyScript is Script {
    function run() public {
        uint256 ownerPk = vm.envUint("PRIVATE_KEY");
        address gasPassAddress = vm.envAddress("GASPASS_ADDRESS");
        uint256 tokenId = 2;
        uint256 targetChainId = 10;
        vm.startBroadcast(ownerPk);
        GasPass(gasPassAddress).cancelRefuelPolicy(tokenId, targetChainId);
        console.log("Cancel refuel policy success. tokenId:", tokenId);
        console.log("ChainId:", targetChainId);
        vm.stopBroadcast();
    }
}


