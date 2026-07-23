import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const usePurchasesStore = defineStore('purchases', () => {
  const purchases = ref([])
  const isProcessing = ref(false)
  const error = ref(null)

  const purchasedPostIds = computed(() => {
    return new Set(purchases.value.map(p => p.post_id))
  })

  function isPurchased(postId) {
    return purchasedPostIds.value.has(postId)
  }

  async function fetchPurchases() {
    try {
      const { data } = await axios.get('/api/purchases/mine')
      purchases.value = data.purchases
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch purchases'
    }
  }

  async function purchasePost(postId) {
    isProcessing.value = true
    error.value = null
    try {
      const { data } = await axios.post('/api/purchases', { post_id: postId })
      // Refresh purchases list
      await fetchPurchases()
      return data
    } catch (err) {
      if (err.response?.status === 409) {
        // Already purchased - still refresh and treat as success
        await fetchPurchases()
        return { success: true, alreadyPurchased: true }
      }
      error.value = err.response?.data?.error || 'Purchase failed'
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  return { purchases, isProcessing, error, purchasedPostIds, isPurchased, fetchPurchases, purchasePost }
})