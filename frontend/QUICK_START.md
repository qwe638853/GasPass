# GasPass Frontend - 快速啟動指南

## 🚀 立即開始

### 1. 啟動開發伺服器
```bash
cd frontend
npm run dev
```

### 2. 開啟瀏覽器
訪問: http://localhost:5173

### 3. 開始使用
- 點擊右上角「連接錢包」按鈕
- 安裝並連接 MetaMask
- 切換到 Arbitrum 網路
- 開始探索 GasPass 功能！

## 📱 功能頁面

| 路由 | 功能 | 描述 |
|------|------|------|
| `/` | 首頁 | 產品介紹和導航 |
| `/mint` | 鑄造儲值卡 | 使用 USDC 鑄造 ERC-3525 儲值卡 |
| `/deposit` | 儲值管理 | 為儲值卡充值 USDC |
| `/manual-refuel` | 手動補 Gas | 選擇目標鏈立即補充 Gas |
| `/auto-refuel` | 自動補 Gas | 設定自動補充策略 |
| `/agent-settings` | AI Agent 設定 | Lit Protocol 智能監控配置 |

## 🔧 開發指令

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 生產構建
npm run build

# 預覽構建結果
npm run preview
```

## 💡 提示

- **首次使用**: 建議從首頁開始，了解產品功能
- **錢包設定**: 確保連接到 Arbitrum 網路
- **測試功能**: 所有功能目前都是 Mock 數據，適合 UI/UX 測試
- **響應式**: 支援桌面和移動端訪問

## 🛠️ 如果遇到問題

1. **清除快取**: 
   ```bash
   npm install
   rm -rf node_modules/.vite
   npm run dev
   ```

2. **錢包問題**: 確保安裝了 MetaMask 並已登入

3. **網路問題**: 手動切換到 Arbitrum One 網路

4. **樣式問題**: 檢查瀏覽器控制台是否有 CSS 錯誤

## 🎯 下一步

1. **整合智能合約**: 將前端與 GasPass 合約連接
2. **實作橋接功能**: 整合 Avail SDK 和 debridge
3. **部署測試**: 部署到測試網進行完整測試

---

🎉 **恭喜！** 你的 GasPass 前端應用已經準備就緒！