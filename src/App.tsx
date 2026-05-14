import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import DailyPage from './pages/DailyPage';
import WeeklyPage from './pages/WeeklyPage';
import StatsPage from './pages/StatsPage';
import YearPage from './pages/YearPage';
import SettingsPage from './pages/SettingsPage';

const TABS = ['每日', '每周', '统计', '年览', '设置'];
const PAGES = [DailyPage, WeeklyPage, StatsPage, YearPage, SettingsPage];

function AppContent() {
  const { loading } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const PageComponent = PAGES[activeTab];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F0F2F5',
        color: '#999',
        fontSize: 16,
      }}>
        加载中...
      </div>
    );
  }

  return (
    <Layout tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
      <PageComponent />
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
