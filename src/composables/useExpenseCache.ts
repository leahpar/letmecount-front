import { ref } from 'vue';
import axios from '@/plugins/axios';

interface ExpenseDetail {
  user: string;
  parts: number;
  montant: number;
}

interface Expense {
  '@id': string;
  titre: string;
  montant: number;
  date: string;
  partage: 'parts' | 'montants';
  payePar: string;
  details?: ExpenseDetail[];
  tag?: string;
}

const expenses = ref<Expense[]>([]);
const page = ref(1);
const allLoaded = ref(false);
const scrollPosition = ref(0);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref('');

export function useExpenseCache() {

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

  return {
    expenses,
    page,
    allLoaded,
    scrollPosition,
    loading,
    loadingMore,
    error,
    fetchExpenses,
    setScrollPosition,
  };
}
