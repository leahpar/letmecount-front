import axios from 'axios';
import { useAuth } from '@/composables/useAuth';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Variables pour gérer le refresh de token unique
let isRefreshing = false;
let failedQueue = [];

// Fonction pour traiter la queue des requêtes en attente
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.originalRequest.headers.Authorization = `Bearer ${token}`;
      prom.resolve(instance(prom.originalRequest));
    }
  });
  
  failedQueue = [];
};

// Intercepteur de REQUÊTE : ajoute le token JWT et configure le Content-Type
instance.interceptors.request.use(
  (config) => {
    const { getToken } = useAuth();
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Utiliser JSON-LD pour les requêtes POST/PUT et JSON MERGE PATCH pour les requêtes PATCH
    if (config.data) {
      if (config.method?.toLowerCase() === 'patch') {
        config.headers['Content-Type'] = 'application/merge-patch+json';
      } else if (['post', 'put'].includes(config.method?.toLowerCase())) {
        config.headers['Content-Type'] = 'application/ld+json';
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de RÉPONSE : gère le rafraîchissement du token
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 et que ce n'est pas une tentative de refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      // Si un refresh est déjà en cours, mettre la requête en queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { getRefreshToken, setTokens, clearTokens, redirectToLogin } = useAuth();
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          // Appel à l'API pour rafraîchir le token
          const { data } = await axios.post(instance.defaults.baseURL + '/auth/refresh', {
            refresh_token: refreshToken
          });

          console.log("toto", data);

          // Stocke le nouveau token et le nouveau refresh token via useAuth
          setTokens(data.token, data.refresh_token);

          // Met à jour l'en-tête de la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${data.token}`;

          // Traiter la queue avec le nouveau token
          processQueue(null, data.token);
          
          // Remettre le flag à false
          isRefreshing = false;

          // Rejoue la requête originale qui a échoué
          return instance(originalRequest);
        } catch (refreshError) {
          // Si le refresh échoue, rejeter toutes les requêtes en queue
          processQueue(refreshError, null);
          isRefreshing = false;
          
          // Déconnecte l'utilisateur
          clearTokens();
          redirectToLogin();
          return Promise.reject(refreshError);
        }
      } else {
        // Pas de refresh token, rejeter toutes les requêtes en queue
        processQueue(new Error('No refresh token'), null);
        isRefreshing = false;
        
        // Redirige vers le login
        clearTokens();
        redirectToLogin();
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
