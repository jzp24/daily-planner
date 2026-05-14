import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate, computeDurationMinutes, getCurrentYear } from '../utils/date';
import './YearPage.css';

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

interface CellData {
  date: string;
  month: number;
  col: number;
  row: number;
  minutes: number;
}

function buildGrid(year: number, tasksMap: Map<string, number>): { cells: CellData[]; maxCol: number; monthStarts: number[] } {
  const cells: CellData[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  // 收集每一天
  const d = new Date(start);
  while (d <= end) {
    const dateStr = formatDate(d);
    const dayOfWeek = d.getDay(); // 0=Sun
    cells.push({
      date: dateStr,
      month: d.getMonth(),
      col: 0, // computed below
      row: dayOfWeek === 0 ? 6 : dayOfWeek - 1, // 0=Mon, 6=Sun
      minutes: tasksMap.get(dateStr) ?? 0,
    });
    d.setDate(d.getDate() + 1);
  }

  // 按周分组计算列号
  const weekMap = new Map<string, number>();
  let weekIndex = 0;
  cells.sort((a, b) => a.date.localeCompare(b.date));

  for (const cell of cells) {
    const cellDate = new Date(cell.date);
    const dayOfWeek = cellDate.getDay();
    const monDate = new Date(cellDate);
    monDate.setDate(monDate.getDate() + (dayOfWeek === 0 ? -6 : 1 - dayOfWeek));
    const weekKey = formatDate(monDate);
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, weekIndex++);
    }
    cell.col = weekMap.get(weekKey)!;
  }

  const maxCol = Math.max(...cells.map(c => c.col), 0);

  // 计算每月首个格子的列号
  const monthStarts: number[] = [];
  for (let m = 0; m < 12; m++) {
    const first = cells.find(c => c.month === m);
    monthStarts.push(first ? first.col : -1);
  }

  return { cells, maxCol, monthStarts };
}

function getColorClass(minutes: number): string {
  if (minutes >= 240) return 'cell-green';
  if (minutes > 3) return 'cell-red';
  return 'cell-none';
}

function YearPage() {
  const { data } = useApp();
  const [year, setYear] = useState(getCurrentYear());
  const [tooltip, setTooltip] = useState<{ date: string; minutes: number; x: number; y: number } | null>(null);

  const tasksMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of data.tasks) {
      if (task.status !== 'completed') continue;
      const dur = computeDurationMinutes(task.startTime, task.endTime);
      map.set(task.date, (map.get(task.date) ?? 0) + dur);
    }
    return map;
  }, [data.tasks]);

  const { cells, maxCol, monthStarts } = useMemo(() => buildGrid(year, tasksMap), [year, tasksMap]);

  const totalHours = useMemo(() => {
    const totalMin = cells.reduce((s, c) => s + c.minutes, 0);
    return (totalMin / 60).toFixed(1);
  }, [cells]);

  const formatTooltip = (date: string, min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${date}  ${h}小时${m}分钟`;
  };

  return (
    <div className="year-page">
      {/* 年份选择 */}
      <div className="year-picker">
        <button className="btn btn-secondary" onClick={() => setYear(y => y - 1)}>
          &lt; {year - 1}
        </button>
        <span className="year-text">{year}</span>
        <button className="btn btn-secondary" onClick={() => setYear(y => y + 1)}>
          {year + 1} &gt;
        </button>
      </div>

      <p className="year-total">
        全年总专注时长：<strong>{totalHours}</strong> 小时
      </p>

      {/* 热力图 */}
      <div className="heatmap-card card">
        <div className="heatmap-scroll">
          {/* 月份标签 — 与格子共用同一套列宽 */}
          <div className="month-bar">
            <span className="row-label-spacer" />
            <div className="cell-row">
              {(() => {
                const items = [];
                let col = 0;
                for (let m = 0; m < 12; m++) {
                  const startCol = monthStarts[m];
                  if (startCol < 0) continue;
                  // 补上前面的空白列
                  while (col < startCol) {
                    items.push(<div key={`gap-${col}`} className="cell cell-empty" />);
                    col++;
                  }
                  // 计算该月跨越的列数
                  let endCol = maxCol + 1;
                  for (let n = m + 1; n < 12; n++) {
                    if (monthStarts[n] > startCol) {
                      endCol = monthStarts[n];
                      break;
                    }
                  }
                  const span = endCol - startCol;
                  const w = span * 16 + (span - 1) * 3;
                  items.push(
                    <span key={m} className="month-label" style={{ width: w, flexShrink: 0 }}>
                      {MONTH_NAMES[m]}
                    </span>
                  );
                  col = endCol;
                }
                return items;
              })()}
            </div>
          </div>

          {/* 每日格子 */}
          {DAY_LABELS.map((label, row) => (
            <div key={row} className="heatmap-row">
              <span className="row-label">{label}</span>
              <div className="cell-row">
                {Array.from({ length: maxCol + 1 }, (_, col) => {
                  const cell = cells.find(c => c.col === col && c.row === row);
                  if (!cell) {
                    return <div key={col} className="cell cell-empty" />;
                  }
                  return (
                    <div
                      key={col}
                      className={`cell ${getColorClass(cell.minutes)}`}
                      onMouseEnter={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setTooltip({
                          date: cell.date,
                          minutes: cell.minutes,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 图例 */}
        <div className="heatmap-legend">
          <span className="legend-item"><span className="legend-dot legend-none" /> 无记录</span>
          <span className="legend-item"><span className="legend-dot legend-red" /> &lt; 4小时</span>
          <span className="legend-item"><span className="legend-dot legend-green" /> ≥ 4小时</span>
        </div>
      </div>

      {/* 悬浮提示 */}
      {tooltip && (
        <div className="heatmap-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {formatTooltip(tooltip.date, tooltip.minutes)}
        </div>
      )}
    </div>
  );
}

export default YearPage;
