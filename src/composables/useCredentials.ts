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
      if (e && typeof e === 'object' && 'response' in e) {
        const axiosError = e as { response?: { status?: number; data?: { detail?: string; message?: string } } };
        const data = axiosError.response?.data;
        error.value = data?.detail
          || data?.message
          || (axiosError.response?.status === 409 ? 'Ce nom d\'utilisateur est déjà pris' : 'Erreur lors de la mise à jour');
      } else if (e instanceof Error) {
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
