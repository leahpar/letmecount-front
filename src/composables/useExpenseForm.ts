import { ref, watch, computed } from 'vue'

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
        // Quand on décoche, retirer le flag manuel
        participantData.value[userId].manualMontant = false
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
        // Montant à 0 : décocher le participant et retirer le flag manuel
        participantCheckboxes.value[userId] = false
        participantData.value[userId].manualMontant = false
      } else {
        // Montant > 0 : cocher le participant et marquer comme manuel
        participantCheckboxes.value[userId] = true
        participantData.value[userId].manualMontant = true
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
      
      // Séparer les participants manuels des automatiques
      const manualParticipants = checkedParticipants.filter(
        userId => participantData.value[userId]?.manualMontant
      )
      
      const autoParticipants = checkedParticipants.filter(
        userId => !participantData.value[userId]?.manualMontant
      )
      
      // Mettre les parts à 0 pour tous les participants
      Object.keys(participantData.value).forEach(userId => {
        participantData.value[userId].parts = 0
        // Remettre à 0 les montants des participants non cochés (y compris manuels)
        if (!participantCheckboxes.value[userId]) {
          participantData.value[userId].montant = 0
          participantData.value[userId].manualMontant = false
        }
      })
      
      // Calculer le montant total des participants manuels
      const totalManualMontant = manualParticipants.reduce(
        (sum, userId) => sum + (participantData.value[userId]?.montant || 0), 0
      )
      
      // Répartir le reste équitablement sur les participants automatiques
      const remainingMontant = formData.value.montant - totalManualMontant
      
      if (autoParticipants.length > 0 && remainingMontant >= 0) {
        const equalShare = Number((remainingMontant / autoParticipants.length).toFixed(2))
        let totalDistributed = 0
        
        autoParticipants.forEach((userId, index) => {
          if (index === autoParticipants.length - 1) {
            const lastShare = Number((remainingMontant - totalDistributed).toFixed(2))
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
      } else if (formData.value.partage === 'montants') {
        // Si on passe en mode 'montants', remettre les parts à 0
        participantData.value[userId].parts = 0
      }
    })
    
    // Mettre à jour formData.details avec les nouvelles parts avant de recalculer
    updateFormDetails()
    calculateAmounts()
  }

  // Computed - Vérification de la validité du formulaire
  const isFormValid = computed(() => {
    return (
      formData.value.titre.trim() !== '' &&
      formData.value.montant > 0 &&
      formData.value.date !== '' &&
      formData.value.payePar !== '' &&
      formData.value.tag !== ''
    )
  })

  // Computed - Vérification de conformité de la répartition
  const isValidRepartition = computed(() => {
    if (formData.value.montant <= 0 || formData.value.details.length === 0) {
      return false
    }
    
    const totalMontants = formData.value.details.reduce((sum, detail) => sum + detail.montant, 0)
    // Tolérance de 0.01 pour les arrondis
    return Math.abs(totalMontants - formData.value.montant) <= 0.01
  })

  // Computed - Le formulaire complet est-il valide et prêt pour soumission
  const canSubmit = computed(() => {
    return isFormValid.value && isValidRepartition.value
  })

  const repartitionStatus = computed(() => {
    if (formData.value.montant <= 0) {
      return { valid: false, message: 'Veuillez saisir un montant' }
    }
    
    if (formData.value.details.length === 0) {
      return { valid: false, message: 'Veuillez sélectionner au moins un participant' }
    }
    
    const totalMontants = formData.value.details.reduce((sum, detail) => sum + detail.montant, 0)
    const difference = Math.abs(totalMontants - formData.value.montant)
    
    if (difference > 0.01) {
      return { 
        valid: false, 
        message: `Écart de ${difference.toFixed(2)}€ (total: ${totalMontants.toFixed(2)}€, attendu: ${formData.value.montant.toFixed(2)}€)` 
      }
    }
    
    return { valid: true, message: 'Répartition conforme' }
  })

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
    resetManualMontants,
    updateFormDetails,
    isFormValid,
    isValidRepartition,
    canSubmit,
    repartitionStatus
  }
}