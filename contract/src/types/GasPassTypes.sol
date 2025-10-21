// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

/**
 * @title GasPassTypes
 * @notice Shared struct definitions for GasPass contract.
 */
library GasPassTypes {
    /// @notice 設定自動補氣策略的 EIP-712 型別資料。
    struct SetRefuelPolicyTypedData {
        uint256 tokenId;
        uint256 targetChainId;
        uint128 gasAmount; // 自動refuel的額度
        uint128 threshold; // 低於此threshold時，會自動refuel
        address agent;
        uint256 nonce; // 一次性nonce
        uint256 deadline; // 過期時間
    }

    struct SetAgentToWalletWithSigTypedData {
        address agent;
        address wallet;
        uint256 nonce;
        uint256 deadline;
    }

    /// @notice 取消自動補氣策略的 EIP-712 型別資料。
    struct CancelRefuelPolicyTypedData {
        uint256 tokenId;
        uint256 targetChainId;
        uint256 nonce;
        uint256 deadline;
    }

    /// @notice 每鏈之補氣策略設定。
    struct RefuelPolicy {
        uint128 gasAmount; // 自動refuel的額度
        uint128 threshold; // 低於此threshold時，會自動refuel
        address agent;
        uint256 lastRefueled;
    }

    /// @notice 穩定幣 EIP-2612 的 permit 參數，用於授權合約轉移資金。
    struct StablecoinPermitData {
        address owner;      // 付款人
        address spender;    // 必須是 address(this)
        uint256 value;      // 授權額度（建議 >= 本次 amount）
        uint256 deadline;   // permit 截止時間
        uint8 v; bytes32 r; bytes32 s;
    }

    /// @notice 使用簽章鑄造 GasPass 的型別資料。
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
        uint256 amount; // 鑄造數量
        uint256 singleValue; // 每個 token 的值
        address agent;
        StablecoinPermitData permitData;
        uint256 nonce;
        uint256 deadline;
    }

    /// @notice 使用簽章為既有 tokenId 充值 value 的型別資料。
    struct DepositWithSigTypedData {
        uint256 tokenId;
        uint256 amount;
        StablecoinPermitData permitData;
        uint256 nonce;
        uint256 deadline;
    }
}


