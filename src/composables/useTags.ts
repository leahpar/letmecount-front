import { computed } from 'vue'
import type { Tag } from '@/types/api'
import { useCache } from '@/composables/useCache'

const tagCache = useCache<Tag[]>('/tags', 'le chargement des tags')

export type { Tag }

export function useTags() {
  const tagsMap = computed(() => {
    const map = new Map<string, Tag>()
    tagCache.data.value.forEach(tag => {
      map.set(tag['@id'], tag)
      map.set(tag.id.toString(), tag)
    })
    return map
  })

  const getTagById = (id: string | number): Tag | undefined => {
    return tagsMap.value.get(id.toString())
  }

  const getTagNameById = (id: string | number): string => {
    const tag = getTagById(id)
    return tag?.name || `Tag ${id}`
  }

  const getTagByIri = (iri: string): Tag | undefined => {
    return tagsMap.value.get(iri)
  }

  const fetchTags = tagCache.fetchData
  const refreshTags = tagCache.refresh

  return {
    tags: tagCache.data,
    loading: tagCache.loading,
    error: tagCache.error,
    tagsMap,
    getTagById,
    getTagNameById,
    getTagByIri,
    fetchTags,
    refreshTags
  }
}
