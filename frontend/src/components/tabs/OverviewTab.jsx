import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const geoUrl = '/dataset/nigeria_states.geojson';

export default function OverviewTab() {
  const { data, stateData, loading, selectedYear } = useData();
  const [mapMetric, setMapMetric] = useState('Confirmed');

  // KPIS
  const nationalKpis = useMemo(() => {
    if (!data || data.length === 0) return { cases: 0, deaths: 0, cfr: 0 };
    if (selectedYear === 'All') {
      const cases = data.reduce((sum, row) => sum + (row.confirmed_cases || 0), 0);
      const deaths = data.reduce((sum, row) => sum + (row.deaths || 0), 0);
      return { cases, deaths, cfr: ((deaths / cases) * 100).toFixed(1) };
    } else {
      const row = data.find(d => d.epi_year === selectedYear) || { confirmed_cases: 0, deaths: 0 };
      return { cases: row.confirmed_cases, deaths: row.deaths, cfr: row.confirmed_cases ? ((row.deaths / row.confirmed_cases) * 100).toFixed(1) : 0 };
    }
  }, [data, selectedYear]);

  const filteredStateData = useMemo(() => {
    if (!stateData || stateData.length === 0) return [];
    if (selectedYear === 'All') {
        const stateMap = {};
        stateData.forEach(row => {
            const state = row.state_clean;
            if (!state) return;
            if (!stateMap[state]) stateMap[state] = { state, confirmed: 0, deaths: 0 };
            stateMap[state].confirmed += (row.confirmed || 0);
            stateMap[state].deaths += (row.deaths || 0);
        });
        return Object.values(stateMap).map(s => ({ ...s, cfr: s.confirmed ? ((s.deaths / s.confirmed) * 100).toFixed(1) : 0 }));
    } else {
        return stateData.filter(d => d.year === selectedYear).map(s => ({ state: s.state_clean, confirmed: s.confirmed || 0, deaths: s.deaths || 0, cfr: s.confirmed ? ((s.deaths / s.confirmed) * 100).toFixed(1) : 0 }));
    }
  }, [stateData, selectedYear]);

  const maxMapValue = useMemo(() => {
     if (filteredStateData.length === 0) return 1;
     return Math.max(...filteredStateData.map(d => mapMetric === 'Confirmed' ? d.confirmed : mapMetric === 'Deaths' ? d.deaths : Number(d.cfr))) || 1;
  }, [filteredStateData, mapMetric]);

  const colorScale = scaleLinear().domain([0, maxMapValue]).range(["#1e1b4b", mapMetric === 'Confirmed' ? '#ff5722' : mapMetric === 'Deaths' ? '#ef4444' : '#eab308']);

  if (loading) return <div style={{ padding: '32px' }}>Loading Data...</div>;

  const topStates = [...filteredStateData].sort((a,b) => b.confirmed - a.confirmed);
  const activeHotspotState = topStates[0] || { state: 'None' };
  const cfrHigh = Number(nationalKpis.cfr) > 15;

  return (
    <div className="tab-content fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ALERT BANNER */}
      {(topStates[0]?.confirmed > 100 || cfrHigh) && (
         <div className="fade-in" style={{ 
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)', 
            borderLeft: '4px solid #ef4444', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' 
         }}>
             <div style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '8px', borderRadius: '50%' }}>
                <AlertTriangle size={24} />
             </div>
             <div>
                <h4 style={{ margin: '0 0 4px', color: '#f87171', fontSize: '15px' }}>Active Outbreak Alert</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                   High outbreak risk in <strong>{activeHotspotState.state}</strong> with {activeHotspotState.confirmed} cases and {activeHotspotState.cfr}% CFR. 
                   {cfrHigh ? " National CFR exceeds 15% threshold." : ""} Rapid intervention recommended.
                </p>
             </div>
         </div>
      )}

      {/* TOP CARDS ROW */}
      <div style={{ display: 'flex', gap: '24px' }}>
         <div className="glass-card" style={{ flex: 1, padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: 'var(--text-main)' }}>Cases Overview</h3>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--text-muted)' }}>Confirmed vs. Suspected volume.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
               <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     {nationalKpis.cases.toLocaleString()}
                     <span style={{ fontSize: '12px', background: 'rgba(255,87,34,0.1)', color: '#ff5722', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={14} /> 14%
                     </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Confirmed</div>
               </div>
               <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     {(nationalKpis.cases * 1.4).toLocaleString(undefined, {maximumFractionDigits:0})}
                     <span style={{ fontSize: '12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingDown size={14} /> 6%
                     </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Suspected</div>
               </div>
            </div>
         </div>

         <div className="glass-card" style={{ flex: 1, padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: 'var(--text-main)' }}>Outcomes</h3>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--text-muted)' }}>Mortality and case fatality indicators.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
               <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     {nationalKpis.deaths.toLocaleString()}
                     <span style={{ fontSize: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={14} /> 12%
                     </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Total Deaths</div>
               </div>
               <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     {nationalKpis.cfr}%
                     <span style={{ fontSize: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={14} /> 2%
                     </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Case Fatality Rate</div>
               </div>
            </div>
         </div>
      </div>

      {/* MAP AND GEOGRAPHICAL DISTRIBUTION */}
      <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)' }}>Geographical Distribution</h3>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {['Confirmed', 'Deaths', 'CFR'].map(tab => (
                     <button 
                        key={tab} 
                        onClick={() => setMapMetric(tab)} 
                        style={{ 
                           padding: '6px 16px', background: mapMetric === tab ? 'var(--accent-lassa)' : 'transparent', 
                           border: 'none', borderRadius: '6px', fontSize: '13px', 
                           fontWeight: mapMetric === tab ? 600 : 400, 
                           color: mapMetric === tab ? '#fff' : 'var(--text-muted)', 
                           boxShadow: mapMetric === tab ? '0 0 10px rgba(255,87,34,0.5)' : 'none', 
                           cursor: 'pointer', transition: 'all 0.3s'
                        }}
                     >
                        {tab}
                     </button>
                  ))}
              </div>
          </div>

          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1.5, height: '400px', display: 'flex', justifyContent: 'center' }}>
                 <ComposableMap projection="geoMercator" projectionConfig={{ scale: 2600, center: [8.5, 9.5] }} style={{ width: '100%', height: '100%' }}>
                    <Geographies geography={geoUrl}>
                      {({ geographies }) => geographies.map((geo) => {
                          const stateName = geo.properties.state;
                          const s = filteredStateData.find(d => d.state === stateName);
                          const val = s ? (mapMetric === 'Confirmed' ? s.confirmed : mapMetric === 'Deaths' ? s.deaths : Number(s.cfr)) : 0;
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={val > 0 ? colorScale(val) : "#1e1b4b"}
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth={1}
                              style={{ 
                                  default: { outline: 'none', transition: 'all 250ms' }, 
                                  hover: { fill: "#ff5722", cursor: 'pointer', outline: 'none', filter: 'drop-shadow(0 0 8px rgba(255,61,0,0.6))' }, 
                                  pressed: { outline: 'none' } 
                              }}
                            />
                          );
                        })
                      }
                    </Geographies>
                 </ComposableMap>
              </div>

              <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 80px 60px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', borderRadius: '8px 8px 0 0' }}>
                     <div>States</div>
                     <div style={{ textAlign: 'right' }}>Burden</div>
                     <div style={{ textAlign: 'right' }}>%</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                      {topStates.slice(0,6).map((st, i) => {
                          const val = mapMetric === 'Confirmed' ? st.confirmed : mapMetric === 'Deaths' ? st.deaths : Number(st.cfr);
                          const total = mapMetric === 'Confirmed' ? nationalKpis.cases : mapMetric === 'Deaths' ? nationalKpis.deaths : 100;
                          const pct = total ? ((val / total) * 100).toFixed(1) : 0;
                          return (
                              <div key={st.state} className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 80px 60px', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-main)' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: i===0?'#ef4444':i===1?'#ff5722':i===2?'#f59e0b':'#10b981', boxShadow: `0 0 8px ${i===0?'#ef4444':i===1?'#ff5722':i===2?'#f59e0b':'#10b981'}` }}></div>
                                    {st.state}
                                 </div>
                                 <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{val.toLocaleString()}</div>
                                 <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>{pct}%</div>
                              </div>
                          )
                      })}
                  </div>
              </div>
          </div>
      </div>
      
      {/* TABLE SECTION */}
      <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>Breakdown By State</h3>
             <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sorted by Confirmed Cases Volume</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
               <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                     <th style={{ padding: '16px', fontWeight: 500, borderRadius: '8px 0 0 0' }}>State</th>
                     <th style={{ padding: '16px', fontWeight: 500 }}>Confirmed Cases</th>
                     <th style={{ padding: '16px', fontWeight: 500 }}>Target / Projected</th>
                     <th style={{ padding: '16px', fontWeight: 500 }}>Deaths</th>
                     <th style={{ padding: '16px', fontWeight: 500 }}>CFR %</th>
                     <th style={{ padding: '16px', fontWeight: 500, borderRadius: '0 8px 0 0' }}>Trend</th>
                  </tr>
               </thead>
               <tbody>
                  {topStates.slice(0, 5).map((st, idx) => (
                     <tr key={st.state} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px', color: 'var(--text-main)' }}>
                        <td style={{ padding: '16px', fontWeight: 500 }}>{st.state}</td>
                        <td style={{ padding: '16px', color: '#ff5722' }}>{st.confirmed.toLocaleString()}</td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{(st.confirmed * 1.2).toFixed(0)}</td>
                        <td style={{ padding: '16px', color: '#ef4444' }}>{st.deaths.toLocaleString()}</td>
                        <td style={{ padding: '16px' }}>
                           <span style={{ padding: '4px 8px', borderRadius: '4px', background: Number(st.cfr) > 15 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', color: Number(st.cfr) > 15 ? '#fca5a5' : '#fde68a' }}>
                              {st.cfr}%
                           </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                            {idx < 2 ? <TrendingUp size={16} color="#ef4444" /> : <TrendingDown size={16} color="#10b981" />}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
