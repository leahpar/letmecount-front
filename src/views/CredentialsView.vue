<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Mettre à jour vos informations
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="submit">
        <input type="hidden" v-model="token">
        <div class="rounded-md -space-y-px">
          <div>
            <label for="username" class="sr-only">Utilisateur</label>
            <input id="username" v-model="username" name="username" type="text" required
                   class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:border-indigo-500 focus:z-10 sm:text-sm"
                   placeholder="Votre nom d'utilisateur">
          </div>
          <div>
            <label for="password" class="sr-only">Mot de passe</label>
            <input id="password" v-model="password" name="password" type="password" autocomplete="new-password"
                   class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:border-indigo-500 focus:z-10 sm:text-sm"
                   placeholder="Nouveau mot de passe">
          </div>
        </div>

        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{{ error }}</span>
        </div>

        <div>
          <button type="submit" :disabled="loading" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <!-- Heroicon name: solid/lock-closed -->
              <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
            </span>
            {{ loading ? 'Mise à jour...' : 'Mettre à jour' }}
          </button>
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
