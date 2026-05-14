import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate, formatDisplayShort, getWeekStart, getWeekEnd, computeDurationMinutes, minutesToHours } from '../utils/date';
import './WeeklyPage.css';

function WeeklyPage() {
  const { data, saveWeekPlan } = useApp();
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const baseDate = new Date(today);
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);

  const weekStart = getWeekStart(baseDate);
  const weekEnd = getWeekEnd(baseDate);
  const weekStartStr = formatDate(weekStart);
  const weekEndStr = formatDate(weekEnd);

  // 已保存的周计划
  const weekPlan = useMemo(
    () => data.weekPlans.find(w => w.weekStart === weekStartStr),
    [data.weekPlans, weekStartStr]
  );

  // 本周累计数据
  const weekStats = useMemo(() => {
    let totalMin = 0;
    const dailyMinutes: { date: string; label: string; minutes: number }[] = [];
    const d = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const dateStr = formatDate(d);
      const dayTasks = data.tasks.filter(t => t.date === dateStr && t.status === 'completed');
      const dayMin = dayTasks.reduce((s, t) => s + computeDurationMinutes(t.startTime, t.endTime), 0);
      totalMin += dayMin;
      dailyMinutes.push({ date: dateStr, label: formatDisplayShort(d), minutes: dayMin });
      d.setDate(d.getDate() + 1);
    }
    return { totalMin, dailyMinutes };
  }, [data.tasks, weekStartStr]);

  // 本周完成的任务
  const weekTasks = useMemo(() => {
    return data.tasks.filter(t => {
      if (t.status !== 'completed') return false;
      return t.date >= weekStartStr && t.date <= weekEndStr;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [data.tasks, weekStartStr, weekEndStr]);

  const isCurrentWeek = weekOffset === 0;
  const hasPlan = weekPlan && (weekPlan.goals.length > 0 || weekPlan.reflection);

  // 查看模式 vs 编辑模式
  const [editing, setEditing] = useState(false);
  const [goals, setGoals] = useState<string[]>(weekPlan?.goals ?? ['', '', '']);
  const [reflection, setReflection] = useState(weekPlan?.reflection ?? '');

  // 切换周时重置
  const [lastWeekStart, setLastWeekStart] = useState(weekStartStr);
  if (weekStartStr !== lastWeekStart) {
    setLastWeekStart(weekStartStr);
    setGoals(weekPlan?.goals ?? ['', '', '']);
    setReflection(weekPlan?.reflection ?? '');
    setEditing(false);
  }

  // 当外部数据变化时（如导入），同步编辑区
  const syncKey = useMemo(
    () => JSON.stringify(weekPlan?.goals) + '||' + (weekPlan?.reflection ?? ''),
    [weekPlan]
  );
  const [lastSyncKey, setLastSyncKey] = useState(syncKey);
  if (syncKey !== lastSyncKey && !editing) {
    setLastSyncKey(syncKey);
    setGoals(weekPlan?.goals ?? ['', '', '']);
    setReflection(weekPlan?.reflection ?? '');
  }

  const startEdit = () => {
    setGoals(weekPlan?.goals ?? ['', '', '']);
    setReflection(weekPlan?.reflection ?? '');
    setEditing(true);
  };

  const addGoalLine = () => setGoals([...goals, '']);
  const removeGoalLine = (i: number) => {
    if (goals.length <= 1) return;
    setGoals(goals.filter((_, idx) => idx !== i));
  };
  const updateGoal = (i: number, v: string) => {
    const next = [...goals];
    next[i] = v;
    setGoals(next);
  };

  const handleSave = () => {
    const filtered = goals.map(g => g.trim()).filter(g => g !== '');
    saveWeekPlan(weekStartStr, filtered, reflection.trim());
    setEditing(false);
  };

  return (
    <div className="weekly-page">
      {/* 周选择器 */}
      <div className="week-picker">
        <button className="btn btn-secondary" onClick={() => setWeekOffset(w => w - 1)}>
          &lt; 上周
        </button>
        <div className="week-display">
          <span className="week-range">{weekStartStr} ~ {weekEndStr}</span>
          {!isCurrentWeek && (
            <button className="btn btn-secondary" style={{ padding: '2px 10px', minHeight: 28, fontSize: 12 }}
              onClick={() => setWeekOffset(0)}>回到本周</button>
          )}
        </div>
        <button className="btn btn-secondary" onClick={() => setWeekOffset(w => w + 1)}>
          下周 &gt;
        </button>
      </div>

      {/* 本周时长概览 */}
      <div className="week-bars card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>本周专注</span>
          <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {minutesToHours(weekStats.totalMin)}
          </span>
        </div>
        {weekStats.dailyMinutes.map(day => (
          <div key={day.date} className="week-bar-item">
            <span className="bar-label">{day.label.slice(0, -1)}</span>
            <div className="bar-track">
              <div
                className={`bar-fill ${day.minutes >= 240 ? 'bar-green' : day.minutes > 3 ? 'bar-red' : ''}`}
                style={{ width: `${Math.min(100, (day.minutes / 240) * 100)}%` }}
              />
            </div>
            <span className="bar-time">{minutesToHours(day.minutes)}</span>
          </div>
        ))}
      </div>

      {/* 编辑模式 */}
      {editing && (
        <>
          <div className="card" style={{ marginTop: 16 }}>
            <div className="section-header">
              <span className="section-title">周目标</span>
              <button className="btn btn-secondary" style={{ padding: '4px 10px', minHeight: 32, fontSize: 12 }}
                onClick={addGoalLine}>+ 添加</button>
            </div>
            <ul className="goal-list">
              {goals.map((g, i) => (
                <li key={i} className="goal-item">
                  <span className="goal-num">{i + 1}.</span>
                  <input className="goal-input" placeholder="输入本周目标..." value={g}
                    onChange={e => updateGoal(i, e.target.value)} />
                  {goals.length > 1 && (
                    <button className="btn btn-danger" style={{ padding: '2px 6px', minHeight: 28, fontSize: 12 }}
                      onClick={() => removeGoalLine(i)}>×</button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="section-header">
              <span className="section-title">周总结 / 反思</span>
            </div>
            <textarea className="reflection-input" placeholder="写写这周的收获和反思..."
              value={reflection} onChange={e => setReflection(e.target.value)} rows={5} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(false)}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>保存周记</button>
          </div>
        </>
      )}

      {/* 查看模式 */}
      {!editing && (
        <>
          {hasPlan ? (
            <div className="card weekly-report" style={{ marginTop: 16 }}>
              {/* 周目标部分 */}
              <div className="report-section">
                <h3 className="report-heading">本周目标</h3>
                {weekPlan!.goals.length > 0 ? (
                  <ul className="report-goals">
                    {weekPlan!.goals.map((g, i) => (
                      <li key={i} className="report-goal-item">
                        <span className="report-check">☐</span> {g}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="report-empty">未设定目标</p>
                )}
              </div>

              {/* 实际完成的任务 */}
              <div className="report-section">
                <h3 className="report-heading">本周完成</h3>
                {weekTasks.length > 0 ? (
                  <ul className="report-tasks">
                    {weekTasks.map(t => {
                      const cat = data.categories.find(c => c.id === t.categoryId);
                      const dur = computeDurationMinutes(t.startTime, t.endTime);
                      return (
                        <li key={t.id} className="report-task-item">
                          <span className="report-task-cat" style={{ background: cat?.color ?? '#999' }}>
                            {cat?.name ?? '未分类'}
                          </span>
                          <span className="report-task-title">{t.title}</span>
                          <span className="report-task-time">
                            {t.date.slice(5)} {t.startTime}-{t.endTime} ({minutesToHours(dur)})
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="report-empty">本周暂无已完成任务</p>
                )}
              </div>

              {/* 周总结 */}
              <div className="report-section">
                <h3 className="report-heading">周总结</h3>
                {weekPlan!.reflection ? (
                  <p className="report-reflection">{weekPlan!.reflection}</p>
                ) : (
                  <p className="report-empty">未写总结</p>
                )}
              </div>

              <button className="btn btn-secondary" style={{ width: '100%', marginTop: 8 }}
                onClick={startEdit}>
                编辑周记
              </button>
            </div>
          ) : (
            <div className="card" style={{ marginTop: 16, textAlign: 'center', padding: 48 }}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                {isCurrentWeek ? '本周还没有写周记' : '这周还没有周记'}
              </p>
              <button className="btn btn-primary" onClick={startEdit}>
                写周记
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WeeklyPage;
