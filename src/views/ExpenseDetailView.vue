<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-4xl mx-auto px-4 py-6">
      <!-- Header avec navigation -->
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <button 
          @click="goBack" 
          class="flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Retour
        </button>
        <button 
          @click="handleEdit" 
          class="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Modifier
        </button>
      </div>

      <!-- Contenu principal -->
      <div v-if="expense">
        <!-- Titre et date -->
        <div class="border-b border-gray-200 pb-4 mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ expense.titre }}</h1>
          <p class="text-gray-600">{{ formatDate(expense.date) }}</p>
        </div>

        <!-- Informations principales -->
        <div class="flex items-center justify-between text-sm text-gray-600 gap-x-4 gap-y-1 mb-6">
          <span class="text-lg italic">
            Payé par {{ getPayer(expense) }}
          </span>
          <span class="text-3xl font-bold text-blue-600">{{ formatAmount(expense.montant) }} €</span>
        </div>

        <!-- Tableau des détails -->
        <div class="border border-gray-200">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Utilisateur
                </th>
                <th v-if="expense.partage === 'parts'" class="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Parts
                </th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-500">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="detail in expense.details"
                :key="detail.user"
                class="hover:bg-gray-50"
              >
                <td class="px-4 py-3 text-sm font-medium text-gray-900">
                  {{ getUserName(detail.user) }}
                </td>
                <td v-if="expense.partage === 'parts'" class="px-4 py-3 text-sm text-gray-500">
                  {{ detail.parts }}
                </td>
                <td class="px-4 py-3 text-sm font-medium text-blue-600 text-right">
                  {{ formatAmount(detail.montant) }} €
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tag si présent -->
        <div v-if="expense.tag" class="mt-6 pt-4 border-t border-gray-200">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
            #{{ getTagName(expense.tag) }}
          </span>
        </div>
      </div>

      <!-- État de chargement -->
      <div v-else-if="loading">
        <div class="animate-pulse">
          <div class="h-8 bg-gray-200 mb-4"></div>
          <div class="h-4 bg-gray-200 mb-2"></div>
          <div class="h-32 bg-gray-200"></div>
        </div>
      </div>

      <!-- Erreur -->
      <div v-else>
        <div class="text-center text-gray-500 py-8">
          <p class="text-lg mb-2">Dépense non trouvée</p>
          <p class="text-sm">Cette dépense n'existe pas ou n'est plus accessible.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsers } from '@/composables/useUsers'
import { useTags } from '@/composables/useTags'
import { useExpenses } from '@/composables/useExpenses'
import type { Expense } from '@/types/api'
import { formatAmount, formatDate } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const { getUsernameByIri } = useUsers()
const { getTagByIri } = useTags()
const { fetchExpenseById } = useExpenses()

const expense = ref<Expense | null>(null)
const loading = ref(true)

const getUserName = (userIri: string): string => {
  return getUsernameByIri(userIri)
}

const getPayer = (expense: Expense): string => {
  return getUserName(expense.payePar)
}

const getTagName = (tagIri: string | undefined): string => {
  if (!tagIri) {
    return ''
  }
  const tag = getTagByIri(tagIri)
  return tag?.libelle || ''
}

const goBack = () => {
  router.back()
}

const handleEdit = () => {
  if (expense.value) {
    router.push({ name: 'edit-expense', params: { id: expense.value.id } })
  }
}

onMounted(async () => {
  const expenseId = route.params.id as string
  if (expenseId) {
    try {
      const result = await fetchExpenseById(expenseId)
      expense.value = result
    } catch (error) {
      console.error('Erreur lors du chargement de la dépense:', error)
    }
  }
  loading.value = false
})
</script>