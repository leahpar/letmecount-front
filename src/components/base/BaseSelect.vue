<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <div class="mt-1">
      <select
        :id="id"
        :value="modelValue"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        :required="required"
        :disabled="disabled"
        class="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:outline-none focus:border-indigo-500 focus:border-indigo-500 sm:text-sm"
        :class="{ 'border-red-500': hasError }"
      >
        <option v-if="placeholder" value="">{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: string
  label: string
}

interface Props {
  id: string
  modelValue: string
  label?: string
  required?: boolean
  disabled?: boolean
  hasError?: boolean
  placeholder?: string
  options: Option[]
}

withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  hasError: false
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>