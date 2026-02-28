<template>
  <aside class="w-[200px] min-w-[200px] bg-[#001529] h-full relative transition-all duration-300 overflow-hidden" :class="{ 'w-16 min-w-16': isCollapsed }">
    <div class="h-10 flex items-center justify-center text-[#bfcbd9] cursor-pointer border-b border-white/10 hover:bg-white/5 transition-colors" @click="toggleSidebar">
      <el-icon :size="20">
        <Fold v-if="!isCollapsed" />
        <Expand v-else />
      </el-icon>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      class="border-r-0 h-[calc(100%-40px)] overflow-y-auto"
      :class="{ 'w-16': isCollapsed }"
      :collapse="isCollapsed"
      :collapse-transition="false"
      background-color="#001529"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      router
    >
      <el-menu-item index="/home">
        <el-icon><HomeFilled /></el-icon>
        <template #title>首页</template>
      </el-menu-item>
      
      <el-sub-menu index="/topology-group">
        <template #title>
          <el-icon><Connection /></el-icon>
          <span>台区拓扑图</span>
        </template>
        <el-menu-item index="/topology">
          <el-icon><List /></el-icon>
          <template #title>拓扑列表</template>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Fold, Expand, HomeFilled, Connection, List } from '@element-plus/icons-vue'

const route = useRoute()
const isCollapsed = ref(false)

const activeMenu = computed(() => route.path)

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style>
.el-menu-item {
  height: 50px !important;
  line-height: 50px !important;
}
.el-menu-item.is-active {
  background: #409EFF !important;
}
.el-menu-item:hover {
  background: rgba(64, 158, 255, 0.2) !important;
}
</style>
