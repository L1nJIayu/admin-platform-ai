<template>
  <div class="home-container">
    <el-card class="home-card">
      <template #header>
        <div class="card-header">
          <span>首页</span>
        </div>
      </template>
      <div class="welcome-content">
        <el-icon :size="64" color="#409EFF"><HomeFilled /></el-icon>
        <h2>欢迎使用后台管理系统</h2>
        <p>这是一个基于 Vue 3 + TypeScript + Element Plus + TailwindCSS 构建的管理系统</p>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">Vue 3</span>
            <span class="stat-label">前端框架</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">TypeScript</span>
            <span class="stat-label">语言</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">Element Plus</span>
            <span class="stat-label">UI组件</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">Pinia</span>
            <span class="stat-label">状态管理</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { HomeFilled } from '@element-plus/icons-vue'
</script>

<style scoped>
.home-container {
  height: 100%;
}

.home-card {
  height: 100%;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.welcome-content h2 {
  margin: 20px 0 10px;
  color: #303133;
}

.welcome-content p {
  color: #606266;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 30px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #409EFF;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 8px;
}
</style>
