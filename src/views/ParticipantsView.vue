<template>
  <PullToRefresh :on-refresh="handleRefresh">
    <div class="py-8">
      <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white border border-gray-200">
          <div class="p-6">
            <h1 class="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <IconUsers class="h-8 w-8" />
              <span>Participants</span>
            </h1>

            <div v-if="loading" class="mt-4">Chargement...</div>
            <div v-if="error" class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3" role="alert">
              <span class="block sm:inline">{{ error }}</span>
            </div>

            <div v-if="!loading && !error" class="mt-6">
              <ul class="divide-y divide-gray-200">
                <li v-for="participant in participants" :key="participant.id" class="py-4 flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <span class="text-lg font-medium text-gray-900">{{ participant.username }}</span>
                    <IconKey v-if="isAdmin" @click="handleUserClick(participant)" class="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
                  </div>
                  <span :class="['font-semibold', participant.solde > 0 ? 'text-green-600' : 'text-red-600']">
                    {{ participant.solde.toFixed(2) }} €
                  </span>
                </li>
              </ul>
              <div class="pb-24"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PullToRefresh>

  <BaseModal :show="showTokenModal" @close="showTokenModal = false" :title="`Connexion rapide pour ${selectedUser?.username}`">
    <div v-if="generatedToken && selectedUser">
      <div class="mt-2 p-2 bg-gray-100 rounded flex justify-center">
        <img :src="qrCodeUrl" alt="QR Code" />
      </div>
      <div class="mt-2 p-2 bg-gray-100 rounded relative">
        <code class="text-sm break-all cursor-pointer" @click="copyToClipboard(impersonationUrl)">
          {{ impersonationUrl }}
        </code>
        <span v-if="copiedMessage" class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-green-600">{{ copiedMessage }}</span>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useParticipants } from '@/composables/useParticipants'
import { useAuth } from '@/composables/useAuth'
import { useUsers } from '@/composables/useUsers'
import type { User } from '@/types/api'
import IconUsers from '@/components/icons/IconUsers.vue'
import IconKey from '@/components/icons/IconKey.vue'
import PullToRefresh from '@/components/PullToRefresh.vue'
import BaseModal from '@/components/base/BaseModal.vue'

const { participants, loading, error, fetchParticipants } = useParticipants()
const { isAdmin } = useAuth()
const { getUserToken } = useUsers()

const selectedUser = ref<User | null>(null)
const generatedToken = ref<string | null>(null)
const showTokenModal = ref(false)
const copiedMessage = ref<string | null>(null)

const impersonationUrl = computed(() => {
  if (!selectedUser.value || !generatedToken.value) {
    return ''
  }
  const baseUrl = import.meta.env.VITE_APP_BASE_URL || window.location.origin
  return `${baseUrl}/credentials?username=${selectedUser.value.username}&token=${generatedToken.value}`
})

const qrCodeUrl = computed(() => {
  if (!impersonationUrl.value) {
    return ''
  }
  return `https://yaqrgen.com/qrcode.png?data=${encodeURIComponent(impersonationUrl.value)}`
})

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    copiedMessage.value = 'Copié !'
    setTimeout(() => {
      copiedMessage.value = null
    }, 2000)
  })
}

const handleRefresh = async () => {
  await fetchParticipants()
  selectedUser.value = null
  generatedToken.value = null
}

const handleUserClick = async (user: User) => {
  if (!isAdmin.value) {
    return
  }
  selectedUser.value = user
  generatedToken.value = await getUserToken(user.id)
  if (generatedToken.value) {
    showTokenModal.value = true
  }
}

onMounted(() => {
  fetchParticipants()
})
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>
