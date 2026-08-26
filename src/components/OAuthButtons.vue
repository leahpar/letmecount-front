<template>
  <div class="space-y-3">
    <button
      @click="emit('select', 'google')"
      class="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
    >
      <GoogleLogo />
      Continuer avec Google
    </button>

    <!-- Apple impose l'un de ses trois styles officiels (noir, blanc, blanc
         avec contour) et que le bouton ne soit pas moins visible que les
         autres : la variante « blanc avec contour » est celle qui s'aligne
         avec Google et PocketID. -->
    <button
      @click="emit('select', 'apple')"
      class="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
    >
      <AppleLogo />
      Continuer avec Apple
    </button>

    <button
      @click="emit('select', 'pocketid')"
      class="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
    >
      <PocketIdLogo />
      Continuer avec Pocket ID
    </button>
  </div>
</template>

<script setup lang="ts">
import GoogleLogo from '@/components/GoogleLogo.vue'
import AppleLogo from '@/components/AppleLogo.vue'
import PocketIdLogo from '@/components/PocketIdLogo.vue'
import type { OAuthProvider } from '@/composables/useOAuth'

const emit = defineEmits<{ select: [provider: OAuthProvider] }>()
</script>
