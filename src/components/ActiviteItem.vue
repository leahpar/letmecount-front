<template>
  <div class="p-2 flex justify-between items-center">
    <div class="flex-1 text-sm text-gray-900">
      <div class="flex items-center space-x-2">
        <div class="h-2 w-2 rounded-full flex-shrink-0" :class="getActionColor(log.action)"></div>
        <span>{{ formatActionMessage(log) }}</span>
      </div>
    </div>
    <div class="text-sm text-gray-500">
      {{ formatLeftSideDate(log.date) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Log } from '@/types/api'
import { useUsers } from '@/composables/useUsers'

interface Props {
  log: Log
}

defineProps<Props>()

const { getUsernameByIri } = useUsers()

const getActionColor = (action: string): string => {
  const colors: { [key: string]: string } = {
    'CREATE': 'bg-green-400',
    'UPDATE': 'bg-blue-400',
    'DELETE': 'bg-red-400',
    'TRANSFER': 'bg-yellow-400'
  }
  return colors[action] || 'bg-gray-400'
}

const formatLeftSideDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  // Si moins de 12h, afficher "il y a XXX"
  if (diffHours < 12) {
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "à l'instant"
    if (diffMins < 60) return `il y a ${diffMins} min`
    return `il y a ${diffHours}h`
  }

  // Sinon afficher "le d/m/Y à H:i"
  return `le ${date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })} à ${date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })}`
}

const formatActionMessage = (log: Log): string => {
  const username = getUsernameByIri(log.user)
  let action = ''

  switch (log.action) {
    case 'CREATE':
      action = 'a créé'
      break
    case 'UPDATE':
      action = 'a modifié'
      break
    case 'DELETE':
      action = 'a supprimé'
      break
    default:
      action = `a ${log.action.toLowerCase()}`
  }

  return `${username} ${action} "${log.libelle}"`
}
</script>
