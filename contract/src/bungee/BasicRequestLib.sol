// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IBungeeInbox} from "./IBungeeInbox.sol";

/// @title Basic Request Library
/// @notice Provides helpers for handling and hashing BasicRequest structs
/// @dev Contains EIP-712 type hash and origin hash logic for BasicRequest
library BasicRequestLib {
    /// @dev EIP-712 type definition for BasicRequest struct
    bytes internal constant BASIC_REQUEST_TYPE = abi.encodePacked(
        "BasicRequest(",
        "uint256 originChainId,",
        "uint256 destinationChainId,",
        "uint256 deadline,",
        "uint256 nonce,",
        "address sender,",
        "address receiver,",
        "address delegate,",
        "address bungeeGateway,",
        "uint32 switchboardId,",
        "address inputToken,",
        "uint256 inputAmount,",
        "address outputToken,",
        "uint256 minOutputAmount,",
        "uint256 refuelAmount)"
    );
    /// @dev Keccak256 hash of the BASIC_REQUEST_TYPE
    bytes32 internal constant BASIC_REQUEST_TYPE_HASH = keccak256(BASIC_REQUEST_TYPE);

    /// @notice Computes the EIP-712 hash of a BasicRequest struct for the origin chain
    /// @dev Enforces originChainId to be the current chainId. Resulting hash is the same on all chains.
    ///      Helps avoid extra checking of chainId in the contract.
    /// @param basicReq BasicRequest object to be hashed
    /// @return bytes32 The EIP-712 hash of the BasicRequest struct
    function originHash(IBungeeInbox.BasicRequest memory basicReq) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                BASIC_REQUEST_TYPE_HASH,
                abi.encode(
                    block.chainid,
                    basicReq.destinationChainId,
                    basicReq.deadline,
                    basicReq.nonce,
                    basicReq.sender,
                    basicReq.receiver,
                    basicReq.delegate,
                    basicReq.bungeeGateway,
                    basicReq.switchboardId,
                    basicReq.inputToken,
                    basicReq.inputAmount,
                    basicReq.outputToken,
                    basicReq.minOutputAmount,
                    basicReq.refuelAmount
                )
            )
        );
    }
}

/// @title Bungee Request Library.
/// @author bungee protocol
/// @notice This library is responsible for all the hashing related to Request object.
library BungeeInboxRequest {
    using BasicRequestLib for IBungeeInbox.BasicRequest;

    /// @dev EIP-712 type definition for Request struct
    bytes internal constant REQUEST_TYPE = abi.encodePacked(
        "Request(",
        "BasicRequest basicReq,",
        "address swapOutputToken,",
        "uint256 minSwapOutput,",
        "bytes32 metadata,",
        "bytes affiliateFees,",
        "uint256 minDestGas,",
        "bytes destinationPayload,",
        "address exclusiveTransmitter)"
    );

    /// @dev EIP-712 type definition for Bungee Request, including BasicRequest
    bytes internal constant BUNGEE_REQUEST_TYPE = abi.encodePacked(REQUEST_TYPE, BasicRequestLib.BASIC_REQUEST_TYPE);

    /// @dev Keccak256 hash of the BUNGEE_REQUEST_TYPE
    bytes32 internal constant BUNGEE_REQUEST_TYPE_HASH = keccak256(BUNGEE_REQUEST_TYPE);

    /**
     * @notice Creates a deterministic hash for a complete swap request
     * @dev Generates an EIP-712 compliant hash that uniquely identifies a swap request
     *      This hash is used for request tracking, validation, and preventing replay attacks
     * @param request The complete swap request structure containing all swap parameters
     * @return bytes32 The deterministic hash of the swap request
     */
    function createSORHash(IBungeeInbox.Request memory request) internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                BUNGEE_REQUEST_TYPE_HASH,
                request.basicReq.originHash(),
                request.swapOutputToken,
                request.minSwapOutput,
                request.metadata,
                keccak256(request.affiliateFees),
                request.minDestGas,
                keccak256(request.destinationPayload),
                request.exclusiveTransmitter
            )
        );
    }
}