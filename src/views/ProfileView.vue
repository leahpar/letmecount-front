<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsers } from '@/composables/useUsers'
import UserProfile from '@/components/UserProfile.vue'
import ExpenseList from '@/components/ExpenseList.vue'

const route = useRoute()
const router = useRouter()
const { fetchMe } = useUsers()

const refreshKey = ref(0)

const handleRefresh = async () => {
  if (route.query.refresh) {
    await fetchMe(true) // Forcer le rafraîchissement
    refreshKey.value++
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

onMounted(() => {
  if (!route.query.refresh) {
    fetchMe()
  }
})
</script>

<template>
  <main class="profile-page">
    <div class="profile-container">
      <UserProfile :key="`profile-${refreshKey}`" />

      <div class="expenses-container">
        <ExpenseList
          :key="`expenses-${refreshKey}`"
          title="Mes 10 dernières dépenses"
          :limit="10"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
.profile-page {
  padding: 1rem;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.expenses-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

@media (min-width: 1024px) {
  .profile-container {
    flex-direction: row;
    align-items: flex-start;
  }

  .expenses-container {
    flex: 1;
    margin-left: 1rem;
  }
}
</style>
