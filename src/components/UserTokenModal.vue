<template>
  <BaseModal :show="show" @close="closeModal" :title="`Token pour ${user?.username}`">
    <div v-if="loading" class="text-center">Génération du token...</div>
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3" role="alert">
      {{ error }}
    </div>
    <div v-if="generatedToken && user">
      <div class="mt-2 p-2 bg-gray-100 rounded flex justify-center">
        <img :src="qrCodeUrl" alt="QR Code" />
      </div>
      <div class="mt-2 p-2 bg-gray-100 rounded relative">
        <code class="text-sm break-all cursor-pointer" @click="copyToClipboard(impersonationUrl)">
          {{ impersonationUrl }}
        </code>
        <span v-if="copiedMessage" class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-green-600">{{ copiedMessage }}</span>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { User } from '@/types/api'
import { useUsers } from '@/composables/useUsers'
import BaseModal from '@/components/base/BaseModal.vue'

const props = defineProps<{
  show: boolean
  user: User | null
}>()

const emit = defineEmits(['close'])

const { getUserToken } = useUsers()
const loading = ref(false)
const error = ref<string | null>(null)

const generatedToken = ref<string | null>(null)
const copiedMessage = ref<string | null>(null)

watch(() => props.show, async (newValue) => {
  if (newValue && props.user) {
    loading.value = true
    error.value = null
    generatedToken.value = null
    try {
      generatedToken.value = await getUserToken(props.user.id)
    } catch (e: unknown) {
      error.value = (e instanceof Error && e.message) ? e.message : 'Failed to get token'
    } finally {
      loading.value = false
    }
  }
})

const impersonationUrl = computed(() => {
  if (!props.user || !generatedToken.value) {
    return ''
  }
  const baseUrl = import.meta.env.VITE_APP_BASE_URL || window.location.origin
  return `${baseUrl}/credentials?username=${props.user.username}&token=${generatedToken.value}`
})

const qrCodeUrl = computed(() => {
  if (!impersonationUrl.value) {
    return ''
  }
  return `https://yaqrgen.com/qrcode.png?data=${encodeURIComponent(impersonationUrl.value)}`
})

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    copiedMessage.value = 'Copié !'
    setTimeout(() => {
      copiedMessage.value = null
    }, 2000)
  })
}

const closeModal = () => {
  emit('close')
}
</script>
