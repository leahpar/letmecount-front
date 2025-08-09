<template>
  <div>
    <div class="form-group">
      <label for="titre">Titre</label>
      <input
        id="titre"
        :value="modelValue.titre"
        @input="updateField('titre', ($event.target as HTMLInputElement).value)"
        type="text"
        required
        placeholder="Repas, Courses..."
        maxlength="255"
      >
    </div>

    <div class="form-group">
      <label for="montant">Montant</label>
      <input
        id="montant"
        :value="modelValue.montant"
        @input="updateField('montant', parseFloat(($event.target as HTMLInputElement).value) || 0)"
        type="number"
        step="0.01"
        min="1"
        required
        placeholder="0.00"
      >
    </div>

    <div class="form-group">
      <label for="date">Date</label>
      <input
        id="date"
        :value="modelValue.date"
        @input="updateField('date', ($event.target as HTMLInputElement).value)"
        type="date"
        required
      >
    </div>

    <div class="form-group">
      <label for="payePar">Payé par</label>
      <select
        id="payePar"
        :value="modelValue.payePar"
        @change="updateField('payePar', ($event.target as HTMLSelectElement).value)"
        required
      >
        <option value="">-- Choisir qui a payé --</option>
        <option
          v-for="user in users"
          :key="user['@id']"
          :value="user['@id']"
        >
          {{ user.username }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="tag">Tag</label>
      <select
        id="tag"
        :value="modelValue.tag"
        @change="updateField('tag', ($event.target as HTMLSelectElement).value)"
        required
      >
        <option value="">-- Choisir un tag --</option>
        <option
          v-for="tag in tags"
          :key="tag['@id']"
          :value="tag['@id']"
        >
          {{ tag.libelle }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  '@id': string
  username: string
}

interface Tag {
  '@id': string
  libelle: string
}

interface FormData {
  titre: string
  montant: number
  date: string
  payePar: string
  tag: string
}

const props = defineProps<{
  modelValue: FormData
  users: User[]
  tags: Tag[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FormData]
}>()

const updateField = (field: keyof FormData, value: string | number) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}
</style>