<template>
  <div
    class="expense-item"
    :class="{ 'clickable': expense.details && expense.details.length > 0 }"
    @click="expense.details && expense.details.length > 0 ? toggleExpanded() : null"
  >
    <div class="expense-header">
      <h4 class="expense-title">{{ expense.titre }}</h4>
      <span class="expense-amount">{{ formatAmount(expense.montant) }} €</span>
    </div>
    <div class="expense-details">
      <span class="expense-date">{{ formatDate(expense.date) }}</span>
      <span class="expense-payer">
        Payé par {{ getPayer(expense) }}
        <span :class="['balance-impact', { 'positive': balanceImpact > 0, 'negative': balanceImpact < 0 }]">
          ({{ formatImpact(balanceImpact) }})
        </span>
      </span>
      <span v-if="!tagId && expense.tag" class="expense-tag">
        #{{ getTagName(expense.tag) }}
      </span>
      <span
        v-if="expense.details && expense.details.length > 0"
        class="expand-indicator"
      >
        {{ isExpanded() ? '▼' : '▶' }}
      </span>
    </div>
    <div
      v-if="expense.details && expense.details.length > 0 && isExpanded()"
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
</script>

<style scoped>
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
  gap: 1rem;
}

.expense-payer {
  font-style: italic;
  color: #555;
}

.expense-tag {
  background-color: #eee;
  color: #333;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.balance-impact {
  font-weight: bold;
  margin-left: 0.5rem;
}

.balance-impact.positive {
  color: #28a745;
}

.balance-impact.negative {
  color: #dc3545;
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

  .expense-payer {
    order: 2;
  }

  .expand-indicator {
    align-self: flex-end;
    order: 3;
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
