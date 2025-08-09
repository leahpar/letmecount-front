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
      <div 
        v-for="expense in expenses" 
        :key="expense['@id']" 
        class="expense-item"
      >
        <div class="expense-header">
          <h4 class="expense-title">{{ expense.titre }}</h4>
          <span class="expense-amount">{{ formatAmount(expense.montant) }} €</span>
        </div>
        <div class="expense-details">
          <span class="expense-date">{{ formatDate(expense.date) }}</span>
          <span class="expense-sharing">Partage: {{ expense.partage === 'parts' ? 'Par parts' : 'Par montants' }}</span>
        </div>
        <div v-if="expense.details && expense.details.length > 0" class="expense-participants">
          <span class="participants-label">Participants:</span>
          <div class="participants-list">
            <span 
              v-for="detail in expense.details" 
              :key="detail.user" 
              class="participant"
            >
              {{ getUserName(detail.user) }} ({{ formatAmount(detail.montant) }} €)
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '@/plugins/axios'

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
  details?: ExpenseDetail[]
}

interface Props {
  title?: string
  limit?: number
  userId?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Dépenses',
  limit: 10
})

const expenses = ref<Expense[]>([])
const loading = ref(false)
const error = ref('')

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

const getUserName = (userIri: string): string => {
  return `Utilisateur ${userIri.split('/').pop()}`
}

const fetchExpenses = async () => {
  loading.value = true
  error.value = ''

  try {
    let url = `/depenses?page=1&itemsPerPage=${props.limit}`
    
    if (props.userId) {
      url += `&details.user=${props.userId}`
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

onMounted(() => {
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

.empty-state {
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

.expense-item {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  transition: box-shadow 0.2s;
}

.expense-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.expense-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.expense-title {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.expense-amount {
  font-weight: bold;
  color: #007bff;
  font-size: 1.2rem;
}

.expense-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.expense-participants {
  margin-top: 0.5rem;
  border-top: 1px solid #eee;
  padding-top: 0.5rem;
}

.participants-label {
  font-weight: 500;
  color: #555;
  display: block;
  margin-bottom: 0.25rem;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.participant {
  background-color: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #495057;
}

@media (max-width: 768px) {
  .expense-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .expense-details {
    flex-direction: column;
    gap: 0.25rem;
  }

  .participants-list {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>