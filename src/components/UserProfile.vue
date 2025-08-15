<template>
  <div class="bg-white border border-gray-200 sm:rounded-lg">
    <div class="p-6 text-center">
      <div v-if="loading" class="text-center py-8 text-gray-500">
        Chargement...
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ error }}</span>
      </div>

      <div v-else-if="user" class="space-y-2">
        <span class="font-medium text-xl text-gray-600">Mon solde</span>
        <div>
          <span
            class="font-bold text-5xl"
            :class="{ 'text-red-600': user.solde < 0, 'text-green-600': user.solde >= 0 }"
          >
            {{ formatMoney(user.solde) }} €
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUsers } from '@/composables/useUsers'

const { me: user, loading, error, fetchMe } = useUsers()

const formatMoney = (amount: number): string => {
  return amount.toFixed(2)
}

onMounted(() => {
  fetchMe()
})
</script>
