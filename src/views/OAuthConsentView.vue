<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Autoriser l'accès
        </h2>
      </div>

      <div v-if="busy" class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-gray-600">Redirection en cours...</p>
      </div>

      <div v-else-if="error" class="space-y-4">
        <span class="block bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          {{ error }}
        </span>
        <RouterLink
          to="/profile"
          class="block w-full bg-indigo-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Retour à l'application
        </RouterLink>
      </div>

      <div v-else class="space-y-6">
        <div class="bg-white border border-gray-300 p-4 space-y-3">
          <p class="text-gray-700">
            <span class="font-semibold">{{ clientName }}</span>
            demande à accéder à tes comptes Let-me-count.
          </p>
          <!-- Le hostname, pas le nom : c'est la seule des deux informations qui
               soit vérifiée côté API. Un client peut se dire ce qu'il veut, mais
               il ne peut se faire renvoyer que vers une URI enregistrée. -->
          <p class="text-sm text-gray-500">
            Les jetons seront remis à <span class="font-mono">{{ redirectHost }}</span>.
          </p>
          <p class="text-sm text-gray-500">
            Il pourra lire et modifier tes dépenses, comme toi depuis l'application.
          </p>
        </div>

        <div class="space-y-3">
          <button
            @click="respond(true)"
            class="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Autoriser
          </button>
          <button
            @click="respond(false)"
            class="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Refuser
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Écran de consentement OAuth (cf. api/doc/couche-mcp.md, M3).
 *
 * L'API a validé la demande d'un client MCP et nous a passé la main avec ses
 * paramètres, parce qu'elle est stateless et n'a aucun moyen de savoir qui est
 * devant l'écran — alors que le front, lui, sait déjà connecter quelqu'un.
 *
 * On ne fabrique rien ici : les paramètres reçus sont renvoyés tels quels, l'API
 * les revalide, émet le code d'autorisation et rend l'URL de retour vers le
 * client. Refuser suit exactement le même chemin, avec `approved: false`.
 */
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import axios from '@/plugins/axios'

const route = useRoute()
const busy = ref(false)
const error = ref('')

// Les paramètres tels que l'API les a passés. Ils repartent à l'identique : les
// interpréter ici ne servirait qu'à s'écarter de ce qu'elle revalidera.
const params: Record<string, string> = {}
Object.entries(route.query).forEach(([key, value]) => {
  const first = Array.isArray(value) ? value[0] : value
  if (typeof first === 'string') {
    params[key] = first
  }
})

const clientName = computed(() => params.client_name || 'Une application')
const redirectUri = params.redirect_uri ?? ''

const redirectHost = computed(() => {
  try {
    return new URL(redirectUri).host
  } catch {
    return redirectUri
  }
})

if (!params.client_id || !redirectUri) {
  error.value = "Demande d'autorisation incomplète. Relance la connexion depuis ton application."
}

const respond = async (approved: boolean) => {
  busy.value = true
  error.value = ''

  try {
    const { data } = await axios.post('/authorize/consent', { ...params, approved })

    // Retour vers le client MCP, hors de l'application : une navigation, pas
    // une route.
    window.location.assign(data.redirect)
  } catch (err: unknown) {
    busy.value = false
    const response = (err as { response?: { data?: { error_description?: string } } }).response
    console.error('Consentement OAuth impossible', response?.data ?? err)
    error.value = response?.data?.error_description
      ?? "Cette demande d'autorisation n'est pas valide."
  }
}
</script>
