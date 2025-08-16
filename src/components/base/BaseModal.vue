<template>
  <div 
    v-if="show"
    class="fixed inset-0 bg-gray-100 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50" 
    @click.self="handleClose"
  >
    <div 
      class="bg-white border border-gray-300 w-full"
      :class="[
        sizeClass,
        `p-${padding}`
      ]"
    >
      <!-- Header avec titre et boutons d'action -->
      <div v-if="$slots.header || title || $slots.actions" class="flex justify-between items-center mb-4">
        <div>
          <!-- Slot header personnalisé ou titre simple -->
          <slot name="header">
            <h4 v-if="title" class="text-xl font-semibold text-gray-800">{{ title }}</h4>
            <p v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</p>
          </slot>
        </div>
        
        <!-- Actions (boutons) -->
        <div v-if="$slots.actions" class="flex items-center gap-2">
          <slot name="actions"></slot>
        </div>
        
        <!-- Bouton fermer par défaut -->
        <button 
          v-else-if="showCloseButton"
          @click="handleClose" 
          class="text-gray-500 hover:text-gray-800 p-1"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      <!-- Contenu principal -->
      <div>
        <slot></slot>
      </div>

      <!-- Footer optionnel -->
      <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-gray-200">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  show: boolean
  title?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: number
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  padding: 6,
  showCloseButton: true,
  closeOnBackdrop: true
})

const emit = defineEmits<{
  close: []
}>()

const sizeClass = computed(() => {
  const sizes = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    'full': 'max-w-full mx-4'
  }
  return sizes[props.size]
})

const handleClose = () => {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}
</script>

<style scoped>
/* Animation d'entrée/sortie pour la modal */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>