<template>
  <div class="bg-gray-100 min-h-screen md:p-4 font-sans">
    <div class="max-w-md mx-auto bg-white rounded-lg  p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Charte Graphique</h1>

      <!-- Colors -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Couleurs</h2>
        <div class="flex space-x-4">
          <div class="w-20 h-20 rounded-lg  bg-blue-600 flex items-center justify-center text-white font-bold">Primaire</div>
          <div class="w-20 h-20 rounded-lg  bg-orange-500 flex items-center justify-center text-white font-bold">Accent</div>
          <div class="w-20 h-20 rounded-lg  bg-gray-800 flex items-center justify-center text-white font-bold">Texte</div>
          <div class="w-20 h-20 rounded-lg  bg-gray-50 flex items-center justify-center text-gray-800 font-bold">Fond</div>
        </div>
      </section>

      <!-- Typography -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Typographie (Police Inter)</h2>
        <h1 class="text-4xl font-bold text-gray-800">Titre de niveau 1</h1>
        <h2 class="text-3xl font-semibold text-gray-700 mt-2">Titre de niveau 2</h2>
        <p class="text-base text-gray-600 mt-2">Ceci est un paragraphe de texte normal. Il est conçu pour être lisible et agréable à l'œil.</p>
        <a href="#" class="text-blue-600 hover:underline mt-2 inline-block">Ceci est un lien</a>
      </section>

      <!-- Buttons -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Boutons</h2>
        <div class="flex flex-col space-y-4">
          <button class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg  hover:bg-blue-700 transition-colors">Bouton Primaire</button>
          <button class="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg  hover:bg-orange-600 transition-colors">Bouton d'Accent</button>
          <button class="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg  hover:bg-gray-300 transition-colors">Bouton Secondaire</button>
        </div>
      </section>

      <!-- Form Elements -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Formulaires</h2>
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input type="text" id="name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:border-blue-500" placeholder="Entrez votre nom">
        </div>
        <div class="mt-4">
          <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Montant</label>
          <div class="relative">
            <input type="text" id="amount" class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:border-blue-500" placeholder="0.00">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500">€</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Balances -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Soldes</h2>
        <div class="p-4 rounded-lg bg-gray-50">
          <div class="flex justify-between items-center">
            <span class="text-lg text-gray-800">Solde total</span>
            <span class="text-2xl font-bold text-green-600">+ 124,50 €</span>
          </div>
          <div class="flex justify-between items-center mt-2">
            <span class="text-lg text-gray-800">Dette envers Jean</span>
            <span class="text-2xl font-bold text-red-600">- 32,00 €</span>
          </div>
        </div>
      </section>

      <!-- Action Buttons -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Boutons d'action</h2>
        <div class="flex space-x-4">
          <button class="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg  hover:bg-green-700 transition-colors">Valider</button>
          <button class="flex-1 bg-red-600 text-white font-bold py-3 px-4 rounded-lg  hover:bg-red-700 transition-colors">Annuler</button>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
// Ce composant est uniquement pour la maquette et la charte graphique.
</script>

<style scoped>
/* Import de la police Inter depuis Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

.font-sans {
  font-family: 'Inter', sans-serif;
}
</style>
