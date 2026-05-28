import React from 'react';
import { Home, LayoutDashboard, LineChart, Map, Lightbulb, User, Bell, Cloud, MoreHorizontal, Activity, AlertTriangle, FileText } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="sidebar expanded-sidebar">
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '24px 20px', marginBottom: '10px' }}>
         <ThermometerIcon />
         <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px' }}>Lassa Tracer</span>
         <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', marginLeft: 'auto' }}>LIVE</span>
      </div>
      
      <div className="sidebar-nav">
         <div className="nav-section">
            <h4 className="nav-heading">ACTION CENTRE</h4>
            <div className={`nav-item`}><Home size={18} /> Home</div>
         </div>

         <div className="nav-section">
            <h4 className="nav-heading">INSIGHTS</h4>
            <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
               <LayoutDashboard size={18} /> Dashboard
            </div>
            <div className={`nav-item ${activeTab === 'custom' ? 'active' : ''}`} onClick={() => setActiveTab('custom')}>
               <LayoutDashboard size={18} /> Custom Dashboard
            </div>
         </div>

         <div className="nav-section">
            <h4 className="nav-heading">ENGAGEMENTS</h4>
            <div className={`nav-item ${activeTab === 'temporal' ? 'active' : ''}`} onClick={() => setActiveTab('temporal')}>
               <Activity size={18} /> Temporal Trends
            </div>
            <div className={`nav-item ${activeTab === 'spatial' ? 'active' : ''}`} onClick={() => setActiveTab('spatial')}>
               <Map size={18} /> Spatial Analysis
            </div>
            <div className={`nav-item ${activeTab === 'forecast' ? 'active' : ''}`} onClick={() => setActiveTab('forecast')}>
               <Lightbulb size={18} /> Forecasts
            </div>
            <div className="nav-item"><AlertTriangle size={18} /> Hotspots</div>
            <div className="nav-item"><FileText size={18} /> Logs</div>
         </div>
      </div>

      <div className="sidebar-footer">
          <div className="footer-icon tooltip"><User size={18} /></div>
          <div className="footer-icon tooltip"><Bell size={18} /></div>
          <div className="footer-icon tooltip"><Cloud size={18} /></div>
          <div className="footer-icon tooltip"><MoreHorizontal size={18} /></div>
      </div>
    </div>
  );
}

function ThermometerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
    </svg>
  );
}
