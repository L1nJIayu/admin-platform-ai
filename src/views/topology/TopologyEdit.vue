<template>
  <div class="topology-edit">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <el-button @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <el-button type="primary" @click="handleSave">
        <el-icon><Check /></el-icon>
        保存
      </el-button>
    </div>

    <div class="editor-container">
      <!-- 左侧：节点工具箱 -->
      <div class="node-toolbox">
        <div class="toolbox-title">节点工具箱</div>
        <draggable
          v-model="toolboxNodes"
          :group="{ name: 'nodes', pull: 'clone', put: false }"
          :clone="cloneNode"
          item-key="type"
          class="toolbox-list"
        >
          <template #item="{ element }">
            <div class="toolbox-item" :class="element.type">
              <el-icon><component :is="getNodeIcon(element.type)" /></el-icon>
              <span>{{ element.label }}</span>
            </div>
          </template>
        </draggable>
      </div>

      <!-- 中间：画布 -->
      <div class="canvas-container">
        <div class="canvas-header">
          <span>拓扑图画布</span>
          <el-button size="small" @click="clearCanvas">清空画布</el-button>
        </div>
        <div class="canvas" ref="canvasRef"
          @mousemove="handleCanvasMouseMove"
          @mouseup="handleCanvasMouseUp"
          @mouseleave="handleCanvasMouseUp"
        >
          <!-- 使用 v-for 渲染节点，拖拽功能由自定义 handlers 处理 -->
          <div
            class="canvas-area"
            :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
          >
            <div
              v-for="element in topology.nodes"
              :key="element.id"
              class="canvas-node"
              :class="element.type"
              :style="{ left: element.x + 'px', top: element.y + 'px' }"
              @mousedown="startNodeDrag(element, $event)"
              @click="selectNode(element); $event.stopPropagation()"
              @dblclick="editNodeParams(element)"
            >
              <div class="node-header" :class="element.type">
                <el-icon><component :is="getNodeIcon(element.type)" /></el-icon>
                <span>{{ getNodeTypeName(element.type) }}</span>
              </div>
              <div class="node-body">
                {{ element.params.name }}
              </div>
              <div class="node-actions">
                <el-button link size="small" type="danger" @click.stop="deleteNode(element.id)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <!-- 连接点 -->
              <div class="connect-point source" @mousedown.stop="startConnect(element.id, $event)"></div>
              <div class="connect-point target" @mouseup.stop="endConnect(element.id)"></div>
            </div>
          </div>

          <!-- 临时连线 -->
          <svg class="temp-wire" v-if="tempWire">
            <line
              :x1="tempWire.x1"
              :y1="tempWire.y1"
              :x2="tempWire.x2"
              :y2="tempWire.y2"
              stroke="#409eff"
              stroke-width="2"
              stroke-dasharray="5,5"
            />
          </svg>

          <!-- 已完成的连线 -->
          <svg class="wires-layer">
            <g v-for="wire in topology.wires" :key="wire.id">
              <line
                :x1="getWirePosition(wire.sourceId).x"
                :y1="getWirePosition(wire.sourceId).y"
                :x2="getWirePosition(wire.targetId).x"
                :y2="getWirePosition(wire.targetId).y"
                stroke="#67c23a"
                stroke-width="2"
                @click="selectWire(wire)"
                style="cursor: pointer"
              />
            </g>
          </svg>
        </div>
      </div>

      <!-- 右侧：属性面板 -->
      <div class="property-panel">
        <el-tabs v-model="activeTab">
          <!-- 拓扑图属性 -->
          <el-tab-pane label="拓扑图属性" name="topology">
            <el-form label-width="100px" class="property-form">
              <el-form-item label="拓扑名称">
                <el-input v-model="topology.params.name" placeholder="请输入拓扑名称" />
              </el-form-item>
              <el-form-item label="拓扑描述">
                <el-input v-model="topology.params.description" type="textarea" :rows="3" placeholder="请输入拓扑描述" />
              </el-form-item>
              <el-form-item label="用电负荷">
                <el-input v-model="topology.params.load" placeholder="请输入台区用电负荷" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 节点属性 -->
          <el-tab-pane label="节点属性" name="node" v-if="selectedNode">
            <el-form label-width="80px" class="property-form">
              <el-form-item label="节点名称">
                <el-input v-model="selectedNode.params.name" />
              </el-form-item>
              <el-form-item label="节点类型">
                <span>{{ getNodeTypeName(selectedNode.type) }}</span>
              </el-form-item>
              
              <!-- 电能表参数 -->
              <template v-if="selectedNode.type === 'meter'">
                <el-form-item label="电能误差(%)">
                  <el-input-number v-model="selectedNode.params.energyError" :precision="2" :step="0.01" :min="0" :max="100" placeholder="请输入电能误差" />
                </el-form-item>
                <el-form-item label="时间误差">
                  <el-input-number v-model="selectedNode.params.timeError" :precision="2" :step="0.01" :min="0" placeholder="请输入时间误差" />
                </el-form-item>
              </template>
              
              <!-- 变压器参数 -->
              <template v-else-if="selectedNode.type === 'transformer'">
                <el-form-item label="额定功率">
                  <el-input v-model="selectedNode.params.ratedPower" placeholder="如: 100kVA" />
                </el-form-item>
                <el-form-item label="电压比">
                  <el-input v-model="selectedNode.params.voltageRatio" placeholder="如: 10kV/0.4kV" />
                </el-form-item>
              </template>
              
              <!-- 互感器参数 -->
              <template v-else-if="selectedNode.type === 'currentTransformer'">
                <el-form-item label="变比">
                  <el-input v-model="selectedNode.params.ratio" placeholder="如: 100/5" />
                </el-form-item>
                <el-form-item label="准确度等级">
                  <el-select v-model="selectedNode.params.accuracyClass" placeholder="请选择">
                    <el-option label="0.5级" value="0.5" />
                    <el-option label="0.5S级" value="0.5S" />
                    <el-option label="0.2级" value="0.2" />
                    <el-option label="0.2S级" value="0.2S" />
                    <el-option label="0.1级" value="0.1" />
                  </el-select>
                </el-form-item>
              </template>
              
              <el-form-item label="X坐标">
                <el-input-number v-model="selectedNode.x" :min="0" :max="canvasWidth" />
              </el-form-item>
              <el-form-item label="Y坐标">
                <el-input-number v-model="selectedNode.y" :min="0" :max="canvasHeight" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 导线属性 -->
          <el-tab-pane label="导线属性" name="wire" v-if="selectedWire">
            <el-form label-width="80px" class="property-form">
              <el-form-item label="型号">
                <el-input v-model="selectedWire.params.model" placeholder="请输入型号" />
              </el-form-item>
              <el-form-item label="线径">
                <el-input v-model="selectedWire.params.wireSize" placeholder="请输入线径" />
              </el-form-item>
              <el-form-item label="长度(m)">
                <el-input-number v-model="selectedWire.params.length" :min="0" />
              </el-form-item>
              <el-form-item label="敷设方式">
                <el-select v-model="selectedWire.params.installationMethod" placeholder="请选择">
                  <el-option
                    v-for="item in INSTALLATION_METHOD_OPTIONS"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="danger" @click="deleteSelectedWire">删除导线</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check, Delete, Box, Coin, Lightning, Cpu } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import { useTopologyStore } from '@/stores/topology'
