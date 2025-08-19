<template>
  <div>
    <div class="text-lg font-medium text-gray-900 mb-2">Bénéficiaire</div>
    <select v-model="selectedBeneficiary" class="w-full p-2 border border-gray-300 rounded-md">
      <option :value="null" disabled>Sélectionner un bénéficiaire</option>
      <option v-for="user in availableBeneficiaries" :key="user['@id']" :value="user['@id']">
        {{ user.username }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/types/api'

const props = defineProps<{
  modelValue: string | null
  users: User[]
  payePar: string
}>()

const emit = defineEmits<{'update:modelValue': [value: string | null]}>()

const selectedBeneficiary = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const availableBeneficiaries = computed(() => {
  return props.users.filter(user => user['@id'] !== props.payePar)
})
</script>
