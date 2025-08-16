<template>
  <div>
    <button
      @click="showTagSelection = true"
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
    </button>

    <BaseModal
      :show="showTagSelection"
      @close="showTagSelection = false"
      title="Choisir un tag"
      size="sm"
    >
      <div v-if="isLoading" class="text-center py-4">
        Chargement des tags...
      </div>
      
      <div v-else-if="userTags.length === 0" class="text-center py-4 text-gray-500">
        Aucun tag disponible
      </div>
      
      <div v-else class="space-y-2">
        <button
          v-for="tag in userTags"
          :key="tag.id"
          @click="selectTag(tag)"
          class="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
        >
          {{ tag.libelle }}
        </button>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from './base/BaseModal.vue'
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
