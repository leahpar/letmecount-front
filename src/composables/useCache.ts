import { ref, computed } from 'vue'
import axios from '@/plugins/axios'
import { handleApiError } from '@/utils/errorHandler'

interface CacheOptions<T> {
  duration?: number // Durée du cache en millisecondes
  defaultValue?: T // Valeur par défaut pour les données
}

/**
 * Composable générique pour gérer le cache des données API
 * @param url - URL de l'API à appeler
 * @param operation - Nom de l'opération pour la gestion d'erreur
 * @param options - Options de configuration du cache
 */
export function useCache<T>(
  url: string,
  operation: string,
  options: CacheOptions<T> = {}
) {
  const {
    duration = 5 * 60 * 1000, // 5 minutes par défaut
    defaultValue = [] as T
  } = options

  const data = ref<T>(defaultValue)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetch = ref<number>(0)

  /**
   * Vérifie si les données en cache sont encore valides
   */
  const isCacheValid = (force = false): boolean => {
    if (force) return false
    if (!data.value || (Array.isArray(data.value) && data.value.length === 0)) return false
    
    const now = Date.now()
    return (now - lastFetch.value) < duration
  }

  /**
   * Récupère les données depuis l'API
   */
  const fetchData = async (force = false): Promise<void> => {
    if (isCacheValid(force)) {
      return
    }

    // Évite les appels simultanés
    if (loading.value) {
      return
    }

    const now = Date.now()
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(url)
      data.value = response.data.member || response.data
      lastFetch.value = now
    } catch (err: unknown) {
      error.value = handleApiError(err, operation)
    } finally {
      loading.value = false
    }
  }

  /**
   * Force le rechargement des données
   */
  const refresh = (): Promise<void> => fetchData(true)

  /**
   * Réinitialise le cache
   */
  const clearCache = (): void => {
    data.value = defaultValue
    lastFetch.value = 0
    error.value = null
  }

  /**
   * Vérifie si le cache est expiré
   */
  const isExpired = computed((): boolean => {
    if (lastFetch.value === 0) return true
    const now = Date.now()
    return (now - lastFetch.value) >= duration
  })

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isExpired,
    fetchData,
    refresh,
    clearCache
  }
}