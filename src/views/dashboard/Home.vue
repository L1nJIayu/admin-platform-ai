<template>
  <div class="h-full">
    <el-card class="h-full">
      <template #header>
        <div class="text-lg font-semibold">首页</div>
      </template>
      <div class="flex flex-col items-center p-10">
        <el-icon :size="64" color="#409EFF"><HomeFilled /></el-icon>
        <h2 class="my-5 text-xl text-gray-700">欢迎使用后台管理系统</h2>
        <p class="text-gray-500 mb-8">这是一个基于 Vue 3 + TypeScript + Element Plus + TailwindCSS 构建的管理系统</p>
        <div class="flex flex-wrap gap-10 justify-center">
          <div class="flex flex-col items-center p-5 bg-gray-50 rounded-lg">
            <span class="text-lg font-semibold text-blue-500">Vue 3</span>
            <span class="text-sm text-gray-400 mt-2">前端框架</span>
          </div>
          <div class="flex flex-col items-center p-5 bg-gray-50 rounded-lg">
            <span class="text-lg font-semibold text-blue-500">TypeScript</span>
            <span class="text-sm text-gray-400 mt-2">语言</span>
          </div>
          <div class="flex flex-col items-center p-5 bg-gray-50 rounded-lg">
            <span class="text-lg font-semibold text-blue-500">Element Plus</span>
            <span class="text-sm text-gray-400 mt-2">UI组件</span>
          </div>
          <div class="flex flex-col items-center p-5 bg-gray-50 rounded-lg">
            <span class="text-lg font-semibold text-blue-500">Pinia</span>
            <span class="text-sm text-gray-400 mt-2">状态管理</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { HomeFilled } from '@element-plus/icons-vue'
</script>
