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
          <span>ou avec un code</span>
          <span class="flex-1 border-t border-gray-200"></span>
        </div>

        <input
          v-model="accessCode"
          type="number"
          inputmode="numeric"
          placeholder="Entre ton code"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
          @keyup.enter="handleCodeLogin"
        >
        <button
          @click="handleCodeLogin"
          :disabled="!isAccessCodeValid"
          class="w-full border border-indigo-600 text-indigo-600 py-3 px-4 rounded-lg font-semibold hover:bg-indigo-50 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Se connecter
        </button>

        <p class="text-center text-sm text-gray-500">
          Pas encore de code ? Contacte ton administrateur préféré.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/plugins/axios'
import { useAuth } from '@/composables/useAuth'
import { useWebauthn } from '@/composables/useWebauthn'

const router = useRouter()
const { login } = useAuth()
const { isSupported, loading: passkeyLoading, error: passkeyError, loginWithPasskey } = useWebauthn()

const accessCode = ref('')
const codeLoading = ref(false)
const codeError = ref('')

const busy = computed(() => codeLoading.value || passkeyLoading.value)
const errorMessage = computed(() => codeError.value || passkeyError.value)

const isAccessCodeValid = computed(() => /^\d{6}$/.test(accessCode.value))

const handlePasskeyLogin = async () => {
  codeError.value = ''

  if (await loginWithPasskey()) {
    router.push({ name: 'profile' })
  }
}

const handleCodeLogin = async () => {
  if (!isAccessCodeValid.value) {
    return
  }

  codeLoading.value = true
  codeError.value = ''

  try {
    const response = await axios.get(`/auth/${accessCode.value}`)

    if (response.data.token) {
      login(response.data.token, response.data.refresh_token)
      router.push({ name: 'profile' })
    } else {
      codeError.value = 'Erreur lors de l\'authentification'
    }
  } catch (err: unknown) {
    console.error('Erreur d\'authentification:', err)
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      codeError.value = axiosError.response?.data?.message || 'Code invalide ou expiré'
    } else {
      codeError.value = 'Erreur lors de l\'authentification'
    }
  } finally {
    codeLoading.value = false
  }
}
</script>
