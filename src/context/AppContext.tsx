import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AppData, Category, Task, Countdown, WeekPlan } from '../types';
import { loadData, saveData, generateId } from '../utils/storage';

interface AppContextType {
  data: AppData;
  loading: boolean;
  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addCountdown: (title: string, targetDate: string) => void;
  deleteCountdown: (id: string) => void;
  saveWeekPlan: (weekStart: string, goals: string[], reflection: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function getDefaultData(): AppData {
  return {
    version: 1,
    categories: [
      { id: 'default-cat-1', name: '学习', color: '#4A90D9', createdAt: new Date().toISOString() },
      { id: 'default-cat-2', name: '工作', color: '#7B61FF', createdAt: new Date().toISOString() },
      { id: 'default-cat-3', name: '运动', color: '#52C41A', createdAt: new Date().toISOString() },
    ],
    tasks: [],
    countdowns: [],
    weekPlans: [],
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(getDefaultData);
  const [loading, setLoading] = useState(true);

  // 启动时从 IndexedDB 加载数据
  useEffect(() => {
    loadData().then((saved) => {
      setData(saved);
      setLoading(false);
    });
  }, []);

  const addCategory = useCallback((name: string, color: string) => {
    setData(prev => {
      const newCat: Category = { id: generateId(), name, color, createdAt: new Date().toISOString() };
      const next = { ...prev, categories: [...prev.categories, newCat] };
      saveData(next);
      return next;
    });
  }, []);

  const updateCategory = useCallback((id: string, name: string, color: string) => {
    setData(prev => {
      const next = { ...prev, categories: prev.categories.map(c => c.id === id ? { ...c, name, color } : c) };
      saveData(next);
      return next;
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setData(prev => {
      const defaultCat = prev.categories[0];
      const next = {
        ...prev,
        categories: prev.categories.filter(c => c.id !== id),
        tasks: prev.tasks.map(t => t.categoryId === id ? { ...t, categoryId: defaultCat?.id ?? '' } : t),
      };
      saveData(next);
      return next;
    });
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    setData(prev => {
      const newTask: Task = { ...task, id: generateId(), createdAt: new Date().toISOString() };
      const next = { ...prev, tasks: [...prev.tasks, newTask] };
      saveData(next);
      return next;
    });
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setData(prev => {
      const next = { ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t) };
      saveData(next);
      return next;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData(prev => {
      const next = { ...prev, tasks: prev.tasks.filter(t => t.id !== id) };
      saveData(next);
      return next;
    });
  }, []);

  const addCountdown = useCallback((title: string, targetDate: string) => {
    setData(prev => {
      const cd: Countdown = { id: generateId(), title, targetDate, createdAt: new Date().toISOString() };
      const next = { ...prev, countdowns: [...prev.countdowns, cd] };
      saveData(next);
      return next;
    });
  }, []);

  const deleteCountdown = useCallback((id: string) => {
    setData(prev => {
      const next = { ...prev, countdowns: prev.countdowns.filter(c => c.id !== id) };
      saveData(next);
      return next;
    });
  }, []);

  const saveWeekPlan = useCallback((weekStart: string, goals: string[], reflection: string) => {
    setData(prev => {
      const existing = prev.weekPlans.find(w => w.weekStart === weekStart);
      const now = new Date().toISOString();
      let next: AppData;
      if (existing) {
        next = {
          ...prev,
          weekPlans: prev.weekPlans.map(w =>
            w.weekStart === weekStart ? { ...w, goals, reflection, updatedAt: now } : w
          ),
        };
      } else {
        const plan: WeekPlan = { id: generateId(), weekStart, goals, reflection, createdAt: now, updatedAt: now };
        next = { ...prev, weekPlans: [...prev.weekPlans, plan] };
      }
      saveData(next);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      data,
      loading,
      addCategory, updateCategory, deleteCategory,
      addTask, updateTask, deleteTask,
      addCountdown, deleteCountdown,
      saveWeekPlan,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
