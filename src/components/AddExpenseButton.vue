<template>
  <div class="fixed bottom-8 right-8 z-10">
    <button
      @click="toggleTagSelection"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center"
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
    </button>

    <!-- Bulle de sélection des tags -->
    <div
      v-if="showTagSelection"
      class="absolute bottom-20 right-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-48 max-w-64 z-20"
      @click.stop
    >
      <!-- Petite flèche pointant vers le bouton -->
      <div class="absolute -bottom-2 right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200"></div>

      <div class="p-3">
        <div v-if="isLoading" class="text-center py-2 text-gray-500 text-sm">
          Chargement...
        </div>

        <div v-else-if="userTags.length === 0" class="text-center py-2 text-gray-500 text-sm">
          Aucun tag disponible
        </div>

        <div v-else class="space-y-1">
          <button
            v-for="tag in userTags"
            :key="tag.id"
            @click="selectTag(tag)"
            class="w-full p-2 text-left text-sm hover:bg-gray-50 rounded transition-colors"
          >
            {{ tag.libelle }}
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay transparent pour fermer la bulle en cliquant ailleurs -->
    <div
      v-if="showTagSelection"
      class="fixed inset-0 z-10"
      @click="showTagSelection = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsers } from '@/composables/useUsers'
import { useTags, type Tag } from '@/composables/useTags'

const router = useRouter()
const showTagSelection = ref(false)
const { me, fetchMe } = useUsers()
const { tags: allTags, fetchTags, getTagByIri } = useTags()

const userTags = computed(() => {
  if (!me.value?.tags) return []

  return me.value.tags
    .map(tagIri => getTagByIri(tagIri))
    .filter(tag => tag !== undefined)
})

const isLoading = computed(() => {
  return !me.value || allTags.value.length === 0
})

const toggleTagSelection = () => {
  showTagSelection.value = !showTagSelection.value
}

const selectTag = (tag: Tag) => {
  showTagSelection.value = false
  router.push({
    name: 'create-expense',
    query: { tag: tag['@id'] }
  })
}

onMounted(async () => {
  await Promise.all([fetchMe(), fetchTags()])
})
</script>
