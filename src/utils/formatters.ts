/**
 * Formate un montant en euros avec 2 décimales
 */
export const formatAmount = (amount: number): string => {
  return amount.toFixed(2)
}

/**
 * Formate une date au format français (ex: "15 janvier 2024")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formate l'impact d'une dépense sur le solde avec signe et symbole euro
 */
export const formatImpact = (impact: number): string => {
  if (impact === 0) {
    return '0.00€'
  }
  const sign = impact > 0 ? '+' : ''
  return `${sign}${impact.toFixed(2)}€`
}

/**
 * Formate une date pour le groupement dans les listes (ex: "15 janvier 2024")
 */
export const formatDateForGrouping = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}