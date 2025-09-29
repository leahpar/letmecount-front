# Documentation Technique du Projet

Ce document décrit l'architecture technique front-end de l'application.

### `src/types/api.ts` - Le Contrat

*   **Rôle** : Définit les structures de données (`interface`, `type`) échangées avec l'API back-end.
*   **Objectif** : Assure la sécurité de typage (type-safety) et l'autocomplétion. C'est la source de vérité pour la forme des données.

### `src/plugins/axios.js` - Le Client HTTP

*   **Rôle** : Configure une instance centralisée d'axios pour toutes les requêtes HTTP.
*   **Fonctionnalités Clés** :
    *   **`baseURL`** : Pré-configure l'URL de base de l'API.
    *   **Intercepteurs** : Gèrent automatiquement l'ajout de tokens d'authentification et les erreurs globales (ex: une erreur 401 redirige vers `/login`).

### `src/composables/useXXX.ts` - La Logique Métier

*   **Rôle** : Encapsule la logique et l'état liés à une fonctionnalité (ex: `useExpenses` pour les dépenses) via la Composition API de Vue.
*   **Fonctionnement** : Un composable gère un état réactif (`ref`, `reactive`), appelle l'API via axios, et expose l'état et les fonctions aux composants.
*   **Avantage** : Logique découplée, réutilisable et facile à maintenir.

### Flux de Données Typique

1.  **Composant Vue** : Appelle une fonction d'un `composable` (ex: `fetchExpenses()` depuis `useExpenses`).
2.  **Composable** : Fait l'appel API via `axios` et met à jour son état (`isLoading`).
3.  **Plugin Axios** : Intercepte la requête pour y ajouter le token.
4.  **Composable** : Reçoit la réponse, et met à jour son état réactif (ex: `expenses.value = ...`).
5.  **Composant Vue** : La réactivité de Vue met automatiquement à jour l'interface avec les nouvelles données.
