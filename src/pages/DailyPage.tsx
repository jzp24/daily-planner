import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate, formatDisplay, getTodayStr, computeDurationMinutes, minutesToHours } from '../utils/date';
import ConfirmDialog from '../components/ConfirmDialog';
import './DailyPage.css';

function DailyPage() {
  const { data, addTask, updateTask, deleteTask } = useApp();
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 当前日期任务
  const dayTasks = useMemo(
    () => data.tasks.filter(t => t.date === selectedDate),
    [data.tasks, selectedDate]
  );

  // 当天总时长
  const totalMinutes = useMemo(() => {
    return dayTasks.reduce((sum, t) => {
      if (t.status !== 'completed') return sum;
      return sum + computeDurationMinutes(t.startTime, t.endTime);
    }, 0);
  }, [dayTasks]);

  const goDay = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(formatDate(d));
  };

  const isToday = selectedDate === getTodayStr();

  return (
    <div className="daily-page">
      {/* 日期选择器 */}
      <div className="date-picker">
        <button className="btn btn-secondary" style={{ padding: '6px 12px', minHeight: 36 }} onClick={() => goDay(-1)}>
          &lt; 前一天
        </button>
        <div className="date-display">
          <span className="date-text">{formatDisplay(new Date(selectedDate))}</span>
          {!isToday && (
            <button className="btn btn-secondary" style={{ padding: '2px 10px', minHeight: 28, fontSize: 12 }}
              onClick={() => setSelectedDate(getTodayStr())}>
              回到今天
            </button>
          )}
        </div>
        <button className="btn btn-secondary" style={{ padding: '6px 12px', minHeight: 36 }} onClick={() => goDay(1)}>
          后一天 &gt;
        </button>
      </div>

      {/* 倒计时条 */}
      {data.countdowns.length > 0 && (
        <div className="countdown-strip">
          {data.countdowns.map(cd => {
            const now = new Date();
            const target = new Date(cd.targetDate);
            const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return (
              <span key={cd.id} className="countdown-badge">
                {cd.title} {days >= 0 ? `还有 ${days} 天` : `已过 ${Math.abs(days)} 天`}
              </span>
            );
          })}
        </div>
      )}

      {/* 总时长卡片 */}
      <div className="total-card card">
        <span className="total-label">当日专注总时长</span>
        <span className="total-time">{minutesToHours(totalMinutes)}</span>
      </div>

      {/* 任务列表 */}
      <div className="section-header">
        <span className="section-title">待办任务</span>
        <button className="btn btn-primary" style={{ padding: '6px 14px', minHeight: 36 }}
          onClick={() => { setEditingId(null); setShowForm(true); }}>
          + 添加任务
        </button>
      </div>

      {dayTasks.length === 0 ? (
        <p className="empty-hint">今天还没有任务，点击上方按钮添加</p>
      ) : (
        <ul className="task-list">
          {dayTasks.map(task => {
            const cat = data.categories.find(c => c.id === task.categoryId);
            const duration = task.status === 'completed'
              ? computeDurationMinutes(task.startTime, task.endTime)
              : 0;

            return (
              <li key={task.id} className={`task-item card ${task.status === 'completed' ? 'task--done' : ''}`}>
                <div className="task-top">
                  <span className="task-cat" style={{ background: cat?.color ?? '#999' }}>{cat?.name ?? '未分类'}</span>
                  <span className={`task-status ${task.status === 'completed' ? 'status-done' : 'status-pending'}`}>
                    {task.status === 'completed' ? '已完成' : task.status === 'in_progress' ? '进行中' : '待开始'}
                  </span>
                </div>
                <p className="task-title">{task.title}</p>
                <div className="task-time">
                  <span>{task.startTime || '--:--'} ~ {task.endTime || '--:--'}</span>
                  {task.status === 'completed' && (
                    <span className="task-duration">({minutesToHours(duration)})</span>
                  )}
                </div>
                <div className="task-actions">
                  {task.status === 'pending' && (
                    <button className="btn btn-primary" style={{ padding: '4px 10px', minHeight: 32, fontSize: 12 }}
                      onClick={() => {
                        const now = new Date();
                        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                        updateTask(task.id, { status: 'in_progress', startTime: time });
                      }}>
                      开始
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button className="btn btn-primary" style={{ padding: '4px 10px', minHeight: 32, fontSize: 12 }}
                      onClick={() => {
                        const now = new Date();
                        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                        updateTask(task.id, { status: 'completed', endTime: time });
                      }}>
                      结束
                    </button>
                  )}
                  <button className="btn btn-secondary" style={{ padding: '4px 10px', minHeight: 32, fontSize: 12 }}
                    onClick={() => { setEditingId(task.id); setShowForm(true); }}>
                    编辑
                  </button>
                  <button className="btn btn-danger" style={{ padding: '4px 10px', minHeight: 32, fontSize: 12 }}
                    onClick={() => setDeleteConfirmId(task.id)}>
                    删除
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* 新增/编辑弹窗 */}
      {showForm && (
        <TaskFormModal
          categories={data.categories}
          initialTask={editingId ? dayTasks.find(t => t.id === editingId) ?? null : null}
          selectedDate={selectedDate}
          onSave={(taskData) => {
            if (editingId) {
              updateTask(editingId, taskData);
            } else {
              addTask({
                date: selectedDate,
                title: taskData.title,
                categoryId: taskData.categoryId,
                startTime: taskData.startTime,
                endTime: taskData.endTime,
                status: taskData.status,
              });
            }
            setShowForm(false);
            setEditingId(null);
          }}
          onClose={() => { setShowForm(false); setEditingId(null); }}
        />
      )}

      {/* 删除确认 */}
      {deleteConfirmId && (
        <ConfirmDialog
          title="删除任务"
          message="确定要删除这个任务吗？删除后无法恢复。"
          onConfirm={() => { deleteTask(deleteConfirmId); setDeleteConfirmId(null); }}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}

// ========== 任务表单弹窗 ==========
function TaskFormModal({
  categories,
  initialTask,
  onSave,
  onClose,
}: {
  categories: { id: string; name: string; color: string }[];
  initialTask: { title: string; categoryId: string; startTime: string; endTime: string; status: string } | null;
  selectedDate: string;
  onSave: (t: { title: string; categoryId: string; startTime: string; endTime: string; status: 'pending' | 'in_progress' | 'completed' }) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [categoryId, setCategoryId] = useState(initialTask?.categoryId ?? categories[0]?.id ?? '');
  const [startTime, setStartTime] = useState(initialTask?.startTime ?? '');
  const [endTime, setEndTime] = useState(initialTask?.endTime ?? '');

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const initialStatus = (initialTask?.status as 'pending' | 'in_progress' | 'completed') ?? 'pending';
    onSave({ title: trimmed, categoryId: (categoryId || categories[0]?.id) ?? '', startTime, endTime, status: initialStatus });
  };

  const fillNow = (field: 'startTime' | 'endTime') => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (field === 'startTime') setStartTime(time);
    else setEndTime(time);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{initialTask ? '编辑任务' : '添加任务'}</h3>

        <input
          className="modal-input"
          placeholder="任务名称"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />

        <select
          className="modal-input"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          style={{ marginTop: 8 }}
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="time-input-row">
          <div className="time-input-group">
            <label className="time-label">开始时间</label>
            <div className="time-input-wrap">
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
              <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', minHeight: 32, fontSize: 12 }}
                onClick={() => fillNow('startTime')}>现在</button>
            </div>
          </div>
          <div className="time-input-group">
            <label className="time-label">结束时间</label>
            <div className="time-input-wrap">
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
              <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', minHeight: 32, fontSize: 12 }}
                onClick={() => fillNow('endTime')}>现在</button>
            </div>
          </div>
        </div>

        {startTime && endTime && (
          <p className="duration-preview">
            时长：{minutesToHours(computeDurationMinutes(startTime, endTime))}
          </p>
        )}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}

export default DailyPage;
