// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { GasPass } from "../src/GasPass.sol";

contract MockUSDCPermit is ERC20, ERC20Permit {
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) ERC20Permit(name_) {
        _mint(msg.sender, 1_000_000_000 * 10 ** uint256(decimals()));
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

contract DeployAnvil is Script {
    bytes32 private constant EIP2612_PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    function _gasPassDomainSeparator(address verifying) internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("GasPass")),
                keccak256(bytes("1")),
                block.chainid,
                verifying
            )
        );
    }

    function _erc20PermitDigest(ERC20Permit token, address owner, address spender, uint256 value, uint256 nonce, uint256 deadline) internal view returns (bytes32) {
        bytes32 permitStructHash = keccak256(
            abi.encode(
                EIP2612_PERMIT_TYPEHASH,
                owner,
                spender,
                value,
                nonce,
                deadline
            )
        );
        return keccak256(abi.encodePacked("\x19\x01", token.DOMAIN_SEPARATOR(), permitStructHash));
    }

    function _gasPassMintDigest(
        GasPass gasPass,
        address to,
        uint256 amount,
        bytes32 permitDataHash,
        address agent,
        uint256 ownerNonce,
        uint256 deadline
    ) internal view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                gasPass.MINT_WITH_SIG_TYPEHASH(),
                to,
                amount,
                permitDataHash,
                agent,
                ownerNonce,
                deadline
            )
        );
        return keccak256(abi.encodePacked("\x19\x01", _gasPassDomainSeparator(address(gasPass)), structHash));
    }

    function _hashPermitDataForGasPass(
        GasPass gasPass,
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                gasPass.STABLECOIN_PERMIT_TYPEHASH(),
                owner,
                spender,
                value,
                deadline,
                v,
                r,
                s
            )
        );
    }

    function run() external {
        uint256 deployerPk = vm.envUint("ANVIL_PRIVATE_KEY");
        address deployer = vm.addr(deployerPk);

        vm.startBroadcast(deployerPk);

        MockUSDCPermit stable = new MockUSDCPermit("Mock USDC", "mUSDC");
        GasPass gasPass = new GasPass(address(stable), deployer);

        address agent = deployer;
        uint256 deadline = block.timestamp + 1 days;
        uint256 value;

        address to = deployer;
        uint256[] memory mintedTokenIds = new uint256[](3);
        for (uint256 i = 0; i < 3; i++) {
            uint256 amount = (i + 1) * 1_000_000; // 1, 2, 3 USDC (6 decimals)
            value = amount;

            uint256 noncePermit = stable.nonces(deployer);
            bytes32 permitDigest = _erc20PermitDigest(stable, deployer, address(gasPass), value, noncePermit, deadline);
            (uint8 pv, bytes32 pr, bytes32 ps) = vm.sign(deployerPk, permitDigest);

            bytes32 permitDataHash = _hashPermitDataForGasPass(gasPass, deployer, address(gasPass), value, deadline, pv, pr, ps);

            uint256 ownerNonce = gasPass.ownerNonces(deployer);
            bytes32 mintDigest = _gasPassMintDigest(gasPass, to, amount, permitDataHash, agent, ownerNonce, deadline);
            (uint8 mv, bytes32 mr, bytes32 ms) = vm.sign(deployerPk, mintDigest);
            bytes memory mintSig = abi.encodePacked(mr, ms, mv);

            GasPass.StablecoinPermitData memory permitData = GasPass.StablecoinPermitData({
                owner: deployer,
                spender: address(gasPass),
                value: value,
                deadline: deadline,
                v: pv,
                r: pr,
                s: ps
            });

            GasPass.MintWithSigTypedData memory mintData = GasPass.MintWithSigTypedData({
                to: to,
                amount: amount,
                permitData: permitData,
                agent: agent,
                nonce: ownerNonce,
                deadline: deadline
            });

            gasPass.mintWithSig(mintData, mintSig);

            uint256 tokenId = gasPass.tokenOfOwnerByIndex(to, gasPass.balanceOf(to) - 1);
            mintedTokenIds[i] = tokenId;
        }

        uint256[4] memory chains = [uint256(8453), uint256(42161), uint256(10), uint256(137)];
        for (uint256 j = 0; j < mintedTokenIds.length; j++) {
            if (j % 2 == 0) {
                uint256 chainIdx = uint256(keccak256(abi.encodePacked(block.timestamp, mintedTokenIds[j]))) % chains.length;
                uint256 targetChainId = chains[chainIdx];
                gasPass.setRefuelPolicy(mintedTokenIds[j], targetChainId, 100_000, 50_000, agent);
            }
        }

        vm.stopBroadcast();

        console.log("Deployer:", deployer);
        console.log("MockUSDC:", address(stable));
        console.log("GasPass:", address(gasPass));
        console.log("Minted tokenIds:", mintedTokenIds[0], mintedTokenIds[1], mintedTokenIds[2]);
    }
}


