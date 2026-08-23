import { ref } from 'vue'
import axios from '@/plugins/axios'

/**
 * Connexion par OAuth Google.
 *
 * Flow « redirect + code d'autorisation » (cf. api/doc/authentification-oauth.md, D2) :
 * on part chez Google en navigation top-level, il nous renvoie sur /auth/callback
 * avec un code, et c'est l'API qui échange ce code en serveur-à-serveur.
 *
 * Aucun scope en dehors de `openid` : on ne veut ni l'email ni le nom, seul le
 * `sub` sert d'identité (D3).
 */

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

// Le sessionStorage suffit : ces valeurs ne servent qu'à l'aller-retour vers Google.
const VERIFIER_KEY = 'oauth_code_verifier'
const STATE_KEY = 'oauth_state'
const LINK_TOKEN_KEY = 'oauth_link_token'

export interface OAuthResult {
  token: string
  refresh_token: string
  /** Vrai si on arrivait par un lien d'invitation : le pseudo reste à choisir. */
  isFirstLink: boolean
}

/** Caractères « unreserved » autorisés dans un code_verifier (RFC 7636). */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

const randomString = (length: number): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  // ALPHABET fait 64 caractères, un octet donne donc 4 tirages équiprobables.
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('')
}

const base64url = (buffer: ArrayBuffer): string => {
  const binary = String.fromCharCode(...new Uint8Array(buffer))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const codeChallengeFor = async (verifier: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64url(digest)
}

const clearSession = () => {
  sessionStorage.removeItem(VERIFIER_KEY)
  sessionStorage.removeItem(STATE_KEY)
  sessionStorage.removeItem(LINK_TOKEN_KEY)
}

/** L'API renvoie ses messages en français, on les affiche tels quels quand ils arrivent. */
const messageFor = (err: unknown, fallback: string): string => {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosError = err as { response?: { status?: number; data?: { detail?: string; message?: string } } }
    const data = axiosError.response?.data
    console.error(fallback, data ?? err)

    if (data?.detail || data?.message) {
      return (data.detail || data.message) as string
    }

    switch (axiosError.response?.status) {
      case 400:
        return 'Requête de connexion invalide, recommence depuis le début.'
      case 403:
        return 'Aucun compte n\'est associé à ce compte Google. Demande une invitation à ton administrateur préféré.'
      case 409:
        return 'Ce compte est déjà lié à un autre compte Google.'
      case 429:
        return 'Trop de tentatives, réessaye dans quelques minutes.'
    }
  } else {
    console.error(fallback, err)
  }

  return fallback
}

export function useOAuth() {
  const loading = ref(false)
  const error = ref('')

  /**
   * Départ vers Google. Le `linkToken` n'est fourni qu'à la première connexion,
   * quand on arrive par le lien d'invitation généré par l'admin.
   */
  const startGoogleLogin = async (linkToken?: string): Promise<void> => {
    loading.value = true
    error.value = ''

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const redirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI

    if (!clientId || !redirectUri) {
      error.value = 'La connexion Google n\'est pas configurée sur cette installation.'
      loading.value = false
      return
    }

    const codeVerifier = randomString(64)
    const state = randomString(32)

    sessionStorage.setItem(VERIFIER_KEY, codeVerifier)
    sessionStorage.setItem(STATE_KEY, state)
    if (linkToken) {
      sessionStorage.setItem(LINK_TOKEN_KEY, linkToken)
    } else {
      sessionStorage.removeItem(LINK_TOKEN_KEY)
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid',
      code_challenge: await codeChallengeFor(codeVerifier),
      code_challenge_method: 'S256',
      state,
    })

    window.location.assign(`${GOOGLE_AUTH_URL}?${params.toString()}`)
  }

  /**
   * Retour de Google : on vérifie le `state`, puis l'API échange le code contre
   * nos propres jetons. Renvoie null en cas d'échec, `error` porte le message.
   */
  const handleCallback = async (): Promise<OAuthResult | null> => {
    loading.value = true
    error.value = ''

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const expectedState = sessionStorage.getItem(STATE_KEY)
    const codeVerifier = sessionStorage.getItem(VERIFIER_KEY)
    const linkToken = sessionStorage.getItem(LINK_TOKEN_KEY)

    clearSession()

    try {
      if (params.get('error')) {
        error.value = 'Connexion annulée.'
        return null
      }

      if (!code || !state || !codeVerifier) {
        error.value = 'Réponse de Google incomplète, recommence depuis le début.'
        return null
      }

      // Sans state attendu, la demande ne vient pas de cet onglet : on refuse.
      if (!expectedState || state !== expectedState) {
        error.value = 'Requête de connexion invalide, recommence depuis le début.'
        return null
      }

      const { data } = await axios.post('/auth/oauth', {
        provider: 'google',
        code,
        code_verifier: codeVerifier,
        ...(linkToken ? { link_token: linkToken } : {}),
      })

      if (!data.token) {
        error.value = 'Erreur lors de l\'authentification'
        return null
      }

      return {
        token: data.token,
        refresh_token: data.refresh_token,
        isFirstLink: !!linkToken,
      }
    } catch (err: unknown) {
      error.value = messageFor(err, 'Connexion impossible')
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    startGoogleLogin,
    handleCallback,
  }
}
