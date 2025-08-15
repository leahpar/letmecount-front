<template>
  <div
    class="bg-white border-b border-gray-200 p-4"
    :class="{ 'cursor-pointer': expense.details && expense.details.length > 0 }"
    @click="expense.details && expense.details.length > 0 ? toggleExpanded() : null"
  >
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
      <h4 class="text-lg font-semibold text-gray-800">{{ expense.titre }}</h4>
      <div class="flex items-center gap-3 self-end sm:self-center">
        <span class="text-xl font-bold text-blue-600">{{ formatAmount(expense.montant) }} €</span>
        <button
          class="p-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 hover:border-blue-500 transition-all duration-200"
          @click.stop="handleEdit"
          title="Modifier la dépense"
        >
          ✏️
        </button>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row justify-between sm:items-center text-sm text-gray-600 gap-x-4 gap-y-1">
      <span class="text-xs text-gray-500">{{ formatDate(expense.date) }}</span>
      <span class="italic">
        Payé par {{ getPayer(expense) }}
        <span class="font-bold ml-1" :class="{ 'text-green-600': balanceImpact > 0, 'text-red-600': balanceImpact < 0 }">
          ({{ formatImpact(balanceImpact) }})
        </span>
      </span>
      <span v-if="!tagId && expense.tag" class="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
        #{{ getTagName(expense.tag) }}
      </span>
      <span
        v-if="expense.details && expense.details.length > 0"
        class="text-blue-600 text-xs font-bold ml-auto"
      >
        {{ isExpanded() ? '▼' : '▶' }}
      </span>
    </div>
    <div
      v-if="expense.details && expense.details.length > 0 && isExpanded()"
      class="mt-3 pt-3 border-t border-gray-200"
    >
      <table class="w-full text-sm">
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUsers } from '@/composables/useUsers'
import { useTags } from '@/composables/useTags'

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
  tagId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [expense: Expense]
}>()

const expanded = ref(false)

const { getUsernameByIri, me } = useUsers()
const { getTagByIri } = useTags()

const formatAmount = (amount: number): string => {
  return amount.toFixed(2)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatImpact = (impact: number): string => {
  if (impact === 0) {
    return '0.00€'
  }
  const sign = impact > 0 ? '+' : ''
  return `${sign}${impact.toFixed(2)}€`
}

const balanceImpact = computed((): number => {
  if (!me.value) {
    return 0
  }
  const expense = props.expense
  let impact = 0
  if (expense.payePar === me.value['@id']) {
    impact += expense.montant
  }

  const userDetail = expense.details.find(d => d.user === me.value['@id'])
  if (userDetail) {
    impact -= userDetail.montant
  }

  return impact
})

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

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const isExpanded = (): boolean => {
  return expanded.value
}

const handleEdit = () => {
  emit('edit', props.expense)
}
</script>