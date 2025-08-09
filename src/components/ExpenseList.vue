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
        :class="{ 'clickable': expense.details && expense.details.length > 0 }"
        @click="expense.details && expense.details.length > 0 ? toggleExpanded(expense['@id']) : null"
      >
        <div class="expense-header">
          <h4 class="expense-title">{{ expense.titre }}</h4>
          <span class="expense-amount">{{ formatAmount(expense.montant) }} €</span>
        </div>
        <div class="expense-details">
          <span class="expense-date">{{ formatDate(expense.date) }}</span>
          <span 
            v-if="expense.details && expense.details.length > 0" 
            class="expand-indicator"
          >
            {{ isExpanded(expense['@id']) ? '▼' : '▶' }}
          </span>
        </div>
        <div 
          v-if="expense.details && expense.details.length > 0 && isExpanded(expense['@id'])" 
          class="expense-participants"
        >
          <table class="participants-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th v-if="expense.partage === 'parts'">Parts</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="detail in expense.details" 
                :key="detail.user"
              >
                <td>{{ getUserName(detail.user) }}</td>
                <td v-if="expense.partage === 'parts'">{{ detail.parts }}</td>
                <td class="amount">{{ formatAmount(detail.montant) }} €</td>
              </tr>
            </tbody>
          </table>
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
const expandedExpenses = ref<Set<string>>(new Set())

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

const toggleExpanded = (expenseId: string) => {
  if (expandedExpenses.value.has(expenseId)) {
    expandedExpenses.value.delete(expenseId)
  } else {
    expandedExpenses.value.add(expenseId)
  }
}

const isExpanded = (expenseId: string): boolean => {
  return expandedExpenses.value.has(expenseId)
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

.expense-item.clickable {
  cursor: pointer;
}

.expense-item.clickable:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.expand-indicator {
  color: #007bff;
  font-size: 0.8rem;
  font-weight: bold;
  margin-left: auto;
}

.expense-participants {
  margin-top: 0.5rem;
  border-top: 1px solid #eee;
  padding-top: 0.5rem;
}

.participants-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.participants-table th {
  background-color: #f8f9fa;
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #dee2e6;
  font-size: 0.85rem;
}

.participants-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #eee;
  color: #495057;
}

.participants-table .amount {
  font-weight: 500;
  color: #007bff;
  text-align: right;
}

.participants-table tbody tr:hover {
  background-color: #f8f9fa;
}

@media (max-width: 768px) {
  .expense-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .expense-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .expand-indicator {
    align-self: flex-end;
  }

  .participants-table {
    font-size: 0.85rem;
  }

  .participants-table th,
  .participants-table td {
    padding: 0.4rem 0.5rem;
  }
}
</style>