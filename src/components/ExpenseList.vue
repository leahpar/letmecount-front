<template>
  <div class="expense-list">
    <h3>{{ title }}</h3>
    
    <div v-if="loading" class="loading">
      Chargement des dépenses...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="expenses.length === 0" class="empty-state">
      Aucune dépense trouvée
    </div>

    <div v-else class="expenses">
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

<style scoped>
.expense-list {
  width: 100%;
}

.expense-list h3 {
  margin-bottom: 1rem;
  color: #333;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.empty-.state {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

.expenses {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
