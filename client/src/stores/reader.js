import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReaderStore = defineStore('reader', () => {
  const readerId = ref(null)

  function initReaderId() {
    let id = localStorage.getItem('blog_reader_id')
    if (!id) {
      id = 'reader_' + crypto.randomUUID()
      localStorage.setItem('blog_reader_id', id)
    }
    readerId.value = id
  }

  function getReaderId() {
    if (!readerId.value) {
      initReaderId()
    }
    return readerId.value
  }

  return { readerId, initReaderId, getReaderId }
})