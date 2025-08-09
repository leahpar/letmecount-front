<template>
  <div class="form-section">
    <h3>Participants</h3>
    <div class="participants">
      <div
        v-for="user in users"
        :key="user['@id']"
        class="participant-row"
      >
        <div class="participant-name">
          {{ user.username }}
        </div>

        <label class="checkbox-container">
          <input
            type="checkbox"
            :checked="participantCheckboxes[user['@id']]"
            @change="updateParticipant(user['@id'], ($event.target as HTMLInputElement).checked)"
          >
          <span class="checkmark"></span>
        </label>

        <input
          v-if="partageMode === 'parts'"
          :value="getParticipantData(user['@id']).parts"
          @input="updateParticipantParts(user['@id'], parseInt(($event.target as HTMLInputElement).value) || 0)"
          type="number"
          min="0"
          step="1"
          placeholder="Parts"
        >

        <input
          :value="getParticipantData(user['@id']).montant"
          @input="updateParticipantMontant(user['@id'], parseFloat(($event.target as HTMLInputElement).value) || 0)"
          type="number"
          min="0"
          step="0.01"
          placeholder="Montant"
          :required="partageMode === 'montants'"
          :readonly="partageMode === 'parts'"
          :class="{ 'manual-montant': getParticipantData(user['@id']).manualMontant }"
        >
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

<style scoped>
.form-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.participants {
  margin-bottom: 1rem;
}

.participant-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid #eee;
  border-radius: 4px;
}

.participant-name {
  flex: 2;
  font-weight: 500;
  color: #333;
}

.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.checkbox-container input[type="checkbox"] {
  opacity: 0;
  position: absolute;
  width: 20px;
  height: 20px;
  margin: 0;
}

.checkmark {
  height: 20px;
  width: 20px;
  background-color: #eee;
  border: 2px solid #ddd;
  border-radius: 3px;
  display: inline-block;
  position: relative;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #007bff;
  border-color: #007bff;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
}

.participant-row input[type="number"] {
  flex: 1;
  margin: 0;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.participant-row input[type="number"]:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.participant-row input[type="number"].manual-montant {
  background-color: #e8f5e8;
  border-color: #28a745;
  color: #155724;
}
</style>