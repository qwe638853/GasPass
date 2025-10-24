// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {GasPass} from "../src/GasPass.sol";
import {MockERC20Permit} from "./mocks/MockERC20Permit.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {GasPassTypes} from "../src/types/GasPassTypes.sol";
import {IBungeeInbox} from "../src/bungee/IBungeeInbox.sol";
import {BungeeInboxRequest} from "../src/bungee/BasicRequestLib.sol";

// Helper contract to calculate SOR hash
contract SORHashCalculator {
    function calculateSORHash(IBungeeInbox.Request memory request) external view returns (bytes32) {
        return BungeeInboxRequest.createSORHash(request);
    }
}

contract GasPassTest is Test {
    GasPass gasPass;
    MockERC20Permit stable;
    address relayer = address(0xBEEF);
    SORHashCalculator sorCalculator;

    // users
    address alice;
    uint256 alicePk;
    address bob;
    uint256 bobPk;

    function setUp() public {
        (alice, alicePk) = makeAddrAndKey("alice");
        (bob, bobPk) = makeAddrAndKey("bob");

        stable = new MockERC20Permit("MockUSD", "MUSD");
        stable.mint(alice, 1_000_000 ether);
        stable.mint(bob, 1_000_000 ether);

        gasPass = new GasPass(address(stable), relayer, address(0x1000000000000000000000000000000000000000), address(0xB000000000000000000000000000000000000000));
        sorCalculator = new SORHashCalculator();
    }

    function _signPermit(
        address owner,
        uint256 ownerPk,
        address spender,
        uint256 value,
        uint256 deadline
    ) internal view returns (uint8 v, bytes32 r, bytes32 s) {
        // OpenZeppelin ERC20Permit uses EIP-2612 domain; use built-in permit by signing via cheatcodes
        bytes32 digest = stable.DOMAIN_SEPARATOR();
        // Note: Simpler path: use permit via vm.sign for EIP-2612 typed data is non-trivial.
        // For tests here we will bypass on-chain permit by pre-approving via prank where needed for non-permit cases.
        // However GasPass requires calling permit(...), so we instead craft a valid permit using OZ helper from stdcheats if available.
        // To keep concise, we'll use ERC20Permit signature via helper in std: vm.sign for EIP712 hash built below.

        // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)")
        bytes32 PERMIT_TYPEHASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;
        uint256 nonce = stable.nonces(owner);
        bytes32 structHash = keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonce, deadline));
        bytes32 eip712Hash = keccak256(abi.encodePacked("\x19\x01", digest, structHash));
        (v, r, s) = vm.sign(ownerPk, eip712Hash);
    }

    function test_mintWithSig_success() public {
        // prepare permit data
        uint256 amount = 1000 ether;
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _signPermit(alice, alicePk, address(gasPass), amount, deadline);

        // build outer typed data per GasPass
        GasPassTypes.StablecoinPermitData memory p = GasPassTypes.StablecoinPermitData({
            owner: alice,
            spender: address(gasPass),
            value: amount,
            deadline: deadline,
            v: v,
            r: r,
            s: s
        });

        // use bob as agent for first mint; mapping agent->wallet will be set
        GasPassTypes.MintWithSigTypedData memory m = GasPassTypes.MintWithSigTypedData({
            to: alice,
            value: amount,
            permitData: p,
            agent: bob,
            nonce: gasPass.ownerNonces(alice),
            deadline: block.timestamp + 1 days
        });

        // hash outer struct per contract logic
        bytes32 permitHash = keccak256(abi.encode(
            gasPass.STABLECOIN_PERMIT_TYPEHASH(),
            p.owner,
            p.spender,
            p.value,
            p.deadline,
            p.v,
            p.r,
            p.s
        ));

        bytes32 structHash = keccak256(abi.encode(
            gasPass.MINT_WITH_SIG_TYPEHASH(),
            m.to,
            m.value,
            permitHash,
            m.agent,
            m.nonce,
            m.deadline
        ));

        bytes32 digest = _hashTypedDataV4(gasPass, structHash);
        (uint8 ov, bytes32 or_, bytes32 os) = vm.sign(alicePk, digest);
        bytes memory outerSig = abi.encodePacked(or_, os, ov);

        vm.prank(relayer);
        gasPass.mintWithSig(m, outerSig);

        // tokenId = 1 for first mint per ERC3525 implementation
        assertEq(gasPass.ownerOf(1), alice);
        assertEq(gasPass.balanceOf(1), amount);
        // verify agent mapping is set
        assertEq(gasPass.getAgentToWallet(bob), alice);
    }

    function test_mintWithSig_revert_onlyOwner() public {
        uint256 amount = 1 ether;
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _signPermit(alice, alicePk, address(gasPass), amount, deadline);
        GasPassTypes.StablecoinPermitData memory p = GasPassTypes.StablecoinPermitData(alice, address(gasPass), amount, deadline, v, r, s);
        GasPassTypes.MintWithSigTypedData memory m = GasPassTypes.MintWithSigTypedData(alice, amount, p, bob, gasPass.ownerNonces(alice), block.timestamp + 1 days);

        bytes32 permitHash = keccak256(abi.encode(
            gasPass.STABLECOIN_PERMIT_TYPEHASH(), p.owner, p.spender, p.value, p.deadline, p.v, p.r, p.s));
        bytes32 structHash = keccak256(abi.encode(
            gasPass.MINT_WITH_SIG_TYPEHASH(), m.to, m.value, permitHash, m.agent, m.nonce, m.deadline));
        bytes32 digest = _hashTypedDataV4(gasPass, structHash);
        (uint8 ov, bytes32 or_, bytes32 os) = vm.sign(alicePk, digest);
        bytes memory outerSig = abi.encodePacked(or_, os, ov);

        vm.expectRevert("Not relayer");
        vm.prank(alice);
        gasPass.mintWithSig(m, outerSig);
    }

    function test_depositWithSig_success() public {
        // Mint first
        uint256 amount = 100 ether;
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _signPermit(alice, alicePk, address(gasPass), amount, deadline);
        GasPassTypes.StablecoinPermitData memory p = GasPassTypes.StablecoinPermitData(alice, address(gasPass), amount, deadline, v, r, s);
        GasPassTypes.MintWithSigTypedData memory m = GasPassTypes.MintWithSigTypedData(alice, amount, p, bob, gasPass.ownerNonces(alice), block.timestamp + 1 days);
        bytes32 pmh = keccak256(abi.encode(gasPass.STABLECOIN_PERMIT_TYPEHASH(), p.owner, p.spender, p.value, p.deadline, p.v, p.r, p.s));
        bytes32 msh = keccak256(abi.encode(gasPass.MINT_WITH_SIG_TYPEHASH(), m.to, m.value, pmh, m.agent, m.nonce, m.deadline));
        bytes32 md = _hashTypedDataV4(gasPass, msh);
        (uint8 ov, bytes32 or_, bytes32 os) = vm.sign(alicePk, md);
        bytes memory osig = abi.encodePacked(or_, os, ov);
        vm.prank(relayer);
        gasPass.mintWithSig(m, osig);

        // deposit more
        uint256 addAmt = 50 ether;
        (v, r, s) = _signPermit(alice, alicePk, address(gasPass), addAmt, deadline);
        GasPassTypes.StablecoinPermitData memory p2 = GasPassTypes.StablecoinPermitData(alice, address(gasPass), addAmt, deadline, v, r, s);
        GasPassTypes.DepositWithSigTypedData memory d = GasPassTypes.DepositWithSigTypedData(1, addAmt, p2, gasPass.ownerNonces(alice), block.timestamp + 1 days);
        bytes32 ph2 = keccak256(abi.encode(gasPass.STABLECOIN_PERMIT_TYPEHASH(), p2.owner, p2.spender, p2.value, p2.deadline, p2.v, p2.r, p2.s));
        bytes32 dsh = keccak256(abi.encode(gasPass.DEPOSIT_WITH_SIG_TYPEHASH(), d.tokenId, d.amount, ph2, d.nonce, d.deadline));
        bytes32 dd = _hashTypedDataV4(gasPass, dsh);
        (ov, or_, os) = vm.sign(alicePk, dd);
        bytes memory dsig = abi.encodePacked(or_, os, ov);

        vm.prank(relayer);
        gasPass.depositWithSig(d, dsig);
        assertEq(gasPass.balanceOf(1), amount + addAmt);
    }

    function test_setRefuelPolicyWithSig_and_cancel_success() public {
        // Prepare a minted token owned by alice
        uint256 amount = 100 ether;
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _signPermit(alice, alicePk, address(gasPass), amount, deadline);
        GasPassTypes.StablecoinPermitData memory p = GasPassTypes.StablecoinPermitData(alice, address(gasPass), amount, deadline, v, r, s);
        GasPassTypes.MintWithSigTypedData memory m = GasPassTypes.MintWithSigTypedData(alice, amount, p, bob, gasPass.ownerNonces(alice), block.timestamp + 1 days);

        bytes32 pmh = keccak256(abi.encode(gasPass.STABLECOIN_PERMIT_TYPEHASH(), p.owner, p.spender, p.value, p.deadline, p.v, p.r, p.s));
        bytes32 msh = keccak256(abi.encode(gasPass.MINT_WITH_SIG_TYPEHASH(), m.to, m.value, pmh, m.agent, m.nonce, m.deadline));
        bytes32 md = _hashTypedDataV4(gasPass, msh);
        (uint8 ov, bytes32 or_, bytes32 os) = vm.sign(alicePk, md);
        bytes memory osig = abi.encodePacked(or_, os, ov);
        vm.prank(relayer);
        gasPass.mintWithSig(m, osig);

        // set policy via relayer with alice signature
        GasPassTypes.SetRefuelPolicyTypedData memory sp = GasPassTypes.SetRefuelPolicyTypedData({
            tokenId: 1,
            targetChainId: 137,
            gasAmount: uint128(10 ether),
            threshold: uint128(5 ether),
            agent: bob,
            nonce: 0,
            deadline: block.timestamp + 1 days
        });

        bytes32 spsh = keccak256(abi.encode(
            gasPass.SET_REFUEL_POLICY_TYPEHASH(),
            sp.tokenId,
            sp.targetChainId,
            sp.gasAmount,
            sp.threshold,
            sp.agent,
            sp.nonce,
            sp.deadline
        ));
        bytes32 spd = _hashTypedDataV4(gasPass, spsh);
        (ov, or_, os) = vm.sign(alicePk, spd);
        bytes memory spsig = abi.encodePacked(or_, os, ov);

        vm.prank(relayer);
        gasPass.setRefuelPolicyWithSig(sp, spsig);
        // cancel policy
        GasPassTypes.CancelRefuelPolicyTypedData memory cp = GasPassTypes.CancelRefuelPolicyTypedData({
            tokenId: 1,
            targetChainId: 137,
            nonce: 1,
            deadline: block.timestamp + 1 days
        });
        bytes32 cpsh = keccak256(abi.encode(
            gasPass.CANCEL_REFUEL_POLICY_TYPEHASH(),
            cp.tokenId,
            cp.targetChainId,
            cp.nonce,
            cp.deadline
        ));
        bytes32 cpd = _hashTypedDataV4(gasPass, cpsh);
        (ov, or_, os) = vm.sign(alicePk, cpd);
        bytes memory cpsig = abi.encodePacked(or_, os, ov);
        vm.prank(relayer);
        gasPass.cancelRefuelPolicyWithSig(cp, cpsig);
    }

    function test_mintBatchWithSig_success() public {
        uint256 batchAmount = 5;
        uint256 singleValue = 20 ether;
        uint256 totalValue = batchAmount * singleValue;
        uint256 deadline = block.timestamp + 1 days;
        
        (uint8 v, bytes32 r, bytes32 s) = _signPermit(alice, alicePk, address(gasPass), totalValue, deadline);
        
        GasPassTypes.StablecoinPermitData memory p = GasPassTypes.StablecoinPermitData({
            owner: alice,
            spender: address(gasPass),
            value: totalValue,
            deadline: deadline,
            v: v,
            r: r,
            s: s
        });
        
        GasPassTypes.MintBatchWithSigTypedData memory m = GasPassTypes.MintBatchWithSigTypedData({
            to: alice,
            amount: batchAmount,
            singleValue: singleValue,
            agent: bob,
            permitData: p,
            nonce: gasPass.ownerNonces(alice),
            deadline: deadline
        });
        
        bytes32 permitHash = keccak256(abi.encode(
            gasPass.STABLECOIN_PERMIT_TYPEHASH(),
            p.owner,
            p.spender,
            p.value,
            p.deadline,
            p.v,
            p.r,
            p.s
        ));
        
        bytes32 structHash = keccak256(abi.encode(
            gasPass.MINT_BATCH_WITH_SIG_TYPEHASH(),
            m.to,
            m.amount,
            m.singleValue,
            m.agent,
            permitHash,
            m.nonce,
            m.deadline
        ));
        
        bytes32 digest = _hashTypedDataV4(gasPass, structHash);
        (uint8 ov, bytes32 or_, bytes32 os) = vm.sign(alicePk, digest);
        bytes memory signature = abi.encodePacked(or_, os, ov);
        
        vm.prank(relayer);
        gasPass.mintBatchWithSig(m, signature);
        
        assertEq(gasPass.balanceOf(alice), batchAmount);
        assertEq(gasPass.getAgentToWallet(bob), alice);
        
        for (uint256 i = 1; i <= batchAmount; i++) {
            assertEq(gasPass.ownerOf(i), alice);
            assertEq(gasPass.balanceOf(i), singleValue);
        }
    }

    function test_setAgentToWalletWithSig_success() public {
        uint256 deadline = block.timestamp + 1 days;
        
        GasPassTypes.SetAgentToWalletWithSigTypedData memory data = GasPassTypes.SetAgentToWalletWithSigTypedData({
            agent: bob,
            wallet: alice,
            nonce: gasPass.ownerNonces(alice),
            deadline: deadline
        });
        
        bytes32 structHash = keccak256(abi.encode(
            gasPass.SET_AGENT_TO_WALLET_WITH_SIG_TYPEHASH(),
            data.agent,
            data.wallet,
            data.nonce,
            data.deadline
        ));
        
        bytes32 digest = _hashTypedDataV4(gasPass, structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(alicePk, digest);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.prank(relayer);
        gasPass.setAgentToWalletWithSig(data, signature);
        
        assertEq(gasPass.getAgentToWallet(bob), alice);
    }

    function test_setRefuelPolicy_success() public {
        // First mint a token
        uint256 amount = 100 ether;
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _signPermit(alice, alicePk, address(gasPass), amount, deadline);
        GasPassTypes.StablecoinPermitData memory p = GasPassTypes.StablecoinPermitData(alice, address(gasPass), amount, deadline, v, r, s);
        GasPassTypes.MintWithSigTypedData memory m = GasPassTypes.MintWithSigTypedData(alice, amount, p, bob, gasPass.ownerNonces(alice), deadline);
        bytes32 pmh = keccak256(abi.encode(gasPass.STABLECOIN_PERMIT_TYPEHASH(), p.owner, p.spender, p.value, p.deadline, p.v, p.r, p.s));
        bytes32 msh = keccak256(abi.encode(gasPass.MINT_WITH_SIG_TYPEHASH(), m.to, m.value, pmh, m.agent, m.nonce, m.deadline));
        bytes32 md = _hashTypedDataV4(gasPass, msh);
        (uint8 ov, bytes32 or_, bytes32 os) = vm.sign(alicePk, md);
        bytes memory osig = abi.encodePacked(or_, os, ov);
        vm.prank(relayer);
        gasPass.mintWithSig(m, osig);
        
        // Set refuel policy
        vm.prank(alice);
        gasPass.setRefuelPolicy(1, 137, uint128(10 ether), uint128(5 ether), bob);
        
        (uint128 gasAmount, uint128 threshold, address agent, uint256 lastRefueled) = gasPass.chainPolicies(1, 137);
        assertEq(gasAmount, 10 ether);
        assertEq(threshold, 5 ether);
        assertEq(agent, bob);
        assertEq(lastRefueled, 0);
    }

    function test_cancelRefuelPolicy_success() public {
        // First mint a token and set policy
        uint256 amount = 100 ether;
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _signPermit(alice, alicePk, address(gasPass), amount, deadline);
        GasPassTypes.StablecoinPermitData memory p = GasPassTypes.StablecoinPermitData(alice, address(gasPass), amount, deadline, v, r, s);
        GasPassTypes.MintWithSigTypedData memory m = GasPassTypes.MintWithSigTypedData(alice, amount, p, bob, gasPass.ownerNonces(alice), deadline);
        bytes32 pmh = keccak256(abi.encode(gasPass.STABLECOIN_PERMIT_TYPEHASH(), p.owner, p.spender, p.value, p.deadline, p.v, p.r, p.s));
        bytes32 msh = keccak256(abi.encode(gasPass.MINT_WITH_SIG_TYPEHASH(), m.to, m.value, pmh, m.agent, m.nonce, m.deadline));
        bytes32 md = _hashTypedDataV4(gasPass, msh);
        (uint8 ov, bytes32 or_, bytes32 os) = vm.sign(alicePk, md);
        bytes memory osig = abi.encodePacked(or_, os, ov);
        vm.prank(relayer);
        gasPass.mintWithSig(m, osig);
        
        vm.prank(alice);
        gasPass.setRefuelPolicy(1, 137, uint128(10 ether), uint128(5 ether), bob);
        
        // Cancel policy
        vm.prank(alice);
        gasPass.cancelRefuelPolicy(1, 137);
        
        (uint128 gasAmount, uint128 threshold, address agent, uint256 lastRefueled) = gasPass.chainPolicies(1, 137);
        assertEq(gasAmount, 0);
        assertEq(threshold, 0);
        assertEq(agent, address(0));
        assertEq(lastRefueled, 0);
    }

    function test_setRelayer_success() public {
        address newRelayer = address(0xCAFE);
        
        vm.prank(gasPass.owner());
        gasPass.setRelayer(newRelayer);
        
        assertEq(gasPass.relayer(), newRelayer);
    }

    function test_setRelayer_revert_notOwner() public {
        address newRelayer = address(0xCAFE);
        
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", alice));
        gasPass.setRelayer(newRelayer);
    }

    function test_withdrawAllUSDC_success() public {
        // First mint a token
        uint256 amount = 100 ether;
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _signPermit(alice, alicePk, address(gasPass), amount, deadline);
        GasPassTypes.StablecoinPermitData memory p = GasPassTypes.StablecoinPermitData(alice, address(gasPass), amount, deadline, v, r, s);
        GasPassTypes.MintWithSigTypedData memory m = GasPassTypes.MintWithSigTypedData(alice, amount, p, bob, gasPass.ownerNonces(alice), deadline);
        bytes32 pmh = keccak256(abi.encode(gasPass.STABLECOIN_PERMIT_TYPEHASH(), p.owner, p.spender, p.value, p.deadline, p.v, p.r, p.s));
        bytes32 msh = keccak256(abi.encode(gasPass.MINT_WITH_SIG_TYPEHASH(), m.to, m.value, pmh, m.agent, m.nonce, m.deadline));
        bytes32 md = _hashTypedDataV4(gasPass, msh);
        (uint8 ov, bytes32 or_, bytes32 os) = vm.sign(alicePk, md);
        bytes memory osig = abi.encodePacked(or_, os, ov);
        vm.prank(relayer);
        gasPass.mintWithSig(m, osig);
        
        uint256 initialBalance = stable.balanceOf(alice);
        
        vm.prank(alice);
        gasPass.withdrawAllUSDC(1, alice);
        
        assertEq(stable.balanceOf(alice), initialBalance + amount);
        assertEq(gasPass.balanceOf(1), 0);
    }

    function test_withdrawAllUSDC_revert_notTokenOwner() public {
        // First mint a token owned by alice
        uint256 amount = 100 ether;
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _signPermit(alice, alicePk, address(gasPass), amount, deadline);
        GasPassTypes.StablecoinPermitData memory p = GasPassTypes.StablecoinPermitData(alice, address(gasPass), amount, deadline, v, r, s);
        GasPassTypes.MintWithSigTypedData memory m = GasPassTypes.MintWithSigTypedData(alice, amount, p, bob, gasPass.ownerNonces(alice), deadline);
        bytes32 pmh = keccak256(abi.encode(gasPass.STABLECOIN_PERMIT_TYPEHASH(), p.owner, p.spender, p.value, p.deadline, p.v, p.r, p.s));
        bytes32 msh = keccak256(abi.encode(gasPass.MINT_WITH_SIG_TYPEHASH(), m.to, m.value, pmh, m.agent, m.nonce, m.deadline));
        bytes32 md = _hashTypedDataV4(gasPass, msh);
        (uint8 ov, bytes32 or_, bytes32 os) = vm.sign(alicePk, md);
        bytes memory osig = abi.encodePacked(or_, os, ov);
        vm.prank(relayer);
        gasPass.mintWithSig(m, osig);
        
        // Now try to withdraw with bob (not the owner)
        vm.prank(bob);
        vm.expectRevert("Not token owner");
        gasPass.withdrawAllUSDC(1, bob);
    }

    function test_autoRefuel_success() public {
        // First mint a token and set refuel policy
        uint256 amount = 100 ether;
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _signPermit(alice, alicePk, address(gasPass), amount, deadline);
        GasPassTypes.StablecoinPermitData memory p = GasPassTypes.StablecoinPermitData(alice, address(gasPass), amount, deadline, v, r, s);
        GasPassTypes.MintWithSigTypedData memory m = GasPassTypes.MintWithSigTypedData(alice, amount, p, bob, gasPass.ownerNonces(alice), deadline);
        bytes32 pmh = keccak256(abi.encode(gasPass.STABLECOIN_PERMIT_TYPEHASH(), p.owner, p.spender, p.value, p.deadline, p.v, p.r, p.s));
        bytes32 msh = keccak256(abi.encode(gasPass.MINT_WITH_SIG_TYPEHASH(), m.to, m.value, pmh, m.agent, m.nonce, m.deadline));
        bytes32 md = _hashTypedDataV4(gasPass, msh);
        (uint8 ov, bytes32 or_, bytes32 os) = vm.sign(alicePk, md);
        bytes memory osig = abi.encodePacked(or_, os, ov);
        vm.prank(relayer);
        gasPass.mintWithSig(m, osig);
        
        // Set refuel policy
        vm.prank(alice);
        gasPass.setRefuelPolicy(1, 137, uint128(10 ether), uint128(5 ether), bob);
        
        // Create mock Bungee request
        address mockInbox = address(0xB000000000000000000000000000000000000000);
        address mockGateway = address(0x1000000000000000000000000000000000000000);
        address mockReceiver = address(0x2000000000000000000000000000000000000000);
        
        IBungeeInbox.BasicRequest memory basicReq = IBungeeInbox.BasicRequest({
            originChainId: block.chainid,
            destinationChainId: 137,
            deadline: block.timestamp + 1 hours,
            nonce: 12345,
            sender: address(gasPass),
            receiver: mockReceiver,
            delegate: mockReceiver,
            bungeeGateway: address(0x1000000000000000000000000000000000000000),
            switchboardId: 1,
            inputToken: address(stable),
            inputAmount: 10 ether,
            outputToken: address(0),
            minOutputAmount: 0,
            refuelAmount: 0
        });
        
        IBungeeInbox.Request memory req = IBungeeInbox.Request({
            basicReq: basicReq,
            swapOutputToken: address(0),
            minSwapOutput: 0,
            metadata: bytes32(0),
            affiliateFees: "",
            minDestGas: 0,
            destinationPayload: "",
            exclusiveTransmitter: address(0)
        });
        
        // Calculate expected SOR hash
        bytes32 expectedSorHash = sorCalculator.calculateSORHash(req);
        
        // Mock the Bungee inbox contract
        vm.etch(mockInbox, abi.encodePacked(
            hex"608060405234801561001057600080fd5b506004361061002b5760003560e01c8063",
            hex"0000000000000000000000000000000000000000000000000000000000000000"
        ));
        
        // Mock the gateway to accept allowance
        vm.etch(mockGateway, abi.encodePacked(
            hex"608060405234801561001057600080fd5b506004361061002b5760003560e01c8063",
            hex"0000000000000000000000000000000000000000000000000000000000000000"
        ));
        
        uint256 initialBalance = gasPass.balanceOf(1);
        uint256 initialFees = gasPass.totalFeesCollected();
        
        // Advance time to pass cooldown period
        vm.warp(block.timestamp + 61 seconds);
        
        // Execute autoRefuel
        vm.prank(bob);
        gasPass.autoRefuel(1, mockInbox, req, expectedSorHash, 137);
        
        // Verify results
        assertEq(gasPass.balanceOf(1), initialBalance - 10 ether - (10 ether * 5 / 1000)); // 10 ether + 0.5% fee
        assertEq(gasPass.totalFeesCollected(), initialFees + (10 ether * 5 / 1000));
        
        // Verify policy was updated
        (, , , uint256 lastRefueled) = gasPass.chainPolicies(1, 137);
        assertEq(lastRefueled, block.timestamp);
    }

    function test_autoRefuel_revert_notAgent() public {
        // First mint a token and set refuel policy
        uint256 amount = 100 ether;
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _signPermit(alice, alicePk, address(gasPass), amount, deadline);
        GasPassTypes.StablecoinPermitData memory p = GasPassTypes.StablecoinPermitData(alice, address(gasPass), amount, deadline, v, r, s);
        GasPassTypes.MintWithSigTypedData memory m = GasPassTypes.MintWithSigTypedData(alice, amount, p, bob, gasPass.ownerNonces(alice), deadline);
        bytes32 pmh = keccak256(abi.encode(gasPass.STABLECOIN_PERMIT_TYPEHASH(), p.owner, p.spender, p.value, p.deadline, p.v, p.r, p.s));
        bytes32 msh = keccak256(abi.encode(gasPass.MINT_WITH_SIG_TYPEHASH(), m.to, m.value, pmh, m.agent, m.nonce, m.deadline));
        bytes32 md = _hashTypedDataV4(gasPass, msh);
        (uint8 ov, bytes32 or_, bytes32 os) = vm.sign(alicePk, md);
        bytes memory osig = abi.encodePacked(or_, os, ov);
        vm.prank(relayer);
        gasPass.mintWithSig(m, osig);
        
        vm.prank(alice);
        gasPass.setRefuelPolicy(1, 137, uint128(10 ether), uint128(5 ether), bob);
        
        // Try to call autoRefuel with wrong agent
        address mockInbox = address(0xB000000000000000000000000000000000000000);
        IBungeeInbox.BasicRequest memory basicReq = IBungeeInbox.BasicRequest({
            originChainId: block.chainid,
            destinationChainId: 137,
            deadline: block.timestamp + 1 hours,
            nonce: 12345,
            sender: address(gasPass),
            receiver: address(0x2000000000000000000000000000000000000000),
            delegate: address(0x2000000000000000000000000000000000000000),
            bungeeGateway: address(0x1000000000000000000000000000000000000000),
            switchboardId: 1,
            inputToken: address(stable),
            inputAmount: 10 ether,
            outputToken: address(0),
            minOutputAmount: 0,
            refuelAmount: 0
        });
        
        IBungeeInbox.Request memory req = IBungeeInbox.Request({
            basicReq: basicReq,
            swapOutputToken: address(0),
            minSwapOutput: 0,
            metadata: bytes32(0),
            affiliateFees: "",
            minDestGas: 0,
            destinationPayload: "",
            exclusiveTransmitter: address(0)
        });
        
        bytes32 expectedSorHash = sorCalculator.calculateSORHash(req);
        
        vm.prank(alice); // alice is not the agent
        vm.expectRevert("Not agent");
        gasPass.autoRefuel(1, mockInbox, req, expectedSorHash, 137);
    }

    function test_autoRefuel_revert_noPolicy() public {
        // First mint a token but don't set refuel policy
        uint256 amount = 100 ether;
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _signPermit(alice, alicePk, address(gasPass), amount, deadline);
        GasPassTypes.StablecoinPermitData memory p = GasPassTypes.StablecoinPermitData(alice, address(gasPass), amount, deadline, v, r, s);
        GasPassTypes.MintWithSigTypedData memory m = GasPassTypes.MintWithSigTypedData(alice, amount, p, bob, gasPass.ownerNonces(alice), deadline);
        bytes32 pmh = keccak256(abi.encode(gasPass.STABLECOIN_PERMIT_TYPEHASH(), p.owner, p.spender, p.value, p.deadline, p.v, p.r, p.s));
        bytes32 msh = keccak256(abi.encode(gasPass.MINT_WITH_SIG_TYPEHASH(), m.to, m.value, pmh, m.agent, m.nonce, m.deadline));
        bytes32 md = _hashTypedDataV4(gasPass, msh);
        (uint8 ov, bytes32 or_, bytes32 os) = vm.sign(alicePk, md);
        bytes memory osig = abi.encodePacked(or_, os, ov);
        vm.prank(relayer);
        gasPass.mintWithSig(m, osig);
        
        // Try to call autoRefuel without policy
        address mockInbox = address(0xB000000000000000000000000000000000000000);
        IBungeeInbox.BasicRequest memory basicReq = IBungeeInbox.BasicRequest({
            originChainId: block.chainid,
            destinationChainId: 137,
            deadline: block.timestamp + 1 hours,
            nonce: 12345,
            sender: address(gasPass),
            receiver: address(0x2000000000000000000000000000000000000000),
            delegate: address(0x2000000000000000000000000000000000000000),
            bungeeGateway: address(0x1000000000000000000000000000000000000000),
            switchboardId: 1,
            inputToken: address(stable),
            inputAmount: 10 ether,
            outputToken: address(0),
            minOutputAmount: 0,
            refuelAmount: 0
        });
        
        IBungeeInbox.Request memory req = IBungeeInbox.Request({
            basicReq: basicReq,
            swapOutputToken: address(0),
            minSwapOutput: 0,
            metadata: bytes32(0),
            affiliateFees: "",
            minDestGas: 0,
            destinationPayload: "",
            exclusiveTransmitter: address(0)
        });
        
        bytes32 expectedSorHash = sorCalculator.calculateSORHash(req);
        
        vm.prank(bob);
        vm.expectRevert("No policy");
        gasPass.autoRefuel(1, mockInbox, req, expectedSorHash, 137);
    }

    function test_autoRefuel_revert_cooldown() public {
        // First mint a token and set refuel policy
        uint256 amount = 100 ether;
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _signPermit(alice, alicePk, address(gasPass), amount, deadline);
        GasPassTypes.StablecoinPermitData memory p = GasPassTypes.StablecoinPermitData(alice, address(gasPass), amount, deadline, v, r, s);
        GasPassTypes.MintWithSigTypedData memory m = GasPassTypes.MintWithSigTypedData(alice, amount, p, bob, gasPass.ownerNonces(alice), deadline);
        bytes32 pmh = keccak256(abi.encode(gasPass.STABLECOIN_PERMIT_TYPEHASH(), p.owner, p.spender, p.value, p.deadline, p.v, p.r, p.s));
        bytes32 msh = keccak256(abi.encode(gasPass.MINT_WITH_SIG_TYPEHASH(), m.to, m.value, pmh, m.agent, m.nonce, m.deadline));
        bytes32 md = _hashTypedDataV4(gasPass, msh);
        (uint8 ov, bytes32 or_, bytes32 os) = vm.sign(alicePk, md);
        bytes memory osig = abi.encodePacked(or_, os, ov);
        vm.prank(relayer);
        gasPass.mintWithSig(m, osig);
        
        vm.prank(alice);
        gasPass.setRefuelPolicy(1, 137, uint128(10 ether), uint128(5 ether), bob);
        
        // Execute first autoRefuel
        address mockInbox = address(0xB000000000000000000000000000000000000000);
        address mockGateway = address(0x1000000000000000000000000000000000000000);
        address mockReceiver = address(0x2000000000000000000000000000000000000000);
        
        IBungeeInbox.BasicRequest memory basicReq = IBungeeInbox.BasicRequest({
            originChainId: block.chainid,
            destinationChainId: 137,
            deadline: block.timestamp + 1 hours,
            nonce: 12345,
            sender: address(gasPass),
            receiver: mockReceiver,
            delegate: mockReceiver,
            bungeeGateway: address(0x1000000000000000000000000000000000000000),
            switchboardId: 1,
            inputToken: address(stable),
            inputAmount: 10 ether,
            outputToken: address(0),
            minOutputAmount: 0,
            refuelAmount: 0
        });
        
        IBungeeInbox.Request memory req = IBungeeInbox.Request({
            basicReq: basicReq,
            swapOutputToken: address(0),
            minSwapOutput: 0,
            metadata: bytes32(0),
            affiliateFees: "",
            minDestGas: 0,
            destinationPayload: "",
            exclusiveTransmitter: address(0)
        });
        
        bytes32 expectedSorHash = sorCalculator.calculateSORHash(req);
        
        vm.etch(mockInbox, abi.encodePacked(
            hex"608060405234801561001057600080fd5b506004361061002b5760003560e01c8063",
            hex"0000000000000000000000000000000000000000000000000000000000000000"
        ));
        
        vm.etch(mockGateway, abi.encodePacked(
            hex"608060405234801561001057600080fd5b506004361061002b5760003560e01c8063",
            hex"0000000000000000000000000000000000000000000000000000000000000000"
        ));
        
        // Advance time to pass cooldown period for first call
        vm.warp(block.timestamp + 61 seconds);
        
        vm.prank(bob);
        gasPass.autoRefuel(1, mockInbox, req, expectedSorHash, 137);
        
        // Try to call autoRefuel again immediately (should fail due to cooldown)
        vm.prank(bob);
        vm.expectRevert("Cooldown period not met");
        gasPass.autoRefuel(1, mockInbox, req, expectedSorHash, 137);
    }

    function test_constructor() public view {
        assertEq(gasPass.name(), "GAS Pass");
        assertEq(gasPass.symbol(), "GPASS");
        assertEq(address(gasPass.stablecoin()), address(stable));
        assertEq(gasPass.relayer(), relayer);
        assertEq(gasPass.owner(), address(this));
    }

    // helper to compute EIP712 digest using contract's domain
    function _hashTypedDataV4(GasPass gp, bytes32 structHash) internal view returns (bytes32) {
        // replicate OZ EIP712._hashTypedDataV4: keccak256(\x19\x01, domainSeparator, structHash)
        // read via extcall: gasPass does not expose DOMAIN_SEPARATOR; fetch through EIP712 storage slot: not accessible.
        // Foundry provides vm.load to read storage, but domain is internal. We'll emulate by calling via assembly to EIP712._domainSeparatorV4 selector which is internal - not callable.
        // Workaround: compute domain separator inline like OZ: keccak256(abi.encode(
        // keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
        // keccak256(bytes("GasPass")),
        // keccak256(bytes("1")),
        // block.chainid,
        // address(gp)
        // ))
        bytes32 TYPE_HASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
        bytes32 nameHash = keccak256(bytes("GasPass"));
        bytes32 versionHash = keccak256(bytes("1"));
        bytes32 domainSeparator = keccak256(abi.encode(TYPE_HASH, nameHash, versionHash, block.chainid, address(gp)));
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
    }
}


