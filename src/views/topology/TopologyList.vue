<template>
  <div class="p-5">
    <!-- 搜索区域 -->
    <el-card class="mb-4" shadow="never">
      <el-form :inline="true" :model="searchForm" class="flex flex-wrap gap-2">
        <el-form-item label="拓扑名称" class="mb-0">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入拓扑名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item class="mb-0">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <div class="mb-4">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增拓扑图
      </el-button>
    </div>

    <!-- 表格区域 -->
    <el-card shadow="never">
      <el-table :data="tableData" stripe border class="w-full">
        <el-table-column prop="name" label="拓扑名称" min-width="180" />
        <el-table-column prop="description" label="描述" min-width="250" />
        <el-table-column prop="createdAt" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { useTopologyStore } from '@/stores/topology'
import type { TopologyListItem } from '@/types/topology'

const router = useRouter()
const topologyStore = useTopologyStore()

// 搜索表单
const searchForm = ref({
  name: ''
})

// 表格数据
const tableData = ref<TopologyListItem[]>([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 加载数据
function loadData() {
  topologyStore.setSearchName(searchForm.value.name)
  topologyStore.setPagination(currentPage.value, pageSize.value)
  tableData.value = topologyStore.fetchList()
  total.value = topologyStore.pagination.total
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  loadData()
}

// 重置
function handleReset() {
  searchForm.value.name = ''
  currentPage.value = 1
  loadData()
}

// 新增
function handleAdd() {
  router.push('/topology/edit/new')
}

// 编辑
function handleEdit(row: TopologyListItem) {
  router.push(`/topology/edit/${row.id}`)
}

// 删除
function handleDelete(row: TopologyListItem) {
  ElMessageBox.confirm(
    `确定要删除拓扑图"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    topologyStore.deleteTopology(row.id)
    loadData()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 分页大小变化
function handleSizeChange(val: number) {
  pageSize.value = val
  loadData()
}

// 页码变化
function handleCurrentChange(val: number) {
  currentPage.value = val
  loadData()
}

onMounted(() => {
  loadData()
})
</script>
