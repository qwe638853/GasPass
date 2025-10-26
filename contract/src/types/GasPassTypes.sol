// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

/**
 * @title GasPassTypes
 * @notice Shared struct definitions for GasPass contract.
 */
library GasPassTypes {
    /// @notice EIP-712 type data for setting automatic refueling policy.
    struct SetRefuelPolicyTypedData {
        uint256 tokenId;
        uint256 targetChainId;
        uint128 gasAmount; // Amount for automatic refuel
        uint128 threshold; // Will automatically refuel when balance falls below this threshold
        address agent;
        uint256 nonce; // One-time nonce
        uint256 deadline; // Expiration time
    }

    struct SetAgentToWalletWithSigTypedData {
        address agent;
        address wallet;
        uint256 nonce;
        uint256 deadline;
    }

    /// @notice EIP-712 type data for canceling automatic refueling policy.
    struct CancelRefuelPolicyTypedData {
        uint256 tokenId;
        uint256 targetChainId;
        uint256 nonce;
        uint256 deadline;
    }

    /// @notice Refueling policy settings per chain.
    struct RefuelPolicy {
        uint128 gasAmount; // Amount for automatic refuel
        uint128 threshold; // Will automatically refuel when balance falls below this threshold
        address agent;
        uint256 lastRefueled;
    }

    /// @notice Stablecoin EIP-2612 permit parameters for authorizing contract to transfer funds.
    struct StablecoinPermitData {
        address owner;      // Payer
        address spender;    // Must be address(this)
        uint256 value;      // Authorization amount (recommended >= current amount)
        uint256 deadline;   // Permit deadline
        uint8 v; bytes32 r; bytes32 s;
    }

    /// @notice Type data for minting GasPass using signature.
    struct MintWithSigTypedData {
        address to;
        uint256 value;
        StablecoinPermitData permitData;
        address agent;
        uint256 nonce;
        uint256 deadline;
    }

    struct MintBatchWithSigTypedData {
        address to;
        uint256 amount; // Number of tokens to mint
        uint256 singleValue; // Value per token
        address agent;
        StablecoinPermitData permitData;
        uint256 nonce;
        uint256 deadline;
    }

    /// @notice Type data for depositing value to an existing tokenId using signature.
    struct DepositWithSigTypedData {
        uint256 tokenId;
        uint256 amount;
        StablecoinPermitData permitData;
        uint256 nonce;
        uint256 deadline;
    }
}


