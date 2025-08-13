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
  <div class="py-8">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div class="lg:grid lg:grid-cols-12 lg:gap-8">
        <div class="lg:col-span-4">
          <UserProfile :key="`profile-${refreshKey}`" />
        </div>
        <div class="mt-8 lg:mt-0 lg:col-span-8">
          <div class="bg-white shadow sm:rounded-lg">
            <div class="p-6">
              <ExpenseList
                :key="`expenses-${refreshKey}`"
                title="Mes 10 dernières dépenses"
                :limit="10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>