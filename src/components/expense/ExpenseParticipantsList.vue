<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Participants</h3>
    <div class="space-y-2">
      <div
        v-for="user in users"
        :key="user['@id']"
        class="flex items-center gap-x-4 p-3 border border-gray-200 rounded-md"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ user.username }}</p>
        </div>

        <div class="flex items-center">
          <input
            :id="`participant-${user['@id']}`"
            type="checkbox"
            :checked="participantCheckboxes[user['@id']]"
            @change="updateParticipant(user['@id'], ($event.target as HTMLInputElement).checked)"
            class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          >
        </div>

        <div class="w-24">
          <label :for="`parts-${user['@id']}`" class="sr-only">Parts</label>
          <input
            :id="`parts-${user['@id']}`"
            v-if="partageMode === 'parts'"
            :value="getParticipantData(user['@id']).parts"
            @input="updateParticipantParts(user['@id'], parseInt(($event.target as HTMLInputElement).value) || 0)"
            type="number"
            min="0"
            step="1"
            placeholder="Parts"
            class="appearance-none block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            :disabled="!participantCheckboxes[user['@id']]"
          >
          <input
            v-if="partageMode === 'montants'"
            type="number"
            placeholder="Parts"
            disabled
            class="appearance-none block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
          >
        </div>

        <div class="w-32">
          <label :for="`montant-${user['@id']}`" class="sr-only">Montant</label>
          <div class="relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">€</span>
            </div>
            <input
              :id="`montant-${user['@id']}`"
              :value="getParticipantData(user['@id']).montant"
              @input="updateParticipantMontant(user['@id'], parseFloat(($event.target as HTMLInputElement).value) || 0)"
              type="number"
              min="0"
              step="0.01"
              placeholder="Montant"
              class="appearance-none block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-7"
              :class="{ 'bg-green-50 border-green-500': getParticipantData(user['@id']).manualMontant && partageMode === 'montants' }"
              :required="partageMode === 'montants'"
              :readonly="partageMode === 'parts'"
              :disabled="!participantCheckboxes[user['@id']]"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  '@id': string
  username: string
}

interface ParticipantData {
  parts: number
  montant: number
  manualMontant: boolean
}

const props = defineProps<{
  users: User[]
  participantCheckboxes: Record<string, boolean>
  participantData: Record<string, ParticipantData>
  partageMode: 'parts' | 'montants'
}>()

const emit = defineEmits<{
  updateParticipant: [userId: string, checked: boolean]
  updateParticipantParts: [userId: string, parts: number]
  updateParticipantMontant: [userId: string, montant: number]
}>()

const updateParticipant = (userId: string, checked: boolean) => {
  emit('updateParticipant', userId, checked)
}

const updateParticipantParts = (userId: string, parts: number) => {
  emit('updateParticipantParts', userId, parts)
}

const updateParticipantMontant = (userId: string, montant: number) => {
  emit('updateParticipantMontant', userId, montant)
}

const getParticipantData = (userId: string): ParticipantData => {
  return props.participantData[userId] || { parts: 1, montant: 0, manualMontant: false }
}
</script>
