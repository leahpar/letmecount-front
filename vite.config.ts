import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// Apple refuse localhost, les IP et les ports non standard comme Return URL
// d'un Services ID. Pour tester « Continuer avec Apple » en local, on sert donc
// le front sur le domaine de prod, redirigé vers 127.0.0.1 par /etc/hosts, en
// https sur 443 avec un certificat mkcert : `npm run dev:https`.
// C'est le mode Vite `https` qui déclenche tout ça, parce qu'il charge aussi
// .env.https, où le redirect_uri OAuth pointe sur ce même domaine.
// Voir api/doc/authentification-oauth.md, « Développer en https en local ».
const appleHost = 'letmecount.lasoireefille.fr'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  server: mode === 'https'
    ? {
        host: appleHost,
        port: 443,
        // Vite 7 rejette les Host headers inconnus.
        allowedHosts: [appleHost],
        https: {
          key: fs.readFileSync('./.certs/dev-key.pem'),
          cert: fs.readFileSync('./.certs/dev.pem'),
        },
      }
    : undefined,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
}))
