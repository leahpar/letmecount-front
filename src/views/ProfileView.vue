<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsers } from '@/composables/useUsers'
import { useExpenseCache } from '@/composables/useExpenseCache'
import UserProfile from '@/components/UserProfile.vue'
import ExpenseList from '@/components/ExpenseList.vue'
import PullToRefresh from '@/components/PullToRefresh.vue'

const route = useRoute()
const router = useRouter()
const { fetchMe } = useUsers()
const { fetchExpenses } = useExpenseCache()

const handleRefresh = async () => {
  if (route.query.refresh) {
    await fetchExpenses(10, undefined, true) // Forcer le rafraîchissement
    // Supprimer le paramètre de la requête pour éviter les rafraîchissements répétés
    await router.replace({ query: { ...route.query, refresh: undefined } })
  }
}

watch(() => route.query.refresh,
  (newVal) => {
    if (newVal) {
      handleRefresh()
    }
  },
  { immediate: true }
)

const handlePullToRefresh = async () => {
  await fetchExpenses(10, undefined, true)
}

onMounted(() => {
  if (!route.query.refresh) {
    fetchMe()
  }
})
</script>

<template>
  <PullToRefresh :on-refresh="handlePullToRefresh" class="py-8">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div class="lg:grid lg:grid-cols-12 lg:gap-8">
        <div class="lg:col-span-4">
          <UserProfile />
        </div>
        <div class="mt-8 lg:mt-0 lg:col-span-8">
          <div class="bg-white border border-gray-200">
            <div class="p-6">
              <ExpenseList
                title="Mes dépenses"
                :limit="10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </PullToRefresh>
</template>
