# 基金销售系统

## 项目概述

本项目是一个基金销售管理系统，采用前后端分离架构，包含 AI 智能问答功能。整个系统由三个子项目组成：**fund-agent**（AI 智能代理）、**fund-backend**（Node.js API 服务）和 **fund-frontend**（React 前端）。

### 核心功能

| 模块 | 功能描述 |
|------|----------|
| 产品管理 | 基金的增删改查，包括产品名称、类型、净值、规模、状态 |
| 客户管理 | 客户信息管理，包括姓名、电话、公司、状态 |
| 持仓管理 | 客户持有产品记录，记录购买金额和购买时间 |
| 跟进记录 | 客户跟进记录，包括跟进方式、内容、时间、下次计划 |
| AI 智能问答 | 自然语言查询数据库、生成图表、金融知识问答 |
| Dashboard | 数据可视化展示 |

## 系统架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   fund-frontend │     │   fund-agent    │     │  fund-backend   │
│   (React前端)    │────▶│  (Python AI)    │────▶│   (Node.js)     │
│    端口:5173    │     │   端口:8001     │     │    端口:3000    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │   MySQL 数据库   │
                                                └─────────────────┘
```

## 技术栈

### fund-agent（AI 智能代理）

- **框架**: FastAPI
- **语言**: Python 3.x
- **AI 框架**: LangChain + 通义千问（Qwen）
- **数据库**: MySQL + SQLAlchemy
- **主要功能**:
  - 自然语言处理与意图识别
  - 动态 SQL 生成
  - 图表数据生成（支持饼图、柱状图、折线图）
  - 产品新增管理

### fund-backend（后端 API）

- **框架**: Express.js
- **语言**: Node.js
- **数据库**: MySQL（mysql2/promise）
- **主要功能**:
  - 产品管理（CRUD）
  - 客户管理
  - 持仓管理
  - 跟进记录管理

### fund-frontend（前端界面）

- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Ant Design 6.x
- **图表库**: Recharts
- **路由**: React Router DOM
- **HTTP 客户端**: Axios

## 核心模块设计

### AI Agent 核心流程

```
用户问题 → 意图识别 → 图表意图解析 → SQL生成 → 安全执行 → 答案生成
```

1. **意图识别**: 解析用户问题，判断查询类型
2. **图表意图**: 判断是否需要生成可视化图表（饼图、柱状图、折线图）
3. **SQL 生成**: 使用 LangChain + 通义千问将自然语言转换为 SQL
4. **安全执行**: 验证并执行 SQL（禁止 DELETE 操作，防止 SQL 注入）
5. **答案生成**: 将查询结果转换为自然语言回答
6. **金融问答**: 非数据库相关问题时，提供专业金融知识解答

### 数据库表结构

| 表名 | 描述 | 字段 |
|------|------|------|
| products | 产品表 | id, product_name, product_type, latest_nav, establish_scale, product_status, create_time |
| customers | 客户表 | id, customer_name, phone, company, customer_status, create_time |
| customer_hold | 持仓表 | id, customer_id, product_id, hold_amount, buy_time |
| customer_follow | 跟进表 | id, customer_id, follow_way, follow_content, follow_time, next_plan |

## 环境配置

### fund-agent 环境变量 (.env)
- `DASHSCOPE_API_KEY`: 通义千问 API 密钥
- `LLM_MODEL`: LLM 模型名称（默认 qwen-turbo）
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`: MySQL 数据库配置

### fund-backend 环境变量 (.env)
- `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`: MySQL 数据库配置

## 启动方式

### fund-agent
```bash
cd fund-agent
python main.py
```

### fund-backend
```bash
cd fund-backend
npm install
npm start
```

### fund-frontend
```bash
cd fund-frontend
npm install
npm run dev
```

### 访问地址

- 前端: http://localhost:5173
- 后端: http://localhost:3000
- AI Agent: http://localhost:8001

## API 接口

### fund-agent (端口: 8001)

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /ai/query | AI 智能问答（同步） |
| POST | /ai/stream | AI 智能问答（流式） |
| POST | /ai/clear | 清除会话 |

### fund-backend (端口: 3000)

#### 产品管理 /api/products

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/products | 获取产品列表 |
| POST | /api/products | 新增产品 |
| PUT | /api/products/:id | 更新产品 |
| DELETE | /api/products/:id | 删除产品 |

#### 客户管理 /api/customers

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/customers | 获取客户列表 |
| POST | /api/customers | 新增客户 |
| PUT | /api/customers/:id | 更新客户 |
| DELETE | /api/customers/:id | 删除客户 |

#### 持仓管理 /api/customer-hold

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/customer-hold | 新增持仓 |
| PUT | /api/customer-hold/:id | 更新持仓 |
| DELETE | /api/customer-hold/:id | 删除持仓 |
| POST | /api/customer-hold/batch-delete | 批量删除 |

#### 跟进管理 /api/follow

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/follow/customer/:id | 获取客户跟进记录 |
| POST | /api/follow/add | 添加跟进记录 |
| PUT | /api/follow/:id | 更新跟进记录 |
| DELETE | /api/follow/:id | 删除跟进记录 |

#### AI 问答 /api/ai

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/ai/query | AI 问答（代理到 fund-agent） |

#### Dashboard /api/dashboard

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/dashboard | 获取仪表盘数据 |

## 安全特性

- AI Agent 端实现了 SQL 注入防护
- 禁止执行 DELETE 操作
- CORS 跨域配置
- 环境变量管理敏感信息

## 项目结构

```
fund-sales-system/
├── fund-agent/                 # AI 智能代理 (Python FastAPI)
│   ├── main.py                 # 入口文件
│   ├── src/
│   │   └── chain.py            # LangChain 链定义
│   └── .env                    # 环境配置
│
├── fund-backend/               # 后端 API (Node.js Express)
│   ├── src/
│   │   ├── app.js              # Express 应用
│   │   ├── config/
│   │   │   └── db.js           # 数据库配置
│   │   └── routes/             # 路由模块
│   │       ├── product.js      # 产品路由
│   │       ├── customer.js     # 客户路由
│   │       ├── customer-hold.js# 持仓路由
│   │       ├── follow.js       # 跟进路由
│   │       ├── aiRoute.js      # AI 路由
│   │       └── dashboard.js    # 仪表盘路由
│   ├── .env                    # 环境配置
│   └── package.json
│
├── fund-frontend/              # 前端界面 (React + TypeScript)
│   ├── src/
│   │   ├── App.tsx             # 主应用组件
│   │   ├── main.tsx            # 入口文件
│   │   ├── pages/              # 页面组件
│   │   │   ├── Product/        # 产品页面
│   │   │   ├── Customer/       # 客户页面
│   │   │   ├── Dashboard/      # 仪表盘页面
│   │   │   └── AIAgent/        # AI 问答页面
│   │   └── api/                # API 请求
│   ├── package.json
│   └── vite.config.ts
│
├── fund_sales.sql              # 数据库初始化脚本
├── DESIGN.md                   # 设计文档
└── README.MD                   # 项目说明
```
