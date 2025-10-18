# Web3Modal 設置指南

## 🚀 快速開始

您的 GasPass 專案已經整合了 Web3Modal，現在用戶可以選擇多種錢包進行連接！

## 📋 設置步驟

### 1. 獲取 WalletConnect Project ID

1. 前往 [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. 創建新帳戶或登入
3. 點擊 "Create Project"
4. 填寫專案資訊：
   - **Project Name**: GasPass
   - **Homepage URL**: https://your-domain.com
   - **Description**: 基於 ERC-3525 的跨鏈 Gas 管理平台
5. 創建專案後，複製 **Project ID**

### 2. 更新配置

在以下文件中替換 Project ID：

```javascript
// main.js
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID' // 替換為您的實際 Project ID

// services/web3ModalService.js
this.projectId = 'YOUR_WALLETCONNECT_PROJECT_ID' // 替換為您的實際 Project ID
```

## 🎯 支援的錢包

Web3Modal 支援超過 300+ 種錢包，包括：

- **瀏覽器錢包**: MetaMask, Coinbase Wallet, Brave Wallet
- **移動錢包**: WalletConnect, Rainbow, Trust Wallet
- **硬體錢包**: Ledger, Trezor
- **社交登入**: Google, Twitter, Discord
- **更多**: 查看 [完整列表](https://walletconnect.com/explorer)

## 🔧 支援的鏈

目前配置支援以下區塊鏈：

- Ethereum (主網)
- Arbitrum
- Polygon
- Base
- Optimism
- Avalanche

## 🎨 自定義樣式

Web3Modal 按鈕已經套用您的 GasPass 品牌樣式：

- 琥珀色漸變背景
- 懸浮動畫效果
- 發光效果
- 響應式設計

## 🔄 功能特色

- **一鍵連接**: 用戶點擊即可選擇錢包
- **自動重連**: 記住用戶的錢包選擇
- **多鏈支援**: 輕鬆切換不同區塊鏈
- **響應式**: 支援桌面和移動設備
- **安全**: 使用 WalletConnect 協議

## 🚨 注意事項

1. **測試環境**: 建議先在測試網上測試功能
2. **Project ID**: 請勿在公開代碼中暴露您的 Project ID
3. **域名**: 確保在 WalletConnect 設置中添加正確的域名
4. **HTTPS**: 生產環境必須使用 HTTPS

## 🎉 完成！

設置完成後，用戶將看到一個美觀的 "連接錢包" 按鈕，點擊後可以選擇各種錢包進行連接！

---

**需要幫助？** 查看 [Web3Modal 文檔](https://docs.walletconnect.com/web3modal/about)