import type { Topology, TopologyNode, TopologyWire, NodeType } from '@/types/topology'
import { NODE_TYPE_OPTIONS, INSTALLATION_METHOD_OPTIONS } from '@/types/topology'

const route = useRoute()
const router = useRouter()
const topologyStore = useTopologyStore()

// 工具箱节点
const toolboxNodes = ref([
  { type: 'meter' as NodeType, label: '电能表' },
  { type: 'transformer' as NodeType, label: '变压器' },
  { type: 'currentTransformer' as NodeType, label: '互感器' }
])

// 画布尺寸
const canvasWidth = ref(800)
const canvasHeight = ref(600)
const canvasRef = ref<HTMLElement>()

// 拓扑图数据
const topology = reactive<Topology>({
  id: '',
  name: '',
  description: '',
  createdAt: '',
  nodes: [],
  wires: [],
  params: {
    name: '',
    description: '',
    load: ''
  }
})

// 选中的节点/导线
const selectedNode = ref<TopologyNode | null>(null)
const selectedWire = ref<TopologyWire | null>(null)

// 当前标签页
const activeTab = ref('topology')

// 临时连线
const tempWire = ref<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
const connectSource = ref<string | null>(null)

// 节点拖拽状态
const draggingNode = ref<TopologyNode | null>(null)
const dragStartPos = ref({ x: 0, y: 0 })
const nodeStartPos = ref({ x: 0, y: 0 })

