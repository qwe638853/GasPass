# GasPass 合約 ABI 文件

這個目錄包含了 GasPass 合約的 ABI (Application Binary Interface) 文件，用於前端和後端與合約交互。

## 📁 文件說明

| 文件名 | 格式 | 用途 | 大小 |
|--------|------|------|------|
| `GasPass.abi.json` | JSON | 純 ABI，用於簡單集成 | ~43KB |
| `GasPass.full.json` | JSON | 完整合約信息（ABI + Bytecode + Metadata） | ~226KB |
| `GasPass.abi.ts` | TypeScript | TypeScript 類型定義 | ~43KB |
| `GasPass.abi.js` | JavaScript | Node.js 模組 | ~43KB |

## 🚀 使用方法

### 1. 前端開發 (React/Vue/Angular)

```typescript
import { GasPassABI } from './GasPass.abi';

// 使用 ethers.js
import { ethers } from 'ethers';

const provider = new ethers.providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
const contract = new ethers.Contract(contractAddress, GasPassABI, provider);

// 調用合約函數
const balance = await contract.balanceOf(tokenId);
const owner = await contract.ownerOf(tokenId);
```

### 2. Node.js 後端開發

```javascript
const GasPassABI = require('./GasPass.abi.js');
const { ethers } = require('ethers');

const provider = new ethers.providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, GasPassABI, wallet);

// 調用合約函數
const result = await contract.mintWithSig(typedData, signature);
```

### 3. Web3.js

```javascript
import GasPassABI from './GasPass.abi.json';
import Web3 from 'web3';

const web3 = new Web3('https://arb1.arbitrum.io/rpc');
const contract = new web3.eth.Contract(GasPassABI, contractAddress);

// 調用合約函數
const balance = await contract.methods.balanceOf(tokenId).call();
```

### 4. 合約驗證

```bash
# 使用完整合約信息進行驗證
forge verify-contract <合約地址> src/GasPass.sol:GasPass \
    --chain-id 42161 \
    --etherscan-api-key $ARBISCAN_API_KEY
```

## 📋 主要函數

### 🔐 簽章函數 (僅 Relayer 可調用)
- `mintWithSig(typedData, signature)` - 簽章鑄造
- `mintBatchWithSig(typedData, signature)` - 批量簽章鑄造
- `depositWithSig(typedData, signature)` - 簽章充值
- `setRefuelPolicyWithSig(policy, signature)` - 簽章設置補氣策略
- `cancelRefuelPolicyWithSig(typedData, signature)` - 簽章取消補氣策略
- `setAgentToWalletWithSig(typedData, signature)` - 簽章綁定代理

### 🎯 直接函數 (Token 擁有者可調用)
- `setRefuelPolicy(tokenId, targetChainId, gasAmount, threshold, agent)` - 設置補氣策略
- `cancelRefuelPolicy(tokenId, targetChainId)` - 取消補氣策略
- `withdrawAllUSDC(tokenId, to)` - 提取 USDC

### 🤖 代理函數 (僅 Agent 可調用)
- `autoRefuel(tokenId, inbox, req, expectedSorHash, targetChainId)` - 自動補氣

### 👑 管理員函數 (僅 Owner 可調用)
- `setRelayer(newRelayer)` - 設置 Relayer
- `withdrawFees(to)` - 提取手續費
- `renounceOwnership()` - 放棄所有權
- `transferOwnership(newOwner)` - 轉移所有權

### 📊 查詢函數 (View)
- `balanceOf(tokenId)` - 查詢餘額
- `ownerOf(tokenId)` - 查詢擁有者
- `agentToWallet(agent)` - 查詢代理綁定
- `chainPolicies(tokenId, chainId)` - 查詢補氣策略
- `getWithdrawableFees()` - 查詢可提取手續費

## 🔄 重新生成 ABI

如果合約有更新，可以重新生成 ABI：

```bash
# 使用自動化腳本
./script/generate-abi.sh

# 或手動生成
forge build
python3 -c "
import json
with open('out/GasPass.sol/GasPass.json', 'r') as f:
    data = json.load(f)
with open('GasPass.abi.json', 'w') as f:
    json.dump(data['abi'], f, indent=2)
"
```

## 📊 ABI 統計

- **函數總數**: 60+ 個
- **事件總數**: 8 個
- **錯誤總數**: 0 個
- **主要功能**:
  - ERC-3525 半同質化代幣
  - EIP-712 簽章鑄造/充值
  - 多鏈自動補氣策略
  - Permit2 穩定幣集成
  - Bungee 跨鏈橋接

## ⚠️ 注意事項

1. **簽章函數**: 需要正確的 EIP-712 簽章
2. **權限控制**: 不同函數有不同的調用權限
3. **Gas 估算**: 複雜函數需要足夠的 Gas
4. **事件監聽**: 建議監聽相關事件來跟蹤狀態
5. **錯誤處理**: 合約會 revert 並提供錯誤信息

## 🔗 相關資源

- [EIP-712 標準](https://eips.ethereum.org/EIPS/eip-712)
- [ERC-3525 標準](https://eips.ethereum.org/EIPS/eip-3525)
- [Ethers.js 文檔](https://docs.ethers.io/)
- [Web3.js 文檔](https://web3js.readthedocs.io/)
- [Arbitrum 開發者文檔](https://docs.arbitrum.io/)
