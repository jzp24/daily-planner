import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { saveData } from '../utils/storage';
import type { AppData, Category, Countdown } from '../types';
import './SettingsPage.css';

const PRESET_COLORS = ['#4A90D9', '#7B61FF', '#52C41A', '#FA8C16', '#FF4D4F', '#13C2C2', '#EB2F96', '#722ED1'];

function SettingsPage() {
  const { data, addCategory, updateCategory, deleteCategory, addCountdown, deleteCountdown } = useApp();
  const [activeSection, setActiveSection] = useState<'category' | 'countdown' | 'data'>('category');

  return (
    <div className="settings-page">
      {/* 子标签 */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeSection === 'category' ? 'settings-tab--active' : ''}`}
          onClick={() => setActiveSection('category')}
        >
          分类管理
        </button>
        <button
          className={`settings-tab ${activeSection === 'countdown' ? 'settings-tab--active' : ''}`}
          onClick={() => setActiveSection('countdown')}
        >
          倒计时
        </button>
        <button
          className={`settings-tab ${activeSection === 'data' ? 'settings-tab--active' : ''}`}
          onClick={() => setActiveSection('data')}
        >
          数据
        </button>
      </div>

      {activeSection === 'data' ? (
        <DataSection data={data} />
      ) : activeSection === 'category' ? (
        <CategorySection
          categories={data.categories}
          onAdd={addCategory}
          onUpdate={updateCategory}
          onDelete={deleteCategory}
        />
      ) : (
        <CountdownSection
          countdowns={data.countdowns}
          onAdd={addCountdown}
          onDelete={deleteCountdown}
        />
      )}
    </div>
  );
}

// ========== 分类管理区域 ==========
function CategorySection({
  categories,
  onAdd,
  onUpdate,
  onDelete,
}: {
  categories: Category[];
  onAdd: (name: string, color: string) => void;
  onUpdate: (id: string, name: string, color: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const openAdd = () => {
    setEditId(null);
    setName('');
    setColor(PRESET_COLORS[0]);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditId(cat.id);
    setName(cat.name);
    setColor(cat.color);
    setShowForm(true);
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editId) {
      onUpdate(editId, trimmed, color);
    } else {
      onAdd(trimmed, color);
    }
    setShowForm(false);
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-title">我的分类</span>
        <button className="btn btn-primary" style={{ padding: '6px 14px', minHeight: 36 }} onClick={openAdd}>
          + 新增
        </button>
      </div>

      {categories.length === 0 && (
        <p className="empty-hint">暂无分类，点击新增创建</p>
      )}

      <ul className="cat-list">
        {categories.map(cat => (
          <li key={cat.id} className="cat-item">
            <span className="cat-color" style={{ background: cat.color }} />
            <span className="cat-name">{cat.name}</span>
            <div className="cat-actions">
              <button className="btn btn-secondary" style={{ padding: '4px 10px', minHeight: 32, fontSize: 12 }}
                onClick={() => openEdit(cat)}>编辑</button>
              <button className="btn btn-danger" style={{ padding: '4px 10px', minHeight: 32, fontSize: 12 }}
                onClick={() => onDelete(cat.id)}>删除</button>
            </div>
          </li>
        ))}
      </ul>

      {/* 新增/编辑弹窗 */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{editId ? '编辑分类' : '新增分类'}</h3>
            <input
              className="modal-input"
              placeholder="分类名称"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
            <div className="color-picker">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  className={`color-dot ${color === c ? 'color-dot--selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSubmit}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== 倒计时管理区域 ==========
function CountdownSection({
  countdowns,
  onAdd,
  onDelete,
}: {
  countdowns: Countdown[];
  onAdd: (title: string, targetDate: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const openAdd = () => {
    setTitle('');
    setTargetDate('');
    setShowForm(true);
  };

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed || !targetDate) return;
    onAdd(trimmed, targetDate);
    setShowForm(false);
  };

  const getRemainingDays = (target: string): number => {
    const now = new Date();
    const targetDate = new Date(target);
    const diff = targetDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-title">我的倒计时</span>
        <button className="btn btn-primary" style={{ padding: '6px 14px', minHeight: 36 }} onClick={openAdd}>
          + 新增
        </button>
      </div>

      {countdowns.length === 0 && (
        <p className="empty-hint">暂无倒计时，点击新增创建</p>
      )}

      <ul className="cd-list">
        {countdowns.map(cd => {
          const days = getRemainingDays(cd.targetDate);
          return (
            <li key={cd.id} className="cd-item card">
              <div className="cd-info">
                <span className="cd-title">{cd.title}</span>
                <span className="cd-date">目标日期：{cd.targetDate}</span>
              </div>
              <div className="cd-right">
                <span className="cd-days">
                  {days >= 0 ? `还有 ${days} 天` : `已过 ${Math.abs(days)} 天`}
                </span>
                <button className="btn btn-danger" style={{ padding: '4px 10px', minHeight: 32, fontSize: 12 }}
                  onClick={() => onDelete(cd.id)}>删除</button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* 新增弹窗 */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">新增倒计时</h3>
            <input
              className="modal-input"
              placeholder="倒计时名称，如：考研"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
            <input
              className="modal-input"
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              style={{ marginTop: 8 }}
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSubmit}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== 数据导出/导入 ==========
function DataSection({ data }: { data: AppData }) {
  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `日程本备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string);
          if (typeof json.version !== 'number') {
            alert('文件格式不正确，无法导入');
            return;
          }
          saveData(json).then(() => {
            alert('数据已导入，请刷新页面生效');
            window.location.reload();
          });
        } catch {
          alert('文件解析失败，请检查文件是否完整');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-title">数据备份</span>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <p className="data-hint">
          如果发现数据偶尔丢失，建议定期导出备份。更换浏览器或设备前也请先导出。
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleExport}>
          导出数据
        </button>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleImport}>
          导入数据
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;
