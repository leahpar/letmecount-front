<template>
  <div class="form-group">
    <label for="partage">Type de partage</label>
    <div class="toggle-container" @click="togglePartage">
      <span :class="{ active: modelValue === 'parts' }">Par parts</span>
      <button
        type="button"
        class="toggle-switch"
        :class="{ active: modelValue === 'montants' }"
      >
        <span class="toggle-slider"></span>
      </button>
      <span :class="{ active: modelValue === 'montants' }">Par montants</span>
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

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-container span {
  font-size: 0.9rem;
  color: #666;
  transition: color 0.2s;
}

.toggle-container span.active {
  color: #007bff;
  font-weight: 600;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 24px;
  background-color: #ddd;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-switch.active {
  background-color: #007bff;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(26px);
}
</style>