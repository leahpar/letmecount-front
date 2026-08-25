import { ref, computed } from 'vue'
import axios from 'axios'
import { useUsers } from '@/composables/useUsers'

const token = ref<string | null>(localStorage.getItem('jwt_token'))
const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
// Repère de la session courante, rendu par l'API à chaque émission de jetons.
// Il ne change pas d'un renouvellement à l'autre : c'est ce qui permet à la
// page des connexions de dire « celle-ci, c'est toi ».
const sessionKey = ref<string | null>(localStorage.getItem('session_key'))

export function useAuth() {
  const { me } = useUsers()
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => me.value?.roles.includes('ROLE_ADMIN') || false)

  const setTokens = (newToken: string, newRefreshToken?: string, newSessionKey?: string | null) => {
    token.value = newToken
    localStorage.setItem('jwt_token', newToken)

    if (newRefreshToken) {
      refreshToken.value = newRefreshToken
      localStorage.setItem('refresh_token', newRefreshToken)
    }

    if (newSessionKey) {
      sessionKey.value = newSessionKey
      localStorage.setItem('session_key', newSessionKey)
    }
  }

  const login = (newToken: string, newRefreshToken?: string, newSessionKey?: string | null) => {
    setTokens(newToken, newRefreshToken, newSessionKey)
  }

  const logout = () => {
    token.value = null
    refreshToken.value = null
    sessionKey.value = null
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('session_key')
  }

  const clearTokens = () => {
    logout()
  }

  /**
   * Déconnexion volontaire : on ferme la session côté serveur avant d'oublier
   * les jetons. Sans cet appel, la ligne survivrait jusqu'à l'expiration du
   * refresh token — un an — et la connexion suivante en ajouterait une seconde,
   * d'où l'impression de doublons sur la page des connexions.
   */
  const signOut = async (): Promise<void> => {
    const current = refreshToken.value

    if (current) {
      try {
        // axios brut et non l'instance du projet : ses intercepteurs
        // renouvelleraient le jeton sur un 401, et la déconnexion porterait
        // alors sur un jeton déjà remplacé — la session resterait ouverte.
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, { refresh_token: current })
      } catch (err: unknown) {
        // Le serveur n'a pas pu être prévenu : on se déconnecte quand même ici,
        // et la session s'éteindra d'elle-même à son expiration.
        console.error('Déconnexion côté serveur impossible', err)
      }
    }

    logout()
  }

  const getToken = () => token.value
  const getRefreshToken = () => refreshToken.value
  const getSessionKey = () => sessionKey.value

  const redirectToLogin = () => {
    window.location.href = '/login'
  }

  return {
    isAuthenticated,
    isAdmin,
    login,
    logout,
    signOut,
    getToken,
    getRefreshToken,
    getSessionKey,
    setTokens,
    clearTokens,
    redirectToLogin
  }
}
