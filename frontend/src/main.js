import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Web3Modal 初始化現在由 walletService 處理
// 這樣可以避免重複初始化的問題

createApp(App).use(router).mount('#app')
