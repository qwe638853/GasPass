# 環境變數設置說明

## 問題診斷
後端無法啟動是因為缺少必要的環境變數。

## 需要設置的環境變數

請在 `GasPass/backend/` 目錄下創建 `.env` 文件，並填入以下變數：

```env
# 基本配置
PRIVATE_KEY=your_private_key_here
RPC_URL=https://arb1.arbitrum.io/rpc

# Vincent 相關配置
DELEGATEE_PRIVATE_KEY=your_delegatee_private_key_here
ALCHEMY_GAS_SPONSOR_API_KEY=your_alchemy_api_key_here
ALCHEMY_GAS_SPONSOR_POLICY_ID=your_alchemy_policy_id_here

# 可選配置
PORT=3001
```

## 變數說明

- `PRIVATE_KEY`: 你的錢包私鑰，用於 Relayer 功能
- `RPC_URL`: 區塊鏈 RPC 端點，預設為 Arbitrum One
- `DELEGATEE_PRIVATE_KEY`: Vincent 委託者私鑰
- `ALCHEMY_GAS_SPONSOR_API_KEY`: Alchemy Gas Sponsor API 金鑰
- `ALCHEMY_GAS_SPONSOR_POLICY_ID`: Alchemy Gas Sponsor 政策 ID

## 設置步驟

1. 在 `GasPass/backend/` 目錄下創建 `.env` 文件
2. 複製上面的內容到 `.env` 文件中
3. 將 `your_xxx_here` 替換為實際的值
4. 運行 `pnpm run dev` 啟動後端

## 注意事項

- 請確保私鑰安全，不要提交到版本控制系統
- `.env` 文件應該已經在 `.gitignore` 中被忽略
- 如果沒有 Alchemy 相關的 API 金鑰，可能需要註冊 Alchemy 帳戶
