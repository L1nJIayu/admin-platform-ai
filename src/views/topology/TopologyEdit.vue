<template>
  <div class="h-full flex flex-col p-4">
    <!-- 顶部操作栏 -->
    <div class="flex justify-between mb-4">
      <el-button @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <el-button type="primary" @click="handleSave">
        <el-icon><Check /></el-icon>
        保存
      </el-button>
    </div>

    <div class="flex-1 flex gap-4 min-h-0">
      <!-- 左侧：节点工具箱 -->
      <div class="w-[150px] bg-white rounded p-3 flex-shrink-0">
        <div class="font-bold mb-3 pb-2 border-b border-gray-200">节点工具箱</div>
        <draggable
          v-model="toolboxNodes"
          :group="{ name: 'nodes', pull: 'clone', put: false }"
          :clone="cloneNode"
          item-key="type"
          class="flex flex-col gap-2"
        >
          <template #item="{ element }">
            <div class="flex items-center gap-2 p-[10px] bg-gray-50 border border-gray-300 rounded cursor-move transition-all hover:border-blue-500 hover:bg-blue-50" :class="{
              'border-l-2 border-l-blue-500': element.type === 'meter',
              'border-l-2 border-l-orange-500': element.type === 'transformer',
              'border-l-2 border-l-green-500': element.type === 'currentTransformer'
            }">
              <el-icon><component :is="getNodeIcon(element.type)" /></el-icon>
              <span>{{ element.label }}</span>
            </div>
          </template>
        </draggable>
      </div>

      <!-- 中间：画布 -->
      <div class="flex-1 flex flex-col bg-white rounded overflow-hidden">
        <div class="flex justify-between items-center p-3 border-b font-bold">
          <span>拓扑图画布</span>
          <el-button size="small" @click="clearCanvas">清空画布</el-button>
        </div>
        <div 
          class="flex-1 relative bg-gray-100 overflow-auto" 
          ref="canvasRef"
          :style="{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
        >
          <!-- 节点 -->
          <div
            v-for="node in topology.nodes"
            :key="node.id"
            class="absolute w-[100px] min-h-[60px] bg-white border-2 rounded cursor-move select-none"
            :class="{
              'border-blue-500 z-10': selectedNode?.id === node.id,
              'border-blue-500': node.type === 'meter' && selectedNode?.id !== node.id,
              'border-orange-500': node.type === 'transformer' && selectedNode?.id !== node.id,
              'border-green-500': node.type === 'currentTransformer' && selectedNode?.id !== node.id
            }"
            :style="{ left: node.x + 'px', top: node.y + 'px' }"
            @mousedown.stop="startDrag(node, $event)"
            @click.stop="selectNode(node)"
            @dblclick.stop="editNodeParams(node)"
          >
            <div class="flex items-center justify-center gap-1 p-2 bg-gray-50 border-b border-gray-200 text-xs" :class="{
              'text-blue-500': node.type === 'meter',
              'text-orange-500': node.type === 'transformer',
              'text-green-500': node.type === 'currentTransformer'
            }">
              <el-icon class="text-lg"><component :is="getNodeIcon(node.type)" /></el-icon>
              <span>{{ getNodeTypeName(node.type) }}</span>
            </div>
            <div class="p-2 text-xs text-center break-all">
              {{ node.params.name }}
            </div>
            <div class="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
              <el-button link size="small" type="danger" @click.stop="deleteNode(node.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <!-- 连接点 -->
            <div class="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-1 top-1/2 -translate-y-1/2 cursor-crosshair opacity-0 hover:opacity-100 transition-opacity" @mousedown.stop="startConnect(node.id, $event)"></div>
            <div class="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -right-1 top-1/2 -translate-y-1/2 cursor-crosshair opacity-0 hover:opacity-100 transition-opacity" @mouseup.stop="endConnect(node.id)"></div>
          </div>

          <!-- 临时连线 -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none" v-if="tempWire">
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
          <svg class="absolute inset-0 w-full h-full pointer-events-auto">
            <g v-for="wire in topology.wires" :key="wire.id">
              <line
                :x1="getWirePosition(wire.sourceId).x"
                :y1="getWirePosition(wire.sourceId).y"
                :x2="getWirePosition(wire.targetId).x"
                :y2="getWirePosition(wire.targetId).y"
                stroke="#67c23a"
                stroke-width="2"
                @click="selectWire(wire)"
                class="cursor-pointer hover:stroke-red-500"
              />
            </g>
          </svg>
        </div>
      </div>

      <!-- 右侧：属性面板 -->
      <div class="w-[300px] bg-white rounded flex-shrink-0 overflow-auto">
        <el-tabs v-model="activeTab" class="h-full">
          <!-- 拓扑图属性 -->
          <el-tab-pane label="拓扑图属性" name="topology">
            <el-form label-width="80px" class="p-3">
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
            <el-form label-width="80px" class="p-3">
              <el-form-item label="节点名称">
                <el-input v-model="selectedNode.params.name" />
              </el-form-item>
              <el-form-item label="节点类型">
                <span>{{ getNodeTypeName(selectedNode.type) }}</span>
              </el-form-item>
              
              <!-- 电能表参数 -->
              <template v-if="selectedNode.type === 'meter'">
                <el-form-item label="电能误差(%)">
                  <el-input-number v-model="selectedNode.params.energyError" :precision="2" :step="0.01" :min="0" :max="100" placeholder="请输入电能误差" class="w-full" />
                </el-form-item>
                <el-form-item label="时间误差">
                  <el-input-number v-model="selectedNode.params.timeError" :precision="2" :step="0.01" :min="0" placeholder="请输入时间误差" class="w-full" />
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
                  <el-select v-model="selectedNode.params.accuracyClass" placeholder="请选择" class="w-full">
                    <el-option label="0.5级" value="0.5" />
                    <el-option label="0.5S级" value="0.5S" />
                    <el-option label="0.2级" value="0.2" />
                    <el-option label="0.2S级" value="0.2S" />
                    <el-option label="0.1级" value="0.1" />
                  </el-select>
                </el-form-item>
              </template>
              
              <el-form-item label="X坐标">
                <el-input-number v-model="selectedNode.x" :min="0" :max="canvasWidth" class="w-full" />
              </el-form-item>
              <el-form-item label="Y坐标">
                <el-input-number v-model="selectedNode.y" :min="0" :max="canvasHeight" class="w-full" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 导线属性 -->
          <el-tab-pane label="导线属性" name="wire" v-if="selectedWire">
            <el-form label-width="80px" class="p-3">
              <el-form-item label="型号">
                <el-input v-model="selectedWire.params.model" placeholder="请输入型号" />
              </el-form-item>
              <el-form-item label="线径">
                <el-input v-model="selectedWire.params.wireSize" placeholder="请输入线径" />
              </el-form-item>
              <el-form-item label="长度(m)">
                <el-input-number v-model="selectedWire.params.length" :min="0" class="w-full" />
              </el-form-item>
              <el-form-item label="敷设方式">
                <el-select v-model="selectedWire.params.installationMethod" placeholder="请选择" class="w-full">
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

