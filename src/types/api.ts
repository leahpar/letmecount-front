export interface User {
  '@id': string
  id: number
  username: string
  solde: number
  tags: string[]
  roles: string[]
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
