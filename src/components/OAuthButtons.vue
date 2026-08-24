<template>
  <div class="space-y-3">
    <button
      @click="emit('select', 'google')"
      class="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
    >
      <GoogleLogo />
      Continuer avec Google
    </button>

    <!-- Fond noir et libellé imposés par les consignes d'Apple, qui demandent
         aussi que le bouton ne soit pas moins visible que les autres. -->
    <button
      @click="emit('select', 'apple')"
      class="w-full flex items-center justify-center gap-3 bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
    >
      <AppleLogo />
      Continuer avec Apple
    </button>
  </div>
</template>

<script setup lang="ts">
import GoogleLogo from '@/components/GoogleLogo.vue'
import AppleLogo from '@/components/AppleLogo.vue'
import type { OAuthProvider } from '@/composables/useOAuth'

const emit = defineEmits<{ select: [provider: OAuthProvider] }>()
</script>
