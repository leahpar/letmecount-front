import { computed, ref } from 'vue'
import axios from '@/plugins/axios'
import type { PushSubscriptionDevice } from '@/types/api'
import { handleApiError } from '@/utils/errorHandler'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

/**
 * applicationServerKey n'accepte pas le base64url de la clé VAPID, il lui faut
 * les octets bruts.
 */
const decodeVapidKey = (base64: string): Uint8Array => {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(padded)

  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)))
}

/**
 * Sur iOS, pushManager n'existe que dans une PWA installée sur l'écran
 * d'accueil : dans Safari, la case « notifications » n'a rien à proposer.
 */
const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches
  || (window.navigator as { standalone?: boolean }).standalone === true

/**
 * Abonnement du navigateur courant aux notifications push (Web Push / VAPID).
 */
export function useWebPush() {
  const devices = ref<PushSubscriptionDevice[]>([])
  const subscribed = ref(false)
  const loading = ref(false)
  const error = ref('')

  // Les trois causes d'indisponibilité sont distinctes, et n'appellent pas le
  // même message : navigateur sans les API, clé VAPID absente du build, ou iOS
  // pas encore installé.
  const hasPushApi = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  const isSupported = hasPushApi && !!VAPID_PUBLIC_KEY

  // Le service worker existe mais pas PushManager, hors mode installé : c'est la
  // signature de Safari iOS. Le dire, plutôt que d'afficher un interrupteur qui
  // ne peut pas fonctionner.
  const needsInstall = computed(
    () => 'serviceWorker' in navigator && !('PushManager' in window) && !isStandalone()
  )

  // Une permission refusée est définitive : le navigateur ne repropose plus sa
  // boîte de dialogue, il faut passer par ses réglages de site.
  const permissionDenied = computed(() => isSupported && Notification.permission === 'denied')

  const currentSubscription = async (): Promise<PushSubscription | null> => {
    const registration = await navigator.serviceWorker.ready
    return registration.pushManager.getSubscription()
  }

  /**
   * Envoie l'abonnement à l'API. À plat : l'API n'attend pas l'objet `keys`
   * imbriqué que produit le navigateur.
   */
  const save = async (subscription: PushSubscription): Promise<void> => {
    const json = subscription.toJSON()

    await axios.post('/push-subscriptions', {
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth
    })
  }

  const fetchDevices = async (): Promise<void> => {
    loading.value = true
    error.value = ''

    try {
      const response = await axios.get('/push-subscriptions')
      devices.value = response.data.member || []
    } catch (err: unknown) {
      error.value = handleApiError(err, 'le chargement des notifications')
    } finally {
      loading.value = false
    }
  }

  /**
   * À appeler au démarrage : le navigateur peut renouveler un endpoint sans
   * prévenir (pushsubscriptionchange n'est pas fiable, Safari ne l'implémente
   * pas), donc on repousse l'abonnement courant. L'API fait un upsert.
   */
  const refresh = async (): Promise<void> => {
    if (!isSupported || Notification.permission !== 'granted') {
      subscribed.value = false
      return
    }

    // Appelée sans await au montage de la vue : tout doit être rattrapé ici,
    // sinon un rejet finit en « Unhandled Promise Rejection » et laisse
    // `subscribed` incohérent.
    try {
      const subscription = await currentSubscription()
      subscribed.value = subscription !== null

      if (subscription) {
        await save(subscription)
      }
    } catch {
      subscribed.value = false
    }
  }

  /**
   * Doit être appelé depuis un geste de l'utilisateur : les navigateurs
   * refusent la demande de permission autrement.
   */
  const subscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      return false
    }

    loading.value = true
    error.value = ''

    try {
      if (await Notification.requestPermission() !== 'granted') {
        error.value = "Les notifications ont été refusées. Il faut les réautoriser dans les réglages du navigateur."
        return false
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        // Obligatoire : chaque message reçu affichera une notification.
        userVisibleOnly: true,
        applicationServerKey: decodeVapidKey(VAPID_PUBLIC_KEY)
      })

      await save(subscription)
      subscribed.value = true
      await fetchDevices()

      return true
    } catch (err: unknown) {
      error.value = handleApiError(err, "l'activation des notifications")
      return false
    } finally {
      loading.value = false
    }
  }

  const unsubscribe = async (): Promise<void> => {
    loading.value = true
    error.value = ''

    try {
      const subscription = await currentSubscription()
      const endpoint = subscription?.endpoint

      await subscription?.unsubscribe()
      subscribed.value = false

      const device = devices.value.find((candidate) => candidate.endpoint === endpoint)
      if (device) {
        await axios.delete(`/push-subscriptions/${device.id}`)
      }

      await fetchDevices()
    } catch (err: unknown) {
      error.value = handleApiError(err, "la désactivation des notifications")
    } finally {
      loading.value = false
    }
  }

  const deleteDevice = async (id: number): Promise<void> => {
    error.value = ''

    try {
      await axios.delete(`/push-subscriptions/${id}`)
      await fetchDevices()
      await refresh()
    } catch (err: unknown) {
      error.value = handleApiError(err, "la suppression de l'appareil")
    }
  }

  return {
    devices,
    subscribed,
    loading,
    error,
    isSupported,
    needsInstall,
    permissionDenied,
    fetchDevices,
    refresh,
    subscribe,
    unsubscribe,
    deleteDevice
  }
}
