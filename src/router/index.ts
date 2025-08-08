import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './authGuard'

// Pages
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => Promise.reject("TODO: Implement login view"),
    }
  ],
})

router.beforeEach(authGuard)

export default router
