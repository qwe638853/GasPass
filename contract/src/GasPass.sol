// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;


import {ERC3525} from "@solvprotocol/contracts/ERC3525.sol"; 
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {GasPassTypes} from "./types/GasPassTypes.sol";
import {IBungeeInbox} from "./bungee/IBungeeInbox.sol";
import {BungeeInboxRequest} from "./bungee/BasicRequestLib.sol";



/**
 * @title GasPass
 * @notice ERC-3525 Semi-Fungible Token for pre-storing and distributing gas across multiple chains according to strategies.
 * @dev Integrates EIP-712 typed data signature flow with stablecoin permit for minting and depositing;
 * Also provides an automated refueling policy setup/cancellation flow with owner signatures relayed by a relayer.
 */
contract GasPass is ERC3525, Ownable, EIP712 {
    using SafeERC20 for IERC20;
    /** @dev EIP-712 type hash constants for off-chain signature structures. */
    bytes32 public constant SET_REFUEL_POLICY_TYPEHASH = keccak256("SetRefuelPolicy(uint256 tokenId,uint256 targetChainId,uint128 gasAmount,uint128 threshold,address agent,uint256 nonce,uint256 deadline)");
    bytes32 public constant CANCEL_REFUEL_POLICY_TYPEHASH = keccak256("CancelRefuelPolicy(uint256 tokenId,uint256 targetChainId,uint256 nonce,uint256 deadline)");
    bytes32 public constant STABLECOIN_PERMIT_TYPEHASH = keccak256("StablecoinPermitData(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)");
    bytes32 public constant MINT_WITH_SIG_TYPEHASH = keccak256("MintWithSig(address to,uint256 value,bytes32 permitDataHash,address agent,uint256 nonce,uint256 deadline)");
    bytes32 public constant DEPOSIT_WITH_SIG_TYPEHASH = keccak256("DepositWithSig(uint256 tokenId,uint256 amount,bytes32 permitDataHash,uint256 nonce,uint256 deadline)");
    bytes32 public constant MINT_BATCH_WITH_SIG_TYPEHASH = keccak256("MintBatchWithSig(address to,uint256 amount,uint256 singleValue,address agent,bytes32 permitDataHash,uint256 nonce,uint256 deadline)");
    bytes32 public constant SET_AGENT_TO_WALLET_WITH_SIG_TYPEHASH = keccak256("SetAgentToWalletWithSig(address agent,address wallet,uint256 nonce,uint256 deadline)");

    // ============ Events ============
    event Minted(address indexed to, uint256 value, address indexed agent);
    event MintBatch(address indexed to, uint256 amount, uint256 singleValue, address indexed agent);
    event Deposited(address indexed owner, uint256 indexed tokenId, uint256 amount);
    event AgentBound(address indexed agent, address indexed wallet);
    event RefuelPolicySet(uint256 indexed tokenId, uint256 indexed targetChainId, uint128 gasAmount, uint128 threshold, address indexed agent);
    event RefuelPolicyCancelled(uint256 indexed tokenId, uint256 indexed targetChainId);
    event AutoRefueled(uint256 indexed tokenId, uint256 indexed targetChainId, uint256 gasAmount);
    event ManualRefueled(uint256 indexed tokenId, uint256 indexed targetChainId, uint256 amount, address indexed owner);
    event RelayerChanged(address indexed oldRelayer, address indexed newRelayer);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event USDCWithdrawn(address indexed owner, uint256 indexed tokenId, uint256 amount, address indexed to); // For testing purposes
    event BungeeForwarded(uint256 indexed tokenId, address indexed inbox, uint256 inputAmount, bytes32 sorHash);

    /** @dev Nonce counter for each tokenId, used for policy signatures to prevent replay attacks. */
    mapping(uint256 => uint256) public nonces;     
    /** @dev Nonce counter for each user address, used for mint/deposit signatures to prevent replay attacks. */
    mapping(address => uint256) public ownerNonces;  
    /** @dev Policy mapping: tokenId => (chainId => RefuelPolicy). */
    mapping(uint256 => mapping(uint256 => GasPassTypes.RefuelPolicy)) public chainPolicies;
    /** @dev Agent mapping: agent address maps to its wallet address (the wallet must be the token owner). */
    mapping(address => address) public agentToWallet;
    /** @dev Stablecoin contract supporting EIP-2612, used as the funding source for GasPass. */
    IERC20Permit public immutable stablecoin;
    /** @dev Authorized relayer that can submit policy signature transactions on behalf of users. */
    address public relayer;
    /** @dev Total fees collected from autoRefuel operations (in stablecoin smallest unit). */
    uint256 public totalFeesCollected;
    // Bungee-related
    address public bungeeGateway;
    address public bungeeInbox;



    // EIP712 Struct for SetRefuelPolicy
    using GasPassTypes for *;

    
    modifier onlyAgent(uint256 tokenId) {
        require(agentToWallet[msg.sender] == ownerOf(tokenId), "Not agent");
        _;
    }

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Not relayer");
        _;
    }

    /**
     * @notice Deploys the contract.
     * @param _stablecoin Address of stablecoin contract supporting EIP-2612.
     * @param _relayer Address of the relayer authorized to submit policy signature transactions.
     */
    constructor(address _stablecoin,address _relayer,address _bungeeGateway,address _bungeeInbox) ERC3525("GAS Pass", "GPASS", 6) Ownable(msg.sender) EIP712("GasPass", "1") {
        stablecoin = IERC20Permit(_stablecoin);
        relayer = _relayer;
        bungeeGateway = _bungeeGateway;
        bungeeInbox = _bungeeInbox;
    }
    // Todo: slot can define different Gas Pass types, currently fixed at 0 (only one type)
    /**
     * @notice Mints a new GasPass with signature and simultaneously transfers corresponding stablecoin amount via permit.
     * @dev Only contract owner can call. Verifies:
     *  - Deadline, value, and user nonce
     *  - ECDSA signature on EIP-712 digest by the payer
     *  - Safe transfer of amount after permit authorization
     * Finally mints ERC3525 token with slot=0.
     * @param typedData Type data required for minting (including permit parameters).
     * @param signature Payer's signature on the MINT_WITH_SIG structure.
     */
    function mintWithSig(GasPassTypes.MintWithSigTypedData calldata typedData, bytes memory signature) public onlyRelayer {
        require(typedData.deadline >= block.timestamp, "Signature expired");
        require(typedData.value > 0, "value=0");
        require(typedData.value <= typedData.permitData.value, "value > value");
        require(typedData.permitData.deadline >= block.timestamp, "permit expired");
        require(typedData.nonce == ownerNonces[typedData.permitData.owner], "Nonce already used");
        
        bytes32 permitHash = keccak256(
            abi.encode(
                STABLECOIN_PERMIT_TYPEHASH,
                typedData.permitData.owner,
                typedData.permitData.spender,
                typedData.permitData.value,
                typedData.permitData.deadline,
                typedData.permitData.v,
                typedData.permitData.r,
                typedData.permitData.s
            )
        );
        


        // First time mint with agent, set agent to wallet
        if (agentToWallet[typedData.agent] == address(0)) {
            _setAgentToWallet(typedData.agent, typedData.permitData.owner);
        }
        bytes32 structHash = keccak256(
            abi.encode(
                MINT_WITH_SIG_TYPEHASH,
                typedData.to,
                typedData.value,
                permitHash,
                typedData.agent,
                typedData.nonce,
                typedData.deadline
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        require(signer == typedData.permitData.owner, "Invalid signature");
        stablecoin.permit(typedData.permitData.owner, address(this), typedData.permitData.value, typedData.permitData.deadline, typedData.permitData.v, typedData.permitData.r, typedData.permitData.s);
        IERC20(address(stablecoin)).safeTransferFrom(typedData.permitData.owner, address(this), typedData.value);
        _mint(typedData.to, 0, typedData.value);
        emit Minted(typedData.to, typedData.value, typedData.agent);
        ownerNonces[typedData.permitData.owner]++;
    }   

    function mintBatchWithSig(GasPassTypes.MintBatchWithSigTypedData calldata typedData, bytes memory signature) public onlyRelayer {
        require(typedData.deadline >= block.timestamp, "Signature expired");
        require(typedData.amount > 0, "Amount is 0");
        require(typedData.amount <= typedData.permitData.value, "Amount > value");
        require(typedData.permitData.deadline >= block.timestamp, "permit expired");
        require(typedData.nonce == ownerNonces[typedData.permitData.owner], "Nonce already used");

        if (typedData.amount * typedData.singleValue > typedData.permitData.value) {
            revert("Amount * singleValue > value");
        }
        
        bytes32 permitHash = keccak256(
            abi.encode(
                STABLECOIN_PERMIT_TYPEHASH,
                typedData.permitData.owner,
                typedData.permitData.spender,
                typedData.permitData.value,
                typedData.permitData.deadline,
                typedData.permitData.v,
                typedData.permitData.r,
                typedData.permitData.s
            )
        );

        // First time mint with agent, set agent to wallet
        if (agentToWallet[typedData.agent] == address(0)) {
            _setAgentToWallet(typedData.agent, typedData.permitData.owner);
        }

        bytes32 structHash = keccak256(
            abi.encode(
                MINT_BATCH_WITH_SIG_TYPEHASH,
                typedData.to,
                typedData.amount,
                typedData.singleValue,
                typedData.agent,
                permitHash,
                typedData.nonce,
                typedData.deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        require(signer == typedData.permitData.owner, "Invalid signature");
        stablecoin.permit(typedData.permitData.owner, address(this), typedData.permitData.value, typedData.permitData.deadline, typedData.permitData.v, typedData.permitData.r, typedData.permitData.s);
        IERC20(address(stablecoin)).safeTransferFrom(typedData.permitData.owner, address(this), typedData.amount * typedData.singleValue);
        for (uint256 i = 0; i < typedData.amount; i++) {
            _mint(typedData.to, 0, typedData.singleValue);
        }
        emit MintBatch(typedData.to, typedData.amount, typedData.singleValue, typedData.agent);
        ownerNonces[typedData.permitData.owner]++;


    }

    function setAgentToWalletWithSig(GasPassTypes.SetAgentToWalletWithSigTypedData calldata typedData, bytes memory signature) public onlyRelayer {
        require(typedData.deadline >= block.timestamp, "Signature expired");
        require(typedData.nonce == ownerNonces[typedData.wallet], "Nonce already used");
        require(agentToWallet[typedData.agent] == address(0), "Agent already has a wallet");
        require(typedData.wallet != address(0), "Invalid wallet");

        bytes32 structHash = keccak256(
            abi.encode(
                SET_AGENT_TO_WALLET_WITH_SIG_TYPEHASH,
                typedData.agent,
                typedData.wallet,
                typedData.nonce,
                typedData.deadline
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        require(signer == typedData.wallet, "Invalid signature");

        _setAgentToWallet(typedData.agent, typedData.wallet);
        emit AgentBound(typedData.agent, typedData.wallet);
        ownerNonces[typedData.wallet]++;
    }
        
    /**
     * @notice Adds value to an existing tokenId with signature and transfers corresponding stablecoin via permit.
     * @param typedData Type data required for deposit (including permit parameters).
     * @param signature Payer's signature on the DEPOSIT_WITH_SIG structure.
     */
    function depositWithSig(GasPassTypes.DepositWithSigTypedData calldata typedData, bytes memory signature) public onlyRelayer {
        require(typedData.deadline >= block.timestamp, "Signature expired");
        require(typedData.amount > 0, "amount=0");
        require(typedData.amount <= typedData.permitData.value, "amount > value");
        require(typedData.permitData.deadline >= block.timestamp, "permit expired");
        require(typedData.nonce == ownerNonces[typedData.permitData.owner], "Nonce already used");

        bytes32 permitHash = keccak256(
            abi.encode(
                STABLECOIN_PERMIT_TYPEHASH,
                typedData.permitData.owner,
                typedData.permitData.spender,
                typedData.permitData.value,
                typedData.permitData.deadline,
                typedData.permitData.v,
                typedData.permitData.r,
                typedData.permitData.s
            )
        );
        uint256 ownerNonce = ownerNonces[typedData.permitData.owner];


        bytes32 structHash = keccak256(
            abi.encode(
                DEPOSIT_WITH_SIG_TYPEHASH,
                typedData.tokenId,
                typedData.amount,
                permitHash,
                ownerNonce,
                typedData.deadline
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        require(signer == typedData.permitData.owner, "Invalid signature");
        stablecoin.permit(typedData.permitData.owner, address(this), typedData.permitData.value, typedData.permitData.deadline, typedData.permitData.v, typedData.permitData.r, typedData.permitData.s);
        IERC20(address(stablecoin)).safeTransferFrom(typedData.permitData.owner, address(this), typedData.amount);
        _mintValue(typedData.tokenId, typedData.amount);
        ownerNonces[typedData.permitData.owner]++;
    }

    // Todo: Can define before Mint

    // Set automatic refuel policy
    /**
     * @notice Directly sets the automatic refueling policy for a given tokenId on a specific chain.
     * @dev Only token owner can call; the corresponding agent must be bound to this owner.
     * @param tokenId Target ERC3525 tokenId.
     * @param targetChainId Target chain ID (e.g., 8453/42161/10/137).
     * @param gasAmount Amount to refuel each time (in stablecoin smallest unit).
     * @param threshold Threshold value to trigger automatic refueling when balance falls below.
     * @param agent Agent address authorized to trigger automatic refueling.
     */
    function setRefuelPolicy(uint256 tokenId, uint256 targetChainId, uint128 gasAmount, uint128 threshold, address agent) public  {
        require(agentToWallet[agent] == ownerOf(tokenId), "Invalid agent");
        require(msg.sender == ownerOf(tokenId), "Not token owner");
        chainPolicies[tokenId][targetChainId] = GasPassTypes.RefuelPolicy(gasAmount, threshold, agent, 0);
    }
    
    // Set automatic refuel policy with signature
    /**
     * @notice Sets automatic refueling policy for a tokenId via owner signature, relayed by relayer.
     * @dev Only relayer can call; verifies signature, deadline, nonce, balance, and agent validity.
     * @param policy Policy structure signed with EIP-712.
     * @param signature Token owner's signature on the policy structure.
     */
    function setRefuelPolicyWithSig(GasPassTypes.SetRefuelPolicyTypedData calldata policy, bytes memory signature) public onlyRelayer {
        require(policy.deadline >= block.timestamp, "Signature expired");
        require(policy.nonce == nonces[policy.tokenId], "Nonce already used");
        require(policy.gasAmount > 0, "Gas amount must be greater than 0");
        require(balanceOf(policy.tokenId) >= policy.gasAmount, "Insufficient balance");
        require(policy.threshold > 0, "Threshold must be greater than 0");
        require(agentToWallet[policy.agent] == ownerOf(policy.tokenId), "Invalid agent");
        bytes32 structHash = keccak256(
            abi.encode(
                SET_REFUEL_POLICY_TYPEHASH,
                policy.tokenId,
                policy.targetChainId,
                policy.gasAmount,
                policy.threshold,
                policy.agent,
                policy.nonce,
                policy.deadline
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(digest, signature);
        require(signer == ownerOf(policy.tokenId), "Invalid signature");

        // update policy
        chainPolicies[policy.tokenId][policy.targetChainId] = GasPassTypes.RefuelPolicy(policy.gasAmount, policy.threshold, policy.agent, 0);
        emit RefuelPolicySet(policy.tokenId, policy.targetChainId, policy.gasAmount, policy.threshold, policy.agent);
        nonces[policy.tokenId]++;
    }   

    /**
     * @notice Cancels automatic refueling policy on a specific chain directly by token owner.
     * @param tokenId Target tokenId.
     * @param targetChainId Target chain ID.
     */
    function cancelRefuelPolicy(uint256 tokenId, uint256 targetChainId) public {
        require(msg.sender == ownerOf(tokenId), "Not token owner");
        delete chainPolicies[tokenId][targetChainId];

    }
    
    // Cancel automatic refuel policy
    /**
     * @notice Cancels automatic refueling policy on a specific chain via owner signature, relayed by relayer.
     * @dev Only relayer can call; verifies signature, deadline, and nonce before removing policy.
     * @param typedData Cancellation structure signed with EIP-712.
     * @param signature Token owner's signature on the cancellation structure.
     */
    function cancelRefuelPolicyWithSig(GasPassTypes.CancelRefuelPolicyTypedData calldata typedData, bytes memory signature) public onlyRelayer {
        require(typedData.deadline >= block.timestamp, "Signature expired");
        require(typedData.nonce == nonces[typedData.tokenId], "Nonce already used");
    
        bytes32 structHash = keccak256(abi.encode(CANCEL_REFUEL_POLICY_TYPEHASH, typedData.tokenId, typedData.targetChainId, typedData.nonce, typedData.deadline));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        require(signer == ownerOf(typedData.tokenId), "Invalid signature");
        
        // update policy
        delete chainPolicies[typedData.tokenId][typedData.targetChainId];
        emit RefuelPolicyCancelled(typedData.tokenId, typedData.targetChainId);
        nonces[typedData.tokenId]++;
    }    

    // Automatic refuel (only callable by agent)
    /**
     * @notice Agent executes automatic refueling for a specified chain.
     * @dev Only bound agents can call.
     * @param tokenId Target tokenId.
     * @param targetChainId Target chain ID.
     */
    function autoRefuel(uint256 tokenId, address inbox,IBungeeInbox.Request calldata req,bytes32 expectedSorHash, uint256 targetChainId) public onlyAgent(tokenId) {

            // === 0) Basic checks ===
        require(inbox != address(0), "inbox=0");
        require(req.basicReq.originChainId == block.chainid, "wrong origin");
        require(req.basicReq.inputAmount > 0, "inputAmount=0");
        require(req.basicReq.destinationChainId == targetChainId, "dest mismatch");
        require(req.basicReq.sender == inbox, "sender!=inbox");
        require(req.basicReq.bungeeGateway == bungeeGateway, "gateway mismatch");
        require(inbox == bungeeInbox, "inbox mismatch");
        require(req.basicReq.inputToken == address(stablecoin), "token!=stablecoin");
        require(req.basicReq.receiver != address(0), "receiver=0");

        GasPassTypes.RefuelPolicy storage policy = chainPolicies[tokenId][targetChainId];
        uint256 gasAmount = policy.gasAmount;
        require(gasAmount > 0, "No policy");
        require(gasAmount==req.basicReq.inputAmount, "gasAmount mismatch");
        require(policy.agent == msg.sender, "Wrong agent");
        require(block.timestamp - policy.lastRefueled > 60 seconds, "Cooldown period not met");
        
        bytes32 sorHash = BungeeInboxRequest.createSORHash(req);
        require(sorHash == expectedSorHash, "SOR hash mismatch");
        

        _burnValue(tokenId, gasAmount);


        IERC20(address(stablecoin)).approve(inbox, gasAmount);

        IBungeeInbox(inbox).createRequest(req);

        policy.lastRefueled = block.timestamp;
        emit BungeeForwarded(tokenId, inbox, gasAmount, sorHash);
        emit AutoRefueled(tokenId, targetChainId, gasAmount); // Emit existing event
    }
    
    // Manual refueling triggered only by agent, no policy required
    function manualRefuelByAgent(uint256 tokenId,address inbox,IBungeeInbox.Request calldata req,bytes32 expectedSorHash,uint256 targetChainId) public onlyAgent(tokenId) {
        // === 0) Basic checks (aligned with autoRefuel) ===
        require(inbox != address(0), "inbox=0");
        require(inbox == bungeeInbox, "inbox mismatch");
        require(req.basicReq.sender == inbox, "sender!=inbox");
        require(req.basicReq.bungeeGateway == bungeeGateway, "gateway mismatch");

        require(req.basicReq.originChainId == block.chainid, "wrong origin");
        require(req.basicReq.destinationChainId == targetChainId, "dest mismatch");
        require(req.basicReq.inputToken == address(stablecoin), "token!=stablecoin");

        require(req.basicReq.receiver != address(0), "receiver=0");
        

        address owner = ownerOf(tokenId);
        require(req.basicReq.receiver == owner, "receiver!=owner");

        // Amount check and card balance
        uint256 amount = req.basicReq.inputAmount;
        require(amount > 0, "inputAmount=0");
        require(balanceOf(tokenId) >= amount, "insufficient card balance");
        
        // SOR anti-tampering check
        bytes32 sorHash = BungeeInboxRequest.createSORHash(req);
        require(sorHash == expectedSorHash, "SOR hash mismatch");

        // === 1) Deduct from card, approve, and send ===
        _burnValue(tokenId, amount);
        IERC20(address(stablecoin)).approve(inbox, amount);
        IBungeeInbox(inbox).createRequest(req);

        // === 2) Events ===
        emit BungeeForwarded(tokenId, inbox, amount, sorHash);
        emit ManualRefueled(tokenId, targetChainId, amount, owner);
    }
    
    /**
     * @notice Sets the relayer.
     * @param _relayer New relayer address.
     */
    function setRelayer(address _relayer) public onlyOwner {
        require(_relayer != address(0), "Invalid relayer");
        address old = relayer;
        relayer = _relayer;
        emit RelayerChanged(old, _relayer);
    }
    
    /**
     * @notice Withdraws accumulated fee income.
     * @dev Only contract owner can call, transfers all accumulated fees to the specified address.
     * @param to Address to receive the fees.
     */
    function withdrawFees(address to) public onlyOwner {
        require(to != address(0), "Invalid address");
        require(totalFeesCollected > 0, "No fees to withdraw");
        
        uint256 amount = totalFeesCollected;
        totalFeesCollected = 0;
        
        IERC20(address(stablecoin)).safeTransfer(to, amount);
        emit FeesWithdrawn(to, amount);
    }
    function getWithdrawableFees() public view returns (uint256) {
        return totalFeesCollected;
    }
   
    // For testing purposes, withdraw all USDC from the card
    function withdrawAllUSDC(uint256 tokenId, address to) public { 
        require(msg.sender == ownerOf(tokenId), "Not token owner");
        require(to != address(0), "Invalid address");
        
        uint256 amount = balanceOf(tokenId);
        require(amount > 0, "No balance to withdraw");
        _burnValue(tokenId, amount);
        IERC20(address(stablecoin)).safeTransfer(to, amount);
        
        emit USDCWithdrawn(msg.sender, tokenId, amount, to);
    }

    // for testing purposes
    function withdrawUSDC() public onlyOwner {
        IERC20 usdc = IERC20(address(stablecoin));
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");

        bool success = usdc.transfer(msg.sender, balance);
        require(success, "USDC transfer failed");
    }
    
    /**
     * @dev Binds the relationship between agent and wallet address, internal use only.
     * @param agent Agent address.
     * @param wallet Wallet address (must be a token owner).
     */
    function _setAgentToWallet(address agent, address wallet) internal {
        require(agent != address(0), "Invalid agent");
        require(wallet != address(0), "Invalid wallet");
        agentToWallet[agent] = wallet;
    }
    
    /**
     * @notice Queries the wallet address bound to a specific agent.
     * @param agent Agent address.
     * @return Bound wallet address.
     */
    function getAgentToWallet(address agent) public view returns (address) {
        return agentToWallet[agent];
    }

    // Todo: Some checking logic for ERC3525 transfers
}
