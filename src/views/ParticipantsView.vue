<template>
  <PullToRefresh :on-refresh="handleRefresh">
    <div>
      <div>
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
                <IconKey v-if="isAdmin" @click="handleUserClick(participant)" class="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
                <span class="text-lg font-medium text-gray-900">{{ participant.username }}</span>
                <span v-if="participant.conjoint" class="">*</span>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="participant.conjoint" class="text-sm text-gray-500">{{ participant.soldeIndividuel.toFixed(2) }} €</span>
                <span :class="['font-semibold', participant.solde >= 0 ? 'text-green-600' : 'text-red-600']">
                  {{ participant.solde.toFixed(2) }} €
                </span>
              </div>
            </li>
          </ul>
          <div class="pb-24"></div>
        </div>
      </div>
    </div>
  </PullToRefresh>

  <UserTokenModal :show="showTokenModal" :user="selectedUser" @close="showTokenModal = false" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useParticipants } from '@/composables/useParticipants'
import { useAuth } from '@/composables/useAuth'
import type { User } from '@/types/api'
import IconUsers from '@/components/icons/IconUsers.vue'
import IconKey from '@/components/icons/IconKey.vue'
import PullToRefresh from '@/components/PullToRefresh.vue'
import UserTokenModal from '@/components/UserTokenModal.vue'

const { participants, loading, error, fetchParticipants } = useParticipants()
const { isAdmin } = useAuth()

const selectedUser = ref<User | null>(null)
const showTokenModal = ref(false)

const handleRefresh = async () => {
  await fetchParticipants()
  selectedUser.value = null
}

const handleUserClick = (user: User) => {
  if (!isAdmin.value) {
    return
  }
  selectedUser.value = user
  showTokenModal.value = true
}

onMounted(() => {
  fetchParticipants()
})
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>
