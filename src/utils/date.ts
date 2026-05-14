import { format, startOfWeek, endOfWeek, eachDayOfInterval, getYear, getDay } from 'date-fns';

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDisplay(date: Date): string {
  return format(date, 'yyyy年M月d日');
}

export function formatDisplayShort(date: Date): string {
  return format(date, 'M月d日');
}

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // 周一
}

export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 }); // 周日
}

export function getWeekStartStr(date: Date): string {
  return formatDate(getWeekStart(date));
}

export function getDaysInYear(year: number): Date[] {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  return eachDayOfInterval({ start, end });
}

export function getColumnForDate(date: Date): number {
  // 0=周日 ... 6=周六 → 我们想要 0=周一 ... 6=周日
  const day = getDay(date);
  return day === 0 ? 6 : day - 1;
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function computeDurationMinutes(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  return Math.max(0, end - start);
}

export function minutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分钟`;
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分钟`;
}

export function getTodayStr(): string {
  return formatDate(new Date());
}

export function getCurrentYear(): number {
  return getYear(new Date());
}
