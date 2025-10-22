# Agent 自動監測系統

## 功能說明

這個監聽系統會自動掃描所有 GasPass token 的策略，當使用者錢包餘額低於設定的 threshold 時，自動觸發補氣。

## 支援的鏈

- Ethereum (1)
- Arbitrum One (42161)
- Base Mainnet (8453)
- Avalanche C-Chain (43114)
- Binance Smart Chain (56)
- Gnosis Chain (100)
- Mantle Network (5000)
- Mode Mainnet (34443)
- Unichain Mainnet (130)
- Soneium Mainnet (1868)
- Ink Mainnet (57073)
- Blast Mainnet (81457)
- Linea (59144)
- Polygon (137)
- Scroll (534352)
- Sonic (146)
- Optimism (10)
- Berachain (80094)

## 環境設定

1. 複製 `.env.example` 到 `.env`
2. 填入必要的環境變量：

```bash
# 必須設定
GASPASS_ADDRESS=0x...  # GasPass 合約地址
AGENT_PRIVATE_KEY=0x...  # Agent 私鑰

# 可選設定
BASE_RPC_URL=https://mainnet.base.org  # 預設 Base 鏈
MONITOR_INTERVAL=1  # 監聽間隔（分鐘）
```

## 使用方法

### 啟動監聽

```bash
# 方法 1: 使用 npm script
npm run monitor

# 方法 2: 直接執行
node monitor/monitor.js
```

### 程式化使用

```javascript
import { checkAllPolicies, startMonitoring } from './monitor/monitor.js';

// 執行一次掃描
await checkAllPolicies();

// 開始定時監聽（每分鐘）
startMonitoring(1);
```

## 監聽流程

1. **掃描所有 tokenId**：使用 `totalSupply()` 和 `tokenByIndex()`
2. **檢查策略**：對每個 tokenId，檢查所有支援鏈的 `chainPolicies`
3. **查詢餘額**：如果策略存在（threshold > 0），查詢該鏈的錢包餘額
4. **觸發補氣**：如果餘額 < threshold，呼叫 `autoRefuel()`

## 日誌說明

- 🔍 開始掃描
- 📊 發現的 token 數量
- 🎫 檢查特定 tokenId
- 👤 錢包擁有者
- 📋 發現的策略
- 💰 餘額查詢結果
- ⚠️ 餘額不足警告
- 🚀 觸發補氣
- ✅ 成功操作
- ❌ 錯誤訊息

## 錯誤處理

- RPC 連接失敗時會跳過該鏈，繼續檢查其他鏈
- 合約調用失敗時會記錄錯誤但不中斷掃描
- 所有錯誤都會記錄到 console

## 測試建議

1. **本地測試**：使用 Anvil 部署合約，設定測試策略
2. **模擬觸發**：先註解掉 `triggerAutoRefuel` 中的實際交易，只記錄日誌
3. **監控日誌**：觀察掃描過程和策略發現情況
