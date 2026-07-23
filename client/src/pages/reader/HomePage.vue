<template>
  <div class="home-page">
    <h1 class="page-title">最新文章</h1>

    <div class="tag-filter" v-if="allTags.length > 0">
      <button :class="{ active: !activeTag }" @click="setTag(null)">全部</button>
      <button
        v-for="tag in allTags"
        :key="tag"
        :class="{ active: activeTag === tag }"
        @click="setTag(tag)"
      >{{ tag }}</button>
    </div>

    <LoadingSpinner :show="postsStore.isLoading" text="加载中..." />

    <div v-if="!postsStore.isLoading && postsStore.posts.length === 0" class="empty-state">
      <p>📭 还没有文章</p>
    </div>

    <PostCard v-for="post in postsStore.posts" :key="post.id" :post="post" />

    <Pagination
      :page="postsStore.currentPage"
      :totalPages="Math.ceil(postsStore.totalPosts / postsStore.pageSize)"
      @change="goToPage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePostsStore } from '@/stores/posts'
import PostCard from '@/components/reader/PostCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const postsStore = usePostsStore()
const activeTag = ref(null)

const allTags = computed(() => {
  const tagSet = new Set()
  postsStore.posts.forEach(p => p.tags.forEach(t => tagSet.add(t)))
  return [...tagSet]
})

function setTag(tag) {
  activeTag.value = tag
  postsStore.fetchPosts(1, tag)
}

function goToPage(page) {
  postsStore.fetchPosts(page, activeTag.value)
}

onMounted(() => {
  postsStore.fetchPosts()
})
</script>

<style scoped>
.home-page { padding: 1rem 0; }
.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}
.tag-filter {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.tag-filter button {
  padding: 0.3rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}
.tag-filter button.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: #999;
  font-size: 1.1rem;
}
</style>