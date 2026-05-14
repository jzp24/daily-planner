import './TabBar.css';

interface TabBarProps {
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

function TabBar({ tabs, activeIndex, onChange }: TabBarProps) {
  return (
    <nav className="tab-bar">
      {tabs.map((tab, i) => (
        <button
          key={tab}
          className={`tab-item ${activeIndex === i ? 'tab-item--active' : ''}`}
          onClick={() => onChange(i)}
        >
          <span className="tab-icon">{getIcon(i)}</span>
          <span className="tab-label">{tab}</span>
        </button>
      ))}
    </nav>
  );
}

function getIcon(index: number): string {
  const icons = ['📅', '📋', '📊', '🗓️', '⚙️'];
  return icons[index] ?? '';
}

export default TabBar;
