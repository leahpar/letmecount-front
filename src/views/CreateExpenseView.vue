<template>
  <div class="create-expense-container">
    <div class="create-expense-form">
      <h1>{{ pageTitle }}</h1>

      <form @submit.prevent="handleSubmit">
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

        <div class="repartition-status" :class="{ 'valid': repartitionStatus.valid, 'invalid': !repartitionStatus.valid }">
          <span class="status-icon">{{ repartitionStatus.valid ? '✓' : '⚠' }}</span>
          {{ repartitionStatus.message }}
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-actions">
          <div class="form-actions-left">
            <button
              v-if="isEditMode"
              type="button"
              @click="handleDelete"
              :disabled="loading"
              class="delete-btn"
            >
              {{ loading ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
          <div class="form-actions-right">
            <button type="button" @click="goBack" class="cancel-btn">
              Annuler
            </button>
            <button type="submit" :disabled="loading || !canSubmit" class="submit-btn">
              {{ submitButtonText }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUsers } from '@/composables/useUsers'
import { useTags } from '@/composables/useTags'
import { useExpenses } from '@/composables/useExpenses'
import { useExpenseForm } from '@/composables/useExpenseForm'
import ExpenseBasicFields from '@/components/expense/ExpenseBasicFields.vue'
import ExpensePartageToggle from '@/components/expense/ExpensePartageToggle.vue'
import ExpenseParticipantsList from '@/components/expense/ExpenseParticipantsList.vue'

const router = useRouter()
const route = useRoute()
const { users, fetchUsers, me, fetchMe } = useUsers()
const { tags, fetchTags } = useTags()
const { createExpense, updateExpense, fetchExpenseById, deleteExpense, loading, error } = useExpenses()

// Détection du mode édition
const expenseId = computed(() => route.params.id as string)
const isEditMode = computed(() => !!expenseId.value)
const pageTitle = computed(() => isEditMode.value ? 'Modifier la dépense' : 'Créer une dépense')
const submitButtonText = computed(() => {
  if (loading.value) {
    return isEditMode.value ? 'Modification...' : 'Création...'
  }
  return isEditMode.value ? 'Modifier la dépense' : 'Créer la dépense'
})

const {
  formData,
  participantCheckboxes,
  participantData,
  updateParticipant,
  updateParticipantParts,
  updateParticipantMontant,
  initializeParticipants,
  updateFormDetails,
  canSubmit,
  repartitionStatus
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

const loadExpenseForEdit = async () => {
  if (!isEditMode.value) return

  const expense = await fetchExpenseById(expenseId.value)
  if (!expense) {
    router.push({ name: 'profile' })
    return
  }

  // Remplir le formulaire avec les données de la dépense
  formData.value.titre = expense.titre
  formData.value.montant = expense.montant
  formData.value.date = expense.date.split('T')[0] // Convertir au format date HTML
  formData.value.payePar = expense.payePar
  formData.value.partage = expense.partage
  formData.value.tag = expense.tag || ''

  // Initialiser les participants avec les données de la dépense
  if (expense.details) {
    expense.details.forEach(detail => {
      participantCheckboxes.value[detail.user] = true
      participantData.value[detail.user] = {
        parts: detail.parts,
        montant: detail.montant,
        manualMontant: formData.value.partage === 'montants' // Considérer comme manuel en mode montants
      }
    })
    // Mettre à jour formData.details avec les données chargées
    updateFormDetails()
  }
}

const handleSubmit = async () => {
  // La validation est maintenant gérée par canSubmit
  if (!canSubmit.value) {
    return
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

  let result
  if (isEditMode.value) {
    result = await updateExpense(expenseId.value, expenseData)
  } else {
    result = await createExpense(expenseData)
  }

  if (result) {
    // Forcer le refresh du profil avec un paramètre
    router.push({ name: 'profile', query: { refresh: true } })
  }
}

const handleDelete = async () => {
  if (!isEditMode.value) return

  const confirmed = confirm(
    `Êtes-vous sûr de vouloir supprimer la dépense "${formData.value.titre}" ?\n\nCette action est irréversible.`
  )

  if (confirmed) {
    const success = await deleteExpense(expenseId.value)
    if (success) {
      // Forcer le refresh du profil avec un paramètre
      router.push({ name: 'profile', query: { refresh: true } })
    }
  }
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchTags(), fetchMe()])

  initializeParticipants(users.value)

  if (isEditMode.value) {
    // En mode édition, charger les données existantes
    await loadExpenseForEdit()
  } else {
    // En mode création, définir l'utilisateur connecté comme payeur par défaut
    if (me.value) {
      formData.value.payePar = me.value['@id']
    }
  }
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
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
}

.form-actions-left {
  display: flex;
  gap: 1rem;
}

.form-actions-right {
  display: flex;
  gap: 1rem;
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

.delete-btn {
  padding: 0.75rem 1.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.delete-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.delete-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
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

.repartition-status {
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.repartition-status.valid {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.repartition-status.invalid {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-icon {
  font-weight: bold;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .form-actions-left,
  .form-actions-right {
    justify-content: center;
  }

  .form-actions-left {
    order: 2;
  }

  .form-actions-right {
    order: 1;
  }
}
</style>
