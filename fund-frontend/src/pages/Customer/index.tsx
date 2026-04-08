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
 * Table: 表格组件
 * Button: 按钮组件
 * Card: 卡片组件
 * Tabs: 标签页组件，TabPane 是标签页面板
 * Input: 输入框组件，Search 是搜索输入框
 * Modal: 弹窗组件
 * message: 全局提示组件
 * Popconfirm: 气泡确认框
 * Select: 下拉选择器，Option 是选项组件
 */
import { Table, Button, Card, Tabs, Input, Modal, message, Popconfirm, Select } from 'antd'

// =====================
// Ant Design Icons
// =====================
/**
 * PlusOutlined: 添加图标
 * DeleteOutlined: 删除图标
 * ReloadOutlined: 刷新图标
 */
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'

// =====================
// 网络请求和日期处理
// =====================
/**
 * axios: HTTP 客户端库
 * dayjs: 日期处理库（轻量级的 moment.js 替代品）
 */
import axios from 'axios'
import dayjs from 'dayjs'

// API 配置
import apiConfig from '../../utils/api'

// =====================
// 解构组件
// =====================
/**
 * Search: 搜索输入框组件
 */
const { Search } = Input

/**
 * Option: 下拉选择器选项
 */
const { Option } = Select

/**
 * TabPane: 标签页面板（Tabs 的子组件）
 */
const { TabPane } = Tabs

// =====================
// 自定义 Hook: 检测移动端
// =====================
/**
 * useIsMobile Hook
 * 检测当前是否为移动端设备（窗口宽度 < 768px）
 */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    // 清理函数：组件卸载时移除事件监听
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return isMobile
}

// =====================
// TypeScript 类型定义
// =====================

/**
 * 客户数据类型
 */
interface Customer {
  id: number             // 客户唯一ID
  customer_name: string  // 客户姓名
  phone: string          // 联系电话
  company: string        // 所属公司
  customer_status: string // 客户状态（意向/合作/流失）
  create_time: string    // 创建时间
}

/**
 * 客户持有产品数据类型
 * 记录客户购买的产品信息
 */
interface Product {
  id: number             // 记录ID
  product_id: number     // 产品ID（关联 products 表）
  product_name: string   // 产品名称
  product_type: string   // 产品类型
  hold_amount: number    // 持有金额（万元）
  buy_time: string       // 购买时间
}

/**
 * 客户跟进记录数据类型
 */
interface Follow {
  id: number             // 记录ID
  follow_way: string     // 跟进方式（电话/微信/面谈）
  follow_content: string // 跟进内容
  follow_time: string    // 跟进时间
  next_plan: string      // 下次计划
}

/**
 * 产品选项数据类型
 * 用于下拉选择产品
 */
interface AllProduct {
  id: number             // 产品ID
  product_name: string   // 产品名称
  product_type: string   // 产品类型
}

// 表单数据类型
/**
 * 客户表单数据类型
 */
interface CustomerFormData {
  customer_name: string
  phone: string
  company: string
  customer_status: string
}

/**
 * 持有产品表单数据类型
 */
interface HoldFormData {
  product_id: number
  hold_amount: number
  buy_time: string
}

/**
 * 跟进记录表单数据类型
 */
interface FollowFormData {
  follow_way: string
  follow_content: string
  follow_time: string
  next_plan: string
}

/**
 * Customer 客户管理页面组件
 * 用于管理客户信息、持有产品和跟进记录
 */
