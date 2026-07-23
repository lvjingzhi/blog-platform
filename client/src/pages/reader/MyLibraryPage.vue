<template>
  <div class="library-page">
    <h1 class="page-title">📚 我的书库</h1>
    <p class="subtitle">已购买的文章</p>

    <LoadingSpinner :show="loading" text="加载中..." />

    <div v-if="!loading && purchases.length === 0" class="empty-state">
      <p>📭 还没有购买任何文章</p>
      <router-link to="/">去逛逛</router-link>
    </div>

    <div v-if="!loading && purchases.length > 0" class="purchase-list">
      <article
        v-for="p in purchases"
        :key="p.id"
        class="purchase-item"
        @click="$router.push(`/post/${p.post_slug}`)"
      >
        <div class="purchase-info">
          <h3>{{ p.post_title }}</h3>
          <div class="purchase-meta">
            <span>¥{{ (p.amount / 100).toFixed(2) }}</span>
            <time>{{ formatDate(p.created_at) }}</time>
          </div>
        </div>
        <span class="read-btn">阅读 →</span>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePurchasesStore } from '@/stores/purchases'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const purchasesStore = usePurchasesStore()
const loading = ref(true)
const purchases = ref([])

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  await purchasesStore.fetchPurchases()
  purchases.value = purchasesStore.purchases
  loading.value = false
})
</script>

<style scoped>
.library-page { padding: 1rem 0; }
.page-title { font-size: 1.8rem; color: #1a1a2e; margin-bottom: 0.3rem; }
.subtitle { color: #888; margin-bottom: 2rem; }
.purchase-list { display: flex; flex-direction: column; gap: 0.8rem; }
.purchase-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.purchase-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.purchase-info h3 { margin: 0 0 0.4rem; font-size: 1.1rem; color: #1a1a2e; }
.purchase-meta { display: flex; gap: 1rem; color: #999; font-size: 0.85rem; }
.read-btn { color: #2563eb; font-weight: 500; }
.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: #999;
}
.empty-state a { color: #2563eb; }
</style>