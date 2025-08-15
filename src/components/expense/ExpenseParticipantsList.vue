<template>
  <div>
      <div
        v-for="user in users"
        :key="user['@id']"
        class="flex items-center gap-x-4 py-1 border-b border-gray-100"
      >
        <div class="flex items-center">
          <input
            :id="`participant-${user['@id']}`"
            type="checkbox"
            :checked="participantCheckboxes[user['@id']]"
            @change="updateParticipant(user['@id'], ($event.target as HTMLInputElement).checked)"
            class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          >
        </div>

        <div class="flex-1 min-w-0">
          <label :for="`participant-${user['@id']}`" class="text-sm font-medium text-gray-900 truncate cursor-pointer">{{ user.username }}</label>
        </div>

        <div class="w-auto">
          <div v-if="partageMode === 'parts'" class="flex items-center">
            <button
              type="button"
              @click="decrementParts(user['@id'])"
              :disabled="!participantCheckboxes[user['@id']] || getParticipantData(user['@id']).parts <= 0"
              class="px-2 py-1 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
            >
              -
            </button>
            <input
              :id="`parts-${user['@id']}`"
              :value="getParticipantData(user['@id']).parts"
              @input="updateParticipantParts(user['@id'], parseInt(($event.target as HTMLInputElement).value) || 0)"
              type="number"
              min="0"
              step="1"
              class="appearance-none block w-12 px-1 py-1 border-t border-b border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center"
              :disabled="!participantCheckboxes[user['@id']]"
            >
            <button
              type="button"
              @click="incrementParts(user['@id'])"
              :disabled="!participantCheckboxes[user['@id']]"
              class="px-2 py-1 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
            >
              +
            </button>
          </div>
          
        </div>

        <div class="w-24">
          <label :for="`montant-${user['@id']}`" class="sr-only">Montant</label>
          <div class="relative rounded-md ">
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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
              class="appearance-none block w-full px-2 py-1 border border-gray-300 rounded-md  placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-7"
              
              :required="partageMode === 'montants'"
              :readonly="partageMode === 'parts'"
              :disabled="partageMode === 'parts' && !participantCheckboxes[user['@id']]"
            >
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

const incrementParts = (userId: string) => {
  const currentParts = props.participantData[userId]?.parts || 0
  emit('updateParticipantParts', userId, currentParts + 1)
}

const decrementParts = (userId: string) => {
  const currentParts = props.participantData[userId]?.parts || 0
  if (currentParts > 0) {
    emit('updateParticipantParts', userId, currentParts - 1)
  }
}
</script>