import { ref, computed } from 'vue'
import axios from '@/plugins/axios'
import type { User } from '@/types/api'
import { handleApiError } from '@/utils/errorHandler'

const users = ref<User[]>([])
const me = ref<User | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const lastFetch = ref<number>(0)

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useUsers() {
  const usersMap = computed(() => {
    const map = new Map<string, User>()
    users.value.forEach(user => {
      map.set(user['@id'], user)
      map.set(user.id.toString(), user)
    })
    return map
  })

  const getUserById = (id: string | number): User | undefined => {
    return usersMap.value.get(id.toString())
  }

  const getUsernameById = (id: string | number): string => {
    const user = getUserById(id)
    return user?.username || `Utilisateur ${id}`
  }

  const getUsernameByIri = (iri: string): string => {
    const user = usersMap.value.get(iri)
    return user?.username || `Utilisateur ${iri.split('/').pop()}`
  }

  const fetchUsers = async (force = false) => {
    const now = Date.now()
    
    if (!force && users.value.length > 0 && (now - lastFetch.value) < CACHE_DURATION) {
      return
    }

    if (loading.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await axios.get('/users')
      users.value = response.data.member || []
      lastFetch.value = now
    } catch (err: unknown) {
      error.value = handleApiError(err, 'le chargement des utilisateurs')
    } finally {
      loading.value = false
    }
  }

  const refreshUsers = () => fetchUsers(true)

  const fetchMe = async (force = false) => {
    if (me.value && !force) {
      return
    }
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/users/me')
      me.value = response.data
      if (me.value && me.value['@id'] === '/users/me' && me.value.id) {
        me.value['@id'] = `/users/${me.value.id}`
      }
    } catch (err: unknown) {
      error.value = handleApiError(err, 'le chargement de l\'utilisateur courant')
    } finally {
      loading.value = false
    }
  }

  return {
    users: computed(() => users.value),
    me: computed(() => me.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    usersMap,
    getUserById,
    getUsernameById,
    getUsernameByIri,
    fetchUsers,
    refreshUsers,
    fetchMe
  }
}
