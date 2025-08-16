<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import IconUsers from '@/components/icons/IconUsers.vue'

const { isAuthenticated, logout } = useAuth()
const isMobileMenuOpen = ref(false)

const handleLogout = () => {
  logout()
  window.location.href = '/login'
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 font-sans">
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex-shrink-0">
            <RouterLink to="/" class="text-2xl font-bold text-blue-600">LetMeCount</RouterLink>
          </div>
                    <div class="md:hidden">
            <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span class="sr-only">Open main menu</span>
              <svg v-if="!isMobileMenuOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-if="isMobileMenuOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <template v-if="isAuthenticated">
                <RouterLink to="/profile" class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Mon compte</RouterLink>
                <RouterLink to="/participants" class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 p-2 rounded-md">
                                    <IconUsers class="h-6 w-6 text-gray-600" />
                </RouterLink>
                <RouterLink to="/expenses/create" class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Créer une dépense</RouterLink>
                <a href="#" @click.prevent="handleLogout" class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Déconnexion</a>
              </template>
            </div>
          </nav>
        </div>
      </div>

      <div v-if="isMobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <template v-if="isAuthenticated">
            <RouterLink to="/profile" class="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Mon compte</RouterLink>
            <RouterLink to="/participants" class="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Participants</RouterLink>
            <RouterLink to="/expenses/create" class="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Créer une dépense</RouterLink>
            <a href="#" @click.prevent="handleLogout" class="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Déconnexion</a>
          </template>
        </div>
      </div>
    </header>

    <main class="flex-grow">
      <RouterView />
    </main>

    <footer class="bg-white">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500">
          © {{ new Date().getFullYear() }} LetMeCount. Tous droits réservés.
        </p>
      </div>
    </footer>
  </div>
</template>