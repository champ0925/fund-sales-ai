// =====================
// React 核心 hooks
// =====================
/**
 * useState: 用于在函数组件中添加状态（状态管理）
 * useEffect: 用于处理副作用操作，如监听窗口大小变化
 */
import { useState, useEffect } from 'react'

// =====================
// React Router 路由管理
// =====================
/**
 * BrowserRouter: 路由容器，使用 HTML5 History API
 * Routes: 路由配置容器
 * Route: 单个路由配置
 * useLocation: 获取当前路由路径的 Hook
 * Link: 路由链接组件，类似于 <a> 标签但不刷新页面
 */
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom'

// =====================
// Ant Design 组件
// =====================
/**
 * Layout: 布局组件，包含 Header、Sider、Content
 * Menu: 导航菜单组件
 * Drawer: 抽屉组件，用于移动端侧边栏
 * Button: 按钮组件
 */
import { Layout as AntLayout, Menu, Drawer, Button } from 'antd'

// =====================
// Ant Design Icons 图标
// =====================
/**
 * ProductOutlined: 产品图标
 * DashboardOutlined: 仪表盘图标
 * UserOutlined: 用户图标
 * RobotOutlined: 机器人图标（AI助手）
 * MenuOutlined: 菜单图标（移动端）
 */
import { ProductOutlined, DashboardOutlined, UserOutlined, RobotOutlined, MenuOutlined } from '@ant-design/icons'

// =====================
// 页面组件导入
// =====================
import Product from './pages/Product'
import Customer from './pages/Customer'
import Dashboard from './pages/Dashboard'
import AIAgent from './pages/AIAgent'

/**
 * 从 Ant Design Layout 中解构出三个常用组件：
 * - Header: 顶部导航区域
 * - Sider: 侧边栏区域
 * - Content: 内容区域
 */
const { Header, Sider, Content } = AntLayout

// =====================
// 自定义 Hook: 检测移动端
// =====================
/**
 * useIsMobile Hook
 * 用于检测当前设备是否为移动端（屏幕宽度 < 768px）
 * 实现原理：
 * 1. 使用 useState 初始化状态，window.innerWidth < 768 为移动端
 * 2. 使用 useEffect 监听窗口 resize 事件
 * 3. 组件卸载时移除事件监听（清理副作用）
 *
 * @returns boolean - true 表示移动端，false 表示 PC 端
 */
const useIsMobile = () => {
  // 初始化：检查当前窗口宽度
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  // useEffect: 组件挂载后执行，用于设置副作用
  useEffect(() => {
    // 窗口大小变化时的处理函数
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // 监听 resize 事件
    window.addEventListener('resize', handleResize)
    
    // 返回清理函数：组件卸载时移除事件监听
    // 这是 React useEffect 的重要模式，防止内存泄漏
    return () => window.removeEventListener('resize', handleResize)
  }, []) // 空依赖数组：只运行一次（挂载时），相当于 componentDidMount
  
  return isMobile
}

// =====================
// 主内容组件
// =====================
/**
 * AppContent 函数组件
 * 这是应用的主布局组件，根据设备类型（移动端/PC端）渲染不同布局
 * 使用 useLocation 获取当前路由路径，高亮对应菜单项
 */
function AppContent() {
  // useLocation: React Router Hook，获取当前路由信息
  // location.pathname 返回当前路径，如 /product, /customer 等
  const location = useLocation()
  
  // 使用自定义 Hook 判断是否为移动端
  const isMobile = useIsMobile()
  
  // 抽屉可见状态（移动端侧边栏）
  const [drawerVisible, setDrawerVisible] = useState(false)

  /**
   * 计算当前选中的菜单项 key
   * 使用立即执行函数 (IIFE) 根据当前路由路径返回对应 key
   * - /product -> '1' (产品货架)
   * - /customer -> '2' (客户管理)
   * - /dashboard -> '3' (数据概览)
   * - /ai -> '4' (AI智能助手)
   * - 其他 -> '1' (默认产品货架)
   */
  const selectedKey = (() => {
    if (location.pathname === '/customer') return '2'
    if (location.pathname === '/dashboard') return '3'
    if (location.pathname === '/ai') return '4'
    return '1'
  })()

  /**
   * 菜单项配置数组
   * 每个对象包含：
   * - key: 唯一标识
   * - icon: 图标组件
   * - label: 显示文本（使用 Link 组件实现路由跳转）
   */
  const menuItems = [
    { key: '1', icon: <ProductOutlined />, label: <Link to="/product">产品货架</Link> },
    { key: '2', icon: <UserOutlined />, label: <Link to="/customer">客户管理</Link> },
    { key: '3', icon: <DashboardOutlined />, label: <Link to="/dashboard">数据概览</Link> },
    { key: '4', icon: <RobotOutlined />, label: <Link to="/ai">AI 智能助手</Link> },
  ]

  /**
   * 菜单点击处理函数
   * 移动端用户点击菜单项后，关闭侧边栏抽屉
   */
  const handleMenuClick = () => {
    if (isMobile) {
      setDrawerVisible(false)
    }
  }

  // 移动端布局
  if (isMobile) {
    return (
      <AntLayout style={{ height: '100%', width: '100%' }}>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)} />
          <span style={{ fontSize: '16px', fontWeight: 500 }}>基金销售系统</span>
          <div style={{ width: 40 }} />
        </Header>
        <Content style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
          <Routes>
            <Route path="/product" element={<Product />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai" element={<AIAgent />} />
            <Route path="*" element={<Product />} />
          </Routes>
        </Content>
        <Drawer
          title="基金销售系统"
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={250}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Drawer>
      </AntLayout>
    )
  }

  // 桌面端布局
  return (
    <AntLayout style={{ height: '100%', width: '100%' }}>
      <Sider width={220} style={{ background: '#fff' }}>
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '16px', fontWeight: 500 }}>
          基金销售系统
        </div>
        <Menu mode="inline" selectedKeys={[selectedKey]} style={{ height: '100%', borderRight: 0 }} items={menuItems} />
      </Sider>

      <AntLayout style={{ height: '100%' }}>
        <Header style={{ background: '#fff' }} />
        <Content style={{ padding: '24px', height: '100%', overflow: 'auto' }}>
          <Routes>
            <Route path="/product" element={<Product />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai" element={<AIAgent />} />
            <Route path="*" element={<Product />} />
          </Routes>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

/**
 * App 根组件
 * 整个应用的入口组件
 * 使用 Router 包裹，提供路由功能
 */
function App() {
  return (
    // Router: BrowserRouter 组件，提供 HTML5 History API 支持
    // 所有使用 useLocation、Link 等路由 Hook 的组件必须在 Router 内
    <Router>
      <AppContent />
    </Router>
  )
}

// 导出 App 组件作为默认导出
// 这是 React 组件的标准导出方式
export default App