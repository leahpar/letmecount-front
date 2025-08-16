<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import IconUsers from '@/components/icons/IconUsers.vue'

interface Props {
  isMobile?: boolean
  onLinkClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false
})

const { isAuthenticated } = useAuth()

const handleLogout = () => {
  const { logout } = useAuth()
  logout()
  window.location.href = '/login'
}

const handleClick = () => {
  if (props.onLinkClick) {
    props.onLinkClick()
  }
}
</script>

<template>
  <template v-if="isAuthenticated">
    <template v-if="isMobile">
      <RouterLink
        to="/profile"
        @click="handleClick"
        class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
      >
        Mon compte
      </RouterLink>
      <RouterLink
        to="/participants"
        @click="handleClick"
        class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
      >
        Participants
      </RouterLink>
      <a
        href="#"
        @click.prevent="handleLogout"
        class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
      >
        Déconnexion
      </a>
    </template>
    <template v-else>
      <RouterLink
        to="/profile"
        class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 text-sm font-medium"
      >
        Mon compte
      </RouterLink>
      <RouterLink
        to="/participants"
        class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 p-2"
      >
        <IconUsers class="h-6 w-6 text-gray-600" />
      </RouterLink>
      <a
        href="#"
        @click.prevent="handleLogout"
        class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 text-sm font-medium"
      >
        Déconnexion
      </a>
    </template>
  </template>
</template>
