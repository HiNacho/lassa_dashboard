import React, { useEffect, useRef } from 'react';
import { Home, LayoutDashboard, Map, Lightbulb, User, Bell, Cloud, MoreHorizontal, Activity, AlertTriangle, FileText, X } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    previousFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current instanceof HTMLElement && previousFocusRef.current.isConnected) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  const selectTab = (tab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      <button
        className={`sidebar-backdrop ${isOpen ? 'is-visible' : ''}`}
        aria-label="Close navigation menu"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />
      <aside className={`sidebar expanded-sidebar ${isOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '24px 20px', marginBottom: '10px' }}>
         <ThermometerIcon />
         <span className="sidebar-brand">Lassa Tracer</span>
         <span className="data-status-badge">HISTORICAL</span>
         <button ref={closeButtonRef} className="sidebar-close" type="button" aria-label="Close navigation menu" onClick={onClose}><X size={20} /></button>
      </div>
      
      <div className="sidebar-nav">
         <div className="nav-section">
            <h4 className="nav-heading">ACTION CENTRE</h4>
            <button type="button" className="nav-item" disabled title="Home is not available in this historical dashboard"><Home size={18} /><span className="nav-label">Home</span></button>
         </div>

         <div className="nav-section">
            <h4 className="nav-heading">INSIGHTS</h4>
            <button type="button" className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => selectTab('overview')}>
               <LayoutDashboard size={18} /><span className="nav-label">Dashboard</span>
            </button>
            <button type="button" className="nav-item" disabled title="Custom Dashboard is not available">
               <LayoutDashboard size={18} /><span className="nav-label">Custom Dashboard</span>
            </button>
         </div>

         <div className="nav-section">
            <h4 className="nav-heading">ENGAGEMENTS</h4>
            <button type="button" className={`nav-item ${activeTab === 'temporal' ? 'active' : ''}`} onClick={() => selectTab('temporal')}>
               <Activity size={18} /><span className="nav-label">Temporal Trends</span>
            </button>
            <button type="button" className={`nav-item ${activeTab === 'spatial' ? 'active' : ''}`} onClick={() => selectTab('spatial')}>
               <Map size={18} /><span className="nav-label">Spatial Analysis</span>
            </button>
            <button type="button" className={`nav-item ${activeTab === 'forecast' ? 'active' : ''}`} onClick={() => selectTab('forecast')}>
               <Lightbulb size={18} /><span className="nav-label">Forecasts</span>
            </button>
            <button type="button" className="nav-item" disabled title="Hotspots is not available"><AlertTriangle size={18} /><span className="nav-label">Hotspots</span></button>
            <button type="button" className="nav-item" disabled title="Logs is not available"><FileText size={18} /><span className="nav-label">Logs</span></button>
         </div>
      </div>

      <div className="sidebar-footer">
          <div className="footer-icon tooltip"><User size={18} /></div>
          <div className="footer-icon tooltip"><Bell size={18} /></div>
          <div className="footer-icon tooltip"><Cloud size={18} /></div>
          <div className="footer-icon tooltip"><MoreHorizontal size={18} /></div>
      </div>
      </aside>
    </>
  );
}

function ThermometerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
    </svg>
  );
}
