<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Bienvenue sur LetMeCount
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
        <span class="block px-4 py-3">
          Veuillez contacter votre administrateur préféré pour obtenir un nouveau lien d'invitation.
        </span>
      </div>

      <div v-if="token && !loading" class="space-y-4">
        <p class="text-center text-gray-600">
          Tu as été invité ! Relie ton compte Google pour activer ton accès,
          tu n'auras plus jamais besoin de ce lien ensuite.
        </p>

        <button
          @click="startGoogleLogin(token)"
          class="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          <GoogleLogo />
          Continuer avec Google
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useOAuth } from '@/composables/useOAuth'
import GoogleLogo from '@/components/GoogleLogo.vue'

const route = useRoute()
const { loading, error, startGoogleLogin } = useOAuth()

// Jeton d'invitation à usage unique généré par l'admin (cf. /login_link?token=123456).
const token = ref('')

onMounted(() => {
  const queryToken = route.query.token

  if (typeof queryToken !== 'string' || !queryToken) {
    error.value = 'Token manquant dans le lien d\'invitation'
    return
  }

  token.value = queryToken
})
</script>
