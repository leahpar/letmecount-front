<template>
  <div class="space-y-6">
    <BaseInput
      id="titre"
      v-model="formData.titre"
      label="Titre"
      type="text"
      required
      placeholder="Repas, Courses..."
      :maxlength="255"
      :has-error="submitted && !isTitreValid"
    />

    <div class="grid grid-cols-2 gap-6">
      <BaseInput
        id="montant"
        :model-value="formData.montant"
        @update:model-value="updateMontant"
        label="Montant"
        type="number"
        step="0.01"
        :min="1"
        required
        placeholder="0.00"
        suffix="€"
        :has-error="submitted && !isMontantValid"
      />

      <BaseInput
        id="date"
        v-model="formData.date"
        label="Date"
        type="date"
        required
      />
    </div>

    <div class="grid grid-cols-2 gap-6">
      <BaseSelect
        id="payePar"
        v-model="formData.payePar"
        label="Payé par"
        required
        placeholder="-- Choisir qui a payé --"
        :options="userOptions"
      />

      <BaseInput
        v-if="isTagReadonly"
        id="tag"
        :model-value="selectedTagLabel"
        label="Tag"
        type="text"
        readonly
        disabled
        class="bg-gray-100"
      />
      <BaseSelect
        v-else
        id="tag"
        :model-value="tagId"
        @update:model-value="$emit('update:tagId', $event)"
        label="Tag"
        required
        placeholder="-- Choisir un tag --"
        :options="tagOptions"
        :has-error="submitted && !isTagValid"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import type { User, Tag } from '@/types/api'

interface FormData {
  titre: string
  montant: number
  date: string
  payePar: string
  tag: string
}

const props = defineProps<{
  modelValue: FormData
  tagId: string
  users: User[]
  tags: Tag[]
  submitted: boolean
  isTagReadonly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FormData]
  'update:tagId': [value: string]
}>()

const formData = computed({
  get: () => props.modelValue,
  set: (value: FormData) => emit('update:modelValue', value)
})

const isTitreValid = computed(() => props.modelValue.titre.trim() !== '')
const isMontantValid = computed(() => props.modelValue.montant > 0)
const isTagValid = computed(() => props.modelValue.tag !== '')

const userOptions = computed(() => 
  props.users.map(user => ({
    value: user['@id'],
    label: user.username
  }))
)

const tagOptions = computed(() => 
  props.tags.map(tag => ({
    value: tag['@id'],
    label: tag.libelle
  }))
)

const selectedTagLabel = computed(() => {
  const selectedTag = props.tags.find(tag => tag['@id'] === props.modelValue.tag)
  return selectedTag?.libelle || ''
})

const updateMontant = (value: string | number) => {
  emit('update:modelValue', {
    ...props.modelValue,
    montant: typeof value === 'string' ? parseFloat(value) || 0 : value
  })
}
</script>
