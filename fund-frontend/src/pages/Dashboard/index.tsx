// =====================
// React 核心 hooks
// =====================
/**
 * useState: 用于在函数组件中添加状态
 * useEffect: 用于处理副作用，如组件挂载时获取数据
 */
import { useState, useEffect } from 'react'

// =====================
// Ant Design 组件
// =====================
/**
 * Card: 卡片组件，用于展示统计图表的容器
 * Row: 栅格系统的行组件
 * Col: 栅格系统的列组件
 *
 * 栅格系统：Row 和 Col 配合使用实现响应式布局
 * - xs: <576px (超小屏幕)
 * - sm: ≥576px (小屏幕)
 * - md: ≥768px (中等屏幕)
 */
import { Card, Row, Col } from 'antd'

// =====================
// Recharts 图表库
// =====================
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// =====================
// 网络请求
// =====================
/**
 * axios: HTTP 客户端库，用于发送 API 请求
 * apiConfig: API 端点配置文件，统一管理接口地址
 */
import axios from 'axios'
import apiConfig from '../../utils/api'

// =====================
// TypeScript 类型定义
// =====================
/**
 * 产品类型统计数据接口
 * 用于描述从 API 获取的产品类型统计数据结构
 */
interface ProductTypeStat {
  name: string    // 产品类型名称（如：股票型、债券型）
  count: number   // 产品数量
}

// =====================
// 自定义 Hook: 检测移动端
// =====================
/**
 * useIsMobile Hook
 * 用于检测当前设备是否为移动端（屏幕宽度 < 768px）
 *
 * @returns boolean - true 表示移动端，false 表示 PC 端
 */
const useIsMobile = () => {
  // 初始化：检查当前窗口宽度是否小于 768px
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  useEffect(() => {
    // 窗口大小变化时的处理函数
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // 监听窗口大小变化事件
    window.addEventListener('resize', handleResize)
    
    // 清理函数：组件卸载时移除事件监听，防止内存泄漏
    return () => window.removeEventListener('resize', handleResize)
  }, []) // 空依赖数组：只在组件挂载时执行一次
  
  return isMobile
}

// =====================
// Dashboard 页面组件
// =====================
/**
 * Dashboard 数据概览页面组件
 * 展示产品类型的分布饼图和数量统计柱状图
 */
export default function Dashboard() {
  // 状态：存储产品类型统计数据
  const [typeData, setTypeData] = useState<ProductTypeStat[]>([])
  
  // 使用自定义 Hook 判断设备类型
  const isMobile = useIsMobile()

  /**
   * 获取统计数据
   * 异步函数，使用 axios 发送 GET 请求获取产品类型统计数据
   *
   * async/await 语法：
   * - async 声明这是一个异步函数
   * - await 等待 Promise 完成后再继续执行
   */
  const getStat = async () => {
    try {
      // 发送 GET 请求获取数据
      const res = await axios.get(apiConfig.endpoints.dashboardProductType)
      // 更新状态，存储获取到的数据
      setTypeData(res.data)
    } catch (error) {
      // 错误处理：打印错误信息
      console.error('获取统计数据失败:', error)
    }
  }

  /**
   * useEffect: 副作用钩子
   * 组件挂载后自动获取统计数据
   *
   * 第二个参数为空数组 []，表示：
   * - 只在组件首次渲染时执行一次（componentDidMount）
   * - 不会在后续渲染时重复执行
   */
  useEffect(() => {
    getStat()
  }, []) // 空依赖数组

  /**
   * 图表配色方案
   * 按顺序为图表的每个数据项分配不同颜色
   */
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  /**
   * 处理图表数据
   * 将 API 返回的数据转换为 Recharts 需要的格式
   * typeData.map() 遍历每个元素，创建新的对象数组
   */
  const chartData = typeData.map(item => ({
    name: item.name,    // 分类名称
    value: item.count   // 数值
  }))

  /**
   * 渲染组件 (JSX)
   * 返回数据概览页面的 UI 结构
   */
  return (
    // Card: 卡片组件，页面的主容器
    <Card title="数据概览">
      {/*
        Row: 栅格系统的行容器
        gutter={[16, 16]}: 设置栅格间距（水平间距, 垂直间距）
      */}
      <Row gutter={[16, 16]}>
        {/*
          Col: 栅格系统的列
          xs={24}: 超小屏幕占 24 列（100% 宽度）
          sm={24}: 小屏幕占 24 列（100% 宽度）
          md={12}: 中等及以上屏幕占 12 列（50% 宽度）
          
          这样实现响应式布局：移动端占满宽度，PC端两列显示
        */}
        <Col xs={24} sm={24} md={12}>
          {/* 产品类型分布饼图 */}
          <Card title="产品类型分布" size="small">
            {/*
              ResponsiveContainer: 自适应容器
              根据父元素尺寸自动调整图表大小
              height 根据设备类型：移动端 200px，PC端 260px
            */}
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
              {/* PieChart: 饼图组件 */}
              <PieChart>
                {/*
                  Pie: 饼图数据系列
                  data: 数据源
                  cx="50%", cy="50%": 饼图中心点位置
                  labelLine={false}: 不显示标签引线
                  label: 标签内容（这里为空字符串，不显示标签）
                  dataKey: 数据键名，对应 data 中的 value 字段
                */}
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={() => ''}
                  dataKey="value"
                >
                  {/* 遍历数据，为每个扇区设置颜色 */}
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                {/* Legend: 图例组件 */}
                <Legend />
                {/* Tooltip: 鼠标悬停提示，formatter 格式化显示的数值 */}
                <Tooltip formatter={(value) => [`${value} 个`, '产品数量']} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 产品类型数量统计柱状图 */}
        <Col xs={24} sm={24} md={12}>
          <Card title="产品类型数量统计" size="small">
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
              {/* BarChart: 柱状图组件 */}
              <BarChart data={chartData}>
                {/*
                  XAxis: X轴
                  dataKey="name": 使用数据的 name 字段作为 X 轴分类
                  fontSize: 根据设备类型调整字体大小
                */}
                <XAxis dataKey="name" fontSize={isMobile ? 10 : 12} />
                {/* YAxis: Y轴，显示数值 */}
                <YAxis fontSize={isMobile ? 10 : 12} />
                {/* Tooltip: 鼠标悬停显示数值 */}
                <Tooltip formatter={(value) => [`${value} 个`, '产品数量']} />
                {/*
                  Bar: 柱状图数据系列
                  dataKey="value": 使用数据的 value 字段
                  fill: 柱状图填充颜色
                  name: 图例名称
                */}
                <Bar dataKey="value" fill="#0088FE" name="产品数量" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Card>
  )
}