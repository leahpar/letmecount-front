<template>
  <div class="w-full">
    <h1 class="text-2xl font-semibold text-gray-900 mb-4">🔑 Mes appareils</h1>

    <p v-if="!isSupported" class="text-gray-600">
      Cet appareil ne gère pas les passkeys.
    </p>

    <template v-else>
      <p class="text-gray-600">
        Enregistre un appareil pour te connecter sans code, avec ton empreinte ou ton visage.
      </p>

      <div v-if="message" class="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="status">
        {{ message }}
      </div>

      <div v-if="errorMessage" class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        {{ errorMessage }}
      </div>

      <div v-if="loading" class="mt-4 text-gray-500">Chargement...</div>

      <ul v-else-if="passkeys.length" class="mt-4 divide-y divide-gray-200">
        <li v-for="passkey in passkeys" :key="passkey.id" class="py-3 flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="font-medium text-gray-900 truncate">{{ passkey.name }}</p>
            <p class="text-sm text-gray-500">
              Ajouté le {{ formatDate(passkey.createdAt) }}
              <span v-if="passkey.lastUsedAt"> · utilisé le {{ formatDate(passkey.lastUsedAt) }}</span>
            </p>
          </div>
          <button
            @click="handleDelete(passkey)"
            class="text-sm text-red-600 hover:text-red-800 shrink-0"
          >
            Supprimer
          </button>
        </li>
      </ul>

      <p v-else class="mt-4 text-gray-500 italic">
        Aucun appareil enregistré.
      </p>

      <button
        @click="handleRegister"
        :disabled="registering"
        class="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {{ registering ? 'Enregistrement...' : 'Enregistrer cet appareil' }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Passkey } from '@/types/api'
import { usePasskeys } from '@/composables/usePasskeys'
import { useWebauthn } from '@/composables/useWebauthn'

const { passkeys, loading, error: listError, fetchPasskeys, deletePasskey } = usePasskeys()
const { isSupported, loading: registering, error: registerError, registerPasskey } = useWebauthn()

const message = ref('')

const errorMessage = computed(() => registerError.value || listError.value)

const formatDate = (value: string): string => {
  return new Date(value).toLocaleDateString('fr-FR')
}

const handleRegister = async () => {
  message.value = ''

  if (await registerPasskey()) {
    message.value = 'Appareil enregistré ! Tu peux maintenant te connecter sans code.'
    await fetchPasskeys()
  }
}

const handleDelete = async (passkey: Passkey) => {
  message.value = ''
  await deletePasskey(passkey.id)
}

onMounted(() => {
  if (isSupported) {
    fetchPasskeys()
  }
})
</script>
