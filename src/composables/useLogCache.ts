import { ref } from 'vue';
import axios from '@/plugins/axios';
import type { Log } from '@/types/api';

const logs = ref<Log[]>([]);
const page = ref(1);
const allLoaded = ref(false);
const scrollPosition = ref(0);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref('');

export function useLogCache() {

  const fetchLogs = async (limit: number, forceRefresh = false) => {
    if (loading.value || loadingMore.value || (allLoaded.value && !forceRefresh)) return;

    if (forceRefresh) {
      logs.value = [];
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
      const url = `/logs?page=${page.value}&itemsPerPage=${limit}`;

      const response = await axios.get(url);
      const newLogs = response.data.member || [];

      if (newLogs.length < limit) {
        allLoaded.value = true;
      }

      if (forceRefresh) {
        logs.value = newLogs;
      } else {
        logs.value.push(...newLogs);
      }
      page.value++;
    } catch (err: unknown) {
      console.error('Erreur lors du chargement des notifications:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        error.value = axiosError.response?.data?.message || 'Erreur lors du chargement des notifications';
      } else {
        error.value = 'Erreur lors du chargement des notifications';
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
    logs,
    page,
    allLoaded,
    scrollPosition,
    loading,
    loadingMore,
    error,
    fetchLogs,
    setScrollPosition,
  };
}