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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/plugins/axios'
import { useUsers } from '@/composables/useUsers'
import { useTags } from '@/composables/useTags'
import ExpenseItem from './ExpenseItem.vue'

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
  title?: string
  limit?: number
  tagId?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Dépenses',
  limit: 10
})

const expenses = ref<Expense[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const page = ref(1)
const allLoaded = ref(false)

const router = useRouter()
const { fetchUsers, fetchMe } = useUsers()
const { fetchTags } = useTags()

const groupedExpenses = computed(() => {
  const groups: { [key: string]: Expense[] } = {}
  for (const expense of expenses.value) {
    const date = new Date(expense.date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(expense)
  }
  return groups
})

const fetchExpenses = async () => {
  if (loading.value || loadingMore.value || allLoaded.value) return

  if (page.value === 1) {
    loading.value = true
  } else {
    loadingMore.value = true
  }
  error.value = ''

  try {
    let url = `/depenses?page=${page.value}&itemsPerPage=${props.limit}`

    if (props.tagId) {
      url += `&tags.id=${props.tagId}`
    }

    const response = await axios.get(url)
    const newExpenses = response.data.member || []

    if (newExpenses.length < props.limit) {
      allLoaded.value = true
    }

    expenses.value.push(...newExpenses)
    page.value++
  } catch (err: unknown) {
    console.error('Erreur lors du chargement des dépenses:', err)
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Erreur lors du chargement des dépenses'
    } else {
      error.value = 'Erreur lors du chargement des dépenses'
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const handleScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    fetchExpenses()
  }
}

const handleEdit = (expense: Expense) => {
  const id = expense['@id'].split('/').pop()
  router.push({ name: 'edit-expense', params: { id } })
}

onMounted(async () => {
  await fetchMe()
  await fetchUsers()
  await fetchTags()
  fetchExpenses()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
