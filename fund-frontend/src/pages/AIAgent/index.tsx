// =====================
// React 核心 hooks
// =====================
/**
 * useState: 用于在函数组件中添加状态
 * useRef: 用于访问DOM元素或保持可变引用（不影响渲染）
 * useEffect: 用于处理副作用，如数据获取、订阅、DOM操作
 */
import { useState, useRef, useEffect } from 'react'

// =====================
// Ant Design UI 组件
// =====================
/**
 * Card: 卡片容器组件
 * Input: 输入框组件
 * Button: 按钮组件
 * List: 列表组件，用于展示消息
 * Spin: 加载动画组件
 * Typography: 排版组件，包含Paragraph等
 */
import { Card, Input, Button, List, Typography, Spin } from 'antd'

// =====================
// Ant Design Icons 图标
// =====================
/**
 * MessageOutlined: 消息图标
 * SendOutlined: 发送图标
 * LoadingOutlined: 加载图标
 * DeleteOutlined: 删除图标
 */
import { MessageOutlined, SendOutlined, LoadingOutlined, DeleteOutlined } from '@ant-design/icons'

// =====================
// Recharts 图表库
// =====================
/**
 * 用于渲染各种类型的图表
 * PieChart: 饼图
 * BarChart: 柱状图
 * LineChart: 折线图
 * RadarChart: 雷达图
 * 配套组件: Pie, Cell, Bar, Line, XAxis, YAxis, Tooltip 等
 */
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

// =====================
// Typography 解构
// =====================
/**
 * Paragraph: 段落组件，支持 whiteSpace: 'pre-wrap' 来保留换行符
 * 用于渲染消息内容，可以正确显示换行和空格
 */
const { Paragraph } = Typography

// =====================
// 工具 Hook
// =====================

/**
 * 检测是否为移动端设备
 * 根据窗口宽度判断，宽度小于768px视为移动端
 */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return isMobile
}

// =====================
// 类型定义
// =====================

/**
 * 图表数据结构
 * 用于存储AI返回的图表配置和数据
 */
interface ChartData {
  type: 'pie' | 'bar' | 'line' | 'radar'
  title: string
  data: Array<{ name: string; value: number }>
}

/**
 * 消息类型
 * - user: 用户发送的消息
 * - ai: AI返回的消息
 * - loading: 加载状态（已弃用，改用thinking）
 * - thinking: AI正在思考的状态
 */
interface Message {
  type: 'user' | 'ai' | 'loading' | 'thinking'
  content: string
  chart?: ChartData
}

// =====================
// 会话记忆存储键名
// =====================

/**
 * localStorage 键名：聊天消息列表
 * 用于持久化存储用户的聊天历史记录
 * 实现会话记忆功能：刷新页面后可以恢复之前的对话
 */
const STORAGE_KEY = 'fund_chat_messages'

/**
 * localStorage 键名：输入框内容
 * 用于持久化存储用户当前输入的内容
 * 防止刷新页面时输入内容丢失
 */
const INPUT_STORAGE_KEY = 'fund_ai_input'

/**
 * 默认欢迎消息
 * 组件初始化时显示的AI欢迎语，介绍功能和使用示例
 * 类型为 Message，包含 type(消息类型) 和 content(消息内容)
 */
const DEFAULT_WELCOME: Message = {
  type: 'ai',
  content: `你好！我是基金智能助手，我可以帮你完成以下任务：

📋 查询客户资料
  - 帮我查一下有哪些客户？
  - 查看客户张总的持仓情况

📦 管理产品
  - 帮我添加一个产品，产品名称是xxx，产品类型是股票型
  - 查询现在有哪些股票型基金？

📊 生成图表
  - 帮我生成按产品类型分组的数量饼图
  - 生成按产品状态分组的规模柱状图

💡 金融知识问答
  - 什么是基金定投？
  - 股票型和债券型有什么区别？

💬 试试这样说："帮我生成按产品类型分组的数量饼图"`
}

/**
 * 图表配色方案
 * 用于饼图和柱状图的颜色数组，按顺序循环使用
 * 每个颜色对应一个数据项，使图表更美观易区分
 */
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

/**
 * 图表渲染组件
 * 根据 chart 数据的 type 类型，渲染对应的图表
 * @param chart - 图表数据对象，包含类型、标题、数据
 * @param isMobile - 是否为移动端，用于调整图表尺寸
 */
