import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate, formatDisplayShort, getTodayStr, computeDurationMinutes, minutesToHours, getWeekStart } from '../utils/date';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { CategoryDuration } from '../types';
import './StatsPage.css';

function StatsPage() {
  const { data } = useApp();
  const today = getTodayStr();

  const [startDate, setStartDate] = useState(() => {
    const wkStart = getWeekStart(new Date());
    return formatDate(wkStart);
  });
  const [endDate, setEndDate] = useState(today);

  // 预设范围
  const setThisWeek = () => {
    setStartDate(formatDate(getWeekStart(new Date())));
    setEndDate(today);
  };
  const setThisMonth = () => {
    const d = new Date();
    setStartDate(formatDate(new Date(d.getFullYear(), d.getMonth(), 1)));
    setEndDate(today);
  };
  const setLast7Days = () => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    setStartDate(formatDate(d));
    setEndDate(today);
  };

  // 过滤日期范围内的完成任务
  const filteredTasks = useMemo(() => {
    return data.tasks.filter(t => {
      if (t.status !== 'completed') return false;
      return t.date >= startDate && t.date <= endDate;
    });
  }, [data.tasks, startDate, endDate]);

  // 每日时长（折线图数据）
  const lineData = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of filteredTasks) {
      const dur = computeDurationMinutes(t.startTime, t.endTime);
      map.set(t.date, (map.get(t.date) ?? 0) + dur);
    }
    const result: { date: string; label: string; minutes: number; hours: number }[] = [];
    const d = new Date(startDate);
    const end = new Date(endDate);
    while (d <= end) {
      const ds = formatDate(d);
      const min = map.get(ds) ?? 0;
      result.push({
        date: ds,
        label: formatDisplayShort(d),
        minutes: min,
        hours: Math.round((min / 60) * 10) / 10,
      });
      d.setDate(d.getDate() + 1);
    }
    return result;
  }, [filteredTasks, startDate, endDate]);

  // 分类时长（饼图数据）
  const pieData = useMemo(() => {
    const map = new Map<string, CategoryDuration>();
    for (const t of filteredTasks) {
      const dur = computeDurationMinutes(t.startTime, t.endTime);
      const existing = map.get(t.categoryId);
      if (existing) {
        existing.totalMinutes += dur;
      } else {
        const cat = data.categories.find(c => c.id === t.categoryId);
        map.set(t.categoryId, {
          categoryId: t.categoryId,
          categoryName: cat?.name ?? '未分类',
          categoryColor: cat?.color ?? '#999',
          totalMinutes: dur,
        });
      }
    }
    return Array.from(map.values())
      .map(cd => ({
        ...cd,
        hours: Math.round((cd.totalMinutes / 60) * 10) / 10,
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [filteredTasks, data.categories]);

  // 统计数据
  const stats = useMemo(() => {
    const totalMin = filteredTasks.reduce((s, t) => s + computeDurationMinutes(t.startTime, t.endTime), 0);
    const dayCount = lineData.length;
    const avgMin = dayCount > 0 ? Math.round(totalMin / dayCount) : 0;
    return { totalMin, avgMin, dayCount };
  }, [filteredTasks, lineData]);

  return (
    <div className="stats-page">
      {/* 日期范围选择 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="range-controls">
          <div className="range-inputs">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span>~</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="range-presets">
            <button className="btn btn-secondary" style={{ padding: '4px 10px', minHeight: 32, fontSize: 12 }}
              onClick={setLast7Days}>近7天</button>
            <button className="btn btn-secondary" style={{ padding: '4px 10px', minHeight: 32, fontSize: 12 }}
              onClick={setThisWeek}>本周</button>
            <button className="btn btn-secondary" style={{ padding: '4px 10px', minHeight: 32, fontSize: 12 }}
              onClick={setThisMonth}>本月</button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="stats-cards">
        <div className="card stat-card">
          <span className="stat-label">总专注时长</span>
          <span className="stat-value">{minutesToHours(stats.totalMin)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">日均专注时长</span>
          <span className="stat-value">{minutesToHours(stats.avgMin)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">统计天数</span>
          <span className="stat-value">{stats.dayCount} 天</span>
        </div>
      </div>

      {/* 折线图 */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="chart-title">每日专注时长趋势</h3>
        {lineData.length === 0 ? (
          <p className="empty-hint">该时间段暂无数据</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="h" />
              <Tooltip
                formatter={(value) => [`${Number(value)} 小时`, '专注时长']}
                labelFormatter={(label) => `日期: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#4A90D9"
                strokeWidth={2}
                dot={{ r: 3, fill: '#4A90D9' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 饼图 */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="chart-title">分类时长占比</h3>
        {pieData.length === 0 ? (
          <p className="empty-hint">该时间段暂无数据</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="totalMinutes"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => {
                  const e = entry as unknown as { categoryName: string; percent: number };
                  const pct = (e.percent * 100).toFixed(0);
                  return `${e.categoryName} ${pct}%`;
                }}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.categoryId} fill={entry.categoryColor} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [minutesToHours(Number(value)), '时长']}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default StatsPage;
