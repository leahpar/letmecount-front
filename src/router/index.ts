import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './authGuard'

// Pages
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => {
        const isAuthenticated = localStorage.getItem('jwt_token')
        return isAuthenticated ? '/home' : '/login'
      }
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    }
  ],
})

router.beforeEach(authGuard)

export default router
