import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CalendarDays, ChevronDown } from 'lucide-react';

export default function Header() {
  const { years, selectedYear, setSelectedYear } = useData();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="header-container" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', borderBottom: '1px solid var(--card-border)' }}>
       <div className="header-title">
         <h1>Dashboard</h1>
       </div>
       
       <div style={{ position: 'relative' }}>
          <button 
             onClick={() => setShowPicker(!showPicker)}
             className="glass-card fade-in"
             style={{ 
                 display: 'flex', alignItems: 'center', gap: '10px', 
                 padding: '10px 20px', color: 'var(--text-main)', 
                 fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                 boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                 transition: 'all 0.3s ease',
                 border: showPicker ? '1px solid var(--accent-lassa)' : '1px solid var(--card-border)'
             }}
             onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 15px var(--accent-lassa-glow)'}
             onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'}
          >
             <CalendarDays size={18} color="var(--accent-lassa)" />
             {selectedYear === 'All' ? 'All Time (2020 - 2025)' : `Year: ${selectedYear}`}
             <ChevronDown size={16} color="var(--text-muted)" style={{ marginLeft: '4px', transform: showPicker ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
          </button>

          {showPicker && (
              <div 
                  className="glass-card fade-in"
                  style={{ 
                  position: 'absolute', top: '100%', right: 0, marginTop: '8px', 
                  zIndex: 100, width: '220px', display: 'flex', flexDirection: 'column', 
                  padding: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
              }}>
                  {years.map(y => (
                      <div 
                         key={y}
                         onClick={() => { setSelectedYear(y); setShowPicker(false); }}
                         style={{ 
                             padding: '10px 16px', borderRadius: '8px', fontSize: '14px',
                             cursor: 'pointer', background: selectedYear === y ? 'rgba(255,87,34,0.15)' : 'transparent',
                             color: selectedYear === y ? 'var(--text-main)' : 'var(--text-muted)', 
                             fontWeight: selectedYear === y ? 600 : 400,
                             transition: 'all 0.2s',
                             border: selectedYear === y ? '1px solid var(--accent-lassa)' : '1px solid transparent'
                         }}
                         onMouseEnter={e => { if(selectedYear !== y) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}}
                         onMouseLeave={e => { if(selectedYear !== y) e.currentTarget.style.background = 'transparent'}}
                      >
                         {y === 'All' ? 'All Time (2020 - 2025)' : `Year: ${y}`}
                      </div>
                  ))}
              </div>
          )}
       </div>
    </div>
  );
}