// 拖拽状态
const draggingNode = ref<TopologyNode | null>(null)
const dragOffset = ref({ x: 0, y: 0 })

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
    x: 50,
    y: 50,
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
    meter: Coin,
    transformer: Lightning,
    currentTransformer: Cpu
  }
  return icons[type] || Box
}

// 开始拖拽节点
function startDrag(node: TopologyNode, event: MouseEvent) {
  draggingNode.value = node
  const target = event.target as HTMLElement
  const nodeEl = target.closest('.absolute') as HTMLElement
  if (nodeEl) {
    const rect = nodeEl.getBoundingClientRect()
    dragOffset.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }
}

// 拖拽移动
function handleMouseMove(event: MouseEvent) {
  // 处理节点拖拽
  if (draggingNode.value && canvasRef.value) {
    const rect = canvasRef.value.getBoundingClientRect()
    const scrollLeft = canvasRef.value.scrollLeft
    const scrollTop = canvasRef.value.scrollTop
    
    let newX = event.clientX - rect.left + scrollLeft - dragOffset.value.x
    let newY = event.clientY - rect.top + scrollTop - dragOffset.value.y
    
    // 边界检查
    newX = Math.max(0, Math.min(newX, canvasWidth.value - 100))
    newY = Math.max(0, Math.min(newY, canvasHeight.value - 60))
    
    draggingNode.value.x = newX
    draggingNode.value.y = newY
  }
  
  // 处理连线
  if (tempWire.value && connectSource.value && canvasRef.value) {
    const rect = canvasRef.value.getBoundingClientRect()
    tempWire.value.x2 = event.clientX - rect.left + canvasRef.value.scrollLeft
    tempWire.value.y2 = event.clientY - rect.top + canvasRef.value.scrollTop
  }
}

// 结束拖拽
function handleMouseUp() {
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
  if (rect && canvasRef.value) {
    tempWire.value = {
      x1: event.clientX - rect.left + canvasRef.value.scrollLeft,
      y1: event.clientY - rect.top + canvasRef.value.scrollTop,
      x2: event.clientX - rect.left + canvasRef.value.scrollLeft,
      y2: event.clientY - rect.top + canvasRef.value.scrollTop
    }
  }
}

// 结束连接
function endConnect(nodeId: string) {
  if (connectSource.value && connectSource.value !== nodeId) {
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
  activeTab.value = 'topology'
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
  
  topologyStore.saveTopology(topology)
  
  ElMessage.success('保存成功')
  router.push('/topology')
}

onMounted(() => {
  const id = route.params.id as string
  if (id === 'new') {
    topology.id = ''
    topology.name = ''
    topology.description = ''
    topology.createdAt = ''
    topology.nodes = []
    topology.wires = []
    topology.params = {
      name: '',
      description: '',
      load: ''
    }
  } else {
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
