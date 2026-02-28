import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Topology, TopologyListItem, TopologyNode, TopologyWire } from '@/types/topology'

// Mock数据
const mockTopologyList: TopologyListItem[] = [
  { id: '1', name: '台区A拓扑', description: '住宅小区A台区', createdAt: '2024-01-15 10:30:00' },
  { id: '2', name: '工业厂区拓扑', description: '工业区配电拓扑', createdAt: '2024-01-20 14:20:00' },
  { id: '3', name: '商业中心拓扑', description: '商业综合体配电', createdAt: '2024-02-01 09:15:00' },
  { id: '4', name: '学校配电拓扑', description: '学校配电系统', createdAt: '2024-02-05 16:45:00' },
  { id: '5', name: '医院配电拓扑', description: '医院配电系统', createdAt: '2024-02-10 11:20:00' },
  { id: '6', name: '农村台区拓扑', description: '农村低压台区', createdAt: '2024-02-15 13:30:00' },
  { id: '7', name: '小区配电拓扑', description: '住宅小区配电', createdAt: '2024-02-20 10:00:00' },
  { id: '8', name: '工业园区拓扑', description: '工业园区配电', createdAt: '2024-02-25 15:20:00' },
  { id: '9', name: '写字楼拓扑', description: '写字楼配电系统', createdAt: '2024-03-01 09:40:00' },
  { id: '10', name: '商场配电拓扑', description: '商场配电系统', createdAt: '2024-03-05 14:10:00' },
]

// 生成UUID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const useTopologyStore = defineStore('topology', () => {
  // 拓扑图列表
  const topologyList = ref<TopologyListItem[]>(mockTopologyList)
  
  // 当前编辑的拓扑图
  const currentTopology = ref<Topology | null>(null)
  
  // 分页参数
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })

  // 搜索关键词
  const searchName = ref('')

  // 获取列表（带分页和搜索）
  function fetchList() {
    let list = [...topologyList.value]
    
    // 搜索过滤
    if (searchName.value) {
      list = list.filter(item => 
        item.name.toLowerCase().includes(searchName.value.toLowerCase())
      )
    }
    
    // 更新总数
    pagination.value.total = list.length
    
    // 分页
    const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return list.slice(start, end)
  }

  // 设置搜索关键词
  function setSearchName(name: string) {
    searchName.value = name
    pagination.value.currentPage = 1
  }

  // 设置分页
  function setPagination(page: number, size: number) {
    pagination.value.currentPage = page
    pagination.value.pageSize = size
  }

  // 获取拓扑图详情
  function getTopologyById(id: string): Topology | null {
    const item = topologyList.value.find(t => t.id === id)
    if (!item) return null
    
    // 返回完整拓扑图（含默认节点和导线）
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      nodes: currentTopology.value?.id === id ? currentTopology.value.nodes : [],
      wires: currentTopology.value?.id === id ? currentTopology.value.wires : [],
      params: currentTopology.value?.id === id ? currentTopology.value.params : {
        name: item.name,
        description: item.description,
        load: ''
      }
    }
  }

  // 创建新拓扑图
  function createTopology(): Topology {
    const newTopology: Topology = {
      id: generateId(),
      name: '新拓扑图',
      description: '',
      createdAt: new Date().toLocaleString('zh-CN'),
      nodes: [],
      wires: [],
      params: {
        name: '新拓扑图',
        description: '',
        load: ''
      }
    }
    return newTopology
  }

  // 保存拓扑图
  function saveTopology(topology: Topology) {
    const index = topologyList.value.findIndex(t => t.id === topology.id)
    if (index >= 0) {
      // 更新
      topologyList.value[index] = {
        id: topology.id,
        name: topology.params.name,
        description: topology.params.description,
        createdAt: topologyList.value[index].createdAt,
        updatedAt: new Date().toLocaleString('zh-CN')
      }
    } else {
      // 新增
      topologyList.value.unshift({
        id: topology.id,
        name: topology.params.name,
        description: topology.params.description,
        createdAt: new Date().toLocaleString('zh-CN')
      })
    }
    currentTopology.value = topology
  }

  // 删除拓扑图
  function deleteTopology(id: string) {
    const index = topologyList.value.findIndex(t => t.id === id)
    if (index >= 0) {
      topologyList.value.splice(index, 1)
    }
  }

  // 设置当前拓扑图
  function setCurrentTopology(topology: Topology | null) {
    currentTopology.value = topology
  }

  // 添加节点
  function addNode(type: 'meter' | 'transformer' | 'currentTransformer', x: number, y: number): TopologyNode {
    const typeNames = {
      meter: '电能表',
      transformer: '变压器',
      currentTransformer: '互感器'
    }
    const node: TopologyNode = {
      id: generateId(),
      type,
      x,
      y,
      params: {
        name: `${typeNames[type]}_${Date.now().toString(36)}`
      }
    }
    if (currentTopology.value) {
      currentTopology.value.nodes.push(node)
    }
    return node
  }

  // 添加导线
  function addWire(sourceId: string, targetId: string): TopologyWire | null {
    if (!currentTopology.value) return null
    
    const wire: TopologyWire = {
      id: generateId(),
      sourceId,
      targetId,
      params: {
        model: '',
        wireSize: '',
        length: 0,
        installationMethod: ''
      }
    }
    currentTopology.value.wires.push(wire)
    return wire
  }

  // 更新节点
  function updateNode(nodeId: string, updates: Partial<TopologyNode>) {
    if (!currentTopology.value) return
    const node = currentTopology.value.nodes.find(n => n.id === nodeId)
    if (node) {
      Object.assign(node, updates)
    }
  }

  // 更新导线
  function updateWire(wireId: string, updates: Partial<TopologyWire>) {
    if (!currentTopology.value) return
    const wire = currentTopology.value.wires.find(w => w.id === wireId)
    if (wire) {
      Object.assign(wire, updates)
    }
  }

  // 删除节点
  function deleteNode(nodeId: string) {
    if (!currentTopology.value) return
    const index = currentTopology.value.nodes.findIndex(n => n.id === nodeId)
    if (index >= 0) {
      currentTopology.value.nodes.splice(index, 1)
      // 同时删除相关的导线
      currentTopology.value.wires = currentTopology.value.wires.filter(
        w => w.sourceId !== nodeId && w.targetId !== nodeId
      )
    }
  }

  // 删除导线
  function deleteWire(wireId: string) {
    if (!currentTopology.value) return
    const index = currentTopology.value.wires.findIndex(w => w.id === wireId)
    if (index >= 0) {
      currentTopology.value.wires.splice(index, 1)
    }
  }

  return {
    topologyList,
    currentTopology,
    pagination,
    searchName,
    fetchList,
    setSearchName,
    setPagination,
    getTopologyById,
    createTopology,
    saveTopology,
    deleteTopology,
    setCurrentTopology,
    addNode,
    addWire,
    updateNode,
    updateWire,
    deleteNode,
    deleteWire
  }
})
