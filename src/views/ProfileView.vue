<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsers } from '@/composables/useUsers'
import { useTags } from '@/composables/useTags'
import { useExpenseCache } from '@/composables/useExpenseCache'
import UserProfile from '@/components/UserProfile.vue'
import ExpenseList from '@/components/ExpenseList.vue'
import PullToRefresh from '@/components/PullToRefresh.vue'

const route = useRoute()
const router = useRouter()
const { fetchMe } = useUsers()
const { fetchExpenses } = useExpenseCache()
const { refreshTags } = useTags()

const handleRefresh = async () => {
  if (route.query.refresh) {
    await Promise.all([
      fetchExpenses(10, undefined, true), // Forcer le rafraîchissement
      refreshTags(),
      fetchMe(true)
    ])
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
  await Promise.all([
    fetchExpenses(10, undefined, true),
    refreshTags(),
    fetchMe(true)
  ])
}

onMounted(() => {
  if (!route.query.refresh) {
    fetchMe()
  }
})
</script>

<template>
  <PullToRefresh :on-refresh="handlePullToRefresh">
    <div>
      <div class="lg:grid lg:grid-cols-12 lg:gap-8">
        <div class="lg:col-span-4">
          <UserProfile />
        </div>
        <div class="mt-8 lg:mt-0 lg:col-span-8">
          <ExpenseList
            title="Mes dépenses"
            :limit="10"
          />
        </div>
      </div>
    </div>
  </PullToRefresh>
</template>
