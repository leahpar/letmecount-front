<template>
  <div 
    ref="containerRef" 
    class="relative"
    :style="{ transform: `translateY(${pullDistance}px)` }"
  >
    <!-- Pull to refresh indicator -->
    <div 
      v-if="pullDistance > 0 || isRefreshing"
      class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full flex items-center justify-center h-16 text-blue-500 transition-opacity duration-200"
      :class="{ 'opacity-100': pullDistance > 30 || isRefreshing, 'opacity-50': pullDistance <= 30 }"
    >
      <div 
        class="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"
        v-if="isRefreshing"
      ></div>
      <svg 
        v-else
        xmlns="http://www.w3.org/2000/svg" 
        class="h-6 w-6 transition-transform duration-200"
        :class="{ 'rotate-180': pullDistance > 60 }"
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
    
    <slot />
  </div>
</template>

<script setup lang="ts">
import { usePullToRefresh } from '@/composables/usePullToRefresh'

interface Props {
  onRefresh: () => Promise<void>
}

const props = defineProps<Props>()

const { isRefreshing, pullDistance, containerRef } = usePullToRefresh(props.onRefresh)
</script>