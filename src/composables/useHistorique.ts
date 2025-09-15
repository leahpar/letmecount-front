import { ref } from 'vue'
import axios from '@/plugins/axios'

export interface HistoriqueData {
  [date: string]: {
    [userId: string]: number
  }
}

export function useHistorique() {
  const historique = ref<HistoriqueData>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchHistorique = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get('/historique')
      historique.value = response.data
    } catch (err) {
      const errorMessage = err instanceof Error && 'response' in err && err.response &&
        typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? (err.response.data as { message: string }).message
        : 'Erreur lors de la récupération de l\'historique'

      error.value = errorMessage
      console.error('Erreur lors de la récupération de l\'historique:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    historique,
    loading,
    error,
    fetchHistorique
  }
}
