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
          <div class="bg-white border border-gray-200 sm:rounded-lg">
            <div class="p-6">
              <ExpenseList
                :key="`expenses-${refreshKey}`"
                title="Mes dépenses"
                :limit="10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <router-link
    :to="{ name: 'create-expense' }"
    class="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-700 text-white font-bold w-16 h-16 rounded-full z-10 flex items-center justify-center"
    aria-label="Ajouter une dépense"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 4v16m8-8H4"
      />
    </svg>
  </router-link>
</template>
