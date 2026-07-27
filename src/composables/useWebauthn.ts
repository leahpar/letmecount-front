import { ref } from 'vue'
import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser'
import axios from '@/plugins/axios'
import { useAuth } from '@/composables/useAuth'

/**
 * Connexion et enrôlement par passkey.
 *
 * Chaque cérémonie tient en deux appels : l'API renvoie des options (dont le
 * challenge), le navigateur fait signer l'appareil, on renvoie le résultat.
 */
export function useWebauthn() {
  const { login } = useAuth()

  const loading = ref(false)
  const error = ref('')

  const isSupported = browserSupportsWebAuthn()

  /**
   * Les routes WebAuthn attendent un corps JSON, même vide.
   * Le Content-Type est imposé par l'intercepteur (voir plugins/axios.ts).
   */
  const postJson = async (url: string, data: unknown = {}) => {
    const response = await axios.post(url, data)
    return response.data
  }

  /**
   * Connexion : le passkey étant découvrable, l'utilisateur n'a rien à saisir,
   * c'est l'appareil qui propose les comptes disponibles.
   */
  const loginWithPasskey = async (): Promise<boolean> => {
    loading.value = true
    error.value = ''

    try {
      const options = await postJson('/auth/webauthn/login/options')
      const credential = await startAuthentication({ optionsJSON: options })
      const data = await postJson('/auth/webauthn/login', credential)

      if (!data.token) {
        error.value = 'Erreur lors de la connexion'
        return false
      }

      login(data.token, data.refresh_token)
      return true
    } catch (err: unknown) {
      error.value = messageFor(err, 'Connexion par passkey impossible')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Enrôlement d'un nouvel appareil. Nécessite d'être déjà connecté :
   * l'API rattache le passkey à l'utilisateur du JWT.
   */
  const registerPasskey = async (): Promise<boolean> => {
    loading.value = true
    error.value = ''

    try {
      const options = await postJson('/auth/webauthn/register/options')
      const credential = await startRegistration({ optionsJSON: options })
      await postJson('/auth/webauthn/register', credential)
      return true
    } catch (err: unknown) {
      error.value = messageFor(err, 'Enregistrement du passkey impossible')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    isSupported,
    loading,
    error,
    loginWithPasskey,
    registerPasskey,
  }
}

/**
 * L'abandon par l'utilisateur (Échap, annulation de Face ID) remonte comme une
 * erreur : ce n'est pas un incident, on ne l'affiche pas.
 */
function messageFor(err: unknown, fallback: string): string {
  if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'AbortError')) {
    return ''
  }

  if (err && typeof err === 'object' && 'response' in err) {
    // Le bundle WebAuthn renvoie ses erreurs dans errorMessage, pas dans message
    const axiosError = err as { response?: { data?: { message?: string; errorMessage?: string } } }
    const data = axiosError.response?.data
    console.error(fallback, data ?? err)
    return data?.errorMessage || data?.message || fallback
  }

  console.error(fallback, err)
  return fallback
}
