<template>
  <div class="w-full">
    <h1 class="text-2xl font-semibold text-gray-900 mb-4">Notifications</h1>

    <div v-if="loading && logs.length === 0" class="text-center py-8 text-gray-500">
      Chargement des notifications...
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-else-if="logs.length === 0" class="text-center py-8 text-gray-500 italic">
      Aucune notification trouvée
    </div>

    <div v-else class="">
      <NotificationItem
        v-for="log in logs"
        :key="log['@id']"
        :log="log"
      />
    </div>

    <div v-if="loadingMore" class="text-center py-4 text-gray-500">Chargement...</div>
    <div v-if="allLoaded && logs.length > 0" class="text-center py-4 text-gray-500 italic">Fin des notifications</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useUsers } from '@/composables/useUsers'
import { useTags } from '@/composables/useTags'
import { useLogCache } from '@/composables/useLogCache'
import NotificationItem from '@/components/NotificationItem.vue'

const { fetchUsers, fetchMe } = useUsers()
const { fetchTags } = useTags()
const {
  logs,
  loading,
  loadingMore,
  error,
  allLoaded,
  scrollPosition,
  fetchLogs,
  setScrollPosition
} = useLogCache()

const handleScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    fetchLogs(10)
  }
  setScrollPosition(scrollTop)
}

onMounted(async () => {
  await fetchUsers()
  await fetchTags()
  await fetchMe()

  if (logs.value.length === 0) {
    fetchLogs(10)
  }

  window.addEventListener('scroll', handleScroll)
  window.scrollTo(0, scrollPosition.value)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
