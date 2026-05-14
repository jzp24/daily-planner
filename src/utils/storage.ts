import type { AppData, Category } from '../types';

const DB_NAME = 'planner_db';
const STORE_NAME = 'planner_store';
const DATA_KEY = 'planner_data';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'default-cat-1', name: '学习', color: '#4A90D9', createdAt: new Date().toISOString() },
  { id: 'default-cat-2', name: '工作', color: '#7B61FF', createdAt: new Date().toISOString() },
  { id: 'default-cat-3', name: '运动', color: '#52C41A', createdAt: new Date().toISOString() },
];

function getDefaultData(): AppData {
  return { version: 1, categories: DEFAULT_CATEGORIES, tasks: [], countdowns: [], weekPlans: [] };
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadData(): Promise<AppData> {
  try {
    const db = await openDB();
    const raw = await new Promise<string | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(DATA_KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (!raw) return getDefaultData();
    const data = JSON.parse(raw) as AppData;
    if (typeof data.version !== 'number') return getDefaultData();
    return data;
  } catch {
    return getDefaultData();
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    const db = await openDB();
    const json = JSON.stringify(data);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(json, DATA_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Silently fail — data will be preserved from last successful save
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
