import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8888/',
});

// Intercepteur de REQUÊTE : ajoute le token JWT à chaque requête
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      originalRequest._retry = true; // On marque la requête pour éviter une boucle infinie

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Appel à l'API pour rafraîchir le token
          const { data } = await axios.post('/auth/refresh', {
            refresh_token: refreshToken
          });

          // Stocke le nouveau token et le nouveau refresh token
          localStorage.setItem('jwt_token', data.token);
          localStorage.setItem('refresh_token', data.refresh_token);

          // Met à jour l'en-tête de la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${data.token}`;

          // Rejoue la requête originale qui a échoué
          return instance(originalRequest);
        } catch (refreshError) {
          // Si le refresh échoue (token invalide ou expiré), déconnecte l'utilisateur
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login'; // Redirige vers la page de login
          return Promise.reject(refreshError);
        }
      } else {
        // Pas de refresh token, on redirige vers le login
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
