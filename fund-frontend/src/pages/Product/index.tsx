// =====================
// React 核心 hooks
// =====================
import { useState, useEffect } from 'react'

// =====================
// Ant Design 组件
// =====================
/**
 * Table: 表格组件，用于展示产品列表
 * Input: 输入框组件，包含 Search 搜索组件
 * Select: 下拉选择器，用于筛选和表单选择
 * Card: 卡片组件，页面容器
 * Modal: 弹窗组件，用于新增/编辑表单和详情展示
 * Descriptions: 描述列表，用于展示产品详情
 * Button: 按钮组件
 * message: 全局提示组件，用于显示成功/失败消息
 * Popconfirm: 气泡确认框，用于删除确认
 * Tag: 标签组件，用于显示产品状态
 */
import { Table, Input, Select, Card, Modal, Descriptions, Button, message, Popconfirm, Tag } from 'antd'

// =====================
// Ant Design Icons
// =====================
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

// =====================
// 网络请求
// =====================
import axios from 'axios'
import apiConfig from '../../utils/api'

// =====================
// Input 和 Select 解构
// =====================
/**
 * Search: 搜索输入框组件，是 Input 的子组件
 * 提供内置的搜索按钮和回车搜索功能
 */
const { Search } = Input

/**
 * Option: Select 下拉选择器的选项组件
 * 必须作为 Select 的子组件使用
 */
const { Option } = Select

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
 * 产品数据接口
 * 定义产品对象的数据结构
 */
interface ProductItem {
  id: number             // 产品唯一ID
  product_name: string   // 产品名称
  product_type: string   // 产品类型（股票型、债券型等）
  latest_nav: number     // 最新净值
  establish_scale: number // 成立规模（万元）
  product_status: string // 产品状态（募集、运作中、已清盘）
  create_time: string    // 创建时间
}

/**
 * 表单数据类型
 * 用于新增/编辑产品时的表单数据结构
 */
interface FormData {
  product_name: string
  product_type: string
  latest_nav: number
  establish_scale: number
  product_status: string
}

/**
 * Product 产品管理页面组件
 * 用于展示、搜索、筛选、增删改查基金产品
 */
