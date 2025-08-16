import { ref, computed } from 'vue'
import axios from '@/plugins/axios'
import type { Expense, CreateExpenseData } from '@/types/api'
import { handleApiError } from '@/utils/errorHandler'

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
      error.value = handleApiError(err, 'la création de la dépense')
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
      error.value = handleApiError(err, 'la mise à jour de la dépense')
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
      error.value = handleApiError(err, 'le chargement de la dépense')
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
      error.value = handleApiError(err, 'la suppression de la dépense')
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
      error.value = handleApiError(err, 'le chargement des dépenses')
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