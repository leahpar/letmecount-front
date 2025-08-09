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
        participantData.value[userId] = { parts: 1, montant: 0, manualMontant: false }
      }
    } else {
      delete participantData.value[userId]
    }
    updateFormDetails()
    calculateAmounts()
  }

  const updateParticipantParts = (userId: string, parts: number) => {
    if (participantData.value[userId]) {
      participantData.value[userId].parts = parts
      updateFormDetails()
      calculateAmounts()
    }
  }

  const updateParticipantMontant = (userId: string, montant: number) => {
    if (participantData.value[userId]) {
      participantData.value[userId].montant = montant
      participantData.value[userId].manualMontant = true
      updateFormDetails()
      calculateAmounts()
    }
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
      
      const manualParticipants = checkedParticipants.filter(
        userId => participantData.value[userId]?.manualMontant
      )
      
      const autoParticipants = checkedParticipants.filter(
        userId => !participantData.value[userId]?.manualMontant
      )
      
      const totalManualMontant = manualParticipants.reduce(
        (sum, userId) => sum + (participantData.value[userId]?.montant || 0), 0
      )
      
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
    })
  }

  const resetManualMontants = () => {
    Object.keys(participantData.value).forEach(userId => {
      participantData.value[userId].manualMontant = false
    })
    calculateAmounts()
  }

  // Watchers
  watch([() => formData.value.montant, () => formData.value.details], calculateAmounts, { deep: true })
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