export default function Product() {
  // 检测是否为移动端
  const isMobile = useIsMobile()
  
  // =====================
  // 状态定义
  // =====================
  
  /**
   * 产品列表状态
   * 存储从 API 获取的所有产品数据
   * useState<ProductItem[]> 表示这是一个 ProductItem 类型的数组
   */
  const [productList, setProductList] = useState<ProductItem[]>([])
  
  /**
   * 筛选后的产品列表
   * 用于显示经过搜索和筛选条件过滤后的数据
   */
  const [filteredList, setFilteredList] = useState<ProductItem[]>([])
  
  /**
   * 详情弹窗可见状态
   * true: 显示详情弹窗, false: 隐藏
   */
  const [visible, setVisible] = useState(false)
  
  /**
   * 当前查看的产品
   * 存储用户点击"详情"时选中的产品对象
   * 初始值为 null，表示没有选中任何产品
   */
  const [current, setCurrent] = useState<ProductItem | null>(null)

  // 筛选条件状态
  /** 当前选中的产品类型筛选值 */
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined)
  /** 当前选中的产品状态筛选值 */
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined)

  // Modal 弹窗相关状态
  /** 新增/编辑弹窗是否可见 */
  const [modalVisible, setModalVisible] = useState(false)
  /** 弹窗标题，根据操作动态变化 */
  const [modalTitle, setModalTitle] = useState('新增产品')
  /** 表单数据状态 */
  const [formData, setFormData] = useState<FormData>({
    product_name: '',
    product_type: '股票型',
    latest_nav: 1.0,
    establish_scale: 0,
    product_status: '募集中'
  })
  /** 当前编辑的产品 ID，null 表示新增模式，有值表示编辑模式 */
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // 多选相关状态
  /** 选中的行 Keys（用于批量操作） */
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  // =====================
  // 数据获取函数
  // =====================

  /**
   * 获取产品列表
   * 异步函数，从 API 获取所有产品数据
   */
  const getProductList = async () => {
    try {
      // 发送 GET 请求获取产品列表
      const res = await axios.get(apiConfig.endpoints.products)
      // 更新产品列表状态
      setProductList(res.data)
      // 同时更新筛选后的列表
      setFilteredList(res.data)
    } catch (error) {
      console.error('获取产品列表失败:', error)
    }
  }

  /**
   * useEffect: 副作用钩子
   * 组件挂载后自动获取产品列表
   * 空依赖数组表示只在首次渲染时执行
   */
  useEffect(() => {
    getProductList()
  }, [])

  // =====================
  // 搜索和筛选处理函数
  // =====================

  /**
   * 搜索处理函数
   * 根据产品名称进行模糊搜索
   * @param value - 搜索关键字
   */
  const handleSearch = (value: string) => {
    // filter: 过滤数组，返回满足条件的元素
    // includes: 判断字符串是否包含指定子串
    const result = productList.filter((item) =>
      item.product_name.includes(value)
    )
    setFilteredList(result)
  }

  /**
   * 产品类型筛选变化处理
   * @param value - 选中的产品类型值
   */
  const handleTypeChange = (value: string) => {
    setSelectedType(value || undefined)
    // 调用统一筛选函数，传入新的类型值和当前状态值
    applyFiltersWithStatus(value || undefined, selectedStatus)
  }

  /**
   * 产品状态筛选变化处理
   * @param value - 选中的产品状态值
   */
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value || undefined)
    applyFiltersWithStatus(selectedType, value || undefined)
  }

  /**
   * 统一筛选处理函数
   * 同时支持类型和状态两个维度的筛选
   * @param type - 产品类型筛选条件
   * @param status - 产品状态筛选条件
   */
  const applyFiltersWithStatus = (type: string | undefined, status: string | undefined) => {
    // 从完整列表开始筛选
    let result = productList

    // 如果有类型筛选条件，则过滤
    if (type) {
      result = result.filter((item) => item.product_type === type)
    }

    // 如果有状态筛选条件，则过滤
    if (status) {
      result = result.filter((item) => item.product_status === status)
    }

    // 更新筛选后的列表
    setFilteredList(result)
  }

  // =====================
  // CRUD 操作处理函数
  // =====================

  /**
   * 查看详情处理函数
   * @param record - 点击的产品记录
   */
  const showDetail = (record: ProductItem) => {
    setCurrent(record)  // 设置当前查看的产品
    setVisible(true)    // 显示详情弹窗
  }

  /**
   * 新增产品处理函数
   * 打开新增弹窗，重置表单数据
   */
  const handleAdd = () => {
    setModalTitle('新增产品')
    setEditingId(null)  // 编辑 ID 为 null，表示新增模式
    // 重置表单数据为默认值
    setFormData({
      product_name: '',
      product_type: '股票型',
      latest_nav: 1.0,
      establish_scale: 0,
      product_status: '募集中'
    })
    setModalVisible(true)
  }

  /**
   * 编辑产品处理函数
   * 打开编辑弹窗，填充已有数据
   * @param record - 要编辑的产品记录
   */
  const handleEdit = (record: ProductItem) => {
    setModalTitle('编辑产品')
    setEditingId(record.id)  // 记录要编辑的产品 ID
    // 填充表单数据为该产品的现有数据
    setFormData({
      product_name: record.product_name,
      product_type: record.product_type,
      latest_nav: record.latest_nav,
      establish_scale: record.establish_scale,
      product_status: record.product_status
    })
    setModalVisible(true)
  }

  /**
   * 删除产品处理函数
   * @param id - 要删除的产品 ID
   */
  const handleDelete = async (id: number) => {
    try {
      // 发送 DELETE 请求
      await axios.delete(apiConfig.endpoints.productDetail(id))
      // 显示成功提示
      message.success('删除成功')
      // 刷新列表
      getProductList()
    } catch (error) {
      message.error('删除失败')
    }
  }

  /**
   * 批量删除处理函数
   * 删除所有选中的产品
   */
  const handleBatchDelete = async () => {
    try {
      // 发送 POST 请求，传递要删除的 IDs 数组
      await axios.post(apiConfig.endpoints.productBatchDelete, {
        ids: selectedRowKeys
      })
      message.success('批量删除成功')
      // 清空选中状态
      setSelectedRowKeys([])
      // 刷新列表
      getProductList()
    } catch (error) {
      message.error('批量删除失败')
    }
  }

  /**
   * 提交表单处理函数
   * 根据 editingId 判断是新增还是编辑
   */
  const handleSubmit = async () => {
    try {
      if (editingId) {
        // 编辑模式：发送 PUT 请求
        await axios.put(apiConfig.endpoints.productDetail(editingId), formData)
        message.success('编辑成功')
      } else {
        // 新增模式：发送 POST 请求
        await axios.post(apiConfig.endpoints.products, formData)
        message.success('新增成功')
      }
      // 关闭弹窗
      setModalVisible(false)
      // 刷新列表
      getProductList()
    } catch (error) {
      message.error('操作失败')
    }
  }

  // =====================
  // 表格配置
  // =====================

  /**
   * 获取状态标签
   * 根据产品状态返回不同颜色的标签组件
   * @param status - 产品状态字符串
   * @returns Tag 组件
   */
  const getStatusTag = (status: string) => {
    // 状态颜色映射对象
    const colorMap: Record<string, string> = {
      '募集中和': 'blue',  // 募集中的产品显示蓝色
      '运作中': 'green',   // 运作中的产品显示绿色
      '已清盘': 'red'      // 已清盘的产品显示红色
    }
    // 获取颜色，如果未匹配到则使用 'default' 灰色
    const color = colorMap[status] || 'default'
    // 返回带有颜色的 Tag 组件
    return <Tag color={color}>{status}</Tag>
  }

  /**
   * 表格列配置
   * 根据设备类型显示不同列：
   * - 移动端：精简列，只显示关键信息
   * - PC端：完整列，显示所有信息
   */
  const columns = isMobile
    ? [
        // 移动端表格列
        { title: '产品', dataIndex: 'product_name', key: 'product_name', ellipsis: true },
        { title: '类型', dataIndex: 'product_type', key: 'product_type', width: 60 },
        // render: 自定义渲染函数，将状态转换为 Tag 组件
        { title: '状态', dataIndex: 'product_status', key: 'product_status', render: (status: string) => getStatusTag(status), width: 70 },
        {
          title: '操作',
          width: 60,
          // render: 渲染操作按钮，参数 _ 表示当前行索引（未使用），record 是当前行数据
          render: (_: any, record: ProductItem) => (
            <Button type="link" size="small" onClick={() => showDetail(record)}>详情</Button>
          )
        }
      ]
    : [
        // PC端表格列
        { title: '产品名称', dataIndex: 'product_name', key: 'product_name' },
        { title: '产品类型', dataIndex: 'product_type', key: 'product_type' },
        { title: '最新净值', dataIndex: 'latest_nav', key: 'latest_nav' },
        { title: '成立规模(万)', dataIndex: 'establish_scale', key: 'establish_scale' },
        { title: '产品状态', dataIndex: 'product_status', key: 'product_status', render: (status: string) => getStatusTag(status) },
        {
          title: '操作',
          // render: 渲染操作链接（详情、编辑、删除）
          render: (_: any, record: ProductItem) => (
            <>
              <a onClick={() => showDetail(record)} style={{ marginRight: 8 }}>详情</a>
              <a onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>编辑</a>
              {/* Popconfirm: 气泡确认框，点击删除前需要确认 */}
              <Popconfirm title="确定删除该产品?" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
                <a style={{ color: 'red' }}>删除</a>
              </Popconfirm>
            </>
          )
        }
      ]

  /**
   * 行选择器配置
   * 用于批量选择和批量操作
   */
  const rowSelection = {
    selectedRowKeys,  // 当前选中的行 Keys
    // onChange: 选中项变化时的回调，keys 是新的选中 Keys 数组
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys)
  }

  return (
    <Card title="基金产品货架">
      {/* 搜索 + 筛选栏 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <Search
          placeholder="搜索产品"
          style={{ minWidth: isMobile ? '100%' : 200 }}
          onSearch={handleSearch}
        />

        <Select
          placeholder="类型筛选"
          style={{ minWidth: isMobile ? '48%' : 140 }}
          allowClear
          onChange={handleTypeChange}
        >
          <Option value="股票型">股票型</Option>
          <Option value="债券型">债券型</Option>
          <Option value="混合型">混合型</Option>
          <Option value="货币型">货币型</Option>
        </Select>

        <Select
          placeholder="状态筛选"
          style={{ minWidth: isMobile ? '48%' : 140 }}
          allowClear
          onChange={handleStatusChange}
        >
          <Option value="募集中">募集中</Option>
          <Option value="运作中">运作中</Option>
          <Option value="已清盘">已清盘</Option>
        </Select>

        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增
        </Button>

        <Popconfirm title="确定删除选中的产品?" onConfirm={handleBatchDelete} okText="确定" cancelText="取消" disabled={selectedRowKeys.length === 0}>
          <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0}>
            批量删除 ({selectedRowKeys.length})
          </Button>
        </Popconfirm>
      </div>

      {/* 产品表格 */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredList}
        pagination={{ pageSize: 10 }}
        rowSelection={rowSelection}
      />

      {/* 产品详情弹窗 */}
      <Modal
        title="产品详情"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={isMobile ? '90%' : 600}
      >
        {current && (
          <Descriptions column={1}>
            <Descriptions.Item label="产品名称">{current.product_name}</Descriptions.Item>
            <Descriptions.Item label="产品类型">{current.product_type}</Descriptions.Item>
            <Descriptions.Item label="最新净值">{current.latest_nav}</Descriptions.Item>
            <Descriptions.Item label="成立规模（万元）">{current.establish_scale}</Descriptions.Item>
            <Descriptions.Item label="产品状态">{current.product_status}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{current.create_time}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={isMobile ? '90%' : 500}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>产品名称：</label>
            <Input
              value={formData.product_name}
              onChange={e => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="请输入产品名称"
            />
          </div>
          <div>
            <label>产品类型：</label>
            <Select
              value={formData.product_type}
              onChange={value => setFormData({ ...formData, product_type: value })}
              style={{ width: '100%' }}
            >
              <Option value="股票型">股票型</Option>
              <Option value="债券型">债券型</Option>
              <Option value="混合型">混合型</Option>
              <Option value="货币型">货币型</Option>
            </Select>
          </div>
          <div>
            <label>最新净值：</label>
            <Input
              type="number"
              value={formData.latest_nav}
              onChange={e => setFormData({ ...formData, latest_nav: parseFloat(e.target.value) || 0 })}
              placeholder="请输入最新净值"
            />
          </div>
          <div>
            <label>成立规模（万元）：</label>
            <Input
              type="number"
              value={formData.establish_scale}
              onChange={e => setFormData({ ...formData, establish_scale: parseFloat(e.target.value) || 0 })}
              placeholder="请输入成立规模"
            />
          </div>
          <div>
            <label>产品状态：</label>
            <Select
              value={formData.product_status}
              onChange={value => setFormData({ ...formData, product_status: value })}
              style={{ width: '100%' }}
            >
              <Option value="募集中">募集中</Option>
              <Option value="运作中">运作中</Option>
              <Option value="已清盘">已清盘</Option>
            </Select>
          </div>
        </div>
      </Modal>
    </Card>
  )
}