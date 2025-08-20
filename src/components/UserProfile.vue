<template>
  <div>
    <div class="text-center">
      <div v-if="loading" class="text-center py-8 text-gray-500">
        Chargement...
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3" role="alert">
        <span class="block sm:inline">{{ error }}</span>
      </div>

      <div v-else-if="user" class="space-y-2">
        <span class="font-medium text-xl text-gray-600">Mon solde</span>
        <div>
          <span
            class="font-bold text-6xl"
            :class="{ 'text-red-600': user.solde < 0, 'text-green-600': user.solde >= 0 }"
          >
            {{ formatMoney(user.solde) }} €
          </span>
        </div>
        <div class="hidden lg:block mt-2">
          <button
            @click="handleRefresh"
            class="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Actualiser
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUsers } from '@/composables/useUsers'
import { useExpenseCache } from '@/composables/useExpenseCache'
import { useTags } from '@/composables/useTags'

const { me: user, loading, error, fetchMe } = useUsers()
const { fetchExpenses } = useExpenseCache()
const { refreshTags } = useTags()

const formatMoney = (amount: number): string => {
  return amount.toFixed(2)
}

const handleRefresh = async () => {
  await Promise.all([
    fetchExpenses(10, undefined, true),
    refreshTags(),
    fetchMe(true)
  ])
}

onMounted(() => {
  fetchMe()
})
</script>
