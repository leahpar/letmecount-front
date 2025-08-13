<template>
  <div>
    <label for="partage" class="block text-sm font-medium text-gray-700">Type de partage</label>
    <div class="mt-2 flex items-center cursor-pointer" @click="togglePartage">
      <span :class="['text-sm font-medium', modelValue === 'parts' ? 'text-blue-600' : 'text-gray-500']">
        Par parts
      </span>
      <button
        type="button"
        class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mx-4"
        :class="modelValue === 'montants' ? 'bg-blue-600' : 'bg-gray-200'"
      >
        <span
          aria-hidden="true"
          class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
          :class="{ 'translate-x-5': modelValue === 'montants', 'translate-x-0': modelValue === 'parts' }"
        ></span>
      </button>
      <span :class="['text-sm font-medium', modelValue === 'montants' ? 'text-blue-600' : 'text-gray-500']">
        Par montants
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: 'parts' | 'montants'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: 'parts' | 'montants']
}>()

const togglePartage = () => {
  emit('update:modelValue', props.modelValue === 'parts' ? 'montants' : 'parts')
}
</script>
