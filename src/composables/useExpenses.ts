import { ref, computed } from 'vue'
import axios from '@/plugins/axios'
import type { Expense, CreateExpenseData } from '@/types/api'

const loading = ref(false)
const error = ref<string | null>(null)

export function useExpenses() {
  const createExpense = async (expenseData: CreateExpenseData): Promise<Expense | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post('/depenses', expenseData)
      return response.data
    } catch (err: unknown) {
      console.error('Erreur lors de la création de la dépense:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        error.value = axiosError.response?.data?.message || 'Erreur lors de la création de la dépense'
      } else {
        error.value = 'Erreur lors de la création de la dépense'
      }
      return null
    } finally {
      loading.value = false
    }
  }

  const updateExpense = async (id: string, expenseData: CreateExpenseData): Promise<Expense | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.patch(`/depenses/${id}`, expenseData)
      return response.data
    } catch (err: unknown) {
      console.error('Erreur lors de la mise à jour de la dépense:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        error.value = axiosError.response?.data?.message || 'Erreur lors de la mise à jour de la dépense'
      } else {
        error.value = 'Erreur lors de la mise à jour de la dépense'
      }
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchExpenseById = async (id: string): Promise<Expense | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`/depenses/${id}`)
      return response.data
    } catch (err: unknown) {
      console.error('Erreur lors du chargement de la dépense:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        error.value = axiosError.response?.data?.message || 'Erreur lors du chargement de la dépense'
      } else {
        error.value = 'Erreur lors du chargement de la dépense'
      }
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteExpense = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await axios.delete(`/depenses/${id}`)
      return true
    } catch (err: unknown) {
      console.error('Erreur lors de la suppression de la dépense:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        error.value = axiosError.response?.data?.message || 'Erreur lors de la suppression de la dépense'
      } else {
        error.value = 'Erreur lors de la suppression de la dépense'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchExpenses = async (params: { limit?: number; tagId?: string } = {}): Promise<Expense[]> => {
    loading.value = true
    error.value = null

    try {
      let url = `/depenses?page=1&itemsPerPage=${params.limit || 10}`
      
      if (params.tagId) {
        url += `&tags.id=${params.tagId}`
      }

      const response = await axios.get(url)
      return response.data.member || []
    } catch (err: unknown) {
      console.error('Erreur lors du chargement des dépenses:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        error.value = axiosError.response?.data?.message || 'Erreur lors du chargement des dépenses'
      } else {
        error.value = 'Erreur lors du chargement des dépenses'
      }
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    createExpense,
    updateExpense,
    fetchExpenseById,
    deleteExpense,
    fetchExpenses
  }
}