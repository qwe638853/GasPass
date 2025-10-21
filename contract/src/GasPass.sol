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

/**
 * @title GasPass
 * @notice ERC-3525 半同質化代幣，用於預存並在多鏈環境中按策略發放 gas。
 * @dev 結合 EIP-712 型別資料簽名流程，支援以穩定幣 permit 的鑄造與存入；
 * 同時提供以所有者簽章由 relayer 代送的自動補氣策略設定/取消流程。
 */
contract GasPass is ERC3525, Ownable, EIP712 {
    using SafeERC20 for IERC20;
    /** @dev EIP-712 型別雜湊常數，用於鏈下簽章結構。 */
    bytes32 public constant SET_REFUEL_POLICY_TYPEHASH = keccak256("SetRefuelPolicy(uint256 tokenId, uint256 targetChainId, uint128 gasAmount, uint128 threshold, address agent, uint256 nonce, uint256 deadline)");
    bytes32 public constant CANCEL_REFUEL_POLICY_TYPEHASH = keccak256("CancelRefuelPolicy(uint256 tokenId, uint256 targetChainId, uint256 nonce, uint256 deadline)");
    bytes32 public constant STABLECOIN_PERMIT_TYPEHASH = keccak256("StablecoinPermitData(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)");
    bytes32 public constant MINT_WITH_SIG_TYPEHASH = keccak256("MintWithSig(address to, uint256 value, StablecoinPermitData permitData,address agent,uint256 nonce,uint256 deadline)");
    bytes32 public constant DEPOSIT_WITH_SIG_TYPEHASH = keccak256("DepositWithSig(uint256 tokenId, uint256 amount, StablecoinPermitData permitData,uint256 nonce,uint256 deadline)");
    bytes32 public constant MINT_BATCH_WITH_SIG_TYPEHASH = keccak256("MintBatchWithSig(address to, uint256 amount, uint256 singleValue, address agent, StablecoinPermitData permitData,uint256 nonce,uint256 deadline)");
    bytes32 public constant SET_AGENT_TO_WALLET_WITH_SIG_TYPEHASH = keccak256("SetAgentToWalletWithSig(address agent,address wallet,uint256 nonce,uint256 deadline)");

    // ============ Events ============
    event Minted(address indexed to, uint256 value, address indexed agent);
    event MintBatch(address indexed to, uint256 amount, uint256 singleValue, address indexed agent);
    event Deposited(address indexed owner, uint256 indexed tokenId, uint256 amount);
    event AgentBound(address indexed agent, address indexed wallet);
    event RefuelPolicySet(uint256 indexed tokenId, uint256 indexed targetChainId, uint128 gasAmount, uint128 threshold, address indexed agent);
    event RefuelPolicyCancelled(uint256 indexed tokenId, uint256 indexed targetChainId);
    event AutoRefueled(uint256 indexed tokenId, uint256 indexed targetChainId, uint256 gasAmount, uint256 fee);
    event RelayerChanged(address indexed oldRelayer, address indexed newRelayer);

    /** @dev 每個 tokenId 的次數器，供策略簽章使用，防重放。 */
    mapping(uint256 => uint256) public nonces;     
    /** @dev 每個使用者地址對應的次數器，供 mint/deposit 的簽章使用，防重放。 */
    mapping(address => uint256) public ownerNonces;  
    /** @dev tokenId => (chainId => RefuelPolicy) 的策略對應。 */
    mapping(uint256 => mapping(uint256 => GasPassTypes.RefuelPolicy)) public chainPolicies;
    /** @dev 代理人映射：agent 地址對應其所屬錢包地址（該錢包需為 token 擁有者）。 */
    mapping(address => address) public agentToWallet;
    /** @dev 作為 GasPass 資金來源的 EIP-2612 支援之穩定幣合約。 */
    IERC20Permit public immutable stablecoin;
    /** @dev 被授權可代送策略簽章交易的中繼者。 */
    address public relayer;
    /** @dev 透過 autoRefuel 累積的手續費總額（單位：穩定幣最小單位）。 */
    uint256 public totalFeesCollected;

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
     * @notice 部署合約。
     * @param _stablecoin 支援 EIP-2612 的穩定幣合約地址。
     * @param _relayer 被授權代送策略簽章交易的 relayer 地址。
     */
    constructor(address _stablecoin,address _relayer) ERC3525("GAS Pass", "GPASS", 6) Ownable(msg.sender) EIP712("GasPass", "1") {
        stablecoin = IERC20Permit(_stablecoin);
        relayer = _relayer;
    }
    // Todo: slot可定義Gas Pass種類，目前固定為0(只有一種)
    /**
     * @notice 以簽章鑄造新的 GasPass，並同時透過 permit 轉入對應穩定幣金額。
     * @dev 僅合約擁有者可呼叫。會驗證:
     *  - 時效、數值與使用者 nonce
     *  - 由付款人對 EIP-712 摘要的 ECDSA 簽章
     *  - 以 permit 授權後安全轉入金額
     * 最後以 slot=0 鑄造 ERC3525 token。
     * @param typedData 鑄造所需之型別資料（含 permit 參數）。
     * @param signature 付款人對 MINT_WITH_SIG 結構之簽章。
     */
    function mintWithSig(GasPassTypes.MintWithSigTypedData calldata typedData, bytes memory signature) public onlyOwner {
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
        

        uint256 ownerNonce = ownerNonces[typedData.permitData.owner];
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
                ownerNonce,
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

        uint256 ownerNonce = ownerNonces[typedData.permitData.owner];
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
     * @notice 以簽章為既有 tokenId 增加值，並透過 permit 轉入對應穩定幣。
     * @param typedData 充值所需之型別資料（含 permit 參數）。
     * @param signature 付款人對 DEPOSIT_WITH_SIG 結構之簽章。
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

    // Todo: 可定義Mint之前

    // 設定自動refuel的policy
    /**
     * @notice 直接設定指定 tokenId 在某鏈的自動補氣策略。
     * @dev 僅 token 擁有者可呼叫；且對應 agent 必須已綁定至該擁有者。
     * @param tokenId 目標 ERC3525 tokenId。
     * @param targetChainId 目標鏈 ID（如 8453/42161/10/137）。
     * @param gasAmount 每次補氣的金額（單位：穩定幣最小單位）。
     * @param threshold 當餘額低於該值時觸發自動補氣。
     * @param agent 被授權可觸發自動補氣的代理人地址。
     */
    function setRefuelPolicy(uint256 tokenId, uint256 targetChainId, uint128 gasAmount, uint128 threshold, address agent) public  {
        require(agentToWallet[agent] == ownerOf(tokenId), "Invalid agent");
        require(msg.sender == ownerOf(tokenId), "Not token owner");
        chainPolicies[tokenId][targetChainId] = GasPassTypes.RefuelPolicy(gasAmount, threshold, agent, 0);
    }
    
    // 設定自動refuel的policy with signature
    /**
     * @notice 透過所有者簽章，由 relayer 代送設定某 tokenId 的自動補氣策略。
     * @dev 僅 relayer 可呼叫；會驗證簽章、時效、nonce、餘額與 agent 合法性。
     * @param policy 以 EIP-712 簽章之策略結構。
     * @param signature token 擁有者對策略結構的簽章。
     */
    function setRefuelPolicyWithSig(GasPassTypes.SetRefuelPolicyTypedData calldata policy, bytes memory signature) public onlyRelayer {
        require(policy.deadline >= block.timestamp, "Signature expired");
        require(policy.nonce == nonces[policy.tokenId], "Nonce already used");
        require(policy.gasAmount > 0, "Gas amount must be greater than 0");
        require(balanceOf(policy.tokenId) > policy.gasAmount, "Insufficient balance");
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
     * @notice 由 token 擁有者直接取消某鏈的自動補氣策略。
     * @param tokenId 目標 tokenId。
     * @param targetChainId 目標鏈 ID。
     */
    function cancelRefuelPolicy(uint256 tokenId, uint256 targetChainId) public {
        require(msg.sender == ownerOf(tokenId), "Not token owner");
        delete chainPolicies[tokenId][targetChainId];

    }
    
    // 取消自動refuel的policy
    /**
     * @notice 透過所有者簽章，由 relayer 代送取消某鏈的自動補氣策略。
     * @dev 僅 relayer 可呼叫；驗證簽章、時效與 nonce 後移除策略。
     * @param typedData 以 EIP-712 簽章之取消結構。
     * @param signature token 擁有者對取消結構的簽章。
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

    // 自動refuel (只能由agent呼叫)
    /**
     * @notice 代理人針對指定鏈執行自動補氣。
     * @dev 僅限已綁定之 agent 呼叫；會收取 0.5% 手續費並從 token 值中扣除。
     * @param tokenId 目標 tokenId。
     * @param targetChainId 目標鏈 ID。
     */
    function autoRefuel(uint256 tokenId, uint256 targetChainId) public onlyAgent(tokenId) {
        GasPassTypes.RefuelPolicy storage policy = chainPolicies[tokenId][targetChainId];
        require(policy.gasAmount > 0, "No policy");
        require(policy.agent == msg.sender, "Wrong agent");
        require(block.timestamp - policy.lastRefueled > 60 seconds, "Cooldown period not met");
        
        // 計算0.5%手續費
        uint256 gasAmount = policy.gasAmount;
        uint256 fee = gasAmount * 5 / 1000;
        uint256 total = gasAmount + fee;

        require(balanceOf(tokenId) >= total, "Insufficient 3525 balance");

        // 扣除加上手續費的total
         _burnValue(tokenId, total);

        IERC20(address(stablecoin)).safeTransfer(address(msg.sender), gasAmount);
        totalFeesCollected += fee;
        policy.lastRefueled = block.timestamp;
        emit AutoRefueled(tokenId, targetChainId, gasAmount, fee);
    }
    
    /**
     * @notice 設定 relayer。
     * @param _relayer 新的 relayer 地址。
     */
    function setRelayer(address _relayer) public onlyOwner {
        require(_relayer != address(0), "Invalid relayer");
        address old = relayer;
        relayer = _relayer;
        emit RelayerChanged(old, _relayer);
    }
    
    /**
     * @dev 綁定 agent 與錢包地址的關係，僅內部使用。
     * @param agent 代理人地址。
     * @param wallet 所屬錢包地址（必須為 token 擁有者）。
     */
    function _setAgentToWallet(address agent, address wallet) internal {
        require(agent != address(0), "Invalid agent");
        require(wallet != address(0), "Invalid wallet");
        agentToWallet[agent] = wallet;
    }
    
    /**
     * @notice 查詢指定 agent 綁定之錢包地址。
    * @param agent 代理人地址。
     * @return 綁定的錢包地址。
     */
    function getAgentToWallet(address agent) public view returns (address) {
        return agentToWallet[agent];
    }

    // Todo:轉移ERC3525的一些檢查邏輯
}
