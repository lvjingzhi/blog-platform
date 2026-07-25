<template>
  <router-view />
</template>

<script setup>
import { useReaderStore } from '@/stores/reader'
import { useAuthStore } from '@/stores/auth'
import { useReaderAuthStore } from '@/stores/readerAuth'

const readerStore = useReaderStore()
const authStore = useAuthStore()
const readerAuthStore = useReaderAuthStore()

// 立即恢复登录状态，不等 onMounted
readerStore.initReaderId()
authStore.initFromStorage()
readerAuthStore.initFromStorage()
</script>