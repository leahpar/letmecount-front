import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/plugins/axios';
import type { Expense, CreateExpenseData } from '@/types/api';
import { handleApiError } from '@/utils/errorHandler';

interface DeleteExpenseOptions {
  redirectTo?: string
  refreshProfile?: boolean
}

const expenses = ref<Expense[]>([]);
const page = ref(1);
const allLoaded = ref(false);
const scrollPosition = ref(0);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref('');

export function useExpenses() {

  const fetchExpenses = async (limit: number, tagId?: string, forceRefresh = false) => {
    if (loading.value || loadingMore.value || (allLoaded.value && !forceRefresh)) return;

    if (forceRefresh) {
      expenses.value = [];
      page.value = 1;
      allLoaded.value = false;
      scrollPosition.value = 0;
    }

    if (page.value === 1) {
      loading.value = true;
    } else {
      loadingMore.value = true;
    }
    error.value = '';

    try {
      let url = `/depenses?page=${page.value}&itemsPerPage=${limit}`;
      if (tagId) {
        url += `&tags.id=${tagId}`;
      }

      const response = await axios.get(url);
      const newExpenses = response.data.member || [];

      if (newExpenses.length < limit) {
        allLoaded.value = true;
      }

      if (forceRefresh) {
        expenses.value = newExpenses;
      } else {
        expenses.value.push(...newExpenses);
      }
      page.value++;
    } catch (err: unknown) {
      console.error('Erreur lors du chargement des dépenses:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        error.value = axiosError.response?.data?.message || 'Erreur lors du chargement des dépenses';
      } else {
        error.value = 'Erreur lors du chargement des dépenses';
      }
    } finally {
      loading.value = false;
      loadingMore.value = false;
    }
  };

  const setScrollPosition = (position: number) => {
    scrollPosition.value = position;
  };

  const createExpense = async (expenseData: CreateExpenseData): Promise<Expense | null> => {
    loading.value = true
    error.value = ''

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
    error.value = ''

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
    error.value = ''

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
    error.value = ''

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

  const confirmDeleteExpense = async (
    expenseId: string,
    expenseTitle: string,
    options: DeleteExpenseOptions = {}
  ): Promise<boolean> => {
    const router = useRouter()
    const { redirectTo = 'profile', refreshProfile = true } = options

    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer la dépense "${expenseTitle}" ?\n\nCette action est irréversible.`
    )

    if (!confirmed) {
      return false
    }

    const success = await deleteExpense(expenseId)

    if (success) {
      // Redirection avec refresh optionnel
      if (refreshProfile && redirectTo === 'profile') {
        router.push({ name: redirectTo, query: { refresh: 'true' } })
      } else {
        router.push({ name: redirectTo })
      }

      return true
    } else {
      alert('Erreur lors de la suppression de la dépense')
      return false
    }
  }

  return {
    expenses,
    page,
    allLoaded,
    scrollPosition,
    loading: computed(() => loading.value),
    loadingMore,
    error: computed(() => error.value),
    fetchExpenses,
    setScrollPosition,
    createExpense,
    updateExpense,
    fetchExpenseById,
    deleteExpense,
    confirmDeleteExpense,
  };
}
