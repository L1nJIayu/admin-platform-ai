<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo">
        <el-icon :size="28" color="#409EFF"><Monitor /></el-icon>
      </div>
      <h1 class="title">后台管理系统</h1>
    </div>
    
    <div class="header-right">
      <div class="user-info">
        <el-icon><User /></el-icon>
        <span class="username">{{ username }}</span>
      </div>
      <el-button 
        type="danger" 
        size="default"
        @click="handleLogout"
      >
        <el-icon><SwitchButton /></el-icon>
        退出登录
      </el-button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Monitor, User, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const username = computed(() => userStore.username || 'Admin')

function handleLogout() {
  userStore.logout()
}
</script>

<style scoped>
.app-header {
  height: 60px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.username {
  font-size: 14px;
}
</style>
