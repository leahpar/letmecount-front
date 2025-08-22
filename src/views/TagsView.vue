<template>
  <PullToRefresh :on-refresh="handleRefresh">
    <div>
      <div>
            <div class="flex justify-between items-center">
              <h1 class="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <IconTag class="h-8 w-8" />
                <span>Tags</span>
              </h1>
              <RouterLink
                to="/tags/create"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Ajouter un tag
              </RouterLink>
            </div>

            <div v-if="loading" class="mt-4">Chargement...</div>
            <div v-if="error" class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3" role="alert">
              <span class="block sm:inline">{{ error }}</span>
            </div>

            <div v-if="!loading && !error" class="mt-6">
              <ul class="divide-y divide-gray-200">
                <li v-for="tag in tags" :key="tag.id" class="py-4">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <span class="text-lg font-medium text-gray-900">{{ tag.libelle }}</span>
                      <div v-if="tag.users && tag.users.length > 0" class="mt-1">
                        <span class="text-sm text-gray-500">{{ getParticipantNames(tag.users).join(', ') }}</span>
                      </div>
                    </div>
                    <RouterLink
                      :to="{ name: 'edit-tag', params: { id: tag.id } }"
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium ml-4"
                    >
                      Éditer
                    </RouterLink>
                  </div>
                </li>
              </ul>
              <div class="pb-24"></div>
            </div>
      </div>
    </div>
  </PullToRefresh>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTags } from '@/composables/useTags'
import { useAuth } from '@/composables/useAuth'
import { useUsers } from '@/composables/useUsers'
import { useRouter } from 'vue-router'
import IconTag from '@/components/icons/IconTag.vue'
import PullToRefresh from '@/components/PullToRefresh.vue'
import type { User } from '@/types/api'

const { tags, loading, error, fetchTags } = useTags()
const { isAdmin } = useAuth()
const { users, fetchUsers } = useUsers()
const router = useRouter()

const getParticipantNames = (userIris: string[]): string[] => {
  return userIris
    .map(iri => users.value.find((user: User) => user['@id'] === iri)?.username)
    .filter((name): name is string => !!name)
}

const handleRefresh = async () => {
  await Promise.all([fetchTags(true), fetchUsers()])
}

onMounted(async () => {
  if (!isAdmin.value) {
    router.push('/')
    return
  }
  await Promise.all([fetchTags(), fetchUsers()])
})
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>
