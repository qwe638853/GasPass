# testScript 日誌記錄功能

## 概述

testScript 現在包含了與 Bungee 測試腳本類似的 JSON 日誌記錄功能，可以記錄整個 Quote → Execute → Submit 流程的詳細信息。

## 功能特點

### 📝 日誌記錄類型

1. **API 調用記錄** (`logApiCall`)
   - 記錄所有 API 請求和響應
   - 包含請求參數和響應數據

2. **Quote 數據記錄** (`logQuote`)
   - 記錄 Quote 階段的詳細數據
   - 包含 quoteId, requestType, signTypedData

3. **Execute 數據記錄** (`logExecute`)
   - 記錄 Execute 階段的詳細數據
   - 包含簽名結果和 witness 數據

4. **Submit 數據記錄** (`logSubmit`)
   - 記錄 Submit 階段的詳細數據
   - 包含請求體和響應

5. **狀態輪詢記錄** (`logStatus`)
   - 記錄 Bungee 狀態輪詢的每次嘗試
   - 包含狀態碼和交易哈希

6. **簽名數據記錄** (`logSignature`)
   - 記錄 EIP-712 簽名詳情
   - 包含簽名驗證結果

7. **錯誤記錄** (`logError`)
   - 記錄所有錯誤信息
   - 包含錯誤上下文和堆棧

8. **測試總結** (`logTestSummary`)
   - 記錄整個測試流程的總結
   - 包含成功/失敗狀態

### 🎯 日誌管理功能

1. **查看所有日誌** - 顯示所有已記錄的日誌條目
2. **清除所有日誌** - 清除 localStorage 中的所有日誌
3. **下載日誌** - 將所有日誌打包下載為 JSON 文件

## 使用方法

### 1. 基本使用

日誌功能已經自動集成到現有的流程中：

- **Quote → Execute → Submit** 按鈕會自動記錄完整流程
- **Quote → Execute (只生成簽名)** 按鈕會記錄簽名生成流程
- **Submit (Frontend)** 按鈕會記錄提交流程

### 2. 查看日誌

點擊 **"查看所有日誌"** 按鈕來查看所有已記錄的日誌條目。

### 3. 下載日誌

點擊 **"下載日誌"** 按鈕來下載所有日誌為 JSON 文件，文件名格式：
```
testscript_logs_YYYY-MM-DDTHH-MM-SS-sssZ.json
```

### 4. 清除日誌

點擊 **"清除所有日誌"** 按鈕來清除所有日誌記錄。

## 日誌格式

### API 調用日誌
```json
{
  "timestamp": "2025-01-24T10:30:00.000Z",
  "endpoint": "quote",
  "request": {
    "bridgeParams": { ... },
    "delegatorPkpEthAddress": "0x...",
    "jwt": "...",
    "audience": "..."
  },
  "response": {
    "ok": true,
    "result": { ... }
  }
}
```

### 測試總結日誌
```json
{
  "timestamp": "2025-01-24T10:30:00.000Z",
  "testRun": {
    "testType": "Quote → Execute → Submit",
    "success": true,
    "quoteId": "...",
    "requestType": "SINGLE_OUTPUT_REQUEST",
    "requestHash": "0x...",
    "userSignature": "0x...",
    "totalSteps": 3
  }
}
```

## 日誌存儲

- 所有日誌都存儲在瀏覽器的 localStorage 中
- 日誌鍵名格式：`TESTSCRIPT_LOG_{type}_{timestamp}.json`
- 不會影響現有的 localStorage 數據

## 與 Bungee 測試腳本的對比

| 功能 | Bungee 測試腳本 | testScript |
|------|----------------|------------|
| 存儲方式 | 文件系統 | localStorage |
| 日誌格式 | JSON 文件 | JSON 字符串 |
| 下載方式 | 直接保存 | 瀏覽器下載 |
| 查看方式 | 文件瀏覽器 | 網頁界面 |
| 清除方式 | 刪除文件 | 清除 localStorage |

## 注意事項

1. **存儲限制**：localStorage 有大小限制（通常 5-10MB），如果日誌過多可能需要定期清除
2. **瀏覽器兼容性**：需要支持 localStorage 的現代瀏覽器
3. **隱私考慮**：日誌可能包含敏感信息，請注意保護隱私
4. **性能影響**：大量日誌記錄可能影響性能，建議定期清理

## 故障排除

### 日誌記錄失敗
- 檢查瀏覽器控制台是否有錯誤
- 確認 localStorage 是否可用
- 檢查是否有足夠的存儲空間

### 下載失敗
- 確認瀏覽器支持 Blob 和 URL.createObjectURL
- 檢查是否有彈窗阻止下載
- 嘗試使用不同的瀏覽器

### 日誌顯示異常
- 清除所有日誌後重新測試
- 檢查 localStorage 中的數據格式
- 重新載入頁面
