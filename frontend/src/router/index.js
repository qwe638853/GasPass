import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CardManagement from '../views/CardManagement.vue'
import GasExchange from '../views/GasExchange.vue'
import GiftCards from '../views/GiftCards.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/card-management',
    name: 'CardManagement',
    component: CardManagement
  },
  {
    path: '/gas-exchange',
    name: 'GasExchange',
    component: GasExchange
  },
  {
    path: '/gift-cards',
    name: 'GiftCards',
    component: GiftCards
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router