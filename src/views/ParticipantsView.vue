<template>
  <div class="py-8">
    <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
      <div class="bg-white border border-gray-200 sm:rounded-lg">
        <div class="p-6">
                    <h1 class="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <IconUsers class="h-8 w-8" />
            <span>Participants</span>
          </h1>

          <div v-if="loading" class="mt-4">Chargement...</div>
          <div v-if="error" class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">{{ error }}</span>
          </div>

          <div v-if="!loading && !error" class="mt-6">
            <ul class="divide-y divide-gray-200">
              <li v-for="participant in participants" :key="participant.id" class="py-4 flex justify-between items-center">
                <span class="text-lg font-medium text-gray-900">{{ participant.username }}</span>
                <span :class="['font-semibold', participant.solde > 0 ? 'text-green-600' : 'text-red-600']">
                  {{ participant.solde.toFixed(2) }} €
                </span>
                
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useParticipants } from '@/composables/useParticipants'
import IconUsers from '@/components/icons/IconUsers.vue'

const { participants, loading, error, fetchParticipants } = useParticipants()

onMounted(() => {
  fetchParticipants()
})
</script>
