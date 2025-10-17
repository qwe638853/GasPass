import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Dashboard from '../views/Dashboard.vue'
import WalletManagement from '../views/WalletManagement.vue'
import CrossChainSwap from '../views/CrossChainSwap.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/wallet-management',
    name: 'WalletManagement',
    component: WalletManagement
  },
  {
    path: '/cross-chain-swap',
    name: 'CrossChainSwap',
    component: CrossChainSwap
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router