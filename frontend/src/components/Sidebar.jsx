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
         <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px' }}>Lassa Tracer</span>
         <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', marginLeft: 'auto' }}>LIVE</span>
         <button ref={closeButtonRef} className="sidebar-close" type="button" aria-label="Close navigation menu" onClick={onClose}><X size={20} /></button>
      </div>
      
      <div className="sidebar-nav">
         <div className="nav-section">
            <h4 className="nav-heading">ACTION CENTRE</h4>
            <button type="button" className="nav-item"><Home size={18} /> Home</button>
         </div>

         <div className="nav-section">
            <h4 className="nav-heading">INSIGHTS</h4>
            <button type="button" className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => selectTab('overview')}>
               <LayoutDashboard size={18} /> Dashboard
            </button>
            <button type="button" className={`nav-item ${activeTab === 'custom' ? 'active' : ''}`} onClick={() => selectTab('custom')}>
               <LayoutDashboard size={18} /> Custom Dashboard
            </button>
         </div>

         <div className="nav-section">
            <h4 className="nav-heading">ENGAGEMENTS</h4>
            <button type="button" className={`nav-item ${activeTab === 'temporal' ? 'active' : ''}`} onClick={() => selectTab('temporal')}>
               <Activity size={18} /> Temporal Trends
            </button>
            <button type="button" className={`nav-item ${activeTab === 'spatial' ? 'active' : ''}`} onClick={() => selectTab('spatial')}>
               <Map size={18} /> Spatial Analysis
            </button>
            <button type="button" className={`nav-item ${activeTab === 'forecast' ? 'active' : ''}`} onClick={() => selectTab('forecast')}>
               <Lightbulb size={18} /> Forecasts
            </button>
            <button type="button" className="nav-item"><AlertTriangle size={18} /> Hotspots</button>
            <button type="button" className="nav-item"><FileText size={18} /> Logs</button>
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
