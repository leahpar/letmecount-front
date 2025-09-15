<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

interface Props {
  isMobile?: boolean
  onLinkClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false
})

const { isAuthenticated, isAdmin } = useAuth()

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
        class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
      >
        Mon compte
      </RouterLink>
      <RouterLink
        to="/participants"
        @click="handleClick"
        class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
      >
        Participants
      </RouterLink>
      <RouterLink
        to="/notifications"
        v-if="isAdmin"
        @click="handleClick"
        class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
      >
        Notifications
      </RouterLink>
      <RouterLink
        v-if="isAdmin"
        to="/historique"
        @click="handleClick"
        class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
      >
        Historique
      </RouterLink>
      <RouterLink
        v-if="isAdmin"
        to="/tags"
        @click="handleClick"
        class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
      >
        Tags
      </RouterLink>
      <div class="border-t border-gray-200"></div>
      <a
        href="#"
        @click.prevent="handleLogout"
        class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-right"
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
        class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 text-sm font-medium"
      >
        Participants
      </RouterLink>
      <RouterLink
        to="/notifications"
        class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 text-sm font-medium"
      >
        Notifications
      </RouterLink>
      <RouterLink
        to="/historique"
        class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 text-sm font-medium"
      >
        Historique
      </RouterLink>
      <RouterLink
        v-if="isAdmin"
        to="/tags"
        class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 text-sm font-medium"
      >
        Tags
      </RouterLink>
      <div class="border-l border-gray-300 h-6 self-center"></div>
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
