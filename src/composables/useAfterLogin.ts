/**
 * Mémorise l'URL où revenir une fois la connexion faite.
 *
 * Elle sert au consentement OAuth : l'API y renvoie le navigateur avec les
 * paramètres du client MCP, et si l'utilisateur n'a pas de session, la
 * redirection vers /login les emporterait — le flow s'arrêterait là sans que
 * personne ne sache pourquoi.
 *
 * sessionStorage plutôt qu'un état en mémoire : la connexion Google et Apple
 * quitte l'onglet et y revient, ce qui remet l'application à zéro.
 */
const KEY = 'after_login_redirect'

export const rememberAfterLogin = (path: string): void => {
  try {
    sessionStorage.setItem(KEY, path)
  } catch {
    // sessionStorage refusé : on retombera sur le profil, comme avant.
  }
}

/** Rend l'URL mémorisée et l'oublie : elle ne vaut que pour cette connexion. */
export const takeAfterLogin = (): string | null => {
  try {
    const path = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
    return path
  } catch {
    return null
  }
}
