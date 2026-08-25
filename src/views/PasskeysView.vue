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
            <div v-if="editingId === passkey.id" class="flex items-center gap-2">
              <input
                v-model="editingName"
                type="text"
                maxlength="100"
                class="min-w-0 flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                @keyup.enter="confirmRename(passkey)"
                @keyup.escape="cancelRename"
              />
              <button @click="confirmRename(passkey)" class="text-sm text-indigo-600 hover:text-indigo-800 shrink-0">
                Valider
              </button>
              <button @click="cancelRename" class="text-sm text-gray-500 hover:text-gray-700 shrink-0">
                Annuler
              </button>
            </div>
            <p v-else class="font-medium text-gray-900 truncate">{{ passkey.name }}</p>
            <p class="text-sm text-gray-500">
              Ajouté le {{ formatDate(passkey.createdAt) }}
              <span v-if="passkey.lastUsedAt"> · utilisé le {{ formatDate(passkey.lastUsedAt) }}</span>
            </p>
          </div>
          <div v-if="editingId !== passkey.id" class="flex items-center gap-3 shrink-0">
            <button
              @click="startRename(passkey)"
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              Renommer
            </button>
            <button
              @click="handleDelete(passkey)"
              class="text-sm text-red-600 hover:text-red-800"
            >
              Supprimer
            </button>
          </div>
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

    <hr class="my-8 border-gray-200" />

    <h2 class="text-xl font-semibold text-gray-900 mb-2">🔔 Notifications</h2>

    <p class="text-gray-600">
      Reçois une notification quand quelqu'un ajoute une dépense qui te concerne.
    </p>

    <!-- Sur iOS, le push n'existe que dans l'app installée sur l'écran d'accueil -->
    <p v-if="pushNeedsInstall" class="mt-4 text-gray-600 italic">
      Ajoute d'abord l'application à ton écran d'accueil : les notifications ne
      sont pas disponibles depuis le navigateur.
    </p>

    <p v-else-if="!pushSupported" class="mt-4 text-gray-600 italic">
      Cet appareil ne gère pas les notifications.
    </p>

    <template v-else>
      <p v-if="pushMessage" class="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="status">
        {{ pushMessage }}
      </p>

      <p v-if="pushError" class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        {{ pushError }}
      </p>

      <!-- Une permission refusée est définitive : le navigateur ne la redemande plus -->
      <p v-else-if="pushDenied" class="mt-4 text-gray-600 italic">
        Les notifications sont bloquées pour ce site. Il faut les réautoriser
        dans les réglages du navigateur.
      </p>

      <ul v-if="pushDevices.length" class="mt-4 divide-y divide-gray-200">
        <li v-for="device in pushDevices" :key="device.id" class="py-3 flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="font-medium text-gray-900 truncate">{{ device.deviceName }}</p>
            <p class="text-sm text-gray-500">Activé le {{ formatDate(device.createdAt) }}</p>
          </div>
          <button
            @click="pushDeleteDevice(device.id)"
            class="text-sm text-red-600 hover:text-red-800 shrink-0"
          >
            Supprimer
          </button>
        </li>
      </ul>

      <button
        v-if="!pushDenied"
        @click="handlePushToggle"
        :disabled="pushLoading"
        class="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {{ pushButtonLabel }}
      </button>
    </template>

    <hr class="my-8 border-gray-200" />

    <h2 class="text-xl font-semibold text-gray-900 mb-2">🔗 Connexions</h2>

    <p class="text-gray-600">
      Les appareils et applications connectés à ton compte. En révoquer un le
      déconnecte à sa prochaine reconnexion, dans l'heure.
    </p>

    <p v-if="sessionsError" class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
      {{ sessionsError }}
    </p>

    <div v-if="sessionsLoading" class="mt-4 text-gray-500">Chargement...</div>

    <ul v-else-if="sessions.length" class="mt-4 divide-y divide-gray-200">
      <li v-for="session in sessions" :key="session.id" class="py-3 flex items-center justify-between gap-4">
        <div class="min-w-0">
          <p class="font-medium text-gray-900 truncate">
            {{ session.label || 'Connexion' }}
            <span v-if="isCurrentSession(session)" class="ml-1 text-xs font-normal text-indigo-600">
              · cet appareil
            </span>
          </p>
          <p v-if="session.createdAt" class="text-sm text-gray-500">
            Dernière activité le {{ formatDate(session.createdAt) }}
          </p>
        </div>
        <!-- Pas de bouton sur la session courante : s'en déconnecter se fait par
             le menu, qui prévient aussi le serveur. -->
        <button
          v-if="!isCurrentSession(session)"
          @click="revokeSession(session.id)"
          class="text-sm text-red-600 hover:text-red-800 shrink-0"
        >
          Révoquer
        </button>
      </li>
    </ul>

    <p v-else class="mt-4 text-gray-500 italic">
      Aucune connexion enregistrée.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Passkey } from '@/types/api'
