<template>
  <div class="min-h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo et nom de l'application -->
      <div class="text-center">
        <div class="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-6">
          <svg class="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 class="text-4xl font-extrabold text-gray-900 mb-2">LetMeCount</h1>
        <p class="text-lg text-gray-600 mb-8">Gestion des comptes entre amis</p>
      </div>

      <!-- Section installation -->
      <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">1. 📱 Installe l'application</h2>
        <p class="text-gray-600">
          Tu clique par ici et tu cliques par là-bas.
        </p>
      </div>

      <!-- Section contact admin -->
      <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">2. 🔑 Demande ton accès</h2>
        <p class="text-gray-600">
          Contactez ton administrateur préféré !
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page de présentation publique - aucune logique nécessaire
</script>
