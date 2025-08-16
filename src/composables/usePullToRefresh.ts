import { ref, onMounted, onUnmounted } from 'vue'

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const isRefreshing = ref(false)
  const pullDistance = ref(0)
  const startY = ref(0)
  const containerRef = ref<HTMLElement>()

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing.value) {
      startY.value = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing.value && startY.value > 0) {
      const currentY = e.touches[0].clientY
      const distance = currentY - startY.value
      
      if (distance > 0) {
        pullDistance.value = Math.min(distance * 0.5, 100)
      }
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance.value > 60 && !isRefreshing.value) {
      isRefreshing.value = true
      await onRefresh()
      
      setTimeout(() => {
        isRefreshing.value = false
      }, 500)
    }
    
    pullDistance.value = 0
    startY.value = 0
  }

  const setupPullToRefresh = () => {
    const container = containerRef.value
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true })
      container.addEventListener('touchmove', handleTouchMove, { passive: true })
      container.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
  }

  const cleanupPullToRefresh = () => {
    const container = containerRef.value
    if (container) {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }

  onMounted(setupPullToRefresh)
  onUnmounted(cleanupPullToRefresh)

  return {
    isRefreshing,
    pullDistance,
    containerRef,
    setupPullToRefresh,
    cleanupPullToRefresh
  }
}