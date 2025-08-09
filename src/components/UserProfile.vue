<template>
  <div class="user-profile">
    <h2>Profil Utilisateur</h2>
    
    <div v-if="loading" class="loading">
      Chargement...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="user" class="profile-info">
      <div class="profile-item">
        <label>Username :</label>
        <span>{{ user.username }}</span>
      </div>
      
      <div class="profile-item">
        <label>Solde :</label>
        <span class="solde" :class="{ negative: user.solde < 0 }">
          {{ formatMoney(user.solde) }} €
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUsers } from '@/composables/useUsers'

const { me: user, loading, error, fetchMe } = useUsers()

const formatMoney = (amount: number): string => {
  return amount.toFixed(2)
}

onMounted(() => {
  fetchMe()
})
</script>

<style scoped>
.user-profile {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 2rem auto;
}

.user-profile h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.loading {
  text-align: center;
  color: #666;
  font-style: italic;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  text-align: center;
}

.profile-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.profile-item label {
  font-weight: 600;
  color: #555;
}

.profile-item span {
  color: #333;
}

.solde {
  font-weight: bold;
  font-size: 1.1em;
}

.solde.negative {
  color: #dc3545;
}

.solde:not(.negative) {
  color: #28a745;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>