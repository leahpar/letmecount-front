<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion à votre compte
        </h2>
      </div>

      <div v-if="busy" class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-gray-600">Authentification en cours...</p>
      </div>

      <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        <span class="block sm:inline">{{ errorMessage }}</span>
      </div>

      <div v-if="!busy" class="space-y-4">
        <button
          v-if="isSupported"
          @click="handlePasskeyLogin"
          class="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          🔓 Se connecter avec cet appareil
        </button>

        <div v-if="isSupported" class="flex items-center gap-3 text-sm text-gray-400">
          <span class="flex-1 border-t border-gray-200"></span>
          <span>ou</span>
          <span class="flex-1 border-t border-gray-200"></span>
        </div>

        <OAuthButtons @select="handleOAuthLogin" />

        <p class="text-center text-sm text-gray-500">
          Pas encore de compte ? Contacte ton administrateur préféré.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWebauthn } from '@/composables/useWebauthn'
import { useOAuth, type OAuthProvider } from '@/composables/useOAuth'
import OAuthButtons from '@/components/OAuthButtons.vue'
import { takeAfterLogin } from '@/composables/useAfterLogin'

const router = useRouter()
const { isSupported, loading: passkeyLoading, error: passkeyError, loginWithPasskey } = useWebauthn()
const { loading: oauthLoading, error: oauthError, startLogin } = useOAuth()

const busy = computed(() => oauthLoading.value || passkeyLoading.value)
const errorMessage = computed(() => oauthError.value || passkeyError.value)

const handlePasskeyLogin = async () => {
  oauthError.value = ''

  if (await loginWithPasskey()) {
    // Comme au retour d'un provider : une page peut attendre le retour.
    router.push(takeAfterLogin() ?? { name: 'profile' })
  }
}

// Quitte la page : la suite se passe dans AuthCallbackView.
const handleOAuthLogin = (provider: OAuthProvider) => startLogin(provider)
</script>
