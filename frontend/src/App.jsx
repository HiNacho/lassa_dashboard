import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import OverviewTab from './components/tabs/OverviewTab';
import TemporalTrendsTab from './components/tabs/TemporalTrendsTab';
import SpatialAnalysisTab from './components/tabs/SpatialAnalysisTab';
import ForecastInsightsTab from './components/tabs/ForecastInsightsTab';
import './index.css';
import { useData } from './context/useData';

function DataStatusBoundary({ children }) {
  const { dataStatus, error } = useData();
  if (dataStatus === 'loading') return <div style={{ padding: '32px' }} role="status">Loading surveillance data…</div>;
  if (dataStatus === 'empty') return <div style={{ padding: '32px' }} role="status">No surveillance observations are available.</div>;
  if (dataStatus === 'error') return <div style={{ padding: '32px', color: '#fca5a5' }} role="alert">Data unavailable: {error}</div>;
  return children;
}

function Dashboard() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('overview');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'temporal':
        return <TemporalTrendsTab />;
      case 'spatial':
        return <SpatialAnalysisTab />;
      case 'forecast':
        return <ForecastInsightsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Header toggleTheme={toggleTheme} theme={theme} />
        
        {/* Dynamic Tab Container */}
        <div className="tab-container">
           <DataStatusBoundary>{renderTabContent()}</DataStatusBoundary>
        </div>

        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <DataProvider>
      <Dashboard />
    </DataProvider>
  );
}

export default App;
