import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref([])
  const currentPost = ref(null)
  const totalPosts = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchPosts(page = 1, tag = null, search = null) {
    isLoading.value = true
    error.value = null
    try {
      const params = { page, limit: pageSize.value }
      if (tag) params.tag = tag
      if (search) params.search = search
      const { data } = await axios.get('/api/posts', { params })
      posts.value = data.posts
      totalPosts.value = data.total
      currentPage.value = data.page
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch posts'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAdminPosts(page = 1) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await axios.get('/api/admin/posts', {
        params: { page, limit: pageSize.value }
      })
      posts.value = data.posts
      totalPosts.value = data.total
      currentPage.value = data.page
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch posts'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPostBySlug(slug) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`/api/posts/${slug}`)
      currentPost.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch post'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPostById(id) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`/api/admin/posts/${id}`)
      currentPost.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch post'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createPost(postData) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await axios.post('/api/admin/posts', postData)
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create post'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updatePost(id, postData) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await axios.put(`/api/admin/posts/${id}`, postData)
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update post'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deletePost(id) {
    isLoading.value = true
    error.value = null
    try {
      await axios.delete(`/api/admin/posts/${id}`)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete post'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    posts, currentPost, totalPosts, currentPage, pageSize, isLoading, error,
    fetchPosts, fetchAdminPosts, fetchPostBySlug, fetchPostById,
    createPost, updatePost, deletePost,
  }
})