import { usePasskeys } from '@/composables/usePasskeys'
import { useWebauthn } from '@/composables/useWebauthn'
import { useWebPush } from '@/composables/useWebPush'
import { useSessions } from '@/composables/useSessions'
import { useAuth } from '@/composables/useAuth'
import type { Session } from '@/types/api'

const { passkeys, loading, error: listError, fetchPasskeys, renamePasskey, deletePasskey } = usePasskeys()
const { isSupported, loading: registering, error: registerError, registerPasskey } = useWebauthn()

const {
  devices: pushDevices,
  subscribed: pushSubscribed,
  loading: pushLoading,
  error: pushError,
  isSupported: pushSupported,
  needsInstall: pushNeedsInstall,
  permissionDenied: pushDenied,
  fetchDevices: pushFetchDevices,
  refresh: pushRefresh,
  subscribe: pushSubscribe,
  unsubscribe: pushUnsubscribe,
  deleteDevice: pushDeleteDevice
} = useWebPush()

const {
  sessions,
  loading: sessionsLoading,
  error: sessionsError,
  fetchSessions,
  revokeSession
} = useSessions()

const { getSessionKey } = useAuth()

// La session ouverte depuis ce navigateur. Absente des connexions ouvertes
// avant l'arrivée du repère : aucune ligne n'est alors marquée.
const isCurrentSession = (session: Session): boolean =>
  !!session.sessionKey && session.sessionKey === getSessionKey()

const message = ref('')
// Distinct de `message`, qui n'est affiché que dans la section des passkeys :
// un appareil peut gérer le push sans gérer les passkeys.
const pushMessage = ref('')
const editingId = ref<number | null>(null)
const editingName = ref('')

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

const startRename = (passkey: Passkey) => {
  message.value = ''
  editingId.value = passkey.id
  editingName.value = passkey.name
}

const cancelRename = () => {
  editingId.value = null
  editingName.value = ''
}

const confirmRename = async (passkey: Passkey) => {
  const name = editingName.value.trim()
  if (!name || name === passkey.name) {
    cancelRename()
    return
  }

  if (await renamePasskey(passkey.id, name)) {
    cancelRename()
  }
}

const pushButtonLabel = computed(() => {
  if (pushLoading.value) return 'Patiente...'
  return pushSubscribed.value ? 'Désactiver sur cet appareil' : 'Activer sur cet appareil'
})

/**
 * L'abonnement doit partir d'un geste de l'utilisateur : les navigateurs
 * refusent la demande de permission autrement.
 */
const handlePushToggle = async () => {
  pushMessage.value = ''

  if (pushSubscribed.value) {
    await pushUnsubscribe()
    return
  }

  if (await pushSubscribe()) {
    pushMessage.value = 'Notifications activées sur cet appareil.'
  }
}

onMounted(() => {
  // Les connexions ne dépendent ni des passkeys ni du push : la liste s'affiche
  // même sur un appareil qui ne gère ni l'un ni l'autre.
  fetchSessions()

  if (isSupported) {
    fetchPasskeys()
  }

  if (pushSupported) {
    pushFetchDevices()
    // Le navigateur peut avoir renouvelé l'endpoint depuis la dernière visite
    pushRefresh()
  }
})
</script>
