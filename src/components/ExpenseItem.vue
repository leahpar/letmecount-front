<template>
  <div>
    <div
      class="px-1 py-2"
      :class="{ 'cursor-pointer': expense.details && expense.details.length > 0 }"
      @click="expense.details && expense.details.length > 0 ? navigateToDetail() : null"
    >
      <div class="flex justify-between items-center gap-2">
        <h4 class="text-lg font-semibold text-gray-800 truncate pr-4">{{ expense.titre }}</h4>
        <div class="flex items-center gap-3">
          <span class="text-xl font-bold text-blue-600 text-nowrap">{{ formatAmount(expense.montant) }} €</span>
        </div>
      </div>
      <div class="flex items-center text-sm text-gray-600 gap-x-4 gap-y-1">
        <span v-if="!tagId && expense.tag" class="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
          #{{ getTagName(expense.tag) }}
        </span>
        <span class="italic ml-auto">
          Payé par {{ getPayer(expense) }}
          <span class="font-bold ml-1" :class="{ 'text-green-600': balanceImpact > 0, 'text-red-600': balanceImpact < 0 }">
            ({{ formatImpact(balanceImpact) }})
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUsers } from '@/composables/useUsers'
import { useTags } from '@/composables/useTags'
import type { Expense } from '@/types/api'
import { formatAmount, formatImpact } from '@/utils/formatters'

interface Props {
  expense: Expense
  tagId?: string
}

const props = defineProps<Props>()

const router = useRouter()
const { getUsernameByIri, me } = useUsers()
const { getTagByIri } = useTags()

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

const navigateToDetail = () => {
  router.push({ name: 'expense-detail', params: { id: props.expense.id } })
}
</script>
