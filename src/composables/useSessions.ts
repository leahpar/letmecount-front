import { ref } from 'vue'
import type { Session } from '@/types/api'
import axios from '@/plugins/axios'
import { handleApiError } from '@/utils/errorHandler'

/**
 * Les sessions ouvertes de l'utilisateur : ses navigateurs, son téléphone, et
 * les clients MCP auxquels il a donné son accord.
 *
 * Pas de cache, comme les passkeys : la liste change rarement et doit être juste
 * après une révocation.
 */
export function useSessions() {
  const sessions = ref<Session[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSessions = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get('/sessions')
      sessions.value = response.data.member || []
    } catch (err: unknown) {
      error.value = handleApiError(err, 'le chargement des sessions')
    } finally {
      loading.value = false
    }
  }

  const revokeSession = async (id: number): Promise<boolean> => {
    error.value = null

    try {
      await axios.delete(`/sessions/${id}`)
      await fetchSessions()
      return true
    } catch (err: unknown) {
      error.value = handleApiError(err, 'la révocation de la session')
      return false
    }
  }

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    revokeSession,
  }
}
