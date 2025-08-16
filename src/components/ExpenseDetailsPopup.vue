<template>
  <div class="fixed inset-0 bg-gray-100 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h4 class="text-xl font-semibold text-gray-800">{{ expense.titre }}</h4>
          <p class="text-sm text-gray-500">{{ formatDate(expense.date) }}</p>
        </div>
        <div>
          <button @click="$emit('edit')" class="text-gray-500 hover:text-gray-800 mr-4">✏️</button>
        </div>
      </div>
      <div>
        <div class="flex items-center justify-between text-sm text-gray-600 gap-x-4 gap-y-1 mt-2">
          <span class="italic">
            Payé par {{ getPayer(expense) }}
          </span>
          <span class="text-xl font-semibold text-blue-600">{{ formatAmount(expense.montant) }} €</span>
        </div>
        <table class="w-full text-sm mt-4">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left font-medium text-gray-500">Utilisateur</th>
              <th v-if="expense.partage === 'parts'" class="px-4 py-2 text-left font-medium text-gray-500">Parts</th>
              <th class="px-4 py-2 text-right font-medium text-gray-500">Montant</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="detail in expense.details"
              :key="detail.user"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-2">{{ getUserName(detail.user) }}</td>
              <td v-if="expense.partage === 'parts'" class="px-4 py-2">{{ detail.parts }}</td>
              <td class="px-4 py-2 text-right font-medium text-blue-600">{{ formatAmount(detail.montant) }} €</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUsers } from '@/composables/useUsers'

interface ExpenseDetail {
  user: string
  parts: number
  montant: number
}

interface Expense {
  '@id': string
  titre: string
  montant: number
  date: string
  partage: 'parts' | 'montants'
  payePar: string
  details?: ExpenseDetail[]
  tag?: string
}

interface Props {
  expense: Expense
}

defineProps<Props>()
defineEmits(['close', 'edit'])

const { getUsernameByIri } = useUsers()

const formatAmount = (amount: number): string => {
  return amount.toFixed(2)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getUserName = (userIri: string): string => {
  return getUsernameByIri(userIri)
}

const getPayer = (expense: Expense): string => {
  return getUserName(expense.payePar)
}
</script>
