<template>
  <div class="min-h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo et nom de l'application -->
      <div class="text-center">
        <div class="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-6">
          <svg class="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 class="text-4xl font-extrabold text-gray-900 mb-2">LetMeCount</h1>
        <p class="text-lg text-gray-600 mb-8">Gestion des comptes entre amis</p>
      </div>

      <!-- Section installation -->
      <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">1. 📱 Installe l'application</h2>
        <p class="text-gray-600">
          Tu clique par ici et tu cliques par là-bas.<br>
          Je vais pas t'apprendre à utiliser ton smartphone !
        </p>
      </div>

      <!-- Section contact admin -->
      <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">2. 🔑 Demande ton accès</h2>
        <p class="text-gray-600">
          Contactez ton administrateur préféré !
        </p>
      </div>

      <!-- input code d'accès -->
      <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">3. 🚪 Accède à l'application</h2>

        <div v-if="loading" class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p class="mt-2 text-gray-600">Authentification en cours...</p>
        </div>

        <div v-if="error" class="">
          <span class="block bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            Boulet !
          </span>
        </div>

        <div v-if="!loading" class="space-y-4">
          <input
            v-model="accessCode"
            type="number"
            placeholder="Entre ton code"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
            :disabled="loading"
            @keyup.enter="handleCodeLogin"
          />
          <button
            @click="handleCodeLogin"
            :disabled="!isAccessCodeValid || loading"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/plugins/axios'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const accessCode = ref('')
const loading = ref(false)
const error = ref('')

const isAccessCodeValid = computed(() => {
  const codePattern = /^\d{6}$/
  return codePattern.test(accessCode.value)
})

const handleCodeLogin = async () => {
  if (!accessCode.value) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await axios.get(`/auth/${accessCode.value}`)

    if (response.data.token) {
      login(response.data.token, response.data.refresh_token)
      router.push({ name: 'profile' })
    } else {
      error.value = 'Erreur lors de l\'authentification'
    }
  } catch (err: unknown) {
    console.error('Erreur d\'authentification:', err)
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Code invalide ou expiré'
    } else {
      error.value = 'Erreur lors de l\'authentification'
    }
  } finally {
    loading.value = false
  }
}
</script>
