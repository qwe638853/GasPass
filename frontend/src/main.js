import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Web3Modal initialization is now handled by walletService
// This avoids duplicate initialization issues

createApp(App).use(router).mount('#app')
