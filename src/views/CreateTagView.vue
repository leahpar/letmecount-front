<template>
  <div>
    <ExpenseActionHeader
      @back="goBack"
    />

    <div>
      <div>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-4">
            <BaseInput
              id="libelle"
              v-model="formData.libelle"
              label="Libellé du tag"
              type="text"
              :error="submitted && !formData.libelle"
              error-message="Le libellé est requis"
              required
            />
          </div>

          <div>
            <div class="text-lg font-medium text-gray-900">Participants</div>
            <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div v-for="user in users" :key="user['@id']" class="flex items-start">
                <div class="flex items-center h-5">
                  <input
                    :id="`user-${user['@id']}`"
                    :name="`user-${user['@id']}`"
                    type="checkbox"
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    v-model="participantCheckboxes[user['@id']]"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label :for="`user-${user['@id']}`" class="font-medium text-gray-700">{{ user.username }}</label>
                </div>
              </div>
            </div>
          </div>

          <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">{{ error }}</span>
          </div>

          <div class="pt-6 border-t border-gray-200">
            <button
              type="submit"
              :disabled="loading || !canSubmit"
              class="w-full px-4 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsers } from '@/composables/useUsers'
import { useTags } from '@/composables/useTags'
import ExpenseActionHeader from '@/components/ExpenseActionHeader.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import type { User } from '@/types/api'

const router = useRouter()
const { users, fetchUsers } = useUsers()
const { createTag, loading, error } = useTags()
const submitted = ref(false)

const formData = ref({
  libelle: '',
  users: [] as string[],
})

const participantCheckboxes = ref<Record<string, boolean>>({})

const canSubmit = computed(() => {
  return formData.value.libelle && Object.values(participantCheckboxes.value).some(v => v)
})

const handleSubmit = async () => {
  submitted.value = true
  if (!canSubmit.value) {
    return
  }

  formData.value.users = Object.entries(participantCheckboxes.value)
    .filter(([, checked]) => checked)
    .map(([userId]) => userId)

  const result = await createTag(formData.value)

  if (result) {
    router.push({ name: 'profile', query: { refresh: 'true' } })
  }
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  await fetchUsers()
  users.value.forEach((user: User) => {
    participantCheckboxes.value[user['@id']] = false
  })
})
</script>
