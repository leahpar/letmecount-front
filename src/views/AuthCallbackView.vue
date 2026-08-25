<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion à votre compte
        </h2>
      </div>

      <div v-if="loading" class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-gray-600">Authentification en cours...</p>
      </div>

      <div v-if="error">
        <span class="block bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          {{ error }}
        </span>
        <RouterLink
          to="/login"
          class="mt-4 block w-full bg-indigo-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Retour à la connexion
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useOAuth } from '@/composables/useOAuth'
import { takeAfterLogin } from '@/composables/useAfterLogin'

const router = useRouter()
const { login } = useAuth()
const { loading, error, handleCallback } = useOAuth()

onMounted(async () => {
  const result = await handleCallback()

  if (!result) {
    return
  }

  login(result.token, result.refresh_token)

  // `replace` pour ne pas laisser le code d'autorisation dans l'historique.
  // La connexion peut avoir été déclenchée par une page qui attend le retour :
  // le consentement OAuth, dont l'URL porte les paramètres du client MCP.
  await router.replace(takeAfterLogin() ?? { name: 'profile' })
})
</script>
