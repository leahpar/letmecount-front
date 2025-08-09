import { ref, computed } from 'vue'

const token = ref<string | null>(localStorage.getItem('jwt_token'))
const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)

  const setTokens = (newToken: string, newRefreshToken?: string) => {
    token.value = newToken
    localStorage.setItem('jwt_token', newToken)
    
    if (newRefreshToken) {
      refreshToken.value = newRefreshToken
      localStorage.setItem('refresh_token', newRefreshToken)
    }
  }

  const login = (newToken: string, newRefreshToken?: string) => {
    setTokens(newToken, newRefreshToken)
  }

  const logout = () => {
    token.value = null
    refreshToken.value = null
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('refresh_token')
  }

  const clearTokens = () => {
    logout()
  }

  const getToken = () => token.value
  const getRefreshToken = () => refreshToken.value

  const redirectToLogin = () => {
    window.location.href = '/login'
  }

  return {
    isAuthenticated,
    login,
    logout,
    getToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    redirectToLogin
  }
}