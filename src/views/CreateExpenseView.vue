<template>
  <div class="create-expense-container">
    <div class="create-expense-form">
      <h1>Créer une dépense</h1>

      <form @submit.prevent="handleCreateExpense">
        <div class="form-group">
          <label for="titre">Titre</label>
          <input
            id="titre"
            v-model="formData.titre"
            type="text"
            required
            placeholder="Repas, Courses..."
            maxlength="255"
          >
        </div>

        <div class="form-group">
          <label for="montant">Montant</label>
          <input
            id="montant"
            v-model.number="formData.montant"
            type="number"
            step="0.01"
            min="1"
            required
            placeholder="0.00"
          >
        </div>

        <div class="form-group">
          <label for="date">Date</label>
          <input
            id="date"
            v-model="formData.date"
            type="date"
            required
          >
        </div>

        <div class="form-group">
          <label for="payePar">Payé par</label>
          <select
            id="payePar"
            v-model="formData.payePar"
            required
          >
            <option value="">-- Choisir qui a payé --</option>
            <option
              v-for="user in users"
              :key="user['@id']"
              :value="user['@id']"
            >
              {{ user.username }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="partage">Type de partage</label>
          <div class="toggle-container" @click="togglePartage">
            <span :class="{ active: formData.partage === 'parts' }">Par parts</span>
            <button
              type="button"
              class="toggle-switch"
              :class="{ active: formData.partage === 'montants' }">
              <span class="toggle-slider"></span>
            </button>
            <span :class="{ active: formData.partage === 'montants' }">Par montants</span>
          </div>
        </div>

        <div class="form-group">
          <label for="tag">Tag</label>
          <select
            id="tag"
            v-model="formData.tag"
            required
          >
            <option value="">-- Choisir un tag --</option>
            <option
              v-for="tag in tags"
              :key="tag['@id']"
              :value="tag['@id']"
            >
              {{ tag.libelle }}
            </option>
          </select>
        </div>

        <div class="form-section">
          <h3>Participants</h3>
          <div class="participants">
            <div
              v-for="(detail, index) in formData.details"
              :key="index"
              class="participant-row"
            >
              <select
                v-model="detail.user"
                required
                class="participant-select"
              >
                <option value="">-- Choisir un participant --</option>
                <option
                  v-for="user in users"
                  :key="user['@id']"
                  :value="user['@id']"
                >
                  {{ user.username }}
                </option>
              </select>

              <input
                v-if="formData.partage === 'parts'"
                v-model.number="detail.parts"
                type="number"
                min="0"
                step="1"
                placeholder="Parts"
                required
              >

              <input
                v-model.number="detail.montant"
                type="number"
                min="0"
                step="0.01"
                placeholder="Montant"
                :required="formData.partage === 'montants'"
                :readonly="formData.partage === 'parts'"
              >

              <button
                type="button"
                @click="removeParticipant(index)"
                class="remove-btn"
              >
                ×
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="addParticipant"
            class="add-participant-btn"
          >
            + Ajouter un participant
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-actions">
          <button type="button" @click="goBack" class="cancel-btn">
            Annuler
          </button>
          <button type="submit" :disabled="loading" class="submit-btn">
            {{ loading ? 'Création...' : 'Créer la dépense' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUsers } from '@/composables/useUsers'
import { useTags } from '@/composables/useTags'
import { useExpenses } from '@/composables/useExpenses'

const router = useRouter()
const { users, fetchUsers, me, fetchMe } = useUsers()
const { tags, fetchTags } = useTags()
const { createExpense, loading, error } = useExpenses()

interface ExpenseDetail {
  user: string
  parts: number
  montant: number
}

const formData = ref({
  titre: '',
  montant: 0,
  date: new Date().toISOString().slice(0, 10),
  payePar: '',
  partage: 'parts' as 'parts' | 'montants',
  tag: '',
  details: [] as ExpenseDetail[]
})

const togglePartage = () => {
  formData.value.partage = formData.value.partage === 'parts' ? 'montants' : 'parts'
}

const addParticipant = () => {
  formData.value.details.push({
    user: '',
    parts: 1,
    montant: 0
  })
}

const removeParticipant = (index: number) => {
  formData.value.details.splice(index, 1)
}

const calculateMontants = () => {
  if (formData.value.partage === 'parts' && formData.value.montant > 0) {
    const totalParts = formData.value.details.reduce((sum, detail) => sum + (detail.parts || 0), 0)
    if (totalParts > 0) {
      let totalDistributed = 0
      formData.value.details.forEach((detail, index) => {
        if (index === formData.value.details.length - 1) {
          detail.montant = Number((formData.value.montant - totalDistributed).toFixed(2))
        } else {
          detail.montant = Number((formData.value.montant * detail.parts / totalParts).toFixed(2))
          totalDistributed += detail.montant
        }
      })
    }
  }
}

watch([() => formData.value.montant, () => formData.value.details], calculateMontants, { deep: true })
watch(() => formData.value.partage, () => {
  if (formData.value.partage === 'parts') {
    calculateMontants()
  }
})

const handleCreateExpense = async () => {
  if (formData.value.details.length === 0) {
    alert('Vous devez ajouter au moins un participant')
    return
  }

  if (formData.value.partage === 'montants') {
    const totalMontants = formData.value.details.reduce((sum, detail) => sum + detail.montant, 0)
    if (Math.abs(totalMontants - formData.value.montant) > 0.01) {
      alert('La somme des montants des participants doit être égale au montant total')
      return
    }
  }

  const expenseData = {
    titre: formData.value.titre,
    montant: formData.value.montant,
    date: formData.value.date,
    payePar: formData.value.payePar,
    partage: formData.value.partage,
    details: formData.value.details,
    tag: formData.value.tag
  }

  const createdExpense = await createExpense(expenseData)
  if (createdExpense) {
    router.push({ name: 'profile' })
  }
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchTags(), fetchMe()])

  if (me.value) {
    formData.value.payePar = me.value['@id']
  }

  addParticipant()
})
</script>

<style scoped>
.create-expense-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
  min-height: 80vh;
}

.create-expense-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
}

.create-expense-form h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

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
}

.participant-select {
  flex: 2;
}

.participant-row input {
  flex: 1;
  margin: 0;
}

.remove-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}

.remove-btn:hover {
  background-color: #c82333;
}

.add-participant-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.add-participant-btn:hover {
  background-color: #218838;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-container span {
  font-size: 0.9rem;
  color: #666;
  transition: color 0.2s;
}

.toggle-container span.active {
  color: #007bff;
  font-weight: 600;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 24px;
  background-color: #ddd;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-switch.active {
  background-color: #007bff;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(26px);
}
</style>
