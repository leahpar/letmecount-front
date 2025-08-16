import { ref, computed } from 'vue'
import axios from '@/plugins/axios'
import type { User } from '@/types/api'
import { useCache } from '@/composables/useCache'

const me = ref<User | null>(null)
const userCache = useCache<User[]>('/users', 'le chargement des utilisateurs')

export function useUsers() {
  const usersMap = computed(() => {
    const map = new Map<string, User>()
    userCache.data.value.forEach(user => {
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

  const fetchUsers = userCache.fetchData
  const refreshUsers = userCache.refresh

  const fetchMe = async (force = false) => {
    if (me.value && !force) {
      return
    }
    try {
      const response = await axios.get('/users/me')
      me.value = response.data
      if (me.value && me.value['@id'] === '/users/me' && me.value.id) {
        me.value['@id'] = `/users/${me.value.id}`
      }
    } catch (err: unknown) {
      console.error('Erreur lors du chargement de l\'utilisateur courant:', err)
    }
  }

  return {
    users: userCache.data,
    me: computed(() => me.value),
    loading: userCache.loading,
    error: userCache.error,
    usersMap,
    getUserById,
    getUsernameById,
    getUsernameByIri,
    fetchUsers,
    refreshUsers,
    fetchMe
  }
}
