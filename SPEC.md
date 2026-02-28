# 后台管理系统规格说明

## 1. 项目概述

- **项目名称**: admin-platform-ai
- **项目类型**: Vue 3 后台管理系统
- **核心功能**: 带登录功能的后台管理界面，包含顶部导航、侧边栏菜单和主内容区
- **目标用户**: 管理员和内部用户

## 2. 技术栈

- **构建工具**: Vite (最新版本)
- **框架**: Vue 3 (Composition API + TypeScript)
- **HTTP**: Axios
- **UI组件库**: Element Plus
- **样式**: TailwindCSS
- **状态管理**: Pinia
- **路由**: Vue Router 4

## 3. UI/UX 规格

### 3.1 整体布局

- **布局类型**: 经典后台布局 (Header + Sidebar + Main Content)
- **Header高度**: 60px
- **Sidebar宽度**: 展开时 200px，收缩时 64px
- **主内容区**: 自适应填充剩余空间

### 3.2 登录页面

- **背景**: 深色渐变背景 (#1a1a2e → #16213e)
- **登录卡片**: 
  - 宽度: 400px
  - 圆角: 16px
  - 背景: rgba(255, 255, 255, 0.95)
  - 阴影: 0 25px 50px rgba(0, 0, 0, 0.25)
- **表单项**:
  - 用户名输入框 (placeholder: "请输入用户名")
  - 密码输入框 (placeholder: "请输入密码")
  - 登录按钮 (主色调: #409EFF)
- **Logo**: 页面顶部显示系统Logo

### 3.3 主界面 - Header

- **背景**: #ffffff
- **底部阴影**: 0 2px 8px rgba(0, 0, 0, 0.08)
- **左侧**: Logo图标 + 系统标题
- **中间**: 标题文字 "后台管理系统"
- **右侧**: 退出登录按钮 (Element Plus Danger类型)
- **用户信息**: 显示当前登录用户名

### 3.4 主界面 - 侧边栏菜单

- **背景**: #001529 (深蓝黑色)
- **菜单项**:
  - 首页 (home图标)
- **展开/收缩功能**:
  - 点击切换按钮展开或收缩
  - 收缩时只显示图标
  - 动画过渡: 0.3s ease

### 3.5 主界面 - 内容区

- **背景**: #f0f2f5 (浅灰色)
- **内边距**: 24px
- **内容卡片**: 白色背景，圆角8px，阴影

### 3.6 颜色方案

- **主色**: #409EFF (Element Plus 蓝)
- **成功色**: #67C23A
- **警告色**: #E6A23C
- **危险色**: #F56C6C
- **背景色**: #f0f2f5
- **深色背景**: #001529

### 3.7 字体

- **字体家族**: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif
- **标题大小**: 18px (Header标题)
- **正文大小**: 14px

## 4. 功能规格

### 4.1 登录功能

- **Mock接口**: 使用 MSW 或简单Mock模拟登录API
- **用户名**: admin
- **密码**: 123456
- **登录成功**: 
  - 保存token到localStorage
  - 跳转到主界面
- **登录失败**: 
  - 显示Element Plus错误提示
  - 清空密码输入框

### 4.2 路由守卫

- **未登录访问**: 重定向到登录页
- **已登录访问登录页**: 重定向到首页

### 4.3 退出登录

- **点击按钮**: 
  - 清除token和用户信息
  - 跳转回登录页

### 4.4 菜单展开/收缩

- **默认状态**: 展开
- **点击切换**: 平滑动画过渡

## 5. 项目结构

```
admin-platform-ai/
├── public/
├── src/
│   ├── api/           # API接口
│   ├── assets/        # 静态资源
│   ├── components/   # 公共组件
│   │   └── Header.vue
│   │   └── Sidebar.vue
│   ├── layouts/      # 布局组件
│   │   └── MainLayout.vue
│   ├── router/       # 路由配置
│   ├── stores/       # Pinia状态管理
│   │   └── user.ts
│   ├── views/        # 页面视图
│   │   ├── Login.vue
│   │   └── Home.vue
│   ├── App.vue
│   ├── main.ts
│   └── style.css     # TailwindCSS入口
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 6. 验收标准

1. ✅ 登录页面正确显示，样式符合规格
2. ✅ 使用admin/123456可以登录成功
3. ✅ 登录成功后跳转到主界面
4. ✅ 主界面Header显示完整（Logo、标题、退出按钮）
5. ✅ 侧边栏菜单可以展开和收缩
6. ✅ 点击退出登录返回登录页面
7. ✅ 未登录状态下无法直接访问主界面
8. ✅ 使用最新版本的技术栈 (Vue 3.4+, Vite 5+, etc.)
