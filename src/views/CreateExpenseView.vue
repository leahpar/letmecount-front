<template>
  <div class="py-8">
    <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
      <div class="bg-white shadow sm:rounded-lg">
        <div class="p-6">

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <ExpenseBasicFields
              v-model="basicFields"
              :users="users"
              :tags="tags"
              :submitted="submitted"
            />

            <div class="flex items-center justify-between">
              <div class="text-lg font-medium text-gray-900">Participants</div>
              <ExpensePartageToggle
                v-model="formData.partage"
              />
            </div>

            <ExpenseParticipantsList
              :users="users"
              :participant-checkboxes="participantCheckboxes"
              :participant-data="participantData"
              :partage-mode="formData.partage"
              @update-participant="updateParticipant"
              @update-participant-parts="updateParticipantParts"
              @update-participant-montant="updateParticipantMontant"
            />



            <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span class="block sm:inline">{{ error }}</span>
            </div>

            <div class="flex flex-col items-stretch pt-6 border-t border-gray-200 gap-4">
              <div class="flex justify-end gap-3">
                <button type="button" @click="goBack" class="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Annuler
                </button>
                <button type="submit" :disabled="loading || !canSubmit" class="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
                  Enregistrer
                </button>
              </div>
              <div class="text-center">
                <button
                  v-if="isEditMode"
                  type="button"
                  @click="handleDelete"
                  :disabled="loading"
                  class="text-red-600 hover:text-red-800 underline disabled:text-gray-400"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
const submitted = ref(false)

// Détection du mode édition
const expenseId = computed(() => route.params.id as string)
const isEditMode = computed(() => !!expenseId.value)

const {
  formData,
  participantCheckboxes,
  participantData,
  updateParticipant,
  updateParticipantParts,
  updateParticipantMontant,
  initializeParticipants,
  updateFormDetails,
  canSubmit
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
  submitted.value = true
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
