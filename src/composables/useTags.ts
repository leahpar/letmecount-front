import { ref, computed } from 'vue'
import axios from '@/plugins/axios'
import type { Tag } from '@/types/api'

const tags = ref<Tag[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const lastFetch = ref<number>(0)

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export type { Tag }

export function useTags() {
  const tagsMap = computed(() => {
    const map = new Map<string, Tag>()
    tags.value.forEach(tag => {
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

  const fetchTags = async (force = false) => {
    const now = Date.now()
    
    if (!force && tags.value.length > 0 && (now - lastFetch.value) < CACHE_DURATION) {
      return
    }

    if (loading.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await axios.get('/tags')
      tags.value = response.data.member || []
      lastFetch.value = now
    } catch (err: unknown) {
      console.error('Erreur lors du chargement des tags:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        error.value = axiosError.response?.data?.message || 'Erreur lors du chargement des tags'
      } else {
        error.value = 'Erreur lors du chargement des tags'
      }
    } finally {
      loading.value = false
    }
  }

  const refreshTags = () => fetchTags(true)

  return {
    tags: computed(() => tags.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    tagsMap,
    getTagById,
    getTagNameById,
    getTagByIri,
    fetchTags,
    refreshTags
  }
}
