<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面未找到</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}
.not-found h1 { font-size: 4rem; color: #ddd; margin: 0; }
.not-found p { color: #888; font-size: 1.2rem; margin: 0.5rem 0 1.5rem; }
.not-found a { color: #2563eb; }
</style>