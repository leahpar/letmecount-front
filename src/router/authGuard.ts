import type { NavigationGuard } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const publicRoutes = ['welcome', 'login', 'login_link', 'credentials']

export const authGuard: NavigationGuard = (to, from, next) => {
  const { isAuthenticated } = useAuth()
  const isPublicRoute = publicRoutes.includes(to.name as string)

  if (!isPublicRoute && !isAuthenticated.value) {
    // welcome porte la saisie du code d'accès ; login_link exige un ?token= dans l'URL
    next({ name: 'welcome' })
  } else if (to.name === 'login' && isAuthenticated.value) {
    next({ name: 'profile' })
  } else {
    next()
  }
}
