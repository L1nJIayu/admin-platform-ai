<template>
  <header class="h-[60px] bg-white flex items-center justify-between px-6 shadow-sm">
    <div class="flex items-center gap-3">
      <div class="flex items-center justify-center">
        <el-icon :size="28" color="#409EFF"><Monitor /></el-icon>
      </div>
      <h1 class="text-lg font-semibold text-gray-700 m-0">后台管理系统</h1>
    </div>
    
    <div class="flex items-center gap-5">
      <div class="flex items-center gap-2 text-gray-500">
        <el-icon><User /></el-icon>
        <span class="text-sm">{{ username }}</span>
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
