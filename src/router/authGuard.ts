import type { NavigationGuard } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { rememberAfterLogin } from '@/composables/useAfterLogin'

const publicRoutes = ['welcome', 'login', 'login_link', 'auth_callback']

export const authGuard: NavigationGuard = (to, from, next) => {
  const { isAuthenticated } = useAuth()
  const isPublicRoute = publicRoutes.includes(to.name as string)

  if (!isPublicRoute && !isAuthenticated.value) {
    // Le consentement OAuth est la seule page dont l'URL porte un sens : ses
    // paramètres viennent de l'API et ne se retrouvent pas. Ailleurs, revenir
    // au profil après connexion ne coûte qu'un clic.
    if (to.name === 'oauth_consent') {
      rememberAfterLogin(to.fullPath)
    }

    // login porte le passkey et Google ; login_link exige un ?token= dans l'URL
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuthenticated.value) {
    next({ name: 'profile' })
  } else {
    next()
  }
}
