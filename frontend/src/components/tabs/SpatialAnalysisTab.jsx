import React, { useMemo } from 'react';
import { useData } from '../../context/useData';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { normalizeStateName, observationStatus, observationStatusLabel } from '../../lib/geography';
import { classifyHistoricalBurden } from '../../lib/hotspots';

const geoUrl = '/dataset/nigeria_states.geojson';

export default function SpatialAnalysisTab() {
  const { stateData, selectedYear, selectedMetric } = useData();

  const filteredStateData = useMemo(() => {
    if (!stateData || stateData.length === 0) return [];
    if (selectedYear === 'All') {
        const stateMap = {};
        stateData.forEach(row => {
            const state = normalizeStateName(row.state_clean);
            if (!state) return;
            if (!stateMap[state]) stateMap[state] = { state, confirmed: 0, deaths: 0 };
            stateMap[state].confirmed += (row.confirmed || 0);
            stateMap[state].deaths += (row.deaths || 0);
        });
        return Object.values(stateMap).map(s => ({
            ...s,
            cfr: s.confirmed ? ((s.deaths / s.confirmed) * 100).toFixed(1) : 0
        }));
    } else {
        return stateData
            .filter(d => d.year === selectedYear)
            .map(s => ({
                state: normalizeStateName(s.state_clean),
                confirmed: s.confirmed || 0,
                deaths: s.deaths || 0,
                cfr: s.confirmed ? ((s.deaths / s.confirmed) * 100).toFixed(1) : 0
            }));
    }
  }, [stateData, selectedYear]);

  const maxMetricValue = useMemo(() => {
    if (filteredStateData.length === 0) return 1;
    if (selectedMetric === 'Deaths') return Math.max(...filteredStateData.map(d => d.deaths)) || 1;
    if (selectedMetric === 'CFR (%)') return Math.max(...filteredStateData.map(d => Number(d.cfr))) || 1;
    return Math.max(...filteredStateData.map(d => d.confirmed)) || 1;
  }, [filteredStateData, selectedMetric]);

  const colorScale = scaleLinear()
    .domain([0, maxMetricValue])
    .range(["#1e1b4b", selectedMetric === 'Deaths' ? '#ef4444' : selectedMetric === 'CFR (%)' ? '#eab308' : '#ff5722']);

  const getMetricValue = (stateName) => {
    const s = filteredStateData.find(d => d.state === normalizeStateName(stateName));
    if (!s) return null;
    if (selectedMetric === 'Deaths') return s.deaths;
    if (selectedMetric === 'CFR (%)') return Number(s.cfr);
    return s.confirmed;
  };

  const topStates = [...filteredStateData].sort((a,b) => b.confirmed - a.confirmed).slice(0, 10);
  
  // Categorize for Hostpot Engine
  const hotspotsData = useMemo(() => {
      const high = [];
      const moderate = [];
      const low = [];
      
      [...filteredStateData]
        .filter(s => s.confirmed > 0)
        .sort((a,b) => b.confirmed - a.confirmed)
        .forEach(st => {
           if (classifyHistoricalBurden(st) === 'high') {
               high.push(st);
           } else if (classifyHistoricalBurden(st) === 'moderate') {
               moderate.push(st);
           } else {
               low.push(st);
           }
        });
      return { high, moderate, low };
  }, [filteredStateData]);

  return (
    <div className="tab-content fade-in spatial-tab" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div>
             <h2 style={{ margin: '0 0 4px', color: 'var(--text-main)', fontSize: '24px' }}>Spatial Analysis</h2>
             <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
                Annual state reporting burden ({selectedYear}); maintained separately from national weekly totals.
             </p>
         </div>
      </div>

      <div className="spatial-map-layout" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', flex: 1 }}>
        {/* MAP */}
        <div className="glass-card spatial-map-card" style={{ flex: 2, padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '450px' }}>
           <h3 style={{ marginTop: 0, color: 'var(--text-bright)' }}>Choropleth Projection</h3>
           <ComposableMap projection="geoMercator" projectionConfig={{ scale: 3000, center: [8.5, 9.5] }} style={{ width: '100%', flex: 1 }}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const stateName = geo.properties.state;
                    const val = getMetricValue(stateName);
                    const status = observationStatus(filteredStateData.find((item) => item.state === normalizeStateName(stateName)));
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={status === 'missing' ? '#374151' : val > 0 ? colorScale(val) : '#0f0f20'}
                        aria-label={`${stateName}: ${observationStatusLabel[status]}${status === 'observed' ? `; ${val} selected metric` : ''}`}
                        stroke="#2d3748"
                        strokeWidth={1}
                        style={{
                          default: { outline: "none", transition: 'all 250ms' },
                          hover: { fill: "#ff3d00", outline: "none", cursor: 'crosshair', filter: 'drop-shadow(0 0 10px rgba(255,61,0,0.5))' },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
           </ComposableMap>
           <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Dark grey: no state observation. Dark map fill: observed zero value.</p>
        </div>

        {/* COL 2: Hotspot detection */}
        <div className="glass-card spatial-screening-card" style={{ flex: 1, padding: '24px', minWidth: '350px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-bright)' }}>Provisional Historical Screening</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '10px' }}>
               
               <div style={{ padding: '16px', border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width:'10px', height:'10px', borderRadius:'50%', background:'#ef4444', boxShadow:'0 0 10px #ef4444' }}></span>
                      Higher historical burden
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                     {hotspotsData.high.map(st => (
                         <div key={st.state} style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            {st.state} ({st.confirmed})
                         </div>
                     ))}
                     {hotspotsData.high.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No states currently meet thresholds.</span>}
                  </div>
               </div>

               <div style={{ padding: '16px', border: '1px solid rgba(245, 158, 11, 0.2)', backgroundColor: 'rgba(245, 158, 11, 0.05)', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width:'10px', height:'10px', borderRadius:'50%', background:'#f59e0b', boxShadow:'0 0 10px #f59e0b' }}></span>
                      Moderate historical burden
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                     {hotspotsData.moderate.map(st => (
                         <div key={st.state} style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            {st.state} ({st.confirmed})
                         </div>
                     ))}
                  </div>
               </div>

               <div style={{ padding: '16px', border: '1px solid rgba(16, 185, 129, 0.2)', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width:'10px', height:'10px', borderRadius:'50%', background:'#10b981', boxShadow:'0 0 10px #10b981' }}></span>
                      Lower historical burden
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '100px', overflowY: 'auto' }}>
                     {hotspotsData.low.map(st => (
                         <div key={st.state} style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            {st.state}
                         </div>
                     ))}
                  </div>
               </div>
            </div>
        </div>
      </div>

      {/* BOTTOM ROW: CFR & Burden list */}
      <div className="spatial-lower-layout" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
         <div className="glass-card" style={{ flex: 2, padding: '24px', minHeight: '300px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '8px', color: 'var(--text-bright)' }}>Regional Case Fatality Rate Discrepancies</h3>
            <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: '12px' }}>Highlighting states with unusually high mortality (% CFR)</p>

            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topStates} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                   <XAxis dataKey="state" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                   <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} unit="%" />
                   <RechartsTooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                   />
                   <Bar dataKey="cfr" name="CFR (%)" radius={[4, 4, 0, 0]}>
                      {topStates.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={Number(entry.cfr) > 15 ? '#ef4444' : '#f59e0b'} />
                      ))}
                   </Bar>
                </BarChart>
            </ResponsiveContainer>
         </div>

         <div className="glass-card spatial-ranking-card" style={{ flex: 1, padding: '24px', minWidth: '300px' }}>
             <h3 style={{ marginTop: 0, color: 'var(--text-bright)' }}>State Burden Ranking</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
               {topStates.slice(0, 5).map((st, i) => (
                   <div key={st.state} style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{i + 1}. {st.state}</span>
                          <span style={{ fontSize: '14px', color: '#ff5722' }}>{st.confirmed.toLocaleString()} Cases</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                         <div style={{ width: `${Math.min((st.confirmed / maxMetricValue) * 100, 100)}%`, background: '#ff5722' }}></div>
                      </div>
                   </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
