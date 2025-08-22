import { computed, ref } from 'vue'
import type { Tag, CreateTagData } from '@/types/api'
import { useCache } from '@/composables/useCache'
import axios from '@/plugins/axios'
import { handleApiError } from '@/utils/errorHandler'

const tagCache = useCache<Tag[]>('/tags', 'le chargement des tags')
const loading = ref(false)
const error = ref<string | null>(null)

export type { Tag }

export function useTags() {
  const tagsMap = computed(() => {
    const map = new Map<string, Tag>()
    if (tagCache.data.value) {
      tagCache.data.value.forEach((tag: Tag) => {
        map.set(tag['@id'], tag)
        map.set(tag.id.toString(), tag)
      })
    }
    return map
  })

  const getTagById = (id: string | number): Tag | undefined => {
    return tagsMap.value.get(id.toString())
  }

  const getTagNameById = (id: string | number): string => {
    const tag = getTagById(id)
    return tag?.libelle || `Tag ${id}`
  }

  const getTagByIri = (iri: string): Tag | undefined => {
    return tagsMap.value.get(iri)
  }

  const fetchTags = (force = false) => {
    return tagCache.fetchData(force)
  }
  const refreshTags = tagCache.refresh

  const createTag = async (tagData: CreateTagData): Promise<Tag | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post('/tags', tagData)
      await refreshTags() // Refresh cache after creation
      return response.data
    } catch (err: unknown) {
      error.value = handleApiError(err, 'la création du tag')
      return null
    } finally {
      loading.value = false
    }
  }

  const updateTag = async (id: string, tagData: Partial<CreateTagData>): Promise<Tag | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.patch(`/tags/${id}`, tagData)
      await refreshTags() // Refresh cache after update
      return response.data
    } catch (err: unknown) {
      error.value = handleApiError(err, 'la modification du tag')
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    tags: tagCache.data,
    loading: computed(() => loading.value || tagCache.loading.value),
    error: computed(() => error.value || tagCache.error.value),
    tagsMap,
    getTagById,
    getTagNameById,
    getTagByIri,
    fetchTags,
    refreshTags,
    createTag,
    updateTag
  }
}
