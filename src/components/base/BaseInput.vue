<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <div class="mt-1" :class="{ 'relative rounded-md': suffix }">
      <div v-if="suffix" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span class="text-gray-500 sm:text-sm">{{ suffix }}</span>
      </div>
      <input
        :id="id"
        :value="modelValue"
        @input="$emit('update:modelValue', getInputValue($event))"
        :type="type"
        :required="required"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :step="step"
        :min="min"
        :readonly="readonly"
        :disabled="disabled"
        class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:outline-none focus:border-indigo-500 focus:border-indigo-500 sm:text-sm"
        :class="[
          { 'border-red-500': hasError },
          { 'pr-7': suffix }
        ]"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id: string
  modelValue: string | number
  label?: string
  type?: string
  required?: boolean
  placeholder?: string
  maxlength?: number
  step?: string
  min?: string | number
  readonly?: boolean
  disabled?: boolean
  hasError?: boolean
  suffix?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  readonly: false,
  disabled: false,
  hasError: false
})

defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const getInputValue = (event: Event): string | number => {
  const target = event.target as HTMLInputElement
  if (props.type === 'number') {
    return parseFloat(target.value) || 0
  }
  return target.value
}
</script>