<template>
  <div class="w-full">
    <h3 class="text-xl font-semibold text-gray-900 mb-4">{{ title }}</h3>

    <div v-if="loading && expenses.length === 0" class="text-center py-8 text-gray-500">
      Chargement des dépenses...
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-else-if="expenses.length === 0" class="text-center py-8 text-gray-500 italic">
      Aucune dépense trouvée
    </div>

    <div v-else>
      <div v-for="(group, date) in groupedExpenses" :key="date" class="mb-2">
        <h4 class="text-lg text-center font-medium text-gray-800 mb-2 sticky top-0 py-2 px-4 -mx-4 border-t border-t-gray-400">{{ date }}</h4>
        <div class="divide-y divide-gray-200">
          <ExpenseItem
            v-for="expense in group"
            :key="expense['@id']"
            :expense="expense"
            :tag-id="props.tagId"
            @edit="handleEdit"
          />
        </div>
      </div>
    </div>

    <div v-if="loadingMore" class="text-center py-4 text-gray-500">Chargement...</div>
    <div v-if="allLoaded" class="text-center py-4 text-gray-500 italic">Fin des dépenses</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUsers } from '@/composables/useUsers'
import { useTags } from '@/composables/useTags'
import { useExpenses } from '@/composables/useExpenses'
import ExpenseItem from './ExpenseItem.vue'
import type { Expense } from '@/types/api'
import { formatDateForGrouping } from '@/utils/formatters'

interface Props {
  title?: string
  limit?: number
  tagId?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Dépenses',
  limit: 10
})

const router = useRouter()
const { fetchUsers, fetchMe } = useUsers()
const { fetchTags } = useTags()
const {
  expenses,
  loading,
  loadingMore,
  error,
  allLoaded,
  scrollPosition,
  fetchExpenses,
  setScrollPosition
} = useExpenses()

const groupedExpenses = computed(() => {
  const groups: { [key: string]: Expense[] } = {}
  for (const expense of expenses.value) {
    const date = formatDateForGrouping(expense.date)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(expense)
  }
  return groups
})

const handleScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    fetchExpenses(props.limit, props.tagId)
  }
  setScrollPosition(scrollTop)
}

const handleEdit = (expense: Expense) => {
  const id = expense['@id'].split('/').pop()
  router.push({ name: 'edit-expense', params: { id } })
}

onMounted(async () => {
  await fetchUsers()
  await fetchTags()
  await fetchMe()

  if (expenses.value.length === 0) {
    fetchExpenses(props.limit, props.tagId)
  }

  window.addEventListener('scroll', handleScroll)
  window.scrollTo(0, scrollPosition.value)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
