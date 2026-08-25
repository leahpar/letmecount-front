export interface User {
  '@id': string
  id: number
  username: string
  solde: number
  soldeIndividuel: number
  tags: string[]
  roles: string[]
  conjoint?: string
}

export interface Tag {
  '@id': string
  id: number
  libelle: string
  users: string[]
}

export interface ExpenseDetail {
  user: string
  parts: number
  montant: number
}

export interface Expense {
  '@id': string
  id?: number
  titre: string
  montant: number
  date: string
  partage: 'parts' | 'montants'
  payePar: string
  details?: ExpenseDetail[]
  tag?: string
}

export interface CreateExpenseData {
  details: ExpenseDetail[]
  date: string
  montant: number
  titre: string
  partage: 'parts' | 'montants'
  tag?: string
  payePar: string
}

export interface ParticipantData {
  parts: number
  montant: number
  manualMontant: boolean
}

export interface Passkey {
  '@id': string
  id: number
  name: string
  createdAt: string
  lastUsedAt: string | null
}

/**
 * Un navigateur abonné aux notifications push. L'endpoint sert au front à
 * reconnaître, dans la liste, l'appareil sur lequel il tourne.
 */
export interface PushSubscriptionDevice {
  '@id': string
  id: number
  endpoint: string
  deviceName: string
  createdAt: string
}

/**
 * Une session ouverte : un navigateur, un téléphone, ou un client MCP autorisé.
 * `label` est nul pour les sessions ouvertes avant l'arrivée des libellés ;
 * elles en reçoivent un à leur prochain renouvellement.
 */
export interface Session {
  '@id': string
  id: number
  label: string | null
  createdAt: string | null
}

export interface CreateTagData {
  libelle: string;
  users: string[];
}

export interface Log {
  '@id': string
  id: number
  date: string
  action: string
  user: string
  depense?: string
  libelle: string
  montant?: number
}
