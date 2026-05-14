// ========== 分类 ==========
export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

// ========== 任务 ==========
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  date: string;         // "YYYY-MM-DD"
  title: string;
  categoryId: string;
  startTime: string;    // "HH:mm"
  endTime: string;      // "HH:mm"
  status: TaskStatus;
  createdAt: string;
}

// ========== 倒计时 ==========
export interface Countdown {
  id: string;
  title: string;
  targetDate: string;   // "YYYY-MM-DD"
  createdAt: string;
}

// ========== 周计划 ==========
export interface WeekPlan {
  id: string;
  weekStart: string;    // 周一日期 "YYYY-MM-DD"
  goals: string[];
  reflection: string;
  createdAt: string;
  updatedAt: string;
}

// ========== 应用全局数据 ==========
export interface AppData {
  version: number;
  categories: Category[];
  tasks: Task[];
  countdowns: Countdown[];
  weekPlans: WeekPlan[];
}

// ========== 统计辅助类型 ==========
export interface CategoryDuration {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  totalMinutes: number;
}

export interface DailyDuration {
  date: string;
  totalMinutes: number;
}
