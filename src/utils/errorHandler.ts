/**
 * Interface pour une erreur Axios structurée
 */
interface AxiosError {
  response?: {
    data?: {
      message?: string
    }
  }
}

/**
 * Gère les erreurs des appels API de manière standardisée
 * @param err - L'erreur capturée
 * @param operation - Le nom de l'opération pour le message d'erreur par défaut
 * @returns Le message d'erreur formaté
 */
export const handleApiError = (err: unknown, operation: string): string => {
  console.error(`Erreur lors de ${operation}:`, err)
  
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosError = err as AxiosError
    return axiosError.response?.data?.message || `Erreur lors de ${operation}`
  }
  
  return `Erreur lors de ${operation}`
}

/**
 * Wrapper pour gérer les appels API avec gestion d'erreur standardisée
 * @param operation - Nom de l'opération
 * @param apiCall - Fonction async qui fait l'appel API
 * @param errorRef - Ref reactive pour stocker l'erreur
 * @returns Le résultat de l'appel API ou null en cas d'erreur
 */
export const withErrorHandling = async <T>(
  operation: string,
  apiCall: () => Promise<T>,
  errorRef: { value: string | null }
): Promise<T | null> => {
  try {
    errorRef.value = null
    return await apiCall()
  } catch (err: unknown) {
    errorRef.value = handleApiError(err, operation)
    return null
  }
}