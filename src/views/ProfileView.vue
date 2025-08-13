<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import UserProfile from '@/components/UserProfile.vue'
import ExpenseList from '@/components/ExpenseList.vue'

const route = useRoute()

// Utiliser le paramètre refresh pour forcer le rechargement des composants
const refresh = computed(() => route.query.refresh || false)
// TODO: reactualiser l'user courant si true
</script>

<template>
  <main class="profile-page">
    <div class="profile-container">
      <UserProfile :key="`profile`" />

      <div class="expenses-container">
        <ExpenseList
          :key="`expenses`"
          title="Mes 10 dernières dépenses"
          :limit="10"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
.profile-page {
  padding: 1rem;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.expenses-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

@media (min-width: 1024px) {
  .profile-container {
    flex-direction: row;
    align-items: flex-start;
  }

  .expenses-container {
    flex: 1;
    margin-left: 1rem;
  }
}
</style>
