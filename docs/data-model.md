# 日程本 — 数据模型

## TypeScript 类型定义

```typescript
// ========== 分类 ==========
interface Category {
  id: string;          // UUID
  name: string;        // 分类名称，如"学习""工作""运动"
  color: string;       // 分类颜色 hex，用户可选
  createdAt: string;   // ISO 日期字符串
}

// ========== 任务 ==========
type TaskStatus = 'pending' | 'in_progress' | 'completed';

interface Task {
  id: string;          // UUID
  date: string;        // 所属日期 "YYYY-MM-DD"
  title: string;       // 任务标题
  categoryId: string;  // 关联分类 ID
  startTime: string;   // 开始时间 "HH:mm"
  endTime: string;     // 结束时间 "HH:mm"
  status: TaskStatus;  // pending | in_progress | completed
  createdAt: string;   // ISO 日期字符串
}

// ========== 倒计时 ==========
interface Countdown {
  id: string;          // UUID
  title: string;       // 倒计时标题，如"考研"
  targetDate: string;  // 目标日期 "YYYY-MM-DD"
  createdAt: string;   // ISO 日期字符串
}

// ========== 周计划 ==========
interface WeekPlan {
  id: string;          // UUID
  weekStart: string;   // 周一日期 "YYYY-MM-DD"
  goals: string[];     // 周目标列表
  reflection: string;  // 周总结/反思
  createdAt: string;   // ISO 日期字符串
  updatedAt: string;   // ISO 日期字符串
}

// ========== 应用全局数据 ==========
interface AppData {
  version: number;           // 数据结构版本号
  categories: Category[];
  tasks: Task[];
  countdowns: Countdown[];
  weekPlans: WeekPlan[];
}
```

## localStorage 存储

| Key | Value | 说明 |
|-----|-------|------|
| `planner_data` | JSON string of AppData | 所有应用数据 |

## 数据完整性

- 启动时读取 `planner_data`，若不存在或解析失败，使用默认初始数据
- 分类至少保留一个默认分类"默认"
- 删除分类时需检查是否有关联任务，提示用户
- 版本号用于未来数据结构迁移
