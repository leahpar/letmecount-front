<template>
  <div class="space-y-6">
    <div>
      <label for="titre" class="block text-sm font-medium text-gray-700">Titre</label>
      <div class="mt-1">
        <input
          id="titre"
          :value="modelValue.titre"
          @input="updateField('titre', ($event.target as HTMLInputElement).value)"
          type="text"
          required
          placeholder="Repas, Courses..."
          maxlength="255"
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          :class="{ 'border-red-500': submitted && !isTitreValid }"
        >
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <div>
        <label for="montant" class="block text-sm font-medium text-gray-700">Montant</label>
        <div class="mt-1 relative rounded-md">
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">€</span>
          </div>
          <input
            id="montant"
            :value="modelValue.montant"
            @input="updateField('montant', parseFloat(($event.target as HTMLInputElement).value) || 0)"
            type="number"
            step="0.01"
            min="1"
            required
            placeholder="0.00"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-7"
            :class="{ 'border-red-500': submitted && !isMontantValid }"
          >
        </div>
      </div>

      <div>
        <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
        <div class="mt-1">
          <input
            id="date"
            :value="modelValue.date"
            @input="updateField('date', ($event.target as HTMLInputElement).value)"
            type="date"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <div>
        <label for="payePar" class="block text-sm font-medium text-gray-700">Payé par</label>
        <div class="mt-1">
          <select
            id="payePar"
            :value="modelValue.payePar"
            @change="updateField('payePar', ($event.target as HTMLSelectElement).value)"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">-- Choisir qui a payé --</option>
            <option
              v-for="user in users"
              :key="user['@id']"
              :value="user['@id']"
            >
              {{ user.username }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <label for="tag" class="block text-sm font-medium text-gray-700">Tag</label>
        <div class="mt-1">
          <select
            id="tag"
            :value="modelValue.tag"
            @change="updateField('tag', ($event.target as HTMLSelectElement).value)"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            :class="{ 'border-red-500': submitted && !isTagValid }"
          >
            <option value="">-- Choisir un tag --</option>
            <option
              v-for="tag in tags"
              :key="tag['@id']"
              :value="tag['@id']"
            >
              {{ tag.libelle }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface User {
  '@id': string
  username: string
}

interface Tag {
  '@id': string
  libelle: string
}

interface FormData {
  titre: string
  montant: number
  date: string
  payePar: string
  tag: string
}

const props = defineProps<{
  modelValue: FormData
  users: User[]
  tags: Tag[]
  submitted: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FormData]
}>()

const isTitreValid = computed(() => props.modelValue.titre.trim() !== '')
const isMontantValid = computed(() => props.modelValue.montant > 0)
const isTagValid = computed(() => props.modelValue.tag !== '')

const updateField = (field: keyof FormData, value: string | number) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}
</script>
