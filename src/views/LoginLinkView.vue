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

      <div v-if="error" class="">
        <span class="block bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          {{ error }}
        </span>
        <span class="block px-4 py-3">
          Veuillez contacter votre administrateur préféré pour obtenir un nouveau lien de connexion.
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/plugins/axios'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { login } = useAuth()

const loading = ref(false)
const error = ref('')

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    error.value = 'Token manquant dans le lien de connexion'
    return
  }

  await handleTokenLogin(token)
})

const handleTokenLogin = async (token: string) => {
  loading.value = true
  error.value = ''

  try {
    const response = await axios.get(`/auth/${token}`)

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
      error.value = axiosError.response?.data?.message || 'Token invalide ou expiré'
    } else {
      error.value = 'Erreur lors de l\'authentification'
    }
  } finally {
    loading.value = false
  }
}
</script>
