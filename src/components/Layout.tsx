import type { ReactNode } from 'react';
import TabBar from './TabBar';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

function Layout({ children, tabs, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="layout">
      <header className="layout-header">
        <h1 className="layout-title">日程本</h1>
      </header>
      <TabBar tabs={tabs} activeIndex={activeTab} onChange={onTabChange} />
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}

export default Layout;
