<template>
  <div class="main-layout">
    <Header />
    <div class="main-container">
      <Sidebar />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.main-content {
  flex: 1;
  background: #f0f2f5;
  overflow-y: auto;
}
</style>
