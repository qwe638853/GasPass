// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;


import {ERC3525} from "@solvprotocol/erc-3525/ERC3525.sol"; 
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GasPass is ERC3525, Ownable, EIP712 {
    using SafeERC20 for IERC20;
    // hashStruct for SetRefuelPolicy
    bytes32 public constant SET_REFUEL_POLICY_TYPEHASH = keccak256("SetRefuelPolicy(uint256 tokenId, uint256 targetChainId, uint128 gasAmount, uint128 threshold, uint256 nonce, uint256 deadline)");
    bytes32 public constant CANCEL_REFUEL_POLICY_TYPEHASH = keccak256("CancelRefuelPolicy(uint256 tokenId, uint256 targetChainId, uint256 nonce, uint256 deadline)");
    bytes32 public constant STABLECOIN_PERMIT_TYPEHASH = keccak256("StablecoinPermitData(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)");
    bytes32 public constant MINT_WITH_SIG_TYPEHASH = keccak256("MintWithSig(address to, uint256 amount, StablecoinPermitData permitData,uint256 nonce,uint256 deadline)");
    bytes32 public constant DEPOSIT_WITH_SIG_TYPEHASH = keccak256("DepositWithSig(uint256 tokenId, uint256 amount, StablecoinPermitData permitData,uint256 nonce,uint256 deadline)");

    mapping(uint256 => uint256) public nonces;     
    mapping(address => uint256) public ownerNonces;  
    IERC20Permit public immutable stablecoin;
    address public relayer;

    // EIP712 Struct for SetRefuelPolicy
    struct SetRefuelPolicyTypedData {
        uint256 tokenId;
        uint256 targetChainId;
        uint128 gasAmount; // 自動refuel的額度
        uint128 threshold; // 低於此threshold時，會自動refuel
        uint256 nonce; // 一次性nonce
        uint256 deadline; // 過期時間
    }

    struct CancelRefuelPolicyTypedData {
        uint256 tokenId;
        uint256 targetChainId;
        uint256 nonce;
        uint256 deadline;
    }

    struct RefuelPolicy {
        uint128 gasAmount; // 自動refuel的額度
        uint128 threshold; // 低於此threshold時，會自動refuel
    }

    struct StablecoinPermitData {
        address owner;      // 付款人
        address spender;    // 必須是 address(this)
        uint256 value;      // 授權額度（建議 >= 本次 amount）
        uint256 deadline;   // permit 截止時間
        uint8 v; bytes32 r; bytes32 s;
    }

    struct MintWithSigTypedData {
        address to;
        uint256 amount;
        StablecoinPermitData permitData;
        uint256 nonce;
        uint256 deadline;
    }

    struct DepositWithSigTypedData {
        uint256 tokenId;
        uint256 amount;
        StablecoinPermitData permitData;
        uint256 nonce;
        uint256 deadline;
    }

    // tokenId => (chainId => policy)
    mapping(uint256 => mapping(uint256 => RefuelPolicy)) public chainPolicies;

    constructor(address _stablecoin,address _relayer) ERC3525("GAS Pass", "GPASS", 6) Ownable(msg.sender) EIP712("GasPass", "1") {
        stablecoin = IERC20Permit(_stablecoin);
        relayer = _relayer;
    }
    // Todo: slot可定義Gas Pass種類，目前固定為0(只有一種)
    function mintWithSig(MintWithSigTypedData calldata typedData, bytes memory signature) public onlyOwner {
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
                MINT_WITH_SIG_TYPEHASH,
                typedData.to,
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
        _mint(typedData.to, 0, typedData.amount);
        ownerNonces[typedData.permitData.owner]++;
    }   

    function depositWithSig(DepositWithSigTypedData calldata typedData, bytes memory signature) public {
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

    // Todo: 可定義Mint之前

    // 設定自動refuel的policy
    function setRefuelPolicy(uint256 tokenId, uint256 targetChainId, uint128 gasAmount, uint128 threshold) public  {
        require(msg.sender == ownerOf(tokenId), "Not token owner");
        chainPolicies[tokenId][targetChainId] = RefuelPolicy(gasAmount, threshold);
    }
    
    // 設定自動refuel的policy with signature
    function setRefuelPolicyWithSig(SetRefuelPolicyTypedData calldata policy, bytes memory signature) public {
        require(msg.sender == relayer, "Not relayer");
        require(policy.deadline >= block.timestamp, "Signature expired");
        require(policy.nonce == nonces[policy.tokenId], "Nonce already used");
        require(policy.gasAmount > 0, "Gas amount must be greater than 0");
        require(balanceOf(policy.tokenId) > policy.gasAmount, "Insufficient balance");
        require(policy.threshold > 0, "Threshold must be greater than 0");
        
        bytes32 structHash = keccak256(
            abi.encode(
                SET_REFUEL_POLICY_TYPEHASH,
                policy.tokenId,
                policy.targetChainId,
                policy.gasAmount,
                policy.threshold,
                policy.nonce,
                policy.deadline
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(digest, signature);
        require(signer == ownerOf(policy.tokenId), "Invalid signature");

        // update policy
        chainPolicies[policy.tokenId][policy.targetChainId] = RefuelPolicy(policy.gasAmount, policy.threshold);
        nonces[policy.tokenId]++;
    }   

    function cancelRefuelPolicy(uint256 tokenId, uint256 targetChainId) public {
        require(msg.sender == ownerOf(tokenId), "Not token owner");
        delete chainPolicies[tokenId][targetChainId];
    }
    
    // 取消自動refuel的policy
    function cancelRefuelPolicyWithSig(CancelRefuelPolicyTypedData calldata typedData, bytes memory signature) public {
        require(msg.sender == relayer, "Not relayer");
        require(typedData.deadline >= block.timestamp, "Signature expired");
        require(typedData.nonce == nonces[typedData.tokenId], "Nonce already used");
    
        bytes32 structHash = keccak256(abi.encode(CANCEL_REFUEL_POLICY_TYPEHASH, typedData.tokenId, typedData.targetChainId, typedData.nonce, typedData.deadline));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        require(signer == ownerOf(typedData.tokenId), "Invalid signature");
        
        // update policy
        delete chainPolicies[typedData.tokenId][typedData.targetChainId];
        nonces[typedData.tokenId]++;
    }    

    function setRelayer(address _relayer) public onlyOwner {
        require(_relayer != address(0), "Invalid relayer");
        relayer = _relayer;
    }
    

}
