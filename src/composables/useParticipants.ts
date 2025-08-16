import { ref, computed } from 'vue'
import axios from '@/plugins/axios'

export function useParticipants() {
  const participantsData = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const participants = computed(() => {
    return [...participantsData.value].sort((a, b) => b.solde - a.solde)
  })

  const fetchParticipants = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/users')
      participantsData.value = response.data.member
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
