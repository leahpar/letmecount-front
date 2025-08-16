<template>
  <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
    <button 
      @click="$emit('back')" 
      class="flex items-center text-gray-600 hover:text-gray-800"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
      Retour
    </button>
    
    <div class="flex items-center gap-2">
      <button 
        v-if="showEdit"
        @click="$emit('edit')" 
        class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        title="Modifier"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
      </button>
      
      <button 
        v-if="showSave"
        @click="$emit('save')"
        :disabled="!canSave || loading"
        class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        title="Enregistrer"
      >
        {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
      </button>
      
      <button 
        v-if="showDelete"
        @click="$emit('delete')" 
        class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50"
        :disabled="loading"
        title="Supprimer"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showEdit?: boolean
  showSave?: boolean
  showDelete?: boolean
  canSave?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  showEdit: false,
  showSave: false,
  showDelete: false,
  canSave: true,
  loading: false
})

defineEmits<{
  back: []
  edit: []
  save: []
  delete: []
}>()
</script>