# GasPass Frontend

GasPass 前端應用是一個基於 Vue.js 3 的現代化 Web3 應用程式，提供完整的跨鏈 Gas 管理解決方案。

## 🚀 功能特色

### 核心功能
- **🎫 ERC-3525 儲值卡鑄造** - 使用 USDC 鑄造跨鏈 Gas 儲值卡
- **💳 儲值金管理** - 便捷的 USDC 充值和餘額查看
- **⚡ 手動補 Gas** - 選擇目標鏈立即補充 Gas
- **🤖 自動補 Gas** - 設定策略自動監控和補充
- **🔮 AI Agent 智能管理** - 整合 Lit Protocol 的智能監控

### 技術特色
- **🔗 Web3 整合** - 支援 MetaMask 等主流錢包
- **🌊 無 Gas 體驗** - 基於簽名的無 Gas 操作
- **📱 響應式設計** - 完美適配桌面和移動端
- **🎨 現代化 UI** - 基於 Tailwind CSS 的精美界面

## 🛠️ 技術架構

- **框架**: Vue.js 3 (Composition API)
- **路由**: Vue Router 4
- **樣式**: Tailwind CSS 4
- **Web3**: Ethers.js 6
- **工具**: Vite、PostCSS

## 📦 安裝和運行

### 前置需求
- Node.js >= 16
- npm 或 yarn
- MetaMask 或其他 Web3 錢包

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```

### 生產構建
```bash
npm run build
```

### 預覽構建結果
```bash
npm run preview
```

## 🗂️ 專案結構

```
src/
├── assets/             # 靜態資源 (LOGO、圖片)
├── components/         # 可重用組件
│   └── Layout.vue     # 主要布局組件
├── composables/        # Vue 3 Composables
│   └── useWeb3.js     # Web3 錢包管理
├── router/            # 路由配置
│   └── index.js       # 路由定義
├── views/             # 頁面組件
│   ├── Home.vue       # 首頁
│   ├── Mint.vue       # 鑄造儲值卡
│   ├── Deposit.vue    # 儲值管理
│   ├── ManualRefuel.vue    # 手動補 Gas
│   ├── AutoRefuel.vue      # 自動補 Gas
│   └── AgentSettings.vue   # AI Agent 設定
├── App.vue            # 根組件
├── main.js            # 應用入口
└── style.css          # 全域樣式
```

## 🎯 頁面功能

### 🏠 首頁 (`/`)
- 產品介紹和特色展示
- 使用流程說明
- 導航到各個功能模組

### 🎫 鑄造儲值卡 (`/mint`)
- 使用 USDC 鑄造 ERC-3525 儲值卡
- 設定初始儲值金額
- 即時費用預估
- 交易狀態追蹤

### 💳 儲值管理 (`/deposit`)
- 查看所有擁有的儲值卡
- 為儲值卡充值 USDC
- 查看交易歷史
- 餘額管理

### ⚡ 手動補 Gas (`/manual-refuel`)
- 選擇目標區塊鏈
- 設定補充數量
- 橋接費用計算
- 交易進度追蹤

### 🤖 自動補 Gas (`/auto-refuel`)
- 設定自動補充策略
- 監控多個錢包地址
- 策略執行統計
- 活動記錄查看

### 🔮 Agent 設定 (`/agent-settings`)
- Lit Protocol 整合配置
- AI Agent 監控設定
- 通知和警告配置
- 進階橋接設定

## 🔧 Web3 整合

### 錢包連接
應用支援主流 Web3 錢包：
- MetaMask
- WalletConnect
- Coinbase Wallet

### 網路支援
- **主網路**: Arbitrum One (42161)
- **目標鏈**: Ethereum, Polygon, BNB Chain, Avalanche, Optimism, Fantom

### 智能合約整合
- GasPass ERC-3525 合約
- USDC ERC-20 Permit 支援
- 跨鏈橋接協議整合

## 🎨 設計系統

### 色彩配置
- **主色**: 橙色系 (#f97316)
- **輔色**: 灰色系 (#6b7280)
- **背景**: 淡灰色 (#f9fafb)
- **強調**: 綠色 (成功)、紅色 (錯誤)、黃色 (警告)

### 字體
- **主字體**: Inter (Google Fonts)
- **等寬字體**: Menlo, Monaco, Consolas

### 響應式設計
- **桌面**: 1024px+
- **平板**: 768px - 1023px  
- **手機**: < 768px

## 🔐 安全考量

- 所有私鑰操作在本地進行
- 使用 EIP-712 簽名標準
- 前端不儲存敏感信息
- HTTPS 連接要求
- CSP 安全標頭

## 🚧 開發計劃

### 即將推出
- [ ] 多語言支援 (英文、日文)
- [ ] 黑暗模式主題
- [ ] PWA 支援
- [ ] 通知系統
- [ ] 交易歷史匯出

### 長期規劃
- [ ] 移動端 App
- [ ] DeFi 協議整合
- [ ] NFT 儲值卡設計
- [ ] 社群功能

## 📞 技術支援

如有技術問題或建議，請聯繫開發團隊：
- GitHub Issues
- Discord 社群
- 技術文檔: [docs.gaspass.xyz](https://docs.gaspass.xyz)

## 📄 授權

MIT License - 詳見 LICENSE 文件