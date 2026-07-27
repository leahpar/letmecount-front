# claude_notes.md

Fichier de travail réservé à Claude. Non destiné à la doc projet (voir `doc-technique.md` pour ça).
Dernière mise à jour : 2026-07-27.

---

## Chantier en cours : passkeys (WebAuthn)

### État : plan validé, implémentation **pas encore lancée** (en attente du feu vert)

### Décisions actées par le user

| Sujet | Décision |
|---|---|
| Périmètre | front **et** API (`../api`, repo git séparé) |
| Mot de passe | **à supprimer** une fois les passkeys en place |
| Code à 6 chiffres | **à garder tel quel** (géré par l'admin, accès DB) — voie de secours |
| Durcissement du code | rate limiter uniquement (fait), pas d'expiration ni de rotation |

### Architecture d'auth actuelle (point de départ)

3 voies convergeant toutes vers `{token, refresh_token}` :

1. `POST /auth` — username/mdp, lexik `api_platform.check_path` → `LoginView.vue` (à supprimer)
2. `GET /auth/{token}` — code 6 chiffres usage unique, `SecurityController` → `WelcomeView.vue` (saisie) et `LoginLinkView.vue` (`?token=`)
3. `POST /auth/refresh` — gesdinet, `single_use: true`, TTL 1 an → intercepteur axios

Front : `useAuth.ts` (state module-level, `localStorage`), `plugins/axios.ts` (Bearer + refresh avec file d'attente), `router/authGuard.ts` (whitelist de routes publiques).

**Le point clé** : le passkey n'est qu'une 4ᵉ source du même couple de tokens. `useAuth`, l'intercepteur axios et le guard n'ont pas à bouger.

### Plan d'implémentation

#### API (`../api`) — ~70 % de l'effort

- [ ] `composer require web-auth/webauthn-bundle --ignore-platform-req=php` (voir « Pièges » plus bas)
- [ ] Entité `WebauthnCredential` : ManyToOne vers `User`, + `name` et `createdAt` pour l'écran « Mes appareils ». Propriétés **publiques** (convention du repo API).
- [ ] Repository implémentant `PublicKeyCredentialSourceRepository` + mapping `User` ↔ `PublicKeyCredentialUserEntity` via `username`. **C'est la partie fastidieuse du bundle.**
- [ ] Migration Doctrine
- [ ] Config `rp.id` / `rp.name` par env : `localhost` en dev, `letmecount.lasoireefille.fr` en prod
- [ ] Firewall `api` : ajouter `webauthn:` avec `authentication.success_handler: lexik_jwt_authentication.handler.authentication_success`
- [ ] Routes sous `/auth/webauthn/*` → couvertes par le `access_control` `^/auth` existant ; **re-protéger explicitement les 2 routes d'enregistrement** (JWT requis), sinon n'importe qui enrôle un passkey sur n'importe quel compte
- [ ] Credentials discoverable : `residentKey: required`, `userVerification: required`
- [ ] Suppression du mdp : `POST /auth` (`api_login_check` dans `config/routes.yaml`), bloc `api_platform` de `lexik_jwt_authentication.yaml`, `password_hashers` dans `security.yaml`, colonne `password` + `PasswordAuthenticatedUserInterface` (`UserSecurityTrait`), et `'someuselessrandomstring'` dans `User::__construct`
- [ ] `UpdateCredentialsDto` / `UserCredentialsProcessor` : réduits au seul `username`
- [ ] `make doc` pour régénérer `openapi.json` (le Makefile le recopie dans `../front`)

#### Front — ~30 %

- [ ] `npm i @simplewebauthn/browser` (~5 ko ; gère base64url et les quirks navigateurs)
- [ ] `composables/useWebauthn.ts` : `register()` et `login()`, 2 appels HTTP chacun (options → cérémonie → result)
- [ ] `WelcomeView.vue` : bouton « Se connecter avec Face ID / empreinte » au-dessus du champ code, qui reste en second plan
- [ ] `ProfileView.vue` : proposition d'enrôlement après connexion par code + section « Mes appareils » (liste, suppression)
- [ ] Supprimer `LoginView.vue` et la route `login` ; retirer `'login'` de la whitelist du guard ; repointer `useAuth.redirectToLogin()` sur `/welcome`
- [ ] `CredentialsView.vue` : retirer le champ mot de passe (ne reste que le username)

### Charge estimée

~1 j côté API, ~2-3 h côté front.

### Le vrai risque

Le test réel **sur iOS en PWA installée** (mode standalone). C'est là que WebAuthn réserve ses surprises et **ça ne se teste pas depuis le desktop**. Prévoir une passe de validation sur device avant de considérer le chantier fini.

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

## Pièges de l'environnement (vérifiés le 2026-07-27)

- **Composer** : PHP local en 8.5.8, mais le `composer.lock` de l'API a été construit sous un PHP plus ancien (`lcobucci/clock`, tiré par lexik, plafonne à 8.4). **Tout `composer require` doit passer `--ignore-platform-req=php`**, sinon il échoue à résoudre.
- **`make tests` (API) est cassé d'origine** : 11 erreurs / 20 échecs sur 38, schéma de base de test désynchronisé (`tag_id cannot be null`) et `User::setConjoint()` inexistante. Même `tests/Api/AuthTest.php` échoue seul. **Ne pas partir en chasse** : comparer au baseline (`git stash -u` + re-run) plutôt que viser le vert.
- **`make stan` (API)** : 10 erreurs préexistantes dans `GenerateRandomExpensesCommand`, `CurrentUserProvider`, `GenerateTokenProvider`.
- Ce qui marche et vaut le coup côté API : `php bin/console lint:container`, `lint:yaml`, `debug:autowiring`.
- Front : `npm run type-check` et `npm run lint` passent au vert, s'y fier.

## Domaines

| | Prod | Dev |
|---|---|---|
| Front | `letmecount.lasoireefille.fr` | `localhost:5173` |
| API | `letmecountapi.lasoireefille.fr` | `127.0.0.1:8888` |

Même domaine enregistrable, mais peu importe : le `rpId` suit l'origine du **front**.
