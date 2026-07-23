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
          <time>{{ formatDate(post.created_at) }}</time>
          <span v-if="post.price > 0" class="price-tag">
            {{ post.purchased ? '✅ 已购买' : `💰 ¥${(post.price / 100).toFixed(2)}` }}
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
      <p>😕 文章未找到</p>
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
    // Redirect to login page, then come back
    router.push({ name: 'reader-login', query: { redirect: route.fullPath } })
    return
  }
  showPurchaseFlow.value = true
}

function onPurchased() {
  showPurchaseFlow.value = false
  // Reload post to get updated purchase status
  loadPost()
}

onMounted(() => {
  loadPost()
  if (readerAuth.isAuthenticated) {
    purchasesStore.fetchPurchases()
  }
})

watch(() => route.params.slug, () => {
  loadPost()
})
</script>

<style scoped>
.post-detail-page { padding: 1rem 0; }
.back-link {
  display: inline-block;
  color: #2563eb;
  text-decoration: none;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}
.back-link:hover { text-decoration: underline; }
.post-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}
.post-header h1 {
  font-size: 2rem;
  color: #1a1a2e;
  margin: 0 0 1rem;
  line-height: 1.4;
}
.post-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.post-meta time { color: #999; font-size: 0.9rem; }
.price-tag {
  font-weight: 600;
  font-size: 0.9rem;
  color: #e65100;
}
.tags { display: flex; gap: 0.4rem; }
.error-state {
  text-align: center;
  padding: 4rem 0;
  color: #999;
}
.error-state a { color: #2563eb; }
</style>