// 克隆节点
function cloneNode(origin: { type: NodeType; label: string }): TopologyNode {
  const defaultParams: Record<NodeType, any> = {
    meter: {
      name: `${origin.label}_${Date.now().toString(36)}`,
      energyError: 0,
      timeError: 0
    },
    transformer: {
      name: `${origin.label}_${Date.now().toString(36)}`,
      ratedPower: '',
      voltageRatio: ''
    },
    currentTransformer: {
      name: `${origin.label}_${Date.now().toString(36)}`,
      ratio: '',
      accuracyClass: ''
    }
  }
  
  return {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    type: origin.type,
    x: 50,  // 默认位置
    y: 50,  // 默认位置
    params: defaultParams[origin.type]
  }
}

// 获取节点类型名称
function getNodeTypeName(type: NodeType): string {
  const option = NODE_TYPE_OPTIONS.find(o => o.value === type)
  return option?.label || type
}

// 获取节点图标组件
function getNodeIcon(type: NodeType) {
  const icons: Record<NodeType, any> = {
    meter: Coin,        // 电能表 - Coin
    transformer: Lightning,  // 变压器 - Lightning
    currentTransformer: Cpu   // 互感器 - Cpu
  }
  return icons[type] || Box
}

// 开始拖拽节点
function startNodeDrag(node: TopologyNode, event: MouseEvent) {
  draggingNode.value = node
  dragStartPos.value = { x: event.clientX, y: event.clientY }
  nodeStartPos.value = { x: node.x, y: node.y }
  event.preventDefault()
}

// 画布鼠标移动 - 处理节点拖拽
function handleCanvasMouseMove(event: MouseEvent) {
  if (!draggingNode.value) return
  
  const dx = event.clientX - dragStartPos.value.x
  const dy = event.clientY - dragStartPos.value.y
  
  let newX = nodeStartPos.value.x + dx
  let newY = nodeStartPos.value.y + dy
  
  // 边界检查
  newX = Math.max(0, Math.min(newX, canvasWidth.value - 100))
  newY = Math.max(0, Math.min(newY, canvasHeight.value - 60))
  
  draggingNode.value.x = newX
  draggingNode.value.y = newY
}

// 画布鼠标释放 - 结束拖拽
function handleCanvasMouseUp() {
  if (draggingNode.value) {
    // 确保节点在边界内
    const node = draggingNode.value
    node.x = Math.max(0, Math.min(node.x, canvasWidth.value - 100))
    node.y = Math.max(0, Math.min(node.y, canvasHeight.value - 60))
  }
  draggingNode.value = null
}

// 选择节点
function selectNode(node: TopologyNode) {
  selectedNode.value = node
  selectedWire.value = null
  activeTab.value = 'node'
}

// 选择导线
function selectWire(wire: TopologyWire) {
  selectedWire.value = wire
  selectedNode.value = null
  activeTab.value = 'wire'
}

// 编辑节点参数
function editNodeParams(node: TopologyNode) {
  selectNode(node)
}

// 删除节点
function deleteNode(nodeId: string) {
  const index = topology.nodes.findIndex(n => n.id === nodeId)
  if (index >= 0) {
    topology.nodes.splice(index, 1)
    // 删除相关的导线
    topology.wires = topology.wires.filter(
      w => w.sourceId !== nodeId && w.targetId !== nodeId
    )
    if (selectedNode.value?.id === nodeId) {
      selectedNode.value = null
    }
  }
}

// 删除选中的导线
function deleteSelectedWire() {
  if (selectedWire.value) {
    const index = topology.wires.findIndex(w => w.id === selectedWire.value!.id)
    if (index >= 0) {
      topology.wires.splice(index, 1)
      selectedWire.value = null
    }
  }
}

