<template>
  <div class="library-page">
    <div class="library-header">
      <h1 class="page-title">📚 我的书库</h1>
      <p class="subtitle">已购买的文章</p>
    </div>

    <LoadingSpinner :show="loading" text="加载中..." />

    <div v-if="!loading && purchases.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>还没有购买任何文章</p>
      <router-link to="/" class="browse-link">去逛逛 →</router-link>
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
            <span class="purchase-amount">¥{{ (p.amount / 100).toFixed(2) }}</span>
            <span class="meta-divider"></span>
            <time>{{ formatDate(p.created_at) }}</time>
          </div>
        </div>
        <span class="read-btn">阅读 →</span>
      </article>
    </div>

    <div class="account-section">
      <button class="delete-account-btn" @click="handleDeleteAccount" :disabled="deleting">
        {{ deleting ? '注销中...' : '注销账号' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePurchasesStore } from '@/stores/purchases'
import { useReaderAuthStore } from '@/stores/readerAuth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const purchasesStore = usePurchasesStore()
const authStore = useReaderAuthStore()
const loading = ref(true)
const purchases = ref([])
const deleting = ref(false)

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  await purchasesStore.fetchPurchases()
  purchases.value = purchasesStore.purchases
  loading.value = false
})

async function handleDeleteAccount() {
  if (!confirm('确定要注销账号吗？此操作不可撤销，所有购买记录将被删除。')) return
  deleting.value = true
  try {
    await authStore.deleteAccount()
    router.push('/')
  } catch (err) {
    alert(err.response?.data?.error || '注销失败')
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.library-page {
  padding: 1rem 0;
}

.library-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 0.3rem;
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.purchase-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.purchase-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
}

.purchase-item:hover {
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.purchase-info h3 {
  margin: 0 0 0.4rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.purchase-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.purchase-amount {
  font-weight: 600;
  color: var(--color-accent);
}

.meta-divider {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-text-muted);
}

.read-btn {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.92rem;
  transition: all var(--transition);
}

.purchase-item:hover .read-btn {
  transform: translateX(4px);
}

.empty-state {
  text-align: center;
  padding: 5rem 1rem;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.browse-link {
  color: var(--color-primary);
  font-weight: 500;
  font-size: 0.95rem;
}

.account-section {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border-light);
  text-align: center;
}

.delete-account-btn {
  padding: 0.5rem 1.5rem;
  background: none;
  border: 1px solid var(--color-error);
  color: var(--color-error);
  border-radius: var(--radius);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition);
}

.delete-account-btn:hover {
  background: var(--color-error);
  color: #fff;
}

@media (max-width: 768px) {
  .purchase-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
    padding: 1rem;
  }
  .page-title {
    font-size: 1.5rem;
  }
}
</style>