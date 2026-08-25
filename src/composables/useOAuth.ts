import { ref } from 'vue'
import axios from '@/plugins/axios'

/**
 * Connexion par OAuth (Google, Apple).
 *
 * Flow « redirect + code d'autorisation » (cf. api/doc/authentification-oauth.md, D2) :
 * on part chez le provider en navigation top-level, il nous renvoie sur
 * /auth/callback avec un code, et c'est l'API qui échange ce code en
 * serveur-à-serveur.
 *
 * Aucun scope porteur de données : `openid` seul côté Google, rien du tout côté
 * Apple. On ne demande ni l'email ni le nom, le `sub` suffit comme identité (D3).
 * Côté Apple, cette absence totale de scope est même ce qui rend ce flow
 * possible : le retour se fait alors en `query` et non en `form_post`, qu'une
 * SPA statique ne saurait recevoir.
 */

export type OAuthProvider = 'google' | 'apple'

const AUTH_URLS: Record<OAuthProvider, string> = {
  google: 'https://accounts.google.com/o/oauth2/v2/auth',
  apple: 'https://appleid.apple.com/auth/authorize',
}

const LABELS: Record<OAuthProvider, string> = {
  google: 'Google',
  apple: 'Apple',
}

// Le sessionStorage suffit : ces valeurs ne servent qu'à l'aller-retour.
const PROVIDER_KEY = 'oauth_provider'
const VERIFIER_KEY = 'oauth_code_verifier'
const NONCE_KEY = 'oauth_nonce'
const STATE_KEY = 'oauth_state'
const LINK_TOKEN_KEY = 'oauth_link_token'

export interface OAuthResult {
  token: string
  refresh_token: string
  session_key?: string
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

const SESSION_KEYS = [PROVIDER_KEY, VERIFIER_KEY, NONCE_KEY, STATE_KEY, LINK_TOKEN_KEY]

// sessionStorage n'est pas seulement vide quand le navigateur le refuse : il lève.
// Une lecture non gardée au retour du provider rejetterait la promesse de
// handleCallback, et la vue callback resterait en chargement sans message.
const readSession = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

const clearSession = () => {
  try {
    SESSION_KEYS.forEach((key) => sessionStorage.removeItem(key))
  } catch {
    // sessionStorage indisponible : rien à nettoyer.
  }
}

const clientIdFor = (provider: OAuthProvider): string | undefined =>
  provider === 'google'
    ? import.meta.env.VITE_GOOGLE_CLIENT_ID
    : import.meta.env.VITE_APPLE_SERVICES_ID

/** L'API renvoie ses messages en français, on les affiche tels quels quand ils arrivent. */
const messageFor = (err: unknown, fallback: string, label: string): string => {
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
        return `Aucun compte n'est associé à ce compte ${label}. Demande une invitation à ton administrateur préféré.`
      case 409:
        return 'Ce compte est déjà lié à une autre identité.'
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
   * Départ vers le provider. Le `linkToken` n'est fourni qu'à la première
   * connexion, quand on arrive par le lien d'invitation généré par l'admin.
   */
  const startLogin = async (provider: OAuthProvider, linkToken?: string): Promise<void> => {
    loading.value = true
    error.value = ''

    const label = LABELS[provider]
    const clientId = clientIdFor(provider)
    const redirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI

    if (!clientId || !redirectUri) {
      error.value = `La connexion ${label} n'est pas configurée sur cette installation.`
      loading.value = false
      return
    }

    // crypto.subtle n'existe qu'en contexte sécurisé et sessionStorage peut être
    // refusé : sans filet, l'utilisateur resterait bloqué sur le bouton en chargement.
    try {
      const state = randomString(32)

      sessionStorage.setItem(PROVIDER_KEY, provider)
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
        state,
      })

      if (provider === 'google') {
        // PKCE : le code ne vaut rien sans le verifier resté dans cet onglet.
        const codeVerifier = randomString(64)
        sessionStorage.setItem(VERIFIER_KEY, codeVerifier)
        params.set('scope', 'openid')
        params.set('code_challenge', await codeChallengeFor(codeVerifier))
        params.set('code_challenge_method', 'S256')
      } else {
        // Apple ne documente pas PKCE : le nonce joue le même rôle, l'API le
        // compare au claim de l'id_token. Pas de `scope` : c'est ce qui laisse
        // Apple répondre en `query` plutôt qu'en `form_post`.
        const nonce = randomString(32)
        sessionStorage.setItem(NONCE_KEY, nonce)
        params.set('nonce', nonce)
      }

      window.location.assign(`${AUTH_URLS[provider]}?${params.toString()}`)
    } catch (err: unknown) {
      console.error(`Départ vers ${label} impossible`, err)
      clearSession()
      error.value = `Impossible de démarrer la connexion ${label} sur ce navigateur.`
      loading.value = false
    }
  }

  /**
   * Retour du provider : on vérifie le `state`, puis l'API échange le code contre
   * nos propres jetons. Renvoie null en cas d'échec, `error` porte le message.
   */
  const handleCallback = async (): Promise<OAuthResult | null> => {
    loading.value = true
    error.value = ''

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const provider = readSession(PROVIDER_KEY) as OAuthProvider | null
    const expectedState = readSession(STATE_KEY)
    const codeVerifier = readSession(VERIFIER_KEY)
    const nonce = readSession(NONCE_KEY)
    const linkToken = readSession(LINK_TOKEN_KEY)

    clearSession()

    const label = provider ? LABELS[provider] : 'du fournisseur'

    try {
      if (params.get('error')) {
        error.value = 'Connexion annulée.'
        return null
      }

      // Sans provider en session, on ne saurait de toute façon pas quoi envoyer
      // à l'API : la demande ne vient pas de cet onglet.
      if (!provider || !AUTH_URLS[provider]) {
        error.value = 'Requête de connexion invalide, recommence depuis le début.'
        return null
      }

      const secret = provider === 'google' ? codeVerifier : nonce
      if (!code || !state || !secret) {
        error.value = `Réponse de ${label} incomplète, recommence depuis le début.`
        return null
      }

      // Sans state attendu, la demande ne vient pas de cet onglet : on refuse.
      if (!expectedState || state !== expectedState) {
        error.value = 'Requête de connexion invalide, recommence depuis le début.'
        return null
      }

      const { data } = await axios.post('/auth/oauth', {
        provider,
        code,
        ...(provider === 'google' ? { code_verifier: secret } : { nonce: secret }),
        ...(linkToken ? { link_token: linkToken } : {}),
      })

      if (!data.token) {
        error.value = 'Erreur lors de l\'authentification'
        return null
      }

      return {
        token: data.token,
        refresh_token: data.refresh_token,
        session_key: data.session_key,
      }
    } catch (err: unknown) {
      error.value = messageFor(err, 'Connexion impossible', label)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    startLogin,
    handleCallback,
  }
}
