<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, LineController, Title, Tooltip, Legend, TimeScale } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { useHistorique } from '@/composables/useHistorique'
import { useUsers } from '@/composables/useUsers'
import type { User } from '@/types/api'
import PullToRefresh from '@/components/PullToRefresh.vue'

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, Title, Tooltip, Legend, TimeScale)

const { historique, loading, error, fetchHistorique } = useHistorique()
const { users, fetchUsers } = useUsers()
const chartRef = ref<HTMLCanvasElement>()
const chartInstance = ref<Chart>()

const chartData = computed(() => {
  if (!historique.value || Object.keys(historique.value).length === 0) {
    return null
  }

  const dates = Object.keys(historique.value).sort().reverse()
  const userIds = new Set<string>()

  dates.forEach(date => {
    Object.keys(historique.value[date]).forEach(userId => {
      userIds.add(userId)
    })
  })

  const datasets = Array.from(userIds).map((userId, index) => {
    const user = users.value.find((u: User) => u['@id'] === userId)
    const userName = user?.username || `User ${userId}`

    const data = dates.map(date => historique.value[date][userId] || 0)

    // Palette de couleurs distinctes
    const colors = [
      '#3B82F6', // blue-500
      '#EF4444', // red-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#8B5CF6', // violet-500
      '#EC4899', // pink-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
      '#6366F1', // indigo-500
      '#14B8A6', // teal-500
      '#EAB308'  // yellow-500
    ]

    const color = colors[index % colors.length]

    return {
      label: userName,
      data: data,
      borderColor: color,
      backgroundColor: color + '20', // Ajoute une transparence
      tension: 0.1,
      borderWidth: 2,
      pointStyle: 'none',
      pointRadius: 1
    }
  })

  return {
    labels: dates,
    datasets
  }
})

const createChart = () => {
  if (!chartRef.value || !chartData.value) return

  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  chartInstance.value = new Chart(chartRef.value, {
    type: 'line',
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: false,
          text: 'Évolution des soldes'
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      indexAxis: 'y',
      scales: {
        x: {
          // type: 'logarithmic',
          position: 'top',
          title: {
            display: false,
            text: 'Solde (€)'
          }
        },
        y: {
          title: {
            display: false,
            text: 'Date'
          }
        }
      }
    }
  })
}

const handlePullToRefresh = async () => {
  await Promise.all([
    fetchHistorique(),
    fetchUsers()
  ])
}

onMounted(async () => {
  await Promise.all([
    fetchHistorique(),
    fetchUsers()
  ])

  if (chartData.value) {
    createChart()
  }
})
</script>

<template>
  <PullToRefresh :on-refresh="handlePullToRefresh">
    <div class="space-y-6">
      <div>
        <div>
          <h1 class="text-lg font-medium text-gray-900 mb-4">Historique des soldes</h1>

          <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-2 text-gray-600">Chargement...</span>
          </div>

          <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="text-red-800 text-sm">{{ error }}</div>
          </div>

          <div v-else-if="!chartData" class="text-center text-gray-500 py-8">
            Aucune donnée d'historique disponible
          </div>

          <div v-else :style="{ height: `${Math.max(400, Object.keys(historique).length * 25)}px` }">
            <canvas ref="chartRef"></canvas>
          </div>
        </div>
      </div>
    </div>
  </PullToRefresh>
</template>
