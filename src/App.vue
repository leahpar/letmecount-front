<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated, logout } = useAuth()

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
          <nav class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <template v-if="isAuthenticated">
                <RouterLink to="/profile" class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Mon compte</RouterLink>
                <RouterLink to="/participants" class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Participants</RouterLink>
                <RouterLink to="/expenses/create" class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Créer une dépense</RouterLink>
                <a href="#" @click.prevent="handleLogout" class="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Déconnexion</a>
              </template>
            </div>
          </nav>
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