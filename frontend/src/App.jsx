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
           {renderTabContent()}
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
