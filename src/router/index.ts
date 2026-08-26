import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './authGuard'
import { useAuth } from '@/composables/useAuth'

// Pages
import WelcomeView from '../views/WelcomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from "@/views/ProfileView.vue";
import CreateExpenseView from "@/views/CreateExpenseView.vue";
import ExpenseDetailView from "@/views/ExpenseDetailView.vue";
import ParticipantsView from "@/views/ParticipantsView.vue";
import TagsView from "@/views/TagsView.vue";
import ActiviteView from "@/views/ActiviteView.vue";
import HistoriqueView from "@/views/HistoriqueView.vue";

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
        return isAuthenticated.value ? { name: 'profile' } : { name: 'welcome' }
      }
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: WelcomeView,
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
      path: '/login_link',
      name: 'login_link',
      component: () => import('../views/LoginLinkView.vue'),
    },
    {
      path: '/auth/callback',
      name: 'auth_callback',
      component: () => import('../views/AuthCallbackView.vue'),
    },
    {
      path: '/participants',
      name: 'participants',
      component: ParticipantsView,
    },
    {
      path: '/tags',
      name: 'tags',
      component: TagsView,
    },
    {
      path: '/tags/create',
      name: 'create-tag',
      component: () => import('../views/CreateTagView.vue'),
    },
    {
      path: '/tags/:id/edit',
      name: 'edit-tag',
      component: () => import('../views/CreateTagView.vue'),
    },
    // Consentement OAuth : l'API y renvoie le navigateur au milieu du flow d'un
    // client MCP (cf. api/doc/couche-mcp.md, M3).
    {
      path: '/oauth/consent',
      name: 'oauth_consent',
      component: () => import('../views/OAuthConsentView.vue'),
    },
    {
      path: '/passkeys',
      name: 'passkeys',
      component: () => import('../views/PasskeysView.vue'),
    },
    {
      path: '/activite',
      name: 'activite',
      component: ActiviteView,
    },
    // Ancienne URL de l'activité : conservée pour les PWA déjà installées et les
    // signets, qui pointent encore dessus.
    {
      path: '/notifications',
      redirect: { name: 'activite' },
    },
    {
      path: '/historique',
      name: 'historique',
      component: HistoriqueView,
    },
    // Toute URL inconnue revient à l'accueil, qui oriente selon la session.
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home' },
    }
  ],
})

router.beforeEach(authGuard)

export default router
