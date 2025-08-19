<template>
  <div>
      <!-- Header avec navigation -->
      <ExpenseActionHeader
        :show-delete="isEditMode"
        @back="goBack"
        @delete="handleDelete"
      />

      <div>
        <div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <ExpenseBasicFields
              v-model="formData"
              :users="users"
              :tags="tags"
              :submitted="submitted"
            />

            <!-- Cas spécial pour le tag "Transfert" -->
            <div v-if="isTransfert">
              <ExpenseTransferFields
                v-model="beneficiaryId"
                :users="users"
                :paye-par="formData.payePar"
              />
            </div>

            <!-- Affichage normal pour les autres tags -->
            <div v-else>
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
                :selected-tag="formData.tag"
                @update-participant="updateParticipant"
                @update-participant-parts="updateParticipantParts"
                @update-participant-montant="updateParticipantMontant"
              />
            </div>


            <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span class="block sm:inline">{{ error }}</span>
            </div>

            <div class="pt-6 border-t border-gray-200">
              <button
                type="submit"
                :disabled="loading || !canSubmit"
                class="w-full px-4 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>

          </form>
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
import { useExpenseActions } from '@/composables/useExpenseActions'
import ExpenseActionHeader from '@/components/ExpenseActionHeader.vue'
import ExpenseBasicFields from '@/components/expense/ExpenseBasicFields.vue'
import ExpensePartageToggle from '@/components/expense/ExpensePartageToggle.vue'
import ExpenseParticipantsList from '@/components/expense/ExpenseParticipantsList.vue'
import ExpenseTransferFields from '@/components/expense/ExpenseTransferFields.vue'

const router = useRouter()
const route = useRoute()
const { users, fetchUsers, me, fetchMe } = useUsers()
const { tags, fetchTags } = useTags()
const { createExpense, updateExpense, fetchExpenseById, loading, error } = useExpenses()
const { confirmDeleteExpense } = useExpenseActions()
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
  canSubmit: originalCanSubmit
} = useExpenseForm()

// Logique pour le cas "Transfert"
const beneficiaryId = ref<string | null>(null)
const isTransfert = computed(() => {
  const selectedTag = tags.value.find((t: any) => t['@id'] === formData.value.tag)
  return selectedTag?.libelle === 'Transfert'
})

const canSubmit = computed(() => {
  if (isTransfert.value) {
    return !!beneficiaryId.value && !!formData.value.titre && formData.value.montant > 0
  }
  return originalCanSubmit.value
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
    if (isTransfert.value) {
      // En mode transfert, il ne devrait y avoir qu'un seul bénéficiaire
      const beneficiary = expense.details.find(d => d.user !== expense.payePar)
      if (beneficiary) {
        beneficiaryId.value = beneficiary.user
      }
    } else {
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
}

const handleSubmit = async () => {
  submitted.value = true
  if (!canSubmit.value) {
    return
  }

  let expenseData
  if (isTransfert.value) {
    if (!beneficiaryId.value) {
      return
    }
    expenseData = {
      titre: formData.value.titre,
      montant: formData.value.montant,
      date: formData.value.date,
      payePar: formData.value.payePar,
      partage: 'montants' as const, // Forcer la répartition par montants
      tag: formData.value.tag,
      details: [
        {
          user: beneficiaryId.value,
          montant: formData.value.montant,
          parts: 1
        }
      ]
    }
  } else {
    expenseData = {
      titre: formData.value.titre,
      montant: formData.value.montant,
      date: formData.value.date,
      payePar: formData.value.payePar,
      partage: formData.value.partage as 'parts' | 'montants',
      details: formData.value.details,
      tag: formData.value.tag
    }
  }

  let result
  if (isEditMode.value) {
    result = await updateExpense(expenseId.value, expenseData)
  } else {
    const tagFromQuery = route.query.tag as string
    result = await createExpense({ ...expenseData, tag: tagFromQuery })
  }

  if (result) {
    // Forcer le refresh du profil avec un paramètre
    router.push({ name: 'profile', query: { refresh: 'true' } })
  }
}

const handleDelete = async () => {
  if (!isEditMode.value) return

  await confirmDeleteExpense(expenseId.value, formData.value.titre)
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

    // Préremplir le tag si fourni dans les query parameters
    const tagFromQuery = route.query.tag as string
    if (tagFromQuery) {
      formData.value.tag = tagFromQuery
    }
  }
})
</script>


