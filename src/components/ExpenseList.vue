<template>
  <div class="w-full">
    <h3 class="text-xl font-semibold text-gray-900 mb-4">{{ title }}</h3>

    <div v-if="loading" class="text-center py-8 text-gray-500">
      Chargement des dépenses...
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-else-if="expenses.length === 0" class="text-center py-8 text-gray-500 italic">
      Aucune dépense trouvée
    </div>

    <div v-else class="space-y-4">
      <ExpenseItem
        v-for="expense in expenses"
        :key="expense['@id']"
        :expense="expense"
        :tag-id="props.tagId"
        @edit="handleEdit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
const error = ref('')

const router = useRouter()
const { fetchUsers, fetchMe } = useUsers()
const { fetchTags } = useTags()

const fetchExpenses = async () => {
  loading.value = true
  error.value = ''

  try {
    let url = `/depenses?page=1&itemsPerPage=${props.limit}`
    
    if (props.tagId) {
      url += `&tags.id=${props.tagId}`
    }

    const response = await axios.get(url)
    expenses.value = response.data.member || []
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
  }
}

const handleEdit = (expense: Expense) => {
  // Extraire l'ID de l'IRI (ex: "/api/depenses/123" -> "123")
  const id = expense['@id'].split('/').pop()
  router.push({ name: 'edit-expense', params: { id } })
}

onMounted(async () => {
  await fetchMe()
  await fetchUsers()
  await fetchTags()
  fetchExpenses()
})
</script>