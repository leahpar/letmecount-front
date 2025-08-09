<template>
  <div class="create-expense-container">
    <div class="create-expense-form">
      <h1>Créer une dépense</h1>

      <form @submit.prevent="handleCreateExpense">
        <ExpenseBasicFields
          v-model="basicFields"
          :users="users"
          :tags="tags"
        />

        <ExpensePartageToggle
          v-model="formData.partage"
        />

        <ExpenseParticipantsList
          :users="users"
          :participant-checkboxes="participantCheckboxes"
          :participant-data="participantData"
          :partage-mode="formData.partage"
          @update-participant="updateParticipant"
          @update-participant-parts="updateParticipantParts"
          @update-participant-montant="updateParticipantMontant"
        />

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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsers } from '@/composables/useUsers'
import { useTags } from '@/composables/useTags'
import { useExpenses } from '@/composables/useExpenses'
import { useExpenseForm } from '@/composables/useExpenseForm'
import ExpenseBasicFields from '@/components/expense/ExpenseBasicFields.vue'
import ExpensePartageToggle from '@/components/expense/ExpensePartageToggle.vue'
import ExpenseParticipantsList from '@/components/expense/ExpenseParticipantsList.vue'

const router = useRouter()
const { users, fetchUsers, me, fetchMe } = useUsers()
const { tags, fetchTags } = useTags()
const { createExpense, loading, error } = useExpenses()

const {
  formData,
  participantCheckboxes,
  participantData,
  updateParticipant,
  updateParticipantParts,
  updateParticipantMontant,
  initializeParticipants
} = useExpenseForm()

const basicFields = computed({
  get: () => ({
    titre: formData.value.titre,
    montant: formData.value.montant,
    date: formData.value.date,
    payePar: formData.value.payePar,
    tag: formData.value.tag
  }),
  set: (value) => {
    formData.value.titre = value.titre
    formData.value.montant = value.montant
    formData.value.date = value.date
    formData.value.payePar = value.payePar
    formData.value.tag = value.tag
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

  initializeParticipants(users.value)
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
</style>