// 开始连接
function startConnect(nodeId: string, event: MouseEvent) {
  connectSource.value = nodeId
  const rect = canvasRef.value?.getBoundingClientRect()
  if (rect) {
    tempWire.value = {
      x1: event.clientX - rect.left,
      y1: event.clientY - rect.top,
      x2: event.clientX - rect.left,
      y2: event.clientY - rect.top
    }
  }
  
  // 监听鼠标移动
  const handleMouseMove = (e: MouseEvent) => {
    if (tempWire.value && rect) {
      tempWire.value.x2 = e.clientX - rect.left
      tempWire.value.y2 = e.clientY - rect.top
    }
  }
  
  // 监听鼠标释放
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 结束连接
function endConnect(nodeId: string) {
  if (connectSource.value && connectSource.value !== nodeId) {
    // 检查是否已存在连接
    const exists = topology.wires.some(
      w => (w.sourceId === connectSource.value && w.targetId === nodeId) ||
           (w.sourceId === nodeId && w.targetId === connectSource.value)
    )
    if (!exists) {
      topology.wires.push({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        sourceId: connectSource.value,
        targetId: nodeId,
        params: {
          model: '',
          wireSize: '',
          length: 0,
          installationMethod: ''
        }
      })
    }
  }
  connectSource.value = null
  tempWire.value = null
}

// 获取导线位置
function getWirePosition(nodeId: string): { x: number; y: number } {
  const node = topology.nodes.find(n => n.id === nodeId)
  if (node) {
    return {
      x: node.x + 50,
      y: node.y + 30
    }
  }
  return { x: 0, y: 0 }
}

// 清空画布
function clearCanvas() {
  topology.nodes = []
  topology.wires = []
  selectedNode.value = null
  selectedWire.value = null
}

// 返回
function handleBack() {
  router.push('/topology')
}

// 保存
function handleSave() {
  if (!topology.params.name) {
    ElMessage.warning('请输入拓扑名称')
    return
  }
  
  topology.name = topology.params.name
  topology.description = topology.params.description
  
  topologyStore.saveTopology({ ...topology })
  ElMessage.success('保存成功')
  router.push('/topology')
}

// 加载数据
onMounted(() => {
  const id = route.params.id as string
  
  if (id === 'new') {
    // 新建
    const newTopo = topologyStore.createTopology()
    topology.id = newTopo.id
    topology.name = newTopo.name
    topology.description = newTopo.description
    topology.createdAt = newTopo.createdAt
    topology.nodes = newTopo.nodes
    topology.wires = newTopo.wires
    topology.params = { ...newTopo.params }
    topologyStore.setCurrentTopology(topology)
  } else {
    // 编辑
    const existing = topologyStore.getTopologyById(id)
    if (existing) {
      topology.id = existing.id
      topology.name = existing.name
      topology.description = existing.description
      topology.createdAt = existing.createdAt
      topology.nodes = existing.nodes || []
      topology.wires = existing.wires || []
      topology.params = { ...existing.params }
      topologyStore.setCurrentTopology(topology)
    }
  }
})
</script>

<style scoped>
.topology-edit {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.editor-container {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
}

/* 工具箱 */
.node-toolbox {
  width: 150px;
  background: #fff;
  border-radius: 4px;
  padding: 12px;
  flex-shrink: 0;
}

.toolbox-title {
  font-weight: bold;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.toolbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toolbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: move;
  transition: all 0.2s;
}

.toolbox-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.toolbox-item.meter {
  border-left: 3px solid #409eff;
}

.toolbox-item.transformer {
  border-left: 3px solid #e6a23c;
}

.toolbox-item.currentTransformer {
  border-left: 3px solid #67c23a;
}

/* 画布 */
.canvas-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  font-weight: bold;
}

.canvas {
  flex: 1;
  position: relative;
  background: #fafafa;
  background-image: 
    linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  overflow: hidden;
}

.canvas-area {
  position: relative;
  margin: 20px;
}

/* 画布节点 */
.canvas-node {
  position: absolute;
  width: 100px;
  min-height: 60px;
  background: #fff;
  border: 2px solid #dcdfe6;
  border-radius: 4px;
  cursor: move;
  user-select: none;
}

.canvas-node:hover {
  border-color: #409eff;
}

.canvas-node.meter {
  border-color: #409eff;
}

.canvas-node.transformer {
  border-color: #e6a23c;
}

.canvas-node.currentTransformer {
  border-color: #67c23a;
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  background: #f5f7fa;
  border-bottom: 1px solid #eee;
  font-size: 12px;
}

.node-header .el-icon {
  font-size: 18px;
}

.node-header.meter .el-icon {
  color: #409eff;
}

.node-header.transformer .el-icon {
  color: #e6a23c;
}

.node-header.currentTransformer .el-icon {
  color: #67c23a;
}

.node-body {
  padding: 8px;
  font-size: 12px;
  text-align: center;
  word-break: break-all;
}

.node-body.params {
  font-size: 10px;
  color: #909399;
}

.node-actions {
  position: absolute;
  top: 2px;
  right: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.canvas-node:hover .node-actions {
  opacity: 1;
}

/* 连接点 */
.connect-point {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #409eff;
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  cursor: crosshair;
  opacity: 0;
  transition: opacity 0.2s;
}

.canvas-node:hover .connect-point {
  opacity: 1;
}

.connect-point.source {
  left: -5px;
}

.connect-point.target {
  right: -5px;
}

/* 连线 */
.temp-wire,
.wires-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.wires-layer {
  pointer-events: auto;
}

/* 属性面板 */
.property-panel {
  width: 300px;
  background: #fff;
  border-radius: 4px;
  flex-shrink: 0;
  overflow: auto;
}

.property-form {
  padding: 12px;
}
</style>
