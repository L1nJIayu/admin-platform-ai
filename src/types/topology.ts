// 节点类型
export type NodeType = 'meter' | 'transformer' | 'currentTransformer'

// 节点参数
export interface NodeParams {
  name: string
  // 电能表参数
  energyError?: number  // 电能误差（百分比）
  timeError?: number   // 时间误差
  // 变压器参数
  ratedPower?: string  // 额定功率
  voltageRatio?: string  // 电压比
  // 互感器参数
  ratio?: string  // 变比
  accuracyClass?: string  // 准确度等级
  [key: string]: any
}

// 导线参数
export interface WireParams {
  model: string
  wireSize: string
  length: number
  installationMethod: string
}

// 拓扑图参数
export interface TopologyParams {
  name: string
  description: string
  load: string
}

// 拓扑图节点
export interface TopologyNode {
  id: string
  type: NodeType
  x: number
  y: number
  params: NodeParams
}

// 拓扑图连接线（导线）
export interface TopologyWire {
  id: string
  sourceId: string
  targetId: string
  params: WireParams
}

// 拓扑图
export interface Topology {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt?: string
  nodes: TopologyNode[]
  wires: TopologyWire[]
  params: TopologyParams
}

// 拓扑图列表项（不含详细节点数据）
export interface TopologyListItem {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt?: string
}

// 节点类型选项
export const NODE_TYPE_OPTIONS = [
  { label: '电能表', value: 'meter' },
  { label: '互感器', value: 'currentTransformer' },
  { label: '变压器', value: 'transformer' }
] as const

// 敷设方式选项
export const INSTALLATION_METHOD_OPTIONS = [
  { label: '明敷', value: 'surface' },
  { label: '暗敷', value: 'concealed' },
  { label: '桥架', value: 'tray' },
  { label: '管道', value: 'conduit' }
] as const