export default function Customer() {
  const isMobile = useIsMobile()
  
  // =====================
  // 状态定义
  // =====================
  
  /**
   * 客户列表状态
   * 存储从 API 获取的所有客户数据
   */
  const [list, setList] = useState<Customer[]>([])
  
  /**
   * 筛选后的客户列表
   */
  const [filteredList, setFilteredList] = useState<Customer[]>([])
  
  /**
   * 所有产品列表（用于新增持有产品时选择）
   */
  const [allProducts, setAllProducts] = useState<AllProduct[]>([])
  
  /**
   * 当前查看的客户 ID
   * 用于展示该客户的详情（持有产品、跟进记录）
   */
  const [currentId, setCurrentId] = useState<number | null>(null)
  
  /**
   * 当前查看的客户姓名
   * 用于在详情标题中显示
   */
  const [currentCustomerName, setCurrentCustomerName] = useState<string>('')
  
  /**
   * 当前客户的持有产品列表
   */
  const [products, setProducts] = useState<Product[]>([])
  
  /**
   * 当前客户的跟进记录列表
   */
  const [follows, setFollows] = useState<Follow[]>([])
  
  // 客户 Modal 相关状态
  /** 客户表单弹窗是否可见 */
  const [customerModalVisible, setCustomerModalVisible] = useState(false)
  /** 客户表单弹窗标题 */
  const [customerModalTitle, setCustomerModalTitle] = useState('新增客户')
  /** 客户表单数据 */
  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    customer_name: '',
    phone: '',
    company: '',
    customer_status: '意向'
  })
  /** 编辑中的客户 ID，null 表示新增 */
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null)
  
  // 持有产品 Modal 相关状态
  /** 持有产品表单弹窗是否可见 */
  const [holdModalVisible, setHoldModalVisible] = useState(false)
  /** 持有产品表单弹窗标题 */
  const [holdModalTitle, setHoldModalTitle] = useState('新增持有产品')
  /** 持有产品表单数据 */
  const [holdFormData, setHoldFormData] = useState<HoldFormData>({
    product_id: 0,
    hold_amount: 0,
    buy_time: dayjs().format('YYYY-MM-DD')  // 默认今天日期
  })
  /** 编辑中的持有产品 ID */
  const [editingHoldId, setEditingHoldId] = useState<number | null>(null)
  
  // 跟进记录 Modal 相关状态
  /** 跟进记录表单弹窗是否可见 */
  const [followModalVisible, setFollowModalVisible] = useState(false)
  /** 跟进记录表单弹窗标题 */
  const [followModalTitle, setFollowModalTitle] = useState('新增跟进记录')
  /** 跟进记录表单数据 */
  const [followFormData, setFollowFormData] = useState<FollowFormData>({
    follow_way: '电话',
    follow_content: '',
    follow_time: dayjs().format('YYYY-MM-DD'),
    next_plan: ''
  })
  /** 编辑中的跟进记录 ID */
  const [editingFollowId, setEditingFollowId] = useState<number | null>(null)
  
  // 多选相关状态
  /** 客户列表选中项 */
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  /** 持有产品列表选中项 */
  const [selectedProductKeys, setSelectedProductKeys] = useState<React.Key[]>([])
  /** 跟进记录列表选中项 */
  const [selectedFollowKeys, setSelectedFollowKeys] = useState<React.Key[]>([])

  // =====================
  // 数据获取函数
  // =====================

  /**
   * 获取客户列表
   * 从 API 获取所有客户数据
   */
  const getList = async () => {
    try {
      const res = await axios.get(apiConfig.endpoints.customers)
      setList(res.data)
      setFilteredList(res.data)
    } catch (error) {
      console.error('获取客户列表失败:', error)
    }
  }

  /**
   * 获取所有产品列表
   * 用于在新增持有产品时提供产品选择
   */
  const getAllProducts = async () => {
    try {
      const res = await axios.get(apiConfig.endpoints.products)
      setAllProducts(res.data)
    } catch (error) {
      console.error('获取产品列表失败:', error)
    }
  }

  /**
   * 获取客户持有产品
   * 根据客户 ID 获取该客户持有的所有产品
   * @param id - 客户 ID
   */
  const getProducts = async (id: number) => {
    try {
      const res = await axios.get(apiConfig.endpoints.customerProducts(id))
      setProducts(res.data)
    } catch (error) {
      console.error('获取客户产品失败:', error)
    }
  }

  /**
   * 获取客户跟进记录
   * 根据客户 ID 获取该客户的所有跟进记录
   * @param id - 客户 ID
   */
  const getFollows = async (id: number) => {
    try {
      const res = await axios.get(apiConfig.endpoints.followCustomer(id))
      setFollows(res.data)
    } catch (error) {
      console.error('获取客户跟进记录失败:', error)
    }
  }

  /**
   * 组件挂载后获取初始数据
   */
  useEffect(() => {
    getList()
    getAllProducts()
  }, [])

  // =====================
  // 搜索处理函数
  // =====================

  /**
   * 搜索处理函数
   * 根据客户姓名或公司名称进行模糊搜索
   * @param value - 搜索关键字
   */
  const handleSearch = (value: string) => {
    // 同时按姓名和公司搜索
    const result = list.filter((item) =>
      item.customer_name.includes(value) || item.company.includes(value)
    )
    setFilteredList(result)
  }

  // =====================
  // 客户 CRUD 操作
  // =====================

  /**
   * 新增客户处理函数
   */
  const handleAddCustomer = () => {
    setCustomerModalTitle('新增客户')
    setEditingCustomerId(null)
    setCustomerFormData({
      customer_name: '',
      phone: '',
      company: '',
      customer_status: '意向'
    })
    setCustomerModalVisible(true)
  }

  /**
   * 编辑客户处理函数
   * @param record - 要编辑的客户记录
   */
  const handleEditCustomer = (record: Customer) => {
    setCustomerModalTitle('编辑客户')
    setEditingCustomerId(record.id)
    setCustomerFormData({
      customer_name: record.customer_name,
      phone: record.phone,
      company: record.company,
      customer_status: record.customer_status
    })
    setCustomerModalVisible(true)
  }

  /**
   * 删除客户处理函数
   * @param id - 要删除的客户 ID
   */
  const handleDeleteCustomer = async (id: number) => {
    try {
      await axios.delete(`${apiConfig.endpoints.customers}/${id}`)
      message.success('删除成功')
      // 如果删除的是当前查看的客户，关闭详情面板
      if (currentId === id) {
        setCurrentId(null)
        setCurrentCustomerName('')
        setProducts([])
        setFollows([])
      }
      getList()
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 批量删除客户处理函数
   */
  const handleBatchDeleteCustomer = async () => {
    try {
      await axios.post(apiConfig.endpoints.customerBatchDelete, {
        ids: selectedRowKeys
      })
      message.success('批量删除成功')
      setSelectedRowKeys([])
      getList()
    } catch (error) {
      message.error('批量删除失败')
    }
  }

  /**
   * 提交客户表单
   * 根据 editingCustomerId 判断是新增还是编辑
   */
  const handleSubmitCustomer = async () => {
    try {
      if (editingCustomerId) {
        // 编辑模式
        await axios.put(`${apiConfig.endpoints.customers}/${editingCustomerId}`, customerFormData)
        message.success('编辑成功')
      } else {
        // 新增模式
        await axios.post(apiConfig.endpoints.customers, customerFormData)
        message.success('新增成功')
      }
      setCustomerModalVisible(false)
      getList()
    } catch (error) {
      message.error('操作失败')
    }
  }

  // =====================
  // 持有产品 CRUD 操作
  // =====================

  /**
   * 新增持有产品处理函数
   */
  const handleAddHold = () => {
    setHoldModalTitle('新增持有产品')
    setEditingHoldId(null)
    setHoldFormData({
      product_id: 0,
      hold_amount: 0,
      buy_time: dayjs().format('YYYY-MM-DD')
    })
    setHoldModalVisible(true)
  }

  /**
   * 编辑持有产品处理函数
   * @param record - 要编辑的持有产品记录
   */
  const handleEditHold = (record: Product) => {
    setHoldModalTitle('编辑持有产品')
    setEditingHoldId(record.id)
    // 处理日期格式：后端返回的可能是 ISO 格式，如 "2024-02-01T00:00:00"
    setHoldFormData({
      product_id: record.product_id,
      hold_amount: record.hold_amount,
      buy_time: record.buy_time ? record.buy_time.split('T')[0] : dayjs().format('YYYY-MM-DD')
    })
    setHoldModalVisible(true)
  }

  /**
   * 删除持有产品处理函数
   * @param id - 要删除的持有产品记录 ID
   */
  const handleDeleteHold = async (id: number) => {
    try {
      await axios.delete(apiConfig.endpoints.customerHoldDetail(id))
      message.success('删除成功')
      if (currentId) getProducts(currentId)
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 批量删除持有产品处理函数
   */
  const handleBatchDeleteHold = async () => {
    try {
      await axios.post(apiConfig.endpoints.customerHoldBatchDelete, {
        ids: selectedProductKeys
      })
      message.success('批量删除成功')
      setSelectedProductKeys([])
      if (currentId) getProducts(currentId)
    } catch (error) {
      message.error('批量删除失败')
    }
  }

  /**
   * 提交持有产品表单
   */
  const handleSubmitHold = async () => {
    try {
      if (editingHoldId) {
        // 编辑模式
        await axios.put(apiConfig.endpoints.customerHoldDetail(editingHoldId), holdFormData)
        message.success('编辑成功')
      } else {
        // 新增模式，需要传入 customer_id
        await axios.post(apiConfig.endpoints.customerHold, {
          customer_id: currentId,
          ...holdFormData  // 展开运算符，合并表单数据
        })
        message.success('新增成功')
      }
      setHoldModalVisible(false)
      if (currentId) getProducts(currentId)
    } catch (error) {
      message.error('操作失败')
    }
  }

  // =====================
  // 跟进记录 CRUD 操作
  // =====================

  /**
   * 新增跟进记录处理函数
   */
  const handleAddFollow = () => {
    setFollowModalTitle('新增跟进记录')
    setEditingFollowId(null)
    setFollowFormData({
      follow_way: '电话',
      follow_content: '',
      follow_time: dayjs().format('YYYY-MM-DD'),
      next_plan: ''
    })
    setFollowModalVisible(true)
  }

  /**
   * 编辑跟进记录处理函数
   * @param record - 要编辑的跟进记录
   */
  const handleEditFollow = (record: Follow) => {
    setFollowModalTitle('编辑跟进记录')
    setEditingFollowId(record.id)
    setFollowFormData({
      follow_way: record.follow_way,
      follow_content: record.follow_content,
      // 处理日期格式
      follow_time: record.follow_time ? record.follow_time.split('T')[0] : dayjs().format('YYYY-MM-DD'),
      next_plan: record.next_plan
    })
    setFollowModalVisible(true)
  }

  /**
   * 删除跟进记录处理函数
   * @param id - 要删除的跟进记录 ID
   */
  const handleDeleteFollow = async (id: number) => {
    try {
      await axios.delete(apiConfig.endpoints.followDetail(id))
      message.success('删除成功')
      if (currentId) getFollows(currentId)
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 批量删除跟进记录处理函数
   */
  const handleBatchDeleteFollow = async () => {
    try {
      await axios.post(apiConfig.endpoints.followBatchDelete, {
        ids: selectedFollowKeys
      })
      message.success('批量删除成功')
      setSelectedFollowKeys([])
      if (currentId) getFollows(currentId)
    } catch (error) {
      message.error('批量删除失败')
    }
  }

  /**
   * 提交跟进记录表单
   */
  const handleSubmitFollow = async () => {
    try {
      if (editingFollowId) {
        // 编辑模式
        await axios.put(apiConfig.endpoints.followDetail(editingFollowId), followFormData)
        message.success('编辑成功')
      } else {
        // 新增模式，需要传入 customer_id
        await axios.post(apiConfig.endpoints.followAdd, {
          customer_id: currentId,
          ...followFormData
        })
        message.success('新增成功')
      }
      setFollowModalVisible(false)
      if (currentId) getFollows(currentId)
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 表格列
  const customerColumns = isMobile
    ? [
        { title: '客户', dataIndex: 'customer_name', render: (text: string, record: Customer) => `${text} (${record.phone})` },
        { title: '状态', dataIndex: 'customer_status' },
        {
          title: '操作',
          width: 100,
          render: (_: any, record: Customer) => (
            <Button
              type="link"
              size="small"
              onClick={() => {
                setCurrentId(record.id)
                setCurrentCustomerName(record.customer_name)
                getProducts(record.id)
                getFollows(record.id)
              }}
            >
              详情
            </Button>
          )
        }
      ]
    : [
        { title: '客户姓名', dataIndex: 'customer_name' },
        { title: '电话', dataIndex: 'phone' },
        { title: '公司', dataIndex: 'company' },
        { title: '状态', dataIndex: 'customer_status' },
        {
          title: '操作',
          render: (_: any, record: Customer) => (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  setCurrentId(record.id)
                  setCurrentCustomerName(record.customer_name)
                  getProducts(record.id)
                  getFollows(record.id)
                }}
                style={{ marginRight: 8 }}
              >
                详情
              </Button>
              <Button size="small" onClick={() => handleEditCustomer(record)} style={{ marginRight: 8 }}>
                编辑
              </Button>
              <Popconfirm title="确定删除该客户?" onConfirm={() => handleDeleteCustomer(record.id)} okText="确定" cancelText="取消">
                <Button size="small" danger>删除</Button>
              </Popconfirm>
            </>
          )
        }
      ]

  const holdColumns = isMobile
    ? [
        { title: '产品', dataIndex: 'product_name', ellipsis: true },
        { title: '金额', dataIndex: 'hold_amount' },
        {
          title: '操作',
          width: 60,
          render: (_: any, record: Product) => (
            <Button type="link" size="small" danger onClick={() => handleDeleteHold(record.id)}>删</Button>
          )
        }
      ]
    : [
        { title: '产品名称', dataIndex: 'product_name' },
        { title: '类型', dataIndex: 'product_type' },
        { title: '持有金额(万)', dataIndex: 'hold_amount' },
        { title: '购买时间', dataIndex: 'buy_time', render: (text: string) => text ? text.split('T')[0] : '-' },
        {
          title: '操作',
          render: (_: any, record: Product) => (
            <>
              <a onClick={() => handleEditHold(record)} style={{ marginRight: 8 }}>编辑</a>
              <Popconfirm title="确定删除?" onConfirm={() => handleDeleteHold(record.id)} okText="确定" cancelText="取消">
                <a style={{ color: 'red' }}>删除</a>
              </Popconfirm>
            </>
          )
        }
      ]

  const followColumns = isMobile
    ? [
        { title: '方式', dataIndex: 'follow_way', width: 60 },
        { title: '内容', dataIndex: 'follow_content', ellipsis: true },
        { title: '时间', dataIndex: 'follow_time', render: (text: string) => text ? text.split('T')[0] : '-', width: 80 },
      ]
    : [
        { title: '方式', dataIndex: 'follow_way' },
        { title: '内容', dataIndex: 'follow_content', ellipsis: true },
        { title: '时间', dataIndex: 'follow_time', render: (text: string) => text ? text.split('T')[0] : '-' },
        { title: '下次计划', dataIndex: 'next_plan', ellipsis: true },
        {
          title: '操作',
          render: (_: any, record: Follow) => (
            <>
              <a onClick={() => handleEditFollow(record)} style={{ marginRight: 8 }}>编辑</a>
              <Popconfirm title="确定删除?" onConfirm={() => handleDeleteFollow(record.id)} okText="确定" cancelText="取消">
                <a style={{ color: 'red' }}>删除</a>
              </Popconfirm>
            </>
          )
        }
      ]

  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys) }
  const productRowSelection = { selectedRowKeys: selectedProductKeys, onChange: (keys: React.Key[]) => setSelectedProductKeys(keys) }
  const followRowSelection = { selectedRowKeys: selectedFollowKeys, onChange: (keys: React.Key[]) => setSelectedFollowKeys(keys) }

  return (
    <Card title="客户管理">
      {/* 搜索 + 操作栏 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <Search placeholder="搜索客户" style={{ minWidth: isMobile ? '100%' : 200 }} onSearch={handleSearch} />
        <Button icon={<ReloadOutlined />} onClick={() => getList()}>刷新</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCustomer}>新增</Button>
        <Popconfirm title="确定删除选中的客户?" onConfirm={handleBatchDeleteCustomer} okText="确定" cancelText="取消" disabled={selectedRowKeys.length === 0}>
          <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0}>批量删除 ({selectedRowKeys.length})</Button>
        </Popconfirm>
      </div>

      {/* 客户表格 */}
      <Table rowKey="id" columns={customerColumns} dataSource={filteredList} pagination={{ pageSize: 10 }} rowSelection={rowSelection} />

      {/* 客户详情 */}
      {currentId && (
        <Card style={{ marginTop: 20 }} title={`${currentCustomerName}-客户详情`}>
          <Tabs>
            <TabPane tab="持有产品" key="1">
              <div style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddHold} style={{ marginRight: 8 }}>新增持有产品</Button>
                <Popconfirm title="确定删除选中的产品?" onConfirm={handleBatchDeleteHold} okText="确定" cancelText="取消" disabled={selectedProductKeys.length === 0}>
                  <Button danger icon={<DeleteOutlined />} disabled={selectedProductKeys.length === 0}>批量删除 ({selectedProductKeys.length})</Button>
                </Popconfirm>
              </div>
              <Table rowKey="id" columns={holdColumns} dataSource={products} pagination={{ pageSize: 5 }} rowSelection={productRowSelection} />
            </TabPane>

            <TabPane tab="跟进记录" key="2">
              <div style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddFollow} style={{ marginRight: 8 }}>新增跟进记录</Button>
                <Popconfirm title="确定删除选中的记录?" onConfirm={handleBatchDeleteFollow} okText="确定" cancelText="取消" disabled={selectedFollowKeys.length === 0}>
                  <Button danger icon={<DeleteOutlined />} disabled={selectedFollowKeys.length === 0}>批量删除 ({selectedFollowKeys.length})</Button>
                </Popconfirm>
              </div>
              <Table rowKey="id" columns={followColumns} dataSource={follows} pagination={{ pageSize: 5 }} rowSelection={followRowSelection} />
            </TabPane>
          </Tabs>
        </Card>
      )}

      {/* 客户表单弹窗 */}
      <Modal title={customerModalTitle} open={customerModalVisible} onCancel={() => setCustomerModalVisible(false)} onOk={handleSubmitCustomer} width={isMobile ? '90%' : 500}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>客户姓名：</label>
            <Input value={customerFormData.customer_name} onChange={e => setCustomerFormData({ ...customerFormData, customer_name: e.target.value })} placeholder="请输入客户姓名" />
          </div>
          <div>
            <label>电话：</label>
            <Input value={customerFormData.phone} onChange={e => setCustomerFormData({ ...customerFormData, phone: e.target.value })} placeholder="请输入电话号码" />
          </div>
          <div>
            <label>公司：</label>
            <Input value={customerFormData.company} onChange={e => setCustomerFormData({ ...customerFormData, company: e.target.value })} placeholder="请输入公司名称" />
          </div>
          <div>
            <label>客户状态：</label>
            <Select value={customerFormData.customer_status} onChange={value => setCustomerFormData({ ...customerFormData, customer_status: value })} style={{ width: '100%' }}>
              <Option value="意向">意向</Option>
              <Option value="合作">合作</Option>
              <Option value="流失">流失</Option>
            </Select>
          </div>
        </div>
      </Modal>

      {/* 持有产品表单弹窗 */}
      <Modal title={holdModalTitle} open={holdModalVisible} onCancel={() => setHoldModalVisible(false)} onOk={handleSubmitHold} width={isMobile ? '90%' : 500}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>选择产品：</label>
            <Select value={holdFormData.product_id || undefined} onChange={value => setHoldFormData({ ...holdFormData, product_id: value })} style={{ width: '100%' }} placeholder="请选择产品">
              {allProducts.map(p => <Option key={p.id} value={p.id}>{p.product_name} ({p.product_type})</Option>)}
            </Select>
          </div>
          <div>
            <label>持有金额（万元）：</label>
            <Input type="number" value={holdFormData.hold_amount} onChange={e => setHoldFormData({ ...holdFormData, hold_amount: parseFloat(e.target.value) || 0 })} placeholder="请输入持有金额" />
          </div>
          <div>
            <label>购买时间：</label>
            <Input type="date" value={holdFormData.buy_time} onChange={e => setHoldFormData({ ...holdFormData, buy_time: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* 跟进记录表单弹窗 */}
      <Modal title={followModalTitle} open={followModalVisible} onCancel={() => setFollowModalVisible(false)} onOk={handleSubmitFollow} width={isMobile ? '90%' : 500}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>跟进方式：</label>
            <Select value={followFormData.follow_way} onChange={value => setFollowFormData({ ...followFormData, follow_way: value })} style={{ width: '100%' }}>
              <Option value="电话">电话</Option>
              <Option value="微信">微信</Option>
              <Option value="面谈">面谈</Option>
            </Select>
          </div>
          <div>
            <label>跟进内容：</label>
            <Input.TextArea value={followFormData.follow_content} onChange={e => setFollowFormData({ ...followFormData, follow_content: e.target.value })} placeholder="请输入跟进内容" rows={3} />
          </div>
          <div>
            <label>跟进时间：</label>
            <Input type="date" value={followFormData.follow_time} onChange={e => setFollowFormData({ ...followFormData, follow_time: e.target.value })} />
          </div>
          <div>
            <label>下次计划：</label>
            <Input value={followFormData.next_plan} onChange={e => setFollowFormData({ ...followFormData, next_plan: e.target.value })} placeholder="请输入下次计划" />
          </div>
        </div>
      </Modal>
    </Card>
  )
}