function ChartRenderer({ chart, isMobile }: { chart: ChartData; isMobile?: boolean }) {
  // 处理数据：将 name 和 value 转换为字符串，并处理空值
  // item.name || '未知': 如果 name 为空，显示"未知"
  // Number(item.value) || 0: 确保 value 是数字，否则显示 0
  const data = chart.data.map(item => ({
    name: item.name || '未知',
    value: Number(item.value) || 0
  }))

  // 根据设备类型调整图表高度：移动端 180px，PC 端 250px
  const chartHeight = isMobile ? 180 : 250
  
  // 根据设备类型调整标签字体大小：移动端 10px，PC 端 12px
  const labelFontSize = isMobile ? 10 : 12

  // 渲染饼图 (Pie Chart)
  // 适用于展示占比、分类统计等数据
  if (chart.type === 'pie') {
    return (
      // ResponsiveContainer: 自适应容器会根据父元素自动调整大小
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart>
          {/* Pie: 饼图组件
              cx="50%", cy="50%": 饼图中心点位于容器中心
              labelLine={false}: 不显示标签引线
              label: 非移动端显示标签（名称和百分比）
              dataKey="value": 使用数据的 value 字段作为数值
          */}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={!isMobile ? ({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%` : undefined}
            dataKey="value"
          >
            {/* 遍历数据，为每个扇区设置颜色
                COLORS[index % COLORS.length]: 循环使用颜色数组
            */}
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {/* Legend: 图例组件，isMobile 时截断文字
              formatter: 格式化图例文字
          */}
          <Legend formatter={(value) => isMobile ? value.substring(0, 3) : value} />
          {/* Tooltip: 鼠标悬停提示，formatter 格式化显示的数值 */}
          <Tooltip formatter={(value) => [`${value}`, '数值']} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // 渲染柱状图 (Bar Chart)
  // 适用于展示分类对比、数量统计等数据
  if (chart.type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data}>
          {/* XAxis: X轴，显示分类名称
              dataKey="name": 使用数据的 name 字段
              fontSize: 字体大小
          */}
          <XAxis dataKey="name" fontSize={labelFontSize} />
          {/* YAxis: Y轴，显示数值 */}
          <YAxis fontSize={labelFontSize} />
          {/* Tooltip: 鼠标悬停显示数值 */}
          <Tooltip formatter={(value) => [`${value}`, '数值']} />
          {/* Bar: 柱状图数据系列
              dataKey="value": 使用数据的 value 字段
              fill: 柱状图填充颜色
          */}
          <Bar dataKey="value" fill="#0088FE" name="数值" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // 渲染折线图 (Line Chart)
  // 适用于展示趋势、变化等数据
  if (chart.type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart data={data}>
          <XAxis dataKey="name" fontSize={labelFontSize} />
          <YAxis fontSize={labelFontSize} />
          <Tooltip formatter={(value) => [`${value}`, '数值']} />
          {/* Line: 折线图数据系列
              type="monotone": 平滑曲线
              stroke: 线条颜色
          */}
          <Line type="monotone" dataKey="value" stroke="#0088FE" name="数值" />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  // 渲染雷达图 (Radar Chart)
  // 适用于展示多维度对比数据
  if (chart.type === 'radar') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          {/* PolarGrid: 极坐标网格 */}
          <PolarGrid />
          {/* PolarAngleAxis: 角度轴，显示分类名称 */}
          <PolarAngleAxis dataKey="name" fontSize={labelFontSize} />
          {/* PolarRadiusAxis: 半径轴，显示数值
              angle=30: 刻度角度
              domain={[0, 'auto']}: 数值范围从0到自动最大值
          */}
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
          {/* Radar: 雷达图数据区域
              fillOpacity: 填充透明度
          */}
          <Radar name="数值" dataKey="value" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
          <Tooltip formatter={(value) => [`${value}`, '数值']} />
        </RadarChart>
      </ResponsiveContainer>
    )
  }

  // 如果图表类型不匹配任何已支持的类型，返回 null（不渲染任何内容）
  return null
}

export default function AIAgent() {
  const isMobile = useIsMobile()

  /**
   * 消息列表状态
   * 初始化时从 localStorage 读取历史聊天记录，实现会话记忆功能
   * 如果 localStorage 中有保存的消息，则加载；否则使用默认欢迎语
   */
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        // 尝试解析 localStorage 中的消息JSON
        return JSON.parse(saved)
      } catch {
        // 解析失败时返回默认欢迎语
        return [DEFAULT_WELCOME]
      }
    }
    return [DEFAULT_WELCOME]
  })

  /**
   * 输入框内容状态
   * 初始化时从 localStorage 读取上次未发送的内容
   * 防止用户输入内容后刷新页面导致内容丢失
   */
  const [input, setInput] = useState(() => {
    return localStorage.getItem(INPUT_STORAGE_KEY) || ''
  })

  /**
   * 加载状态
   * 用于控制发送按钮的loading状态和输入框的禁用状态
   */
  const [loading, setLoading] = useState(false)

  // 引用：消息列表的DOM元素，用于自动滚动
  const listRef = useRef<any>(null)

  // 引用：AbortController，用于取消正在进行的请求
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * 会话记忆持久化：消息列表
   * 每次 messages 状态变化时，自动保存到 localStorage
   * 这样刷新页面后可以恢复之前的聊天记录
   */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  /**
   * 会话记忆持久化：输入框内容
   * 每次 input 状态变化时，自动保存到 localStorage
   * 防止用户输入内容后意外刷新页面导致内容丢失
   */
  useEffect(() => {
    localStorage.setItem(INPUT_STORAGE_KEY, input)
  }, [input])

  // 自动滚动到底部
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  /**
   * 发送问题函数
   * 处理用户发送消息的完整流程：
   * 1. 验证输入
   * 2. 发送请求到AI服务
   * 3. 接收流式响应
   * 4. 更新UI显示消息
   *
   * 注意：这是一个 async 异步函数，可以使用 await 等待Promise完成
   */
  const sendQuestion = async () => {
    // 防御性检查：
    // 1. input.trim() 检查输入是否为空（去除首尾空格后）
    // 2. loading 检查是否正在处理其他请求，防止重复提交
    if (!input.trim() || loading) return
    
    // 取消之前的请求
    // 如果用户连续快速发送多条消息，取消之前的请求可以避免响应混乱
    // AbortController 是 Web API，用于中止 fetch 请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    // 创建新的 AbortController 用于控制本次请求
    abortControllerRef.current = new AbortController()

    // 构建用户消息对象
    const userMsg: Message = { type: 'user', content: input }

    // 更新消息列表：
    // setMessages 接收一个函数，prev 是当前消息列表
    // ...prev 是展开运算符，复制现有数组
    // [...prev, userMsg, { type: 'thinking', content: '' }] 添加用户消息和思考状态
    setMessages(prev => [...prev, userMsg, { type: 'thinking', content: '' }])
    
    // 保存输入值到临时变量（因为 setInput('') 会立即清空 input）
    const inputValue = input
    // 清空输入框
    setInput('')
    // 设置加载状态为 true，禁用输入框和发送按钮
    setLoading(true)

    // 立即滚动到底部
    // setTimeout(..., 0) 将回调放入下一个宏任务队列
    // 确保DOM已更新后再执行滚动，避免滚动到错误位置
    setTimeout(() => {
      if (listRef.current) {
        // scrollTop: 滚动到元素底部
        listRef.current.scrollTop = listRef.current.scrollHeight
      }
    }, 0)

    // 获取 AI API 地址
    // import.meta.env.VITE_AI_API_URL 是 Vite 环境变量
    // 如果未设置，则默认使用本地地址 http://localhost:8001
    const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8001'

    try {
      // 发送 POST 请求到 AI 流式接口
      const response = await fetch(`${AI_API_URL}/ai/stream`, {
        method: 'POST',  // HTTP 方法
        headers: {
          // 告诉服务器发送的是 JSON 格式数据
          'Content-Type': 'application/json',
        },
        // 请求体：JSON 格式的问题
        body: JSON.stringify({ question: inputValue }),
        // 绑定 AbortController.signal，用于取消请求
        signal: abortControllerRef.current.signal
      })

      // 检查响应状态
      // response.ok 为 false 表示 HTTP 状态码不是 200-299
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      // 获取响应体的读取器
      // response.body 是 ReadableStream，用于读取流式数据
      const reader = response.body?.getReader()
      
      // 创建文本解码器，将二进制数据转换为字符串
      const decoder = new TextDecoder()
      
      // 缓冲区：用于存储不完整的 SSE 数据行
      // SSE (Server-Sent Events) 格式：每行以 "data: " 开头
      let buffer = ''

      // 检查读取器是否可用
      if (!reader) {
        throw new Error('No reader available')
      }

      // 循环读取流式数据
      // 这是一个无限循环，会一直读取直到服务器关闭连接
      while (true) {
        // read() 返回一个 Promise，解构出 done（是否完成）和 value（数据块）
        const { done, value } = await reader.read()
        
        // 如果 done 为 true，表示服务器已关闭连接，退出循环
        if (done) {
          break
        }

        // 解码当前数据块并添加到缓冲区
        // { stream: true } 表示这是流式解码，允许处理不完整的字符（如中文）
        buffer += decoder.decode(value, { stream: true })
        
        // 按换行符分割，处理多行数据
        const lines = buffer.split('\n')
        // 保留最后一行（可能是不完整的，等待下次数据补充）
        buffer = lines.pop() || ''

        // 遍历处理每一行
        for (const line of lines) {
          // SSE 格式：以 "data: " 开头的数据行才是有效数据
          if (line.startsWith('data: ')) {
            try {
              // 提取 JSON 部分（去掉 "data: " 前缀）
              // line.slice(6) 相当于 line.substring(6)
              const data = JSON.parse(line.slice(6))
              
              // 根据数据类型处理
              
              // type === 'thinking': AI 正在思考/生成中
              if (data.type === 'thinking') {
                setMessages(prev => {
                  // 过滤掉之前的 thinking 消息（避免多个 thinking 状态）
                  const filtered = prev.filter(m => m.type !== 'thinking')
                  // 添加新的 thinking 消息
                  return [...filtered, { type: 'thinking', content: data.content || '正在思考...' }]
                })
              }
              // type === 'content': AI 返回的文本内容（流式追加）
              else if (data.type === 'content') {
                setMessages(prev => {
                  const filtered = prev.filter(m => m.type !== 'thinking')
                  // 获取最后一条 AI 消息
                  const lastAiMsg = filtered[filtered.length - 1]
                  if (lastAiMsg && lastAiMsg.type === 'ai') {
                    // 已有 AI 消息：累加内容（追加而不是替换）
                    return [
                      ...filtered.slice(0, -1),  // 去掉最后一条 AI 消息
                      { ...lastAiMsg, content: lastAiMsg.content + data.content }  // 累加新内容
                    ]
                  } else {
                    // 没有 AI 消息：创建新的 AI 消息
                    return [...filtered, { type: 'ai', content: data.content }]
                  }
                })
              }
              // type === 'chart': AI 返回的图表数据（不走流式，一次性返回）
              else if (data.type === 'chart') {
                setMessages(prev => {
                  const filtered = prev.filter(m => m.type !== 'thinking')
                  const newMsg = {
                    type: 'ai' as const,  // as const 是 TypeScript 语法，表示字面量类型
                    content: data.answer || '已为您生成图表',
                    chart: data.chart  // 图表数据
                  }
                  return [...filtered, newMsg]
                })
              }
              // type === 'done': 流式响应完成
              else if (data.type === 'done') {
                // 移除 thinking 状态，表示响应完成
                setMessages(prev => prev.filter(m => m.type !== 'thinking'))
              }
              
              // 每次更新消息后滚动到底部
              setTimeout(() => {
                if (listRef.current) {
                  listRef.current.scrollTop = listRef.current.scrollHeight
                }
              }, 0)
              
            } catch (e) {
              // 解析 JSON 失败，记录错误但不中断流程
              console.error('Parse error:', e)
            }
          }
        }
      }
    } catch (err: any) {
      // 错误处理
      
      // AbortError: 用户取消请求或快速发送新消息
      // 这种情况下不显示错误提示，因为是用户主动行为
      if (err.name === 'AbortError') {
        return
      }
      
      // 其他错误：移除 thinking 状态，显示错误消息
      setMessages(prev => {
        const filtered = prev.filter(m => m.type !== 'thinking')
        return [...filtered, { type: 'ai', content: '服务异常，请稍后再试' }]
      })
    } finally {
      // finally 块：无论成功还是失败都会执行
      
      // 重置加载状态，启用输入框和发送按钮
      setLoading(false)
      // 清理 AbortController 引用
      abortControllerRef.current = null
    }
  }

  /**
   * 清空聊天记录
   * 清除 localStorage 中的聊天历史，恢复到初始状态
   * 同时取消正在进行的请求
   */
  const clearChat = async () => {
    // 取消正在进行的请求，防止清空后还在处理之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    
    // 清除 localStorage 中的聊天记录
    localStorage.removeItem(STORAGE_KEY)
    // 重置消息列表为默认欢迎语
    setMessages([DEFAULT_WELCOME])
    // 重置加载状态
    setLoading(false)
  }

  /**
   * 组件渲染 (JSX)
   * 返回组件的 UI 结构，类似于 Vue 的模板语法
   */
  return (
    // Card: Ant Design 卡片组件，作为整个聊天界面的容器
    // title: 卡片标题，包含图标和文字
    // extra: 卡片右上角的额外内容，这里是清空聊天按钮
    // style: 设置卡片高度为 100%
    <Card
      title={<><MessageOutlined /> AI 智能基金助手</>}
      extra={
        // Button: 按钮组件
        // type="text": 文本按钮样式
        // icon: 按钮图标
        // onClick: 点击事件处理函数
        // danger: 危险按钮样式（红色）
        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={clearChat}
          danger
        >
          清空聊天
        </Button>
      }
      style={{ height: '100%' }}
    >
      {/* div: 主容器，设置布局和尺寸 */}
      <div style={{
        // 高度：移动端为视口高度减去200px，PC端固定500px
        height: isMobile ? 'calc(100vh - 200px)' : '500px',
        // 使用 Flex 布局
        display: 'flex',
        // 垂直排列
        flexDirection: 'column',
        // 两端对齐
        justifyContent: 'space-between'
      }}>
        {/*
          List: Ant Design 列表组件，用于展示消息
          ref: 绑定 DOM 引用，用于滚动操作
          itemLayout="vertical": 垂直布局
          dataSource: 数据源，即消息数组
          style: 设置滚动和尺寸
          renderItem: 渲染每一项的函数
        */}
        <List
          ref={listRef}
          itemLayout="vertical"
          dataSource={messages}
          style={{ overflowY: 'auto', marginBottom: 16, maxHeight: isMobile ? 'calc(100% - 60px)' : 420 }}
          // renderItem 接收一个函数，item 是当前消息，index 是索引
          renderItem={(item) => (
            // List.Item: 列表项容器
            // 根据消息类型设置对齐方式：用户消息右对齐，AI消息左对齐
            <List.Item style={{ textAlign: item.type === 'user' ? 'right' : 'left' }}>
              {/* 条件渲染：根据消息类型显示不同内容 */}
              
              {/* loading 或 thinking 状态：显示加载动画 */}
              {item.type === 'loading' || item.type === 'thinking' ? (
                <Card
                  size="small"
                  style={{
                    // 宽度：移动端85%，PC端70%
                    maxWidth: isMobile ? '85%' : '70%',
                    display: 'inline-block',
                    background: '#f5f5f5'  // 灰色背景
                  }}
                >
                  {/*
                    Spin: 加载动画组件
                    indicator: 自定义动画图标，这里使用 LoadingOutlined
                    style: 设置图标大小
                  */}
                  <Spin indicator={<LoadingOutlined style={{ fontSize: isMobile ? 14 : 18 }} spin />} />
                  {/* 加载提示文字 */}
                  <span style={{ marginLeft: 8, fontSize: isMobile ? 12 : 14 }}>{item.content || '正在思考...'}</span>
                </Card>
              ) : (
                // user 或 ai 消息：显示消息卡片
                <Card
                  size="small"
                  style={{
                    maxWidth: isMobile ? '85%' : '70%',
                    display: 'inline-block',
                    // 用户消息：蓝色背景 (#e6f7ff)，AI消息：灰色背景 (#f5f5f5)
                    background: item.type === 'user' ? '#e6f7ff' : '#f5f5f5'
                  }}
                >
                  {/*
                    Paragraph: 段落组件
                    style:
                      whiteSpace: 'pre-wrap' - 保留换行符和空格
                      marginBottom: 0 - 移除底部间距
                      fontSize: 根据设备类型设置
                  */}
                  <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0, fontSize: isMobile ? 12 : 14 }}>{item.content}</Paragraph>
                  
                  {/* 如果有图表数据，渲染图表 */}
                  {/* item.chart && 是短路运算符，如果 chart 存在才渲染后面内容 */}
                  {item.chart && (
                    <div style={{ marginTop: 16 }}>
                      {/* 图表标题 */}
                      <h4 style={{ marginBottom: 8, fontSize: isMobile ? 12 : 14 }}>{item.chart.title}</h4>
                      {/* 渲染图表组件 */}
                      <ChartRenderer chart={item.chart} isMobile={isMobile} />
                    </div>
                  )}
                </Card>
              )}
            </List.Item>
          )}
        />

        {/* 底部输入区域 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/*
            Input: 输入框组件
            value: 绑定输入值
            onChange: 输入变化事件，e.target.value 是输入的内容
            placeholder: 占位符
            onPressEnter: 按回车键事件
            disabled: 是否禁用（加载时禁用）
            style: flex: 1 占据剩余空间
          */}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的问题..."
            onPressEnter={sendQuestion}
            disabled={loading}
            style={{ flex: 1, minWidth: isMobile ? '100%' : 'auto' }}
          />
          
          {/*
            Button: 发送按钮
            type="primary": 主要按钮样式（蓝色）
            icon: 发送图标
            onClick: 点击事件
            loading: 加载状态，显示加载动画并禁用按钮
          */}
          <Button type="primary" icon={<SendOutlined />} onClick={sendQuestion} loading={loading}>
            发送
          </Button>
        </div>
      </div>
    </Card>
  )
}