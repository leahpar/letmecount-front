import { ref } from 'vue'
import type { Passkey } from '@/types/api'
import axios from '@/plugins/axios'
import { handleApiError } from '@/utils/errorHandler'

/**
 * Les appareils (passkeys) enregistrés par l'utilisateur connecté.
 * Pas de cache : la liste change rarement et doit être juste après une suppression.
 */
export function usePasskeys() {
  const passkeys = ref<Passkey[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPasskeys = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get('/passkeys')
      passkeys.value = response.data.member || []
    } catch (err: unknown) {
      error.value = handleApiError(err, 'le chargement des appareils')
    } finally {
      loading.value = false
    }
  }

  const renamePasskey = async (id: number, name: string): Promise<boolean> => {
    error.value = null

    try {
      await axios.patch(`/passkeys/${id}`, { name })
      await fetchPasskeys()
      return true
    } catch (err: unknown) {
      error.value = handleApiError(err, 'le renommage de l\'appareil')
      return false
    }
  }

  const deletePasskey = async (id: number): Promise<boolean> => {
    error.value = null

    try {
      await axios.delete(`/passkeys/${id}`)
      await fetchPasskeys()
      return true
    } catch (err: unknown) {
      error.value = handleApiError(err, 'la suppression de l\'appareil')
      return false
    }
  }

  return {
    passkeys,
    loading,
    error,
    fetchPasskeys,
    renamePasskey,
    deletePasskey,
  }
}
