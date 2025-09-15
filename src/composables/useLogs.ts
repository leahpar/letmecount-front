import { ref, computed } from 'vue'
import axios from '@/plugins/axios'
import type { Log } from '@/types/api'
import { handleApiError } from '@/utils/errorHandler'

const loading = ref(false)
const error = ref<string | null>(null)

export function useLogs() {
  const fetchLogs = async (params: { page?: number; itemsPerPage?: number } = {}): Promise<{ logs: Log[]; totalItems: number; hasMore: boolean }> => {
    loading.value = true
    error.value = null

    try {
      const page = params.page || 1
      const itemsPerPage = params.itemsPerPage || 10
      const url = `/logs?page=${page}&itemsPerPage=${itemsPerPage}`

      const response = await axios.get(url)
      const data = response.data

      return {
        logs: data.member || [],
        totalItems: data.totalItems || 0,
        hasMore: data.view?.next ? true : false
      }
    } catch (err: unknown) {
      error.value = handleApiError(err, 'le chargement des notifications')
      return { logs: [], totalItems: 0, hasMore: false }
    } finally {
      loading.value = false
    }
  }

  const fetchLogById = async (id: string): Promise<Log | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`/logs/${id}`)
      return response.data
    } catch (err: unknown) {
      error.value = handleApiError(err, 'le chargement de la notification')
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchLogs,
    fetchLogById
  }
}