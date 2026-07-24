<template>
  <div class="post-detail-page">
    <LoadingSpinner :show="loading" text="加载中..." />

    <div v-if="!loading && post" class="post-detail">
      <router-link to="/" class="back-link">← 返回首页</router-link>

      <header class="post-header">
        <h1>{{ post.title }}</h1>
        <div class="post-meta">
          <div class="tags">
            <TagBadge v-for="tag in post.tags" :key="tag" :tag="tag" />
          </div>
          <div class="meta-divider"></div>
          <time>{{ formatDate(post.created_at) }}</time>
          <span v-if="post.price > 0" class="price-tag">
            {{ post.purchased ? '✅ 已购买' : `💎 ¥${(post.price / 100).toFixed(2)}` }}
          </span>
        </div>
      </header>

      <PostContent
        :content="post.content"
        :paid-blocks="post.paid_blocks"
        :purchased="post.purchased"
        :price="post.price"
        @purchase="handlePurchase"
      />

      <PurchaseFlow
        :show="showPurchaseFlow"
        :post-id="post.id"
        :price="post.price"
        @close="showPurchaseFlow = false"
        @purchased="onPurchased"
      />
    </div>

    <div v-if="!loading && !post" class="error-state">
      <div class="error-icon">😕</div>
      <p>文章未找到</p>
      <router-link to="/">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import { usePurchasesStore } from '@/stores/purchases'
import { useReaderAuthStore } from '@/stores/readerAuth'
import PostContent from '@/components/reader/PostContent.vue'
import PurchaseFlow from '@/components/reader/PurchaseFlow.vue'
import TagBadge from '@/components/common/TagBadge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()
const purchasesStore = usePurchasesStore()
const readerAuth = useReaderAuthStore()

const loading = ref(true)
const post = ref(null)
const showPurchaseFlow = ref(false)

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

async function loadPost() {
  loading.value = true
  const slug = route.params.slug
  post.value = await postsStore.fetchPostBySlug(slug)
  loading.value = false
}

function handlePurchase() {
  if (!readerAuth.isAuthenticated) {
    router.push({ name: 'reader-login', query: { redirect: route.fullPath } })
    return
  }
  showPurchaseFlow.value = true
}

function onPurchased() {
  showPurchaseFlow.value = false
  loadPost()
}

onMounted(() => {
  loadPost()
  if (readerAuth.isAuthenticated) {
    purchasesStore.fetchPurchases()
  }
})

watch(() => route.params.slug, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  loadPost()
})
</script>

<style scoped>
.post-detail-page {
  padding: 1rem 0;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  margin-bottom: 1.5rem;
  font-size: 0.92rem;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition);
}

.back-link:hover {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.post-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-border);
}

.post-header h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0 0 1rem;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.meta-divider {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-text-muted);
}

.post-meta time {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.price-tag {
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.25rem 0.8rem;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border-radius: 20px;
}

.tags {
  display: flex;
  gap: 0.4rem;
}

.error-state {
  text-align: center;
  padding: 5rem 1rem;
  color: var(--color-text-muted);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state p {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.error-state a {
  color: var(--color-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .post-header h1 {
    font-size: 1.6rem;
  }
  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .meta-divider {
    display: none;
  }
}
</style>