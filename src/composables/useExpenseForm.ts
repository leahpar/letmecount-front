import { ref, watch } from 'vue'

interface ExpenseDetail {
  user: string
  parts: number
  montant: number
}

interface ParticipantData {
  parts: number
  montant: number
  manualMontant: boolean
}

export function useExpenseForm() {
  const formData = ref({
    titre: '',
    montant: 0,
    date: new Date().toISOString().slice(0, 10),
    payePar: '',
    partage: 'parts' as 'parts' | 'montants',
    tag: '',
    details: [] as ExpenseDetail[]
  })

  const participantCheckboxes = ref<Record<string, boolean>>({})
  const participantData = ref<Record<string, ParticipantData>>({})

  const updateParticipant = (userId: string, checked: boolean) => {
    participantCheckboxes.value[userId] = checked
    
    if (checked) {
      if (!participantData.value[userId]) {
        if (formData.value.partage === 'parts') {
          participantData.value[userId] = { parts: 1, montant: 0, manualMontant: false }
        } else {
          participantData.value[userId] = { parts: 0, montant: 0, manualMontant: false }
        }
      } else {
        if (formData.value.partage === 'parts') {
          participantData.value[userId].parts = 1
        } else {
          participantData.value[userId].parts = 0
        }
      }
    } else {
      if (participantData.value[userId]) {
        participantData.value[userId].parts = 0
        participantData.value[userId].montant = 0
      }
    }
    updateFormDetails()
    calculateAmounts()
  }

  const updateParticipantParts = (userId: string, parts: number) => {
    if (!participantData.value[userId]) {
      participantData.value[userId] = { parts: 0, montant: 0, manualMontant: false }
    }
    
    participantData.value[userId].parts = parts
    
    // Si les parts sont mises à 0, décocher le participant et mettre le montant à 0
    if (parts === 0) {
      participantCheckboxes.value[userId] = false
      participantData.value[userId].montant = 0
    } else {
      // Si les parts sont > 0, cocher le participant
      participantCheckboxes.value[userId] = true
    }
    
    updateFormDetails()
    calculateAmounts()
  }

  const updateParticipantMontant = (userId: string, montant: number) => {
    if (!participantData.value[userId]) {
      participantData.value[userId] = { parts: 0, montant: 0, manualMontant: false }
    }
    
    participantData.value[userId].montant = montant
    
    if (formData.value.partage === 'montants') {
      if (montant === 0) {
        // Montant à 0 : décocher le participant
        participantCheckboxes.value[userId] = false
      } else {
        // Montant > 0 : cocher le participant
        participantCheckboxes.value[userId] = true
        // Pour l'instant, pas de gestion manuelle, on recalcule équitablement
        participantData.value[userId].manualMontant = false
      }
    } else {
      // En mode parts, on garde la logique manuelle
      participantData.value[userId].manualMontant = true
    }
    
    updateFormDetails()
    calculateAmounts()
  }

  const updateFormDetails = () => {
    formData.value.details = Object.entries(participantData.value)
      .filter(([userId]) => participantCheckboxes.value[userId])
      .map(([userId, data]) => ({
        user: userId,
        parts: data.parts,
        montant: data.montant
      }))
  }

  const calculateAmounts = () => {
    if (formData.value.montant <= 0 || formData.value.details.length === 0) {
      return
    }

    if (formData.value.partage === 'parts') {
      const totalParts = formData.value.details.reduce((sum, detail) => sum + (detail.parts || 0), 0)
      if (totalParts > 0) {
        let totalDistributed = 0
        formData.value.details.forEach((detail, index) => {
          if (index === formData.value.details.length - 1) {
            const calculatedMontant = Number((formData.value.montant - totalDistributed).toFixed(2))
            detail.montant = calculatedMontant
            participantData.value[detail.user].montant = calculatedMontant
          } else {
            const calculatedMontant = Number((formData.value.montant * detail.parts / totalParts).toFixed(2))
            detail.montant = calculatedMontant
            participantData.value[detail.user].montant = calculatedMontant
            totalDistributed += calculatedMontant
          }
        })
      }
    } else if (formData.value.partage === 'montants') {
      const checkedParticipants = Object.keys(participantData.value).filter(
        userId => participantCheckboxes.value[userId]
      )
      
      // Mettre les montants à 0 et parts à 0 pour tous les participants d'abord
      Object.keys(participantData.value).forEach(userId => {
        participantData.value[userId].parts = 0
        if (!participantCheckboxes.value[userId]) {
          participantData.value[userId].montant = 0
        }
      })
      
      // Répartition équitable pour tous les participants cochés
      if (checkedParticipants.length > 0) {
        const equalShare = Number((formData.value.montant / checkedParticipants.length).toFixed(2))
        let totalDistributed = 0
        
        checkedParticipants.forEach((userId, index) => {
          if (index === checkedParticipants.length - 1) {
            const lastShare = Number((formData.value.montant - totalDistributed).toFixed(2))
            participantData.value[userId].montant = lastShare
          } else {
            participantData.value[userId].montant = equalShare
            totalDistributed += equalShare
          }
        })
      }
      
      updateFormDetails()
    }
  }

  const initializeParticipants = (users: { '@id': string }[]) => {
    users.forEach(user => {
      participantCheckboxes.value[user['@id']] = false
      participantData.value[user['@id']] = { parts: 0, montant: 0, manualMontant: false }
    })
  }

  const resetManualMontants = () => {
    Object.keys(participantData.value).forEach(userId => {
      participantData.value[userId].manualMontant = false
      
      // Si on passe en mode 'parts', initialiser les parts à 1 pour les participants cochés
      if (formData.value.partage === 'parts' && participantCheckboxes.value[userId]) {
        participantData.value[userId].parts = 1
      }
    })
    calculateAmounts()
  }

  // Watchers
  watch(() => formData.value.montant, calculateAmounts)
  watch(() => formData.value.partage, resetManualMontants)

  return {
    formData,
    participantCheckboxes,
    participantData,
    updateParticipant,
    updateParticipantParts,
    updateParticipantMontant,
    calculateAmounts,
    initializeParticipants,
    resetManualMontants
  }
}