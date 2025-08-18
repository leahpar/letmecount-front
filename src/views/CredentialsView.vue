<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Mettre à jour vos informations</h1>
      <form @submit.prevent="submit">
        <div class="mb-4">
          <label for="username" class="block text-gray-700">Utilisateur</label>
          <input type="text" id="username" v-model="username" placeholder="Votre nom d'utilisateur" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div class="mb-4">
          <label for="password" class="block text-gray-700">Mot de passe</label>
          <input type="password" id="password" v-model="password" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <input type="hidden" v-model="token">
        <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors" :disabled="loading">
          <span v-if="loading">Mise à jour...</span>
          <span v-else>Mettre à jour</span>
        </button>
        <div v-if="error" class="mt-4 text-red-500 text-center">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCredentials } from '@/composables/useCredentials';

const route = useRoute();
const router = useRouter();
const { updateCredentials, loading, error } = useCredentials();

const username = ref('');
const password = ref('');
const token = ref('');

onMounted(() => {
  if (typeof route.query.username === 'string') {
    username.value = route.query.username;
  }
  if (typeof route.query.token === 'string') {
    token.value = route.query.token;
  }
});

const submit = async () => {
  await updateCredentials({
    token: token.value,
    username: username.value,
    password: password.value,
  });
  if (!error.value) {
    await router.push({ name: 'login' });
  }
};
</script>
