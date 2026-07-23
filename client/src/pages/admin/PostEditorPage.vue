<template>
  <div class="post-editor-page">
    <h1>{{ isEdit ? '编辑文章' : '新建文章' }}</h1>

    <LoadingSpinner :show="loading" text="加载中..." />

    <PostForm
      v-if="!loading"
      :initial-data="initialData"
      :submit-label="isEdit ? '更新文章' : '发布文章'"
      @submit="handleSubmit"
      @cancel="goBack"
    />

    <div v-if="error" class="error-msg">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import PostForm from '@/components/admin/PostForm.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

const loading = ref(false)
const error = ref('')
const loadedPost = ref(null)

const isEdit = computed(() => !!route.params.id)

const initialData = computed(() => {
  if (!isEdit.value) return {}
  return loadedPost.value || {}
})

function goBack() {
  router.push('/admin/posts')
}

async function handleSubmit(formData) {
  error.value = ''
  try {
    if (isEdit.value) {
      await postsStore.updatePost(route.params.id, formData)
    } else {
      await postsStore.createPost(formData)
    }
    router.push('/admin/posts')
  } catch (err) {
    error.value = err.response?.data?.error || '保存失败，请重试'
  }
}

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    const post = await postsStore.fetchPostById(route.params.id)
    if (post) {
      loadedPost.value = post
    } else {
      error.value = '文章未找到'
    }
    loading.value = false
  }
})
</script>

<style scoped>
.post-editor-page { max-width: 800px; }
.post-editor-page h1 { margin-bottom: 1.5rem; color: #1a1a2e; }
.error-msg {
  margin-top: 1rem;
  color: #e53e3e;
  background: #fef2f2;
  padding: 0.8rem;
  border-radius: 8px;
}
</style>