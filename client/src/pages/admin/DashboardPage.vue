<template>
  <div class="dashboard">
    <h1>📊 仪表盘</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalPosts }}</div>
        <div class="stat-label">文章总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.publishedPosts }}</div>
        <div class="stat-label">已发布</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.draftPosts }}</div>
        <div class="stat-label">草稿</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalPurchases }}</div>
        <div class="stat-label">购买次数</div>
      </div>
    </div>
    <div class="quick-actions">
      <router-link to="/admin/posts/new" class="action-btn">✏️ 写新文章</router-link>
      <router-link to="/admin/posts" class="action-btn">📄 管理文章</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref({ totalPosts: 0, publishedPosts: 0, draftPosts: 0, totalPurchases: 0 })

onMounted(async () => {
  try {
    const { data: postsData } = await axios.get('/api/admin/posts', { params: { limit: 1000 } })
    stats.value.totalPosts = postsData.total
    stats.value.publishedPosts = postsData.posts.filter(p => p.is_published).length
    stats.value.draftPosts = postsData.posts.filter(p => !p.is_published).length
  } catch { /* ignore */ }

  try {
    const { data: purchasesData } = await axios.get('/api/purchases/_all_')
    stats.value.totalPurchases = Array.isArray(purchasesData.purchases) ? purchasesData.purchases.length : 0
  } catch { /* ignore */ }
})
</script>

<style scoped>
.dashboard h1 { margin-bottom: 1.5rem; color: #1a1a2e; }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  border: 1px solid #eee;
}
.stat-value { font-size: 2rem; font-weight: 700; color: #2563eb; }
.stat-label { color: #888; font-size: 0.9rem; margin-top: 0.3rem; }
.quick-actions { display: flex; gap: 1rem; }
.action-btn {
  padding: 0.7rem 1.5rem;
  background: #2563eb;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.95rem;
}
.action-btn:hover { background: #1d4ed8; }
</style>