import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Web3Modal setup with wagmi
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'
import { arbitrum, base, polygon, mainnet, optimism, avalanche } from 'viem/chains'

// 您需要在 https://cloud.walletconnect.com/ 創建專案並獲取 Project ID
const projectId = '255a4cd46f3cd791463a56bb6c43d7bc' 

const metadata = {
  name: 'GasPass',
  description: '基於 ERC-3525 的跨鏈 Gas 管理平台',
  url: 'https://gaspass.com',
  icons: ['https://gaspass.com/icon.png']
}

const chains = [mainnet, arbitrum, polygon, base, optimism, avalanche]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

createWeb3Modal({ wagmiConfig, projectId, chains })

createApp(App).use(router).mount('#app')
