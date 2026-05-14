# 日程本 — 技术规范

## 技术栈

| 类别 | 选择 | 版本 |
|------|------|------|
| 构建工具 | Vite | 5.x |
| UI 框架 | React | 18.x |
| 语言 | TypeScript | 5.x |
| 图表 | Recharts | 2.x |
| 日期 | date-fns | 3.x |
| 样式 | CSS (原生) | - |
| 存储 | localStorage | - |

## 项目结构

```
日程本/
├── docs/                   # 项目文档
│   ├── requirements.md     # 需求文档
│   ├── tech-spec.md        # 技术规范（本文件）
│   ├── design-spec.md      # 设计规范
│   ├── implementation-plan.md  # 执行计划
│   └── data-model.md       # 数据模型
├── dev-logs/               # 开发日志
│   └── YYYY-MM-DD.md       # 每日开发记录
├── src/
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/              # 工具函数
│   │   ├── storage.ts      # localStorage 封装
│   │   └── date.ts         # 日期工具
│   ├── context/            # React Context
│   │   └── AppContext.tsx   # 全局数据上下文
│   ├── hooks/              # 自定义 Hooks
│   │   └── useLocalStorage.ts
│   ├── components/         # 通用组件
│   │   ├── Layout.tsx
│   │   ├── TabBar.tsx
│   │   └── ...
│   ├── pages/              # 页面组件
│   │   ├── DailyPage.tsx
│   │   ├── WeeklyPage.tsx
│   │   ├── StatsPage.tsx
│   │   ├── YearPage.tsx
│   │   └── SettingsPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css           # 全局样式 + CSS 变量
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 编码规范

- 所有类型/接口定义在 `src/types/index.ts`
- 组件按页面拆分，通用组件放 `components/`，页面放 `pages/`
- 样式与组件同目录，命名 `ComponentName.css`
- 不引入任何 UI 组件库，全部手写 CSS
- 函数组件 + Hooks，不使用 Class 组件
- 禁止使用 `any` 类型

## 数据持久化策略

- localStorage key 前缀：`planner_`
- 每次数据变更立即写入 localStorage
- 应用启动时从 localStorage 读取并校验数据完整性
- 数据结构版本号，便于未来迁移
