// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/// @title Bungee Inbox Interface
/// @notice Interface for submitting and handling Bungee cross-chain requests
/// @dev Defines the structure and function for Bungee Inbox requests
interface IBungeeInbox {
    /// @notice Basic details in the request
    /// @dev Contains all the fundamental parameters required for a Bungee request
    struct BasicRequest {
        /// @notice Source chain ID
        uint256 originChainId;
        /// @notice Destination chain ID
        uint256 destinationChainId;
        /// @notice Deadline of the request
        uint256 deadline;
        /// @notice Nonce used for uniqueness in signature
        uint256 nonce;
        /// @notice Address of the user placing the request
        address sender;
        /// @notice Address of the receiver on destination chain
        address receiver;
        /// @notice Delegate address that has some rights over the request signed (e.g., cancellation)
        address delegate;
        /// @notice Address of bungee gateway, this address will have access to pull funds from the sender
        address bungeeGateway;
        /// @notice ID of the switchboard for settlement
        uint32 switchboardId;
        /// @notice Address of the input token
        address inputToken;
        /// @notice Amount of the input token
        uint256 inputAmount;
        /// @notice Output token to be received on the destination
        address outputToken;
        /// @notice Minimum amount of output token to be received on the destination
        uint256 minOutputAmount;
        /// @notice Native token refuel amount on the destination chain
        uint256 refuelAmount;
    }

    /// @notice The Request which user signs
    /// @dev Contains all parameters for a complete Bungee request, including swap and execution details
    struct Request {
        /// @notice Basic details in the request
        BasicRequest basicReq;
        /// @notice Swap output token that the user is permitting to swap input token to
        address swapOutputToken;
        /// @notice Minimum swap output the user is okay with swapping the input token to
        /// @dev Transmitter can choose or not choose to swap tokens
        uint256 minSwapOutput;
        /// @notice Any sort of metadata to be passed with the request
        bytes32 metadata;
        /// @notice Fees of the affiliate if any
        bytes affiliateFees;
        /// @notice Minimum destination gas limit to execute calldata on destination
        /// @dev Only to be used when execution is required on destination
        uint256 minDestGas;
        /// @notice Calldata to be executed on the destination
        /// @dev Calldata can only be executed on the receiver in the request
        bytes destinationPayload;
        /// @notice Address of the only transmitter that is permitted to execute the request
        /// @dev If the transmitter is not set, anyone can execute the request. This validation would be done off-chain by the auction house
        address exclusiveTransmitter;
    }

    /// @notice Creates a new Bungee request
    /// @dev Accepts a complete Request struct and processes it. May require a payment depending on the request.
    /// @param singleOutputRequest The complete request structure containing all parameters
    function createRequest(Request calldata singleOutputRequest) external payable;
}