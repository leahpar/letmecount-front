# claude_notes.md

Fichier de travail réservé à Claude. Non destiné à la doc projet (voir `doc-technique.md` pour ça).
Dernière mise à jour : 2026-07-27.

---

## Chantier en cours : passkeys (WebAuthn)

### État : **API et front terminés** (2026-07-27, non commités). Reste la validation sur device réel.

### Décisions actées par le user

| Sujet | Décision |
|---|---|
| Périmètre | front **et** API (`../api`, repo git séparé) |
| Mot de passe | **à supprimer** une fois les passkeys en place |
| Code à 6 chiffres | **à garder tel quel** (géré par l'admin, accès DB) — voie de secours |
| Durcissement du code | rate limiter uniquement (fait), pas d'expiration ni de rotation |

### Architecture d'auth actuelle (point de départ)

3 voies convergeant toutes vers `{token, refresh_token}` :

1. ~~`POST /auth` — username/mdp~~ **supprimé côté API**, `LoginView.vue` reste à retirer côté front
2. `GET /auth/{token}` — code 6 chiffres usage unique, `SecurityController` → `WelcomeView.vue` (saisie) et `LoginLinkView.vue` (`?token=`)
3. `POST /auth/refresh` — gesdinet, `single_use: true`, TTL 1 an → intercepteur axios
4. **`POST /auth/webauthn/login/options` puis `/auth/webauthn/login`** — passkey, sort le même `{token, refresh_token}`

Front : `useAuth.ts` (state module-level, `localStorage`), `plugins/axios.ts` (Bearer + refresh avec file d'attente), `router/authGuard.ts` (whitelist de routes publiques).

**Le point clé** : le passkey n'est qu'une 4ᵉ source du même couple de tokens. `useAuth`, l'intercepteur axios et le guard n'ont pas à bouger.

### Plan d'implémentation

#### API (`../api`) — FAIT

- [x] `composer require web-auth/webauthn-symfony-bundle --ignore-platform-req=php` → **5.3.5**. Attention, le paquet ne s'appelle **pas** `webauthn-bundle`. Recette Flex ignorée (`allow-contrib: false`) → bundle enregistré à la main dans `config/bundles.php` et routes importées à la main dans `config/routes.yaml` (`type: webauthn`).
- [x] `src/Entity/WebauthnCredential.php` étend `Webauthn\CredentialRecord`. **Piège majeur** : le bundle déclare déjà `CredentialRecord` en `<mapped-superclass>` XML (`Resources/config/doctrine-mapping/CredentialRecord.orm.xml`). Il ne faut **surtout pas** redéclarer ses champs dans l'entité, sinon `Duplicate definition of column`. On n'ajoute que `id`, `user`, `name`, `createdAt`, `lastUsedAt`.
- [x] `src/Repository/WebauthnCredentialRepository.php` — doit implémenter `PublicKeyCredentialSourceRepositoryInterface` (déprécié mais le bundle 5.3 crée encore l'alias DI vers lui) **et** `CanSaveCredentialRecord`. `saveCredentialRecord()` sert au premier enregistrement *et* à chaque connexion (compteur anti-clonage) : d'où le test `instanceof WebauthnCredential` pour distinguer les deux cas.
- [x] `src/Repository/WebauthnUserEntityRepository.php` — pont `User` ↔ `PublicKeyCredentialUserEntity`. **userHandle = l'id numérique**, pas le username (stable si le username change).
- [x] Migrations `Version20260727135233` (table) et `Version20260727135854` (drop password). Les lignes parasites sur la table `log` générées par `migrations:diff` ont été retirées (dérive préexistante entité/base, hors sujet).
- [x] `config/packages/webauthn.yaml` — `rp.id` et `allowed_origins` par env. **`allowed_origins` est indispensable** : front et API sont sur deux domaines, le validateur ne peut donc pas se fier au host de la requête.
- [x] **`public_key_credential_parameters` doit être renseigné explicitement** (ES256 `-7`, RS256 `-257`, EdDSA `-8`) : le bundle le laisse à `[]` par défaut, le profil annonçait donc `pubKeyCredParams: []` aux authentificateurs. Rien ne le signale côté serveur — repéré en inspectant les options réelles dans le navigateur.
- [x] `options_storage` = `CacheStorage` sur un pool dédié `app.webauthn.cache` (TTL 300 s). Le `SessionStorage` par défaut est inutilisable : le firewall est stateless.
- [x] Firewall `webauthn:` avec `success_handler: lexik_jwt_authentication.handler.authentication_success` → même JSON que l'ancien `/auth`, gesdinet ajoute le refresh token. `registration: enabled: false`.
- [x] **Enrôlement via `webauthn.controllers.creation`, pas via la `registration` du firewall.** Celle du firewall utilise `RequestBodyUserEntityGuesser` (l'utilisateur vient du corps de la requête) → n'importe qui pourrait enrôler un passkey sur le compte d'un autre. On utilise `CurrentUserEntityGuesser` + `access_control` `^/auth/webauthn/register` en `IS_AUTHENTICATED_FULLY`, **placé avant** la règle `^/auth` (première règle qui matche gagne).
- [x] Suppression du mdp : `POST /auth`, bloc `api_platform` de lexik, colonne `password`, `PasswordAuthenticatedUserInterface`, `PasswordUpgraderInterface` sur `UserRepository`, champ `password` du DTO. `password_hashers` a dû être **conservé mais restreint à `InMemoryUser`** : le firewall du profiler utilise encore un mot de passe.
- [x] `GET /auth/{token}` a reçu `requirements: ['token' => '\d{6}']` pour ne pas capter les nouvelles routes `/auth/*`.
- [x] `tests/Api/AuthenticatedApiTestCase.php` : `loginUser()` émet désormais le JWT directement via `JWTTokenManagerInterface` au lieu de poster sur `/auth`.
- [x] `tests/Api/WebauthnTest.php` : 5 tests d'endpoint, dont celui qui vérifie le 401 sur `/auth/webauthn/register/options` sans JWT.
- [x] `make doc` régénéré.

##### Contrat d'API pour le front

| Route | Méthode | Auth | Rôle |
|---|---|---|---|
| `/auth/webauthn/login/options` | POST | publique | challenge de connexion (corps `{}`) |
| `/auth/webauthn/login` | POST | publique | renvoie `{token, refresh_token}` |
| `/auth/webauthn/register/options` | POST | **JWT requis** | challenge d'enrôlement (corps `{}`) |
| `/auth/webauthn/register` | POST | **JWT requis** | enregistre le passkey |
| `/passkeys` | GET | JWT | liste « Mes appareils » |
| `/passkeys/{id}` | PATCH | JWT | renommer (`name`) |
| `/passkeys/{id}` | DELETE | JWT | supprimer |

Les deux routes `/options` attendent un corps JSON (au minimum `{}`) et `Content-Type: application/json`.

#### Front — FAIT

- [x] `npm i @simplewebauthn/browser` → **13.3.0**. API v13 : `startRegistration({ optionsJSON })` / `startAuthentication({ optionsJSON })`, l'objet englobant est obligatoire.
- [x] `composables/useWebauthn.ts` — `loginWithPasskey()` et `registerPasskey()`. **Les 4 routes WebAuthn exigent `Content-Type: application/json`** et un corps JSON (au minimum `{}`) : le check est dans les `ProfileBased*OptionsBuilder` pour `/options` et dans les `*ResponseController` pour les résultats.
- [x] **LA cause du 400 `Only JSON content type allowed` (2026-07-27) : un doublon `src/plugins/axios.js` traînait à côté de `axios.ts`.** La conversion en TS avait supprimé le `.js`, mais la suppression n'est pas passée dans le commit et le fichier est revenu. Vite résout un import sans extension avec `.js` **avant** `.ts` : l'application chargeait donc `/src/plugins/axios.js`, c'est-à-dire l'intercepteur d'origine, et **aucune** correction apportée à `axios.ts` n'était exécutée. Supprimé via `git rm`. **Si un comportement corrigé persiste sans explication, vérifier d'abord `ls src/**/` à la recherche d'un doublon `.js`/`.ts`.**
- [x] Corollaire : le serveur de dev Vite garde sa résolution en cache. Après suppression du doublon, **il faut redémarrer `npm run dev`** — sinon il continue de servir `/src/plugins/axios.js`.
- [x] `plugins/axios.ts` — l'intercepteur force `application/json` sur toute URL commençant par `/auth/webauthn`, règle portée sur l'URL plutôt que laissée à l'appelant. `useWebauthn` n'a donc aucun en-tête à poser. Les autres routes gardent `application/ld+json` / `application/merge-patch+json`.
- [x] `messageFor` lit `errorMessage` **et** `message` : le bundle WebAuthn renvoie ses erreurs dans `errorMessage`, ce qui masquait la vraie cause derrière un message générique.
- [x] Dans `useWebauthn`, l'abandon utilisateur (`NotAllowedError`/`AbortError`, Échap ou annulation de Face ID) est traité comme un non-événement : pas de message d'erreur.
- [x] `composables/usePasskeys.ts` — liste/renommage/suppression. La collection API Platform 4 arrive sous **`response.data.member`** (vérifié en réel), pas `hydra:member`.
- [x] `components/PasskeyManager.vue` — « Mes appareils » : liste, suppression, bouton d'enrôlement. Monté dans la colonne gauche de `ProfileView` (= « Mon compte » dans la nav).
- [x] `views/LoginView.vue` **entièrement réécrit** : bouton passkey en primaire + champ code à 6 chiffres en secours. Le formulaire username/mot de passe a disparu.
- [x] `views/WelcomeView.vue` : ajout d'une étape 3 avec un lien vers `/login`.
- [x] `router/authGuard.ts` : un non-authentifié va sur `login` (et non plus `welcome`).
- [x] `views/CredentialsView.vue` : champ mot de passe retiré, la page ne sert plus qu'à choisir son username.
- [x] `types/api.ts` : `Passkey` ajouté, `password` retiré de `UpdateCredentialsDto`.

##### Écart assumé par rapport au plan initial

Le plan prévoyait de **supprimer** `LoginView` et la route `login`, la saisie du code vivant dans `WelcomeView`. Entre-temps `WelcomeView` est devenue une page de présentation pure (commit `d84ad0b`), qui n'a plus aucun moyen de connexion. `LoginView` a donc été **conservée et reconvertie** en page de connexion unique (passkey + code) plutôt que supprimée — sinon plus aucune porte d'entrée dans l'application. Le guard et `useAuth.redirectToLogin()` pointent donc toujours sur `/login`, ce qui reste cohérent.

### Reste à faire

Rien côté code. **Le test sur device réel est le seul point ouvert** (voir « Le vrai risque » ci-dessous).

### Le vrai risque — TOUJOURS OUVERT

Le test réel **sur iOS en PWA installée** (mode standalone). C'est là que WebAuthn réserve ses surprises et **ça ne se teste pas depuis le desktop**. Rien de la cérémonie elle-même (Face ID, création et signature du passkey) n'a pu être vérifié ici : seuls les échanges HTTP l'ont été (challenge émis, 401 sur l'enrôlement anonyme, forme de la collection `/passkeys`). Prévoir une passe sur device avant de considérer le chantier fini.

Second point de vigilance : un passkey vit dans un trousseau iCloud/Google. Changement d'écosystème ou refus de sauvegarde cloud → l'user est dehors. D'où le maintien du code à 6 chiffres.

---

## Fait le 2026-07-27 (hors passkeys, non commité)

Corrections demandées suite au bilan de l'auth :

- `plugins/axios.js` + `axios.d.ts` → **`plugins/axios.ts`** ; `router/authGuard.js` + `authGuard.d.ts` → **`router/authGuard.ts`**. Les `.d.ts` déclaraient les types à la main, donc `vue-tsc` ne vérifiait jamais l'implémentation. Au passage : typage de `failedQueue`, garde `error.response?.status`, `console.log("toto")` supprimé.
- `authGuard` : redirige un non-authentifié vers `welcome` (et non plus `login_link`, qui exige un `?token=` et affichait donc « Token manquant »). Utilise maintenant `useAuth().isAuthenticated` au lieu de lire `localStorage` en direct.
- API : rate limiter sur `GET /auth/{token}` — `config/packages/rate_limiter.yaml` (limiter `auth_code`, sliding window, 10 tentatives / 15 min par IP) + consommation dans `SecurityController`, avec `reset()` quand le code est valide. `symfony/rate-limiter` ajouté au `composer.json`.

Écartés par le user, ne pas y revenir :

- Erreur réseau sans `response` dans l'intercepteur → la PWA ne gère pas le hors-ligne de toute façon (la garde `?.` a quand même été ajoutée en convertissant le fichier)
- Le front ne rappelle jamais `/auth/logout` → les refresh tokens sont révoqués à l'utilisation côté API

---

## Environnement à configurer en prod

`api/.env` porte les valeurs de dev ; la prod doit surcharger dans `.env.local` sur le serveur (même convention que `CORS_ALLOW_ORIGIN`) :

```
WEBAUTHN_RP_ID=letmecount.lasoireefille.fr
WEBAUTHN_ALLOWED_ORIGIN=https://letmecount.lasoireefille.fr
```

**Sans ça, aucun passkey ne fonctionnera en production** (le rpId `localhost` sera rejeté par le navigateur).

## Pièges de l'environnement (vérifiés le 2026-07-27)

- **Composer** : PHP local en 8.5.8, mais le `composer.lock` de l'API a été construit sous un PHP plus ancien (`lcobucci/clock`, tiré par lexik, plafonne à 8.4). **Tout `composer require` doit passer `--ignore-platform-req=php`**, sinon il échoue à résoudre.
- **`make tests` (API) est cassé d'origine** : 11 erreurs / 20 échecs sur 38, schéma de base de test désynchronisé (`tag_id cannot be null`) et `User::setConjoint()` inexistante. Même `tests/Api/AuthTest.php` échoue seul. **Ne pas partir en chasse** : comparer au baseline (`git stash -u` + re-run) plutôt que viser le vert.
- **`make stan` (API)** : 10 erreurs préexistantes dans `GenerateRandomExpensesCommand`, `CurrentUserProvider`, `GenerateTokenProvider`.
- Ce qui marche et vaut le coup côté API : `php bin/console lint:container`, `lint:yaml`, `debug:autowiring`.
- Front : `npm run type-check` et `npm run lint` passent au vert, s'y fier.
- **`api/phpstan.neon` est gitignoré.** Les deux `ignoreErrors` ajoutés pour `WebauthnCredentialRepository` (phpstan-doctrine ne lit pas les mappings XML du bundle et croit les champs hérités absents) sont donc **locaux** : à re-ajouter sur toute autre machine.
- Les tests d'API ont besoin d'un schéma à jour : lancer `make tests` (qui fait le `doctrine:schema:update`) plutôt que `phpunit` directement, sinon on récupère des erreurs de colonnes fantômes.
- État de la suite après le chantier API : **43 tests, 12 erreurs, 5 échecs**, tous préexistants (comparaison `git stash` faite, 0 régression, et 14 tests réparés au passage puisque leur authentification était cassée). phpstan : toujours 10 erreurs, toutes préexistantes.

## Domaines

| | Prod | Dev |
|---|---|---|
| Front | `letmecount.lasoireefille.fr` | `localhost:5173` |
| API | `letmecountapi.lasoireefille.fr` | `127.0.0.1:8888` |

Même domaine enregistrable, mais peu importe : le `rpId` suit l'origine du **front**.
