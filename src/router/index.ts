import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './authGuard'
import { useAuth } from '@/composables/useAuth'

// Pages
import LoginView from '../views/LoginView.vue'
import ProfileView from "@/views/ProfileView.vue";
import CreateExpenseView from "@/views/CreateExpenseView.vue";
import ExpenseDetailView from "@/views/ExpenseDetailView.vue";
import ParticipantsView from "@/views/ParticipantsView.vue";
import CredentialsView from "@/views/CredentialsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Si l'utilisateur utilise les boutons précédent/suivant du navigateur
    if (savedPosition) {
      return savedPosition
    }
    // Pour toute nouvelle navigation, remonter en haut
    return { top: 0 }
  },
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
      path: '/expenses/:id',
      name: 'expense-detail',
      component: ExpenseDetailView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/credentials',
      name: 'credentials',
      component: CredentialsView,
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
    },
    {
      path: '/tags/create',
      name: 'create-tag',
      component: () => import('../views/CreateTagView.vue'),
    }
  ],
})

router.beforeEach(authGuard)

export default router
