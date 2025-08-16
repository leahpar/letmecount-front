import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './authGuard'
import { useAuth } from '@/composables/useAuth'

// Pages
import LoginView from '../views/LoginView.vue'
import ProfileView from "@/views/ProfileView.vue";
import CreateExpenseView from "@/views/CreateExpenseView.vue";
import ParticipantsView from "@/views/ParticipantsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: () => {
        const { isAuthenticated } = useAuth()
        return isAuthenticated.value ? { name: 'profile' } : { name: 'login' }
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/expenses/create',
      name: 'create-expense',
      component: CreateExpenseView,
    },
    {
      path: '/expenses/:id/edit',
      name: 'edit-expense',
      component: CreateExpenseView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/style-guide',
      name: 'style-guide',
      component: () => import('../views/StyleGuideView.vue'),
    },
    {
      path: '/participants',
      name: 'participants',
      component: ParticipantsView,
    }
  ],
})

router.beforeEach(authGuard)

export default router
