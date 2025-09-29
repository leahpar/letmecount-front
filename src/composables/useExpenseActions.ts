import { useRouter } from 'vue-router'
import { useExpenseCache } from '@/composables/useExpenseCache'

interface DeleteExpenseOptions {
  redirectTo?: string
  refreshProfile?: boolean
}

export function useExpenseActions() {
  const router = useRouter()
  const { deleteExpense } = useExpenseCache()

  const confirmDeleteExpense = async (
    expenseId: string, 
    expenseTitle: string, 
    options: DeleteExpenseOptions = {}
  ): Promise<boolean> => {
    const { redirectTo = 'profile', refreshProfile = true } = options
    
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer la dépense "${expenseTitle}" ?\n\nCette action est irréversible.`
    )

    if (!confirmed) {
      return false
    }

    const success = await deleteExpense(expenseId)
    
    if (success) {
      // Redirection avec refresh optionnel
      if (refreshProfile && redirectTo === 'profile') {
        router.push({ name: redirectTo, query: { refresh: 'true' } })
      } else {
        router.push({ name: redirectTo })
      }
      
      return true
    } else {
      alert('Erreur lors de la suppression de la dépense')
      return false
    }
  }

  return {
    confirmDeleteExpense
  }
}