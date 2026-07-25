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

  // 创建支付宝订单，返回二维码链接
  async function createOrder(postId) {
    isProcessing.value = true
    error.value = null
    try {
      const { data } = await axios.post('/api/purchases/create-order', { post_id: postId })
      return data
    } catch (err) {
      error.value = err.response?.data?.error || '创建订单失败'
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  // 查询支付状态
  async function checkOrder(orderId) {
    try {
      const { data } = await axios.get(`/api/purchases/check-order/${orderId}`)
      return data
    } catch (err) {
      return null
    }
  }

  // 原有模拟支付（保留备用）
  async function purchasePost(postId) {
    isProcessing.value = true
    error.value = null
    try {
      const { data } = await axios.post('/api/purchases', { post_id: postId })
      await fetchPurchases()
      return data
    } catch (err) {
      if (err.response?.status === 409) {
        await fetchPurchases()
        return { success: true, alreadyPurchased: true }
      }
      error.value = err.response?.data?.error || 'Purchase failed'
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  return {
    purchases, isProcessing, error, purchasedPostIds, isPurchased,
    fetchPurchases, createOrder, checkOrder, purchasePost,
  }
})