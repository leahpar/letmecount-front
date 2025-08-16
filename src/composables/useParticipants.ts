import { ref } from 'vue'
import axios from '@/plugins/axios'

export function useParticipants() {
  const participants = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchParticipants = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/users')
      participants.value = response.data.member
    } catch (error: unknown) {
      console.error(error)
      error.value = 'Erreur lors de la récupération des participants'
    } finally {
      loading.value = false
    }
  }

  return {
    participants,
    loading,
    error,
    fetchParticipants
  }
}
