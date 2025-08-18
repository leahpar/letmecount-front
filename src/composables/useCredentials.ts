import { ref } from 'vue';
import type { UpdateCredentialsDto } from '@/types/api';
import apiClient from '@/plugins/axios';

export const useCredentials = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const updateCredentials = async (payload: UpdateCredentialsDto) => {
    loading.value = true;
    error.value = null;
    try {
      await apiClient.patch('/users', payload, {
        headers: {
          'Content-Type': 'application/merge-patch+json',
        }
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        error.value = e.message;
      } else {
        error.value = 'An unknown error occurred';
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    updateCredentials,
  };
};
