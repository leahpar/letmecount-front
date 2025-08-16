<template>
  <router-link
    :to="{ name: 'create-expense' }"
    class="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-700 text-white font-bold w-16 h-16 rounded-full z-10 flex items-center justify-center"
    aria-label="Ajouter une dépense"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 4v16m8-8H4"
      />
    </svg>
  </router-link>
</template>

<script setup lang="ts">
</script>
