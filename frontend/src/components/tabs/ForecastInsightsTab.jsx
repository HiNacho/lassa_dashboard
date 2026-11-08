import React, { useMemo } from 'react';
import { useData } from '../../context/useData';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { BrainCircuit, AlertOctagon } from 'lucide-react';
import { buildIndicativeProjection } from '../../lib/projection';

export default function ForecastInsightsTab() {
  const { data, selectedYear } = useData();

  const forecastData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const sorted = [...data].sort((a,b) => a.week_start_date.localeCompare(b.week_start_date));
    let baseData = [];
    if (selectedYear === 'All') {
        baseData = sorted.slice(-20); // Get last 20 weeks of all time
    } else {
        baseData = sorted.filter(d => d.epi_year === selectedYear);
    }
    
    return buildIndicativeProjection(baseData);

  }, [data, selectedYear]);

  return (
    <div className="tab-content fade-in forecast-tab" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div>
             <h2 style={{ margin: '0 0 4px', color: 'var(--text-main)', fontSize: '24px' }}>Indicative Trend Projection</h2>
             <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
                A transparent 12-week heuristic projection from the latest eligible weekly national observation; not a trained forecasting model.
             </p>
         </div>
         <span style={{ fontSize: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid currentColor', color: '#8b5cf6', padding: '6px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
             <BrainCircuit size={16} /> Heuristic projection
         </span>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div className="glass-card" style={{ flex: 2, padding: '30px', minHeight: '450px' }}>
             <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-bright)' }}>Observed weekly cases and 12-week projection</h3>
             <ResponsiveContainer width="100%" height={350}>
                 <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorInterval" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend layout="vertical" align="left" verticalAlign="top" height={64} wrapperStyle={{ fontSize: 11, lineHeight: '18px' }} />
                    
                    {/* Illustrative range, not a statistical confidence interval. */}
                    <Area type="monotone" dataKey="upper" name="Illustrative sensitivity range" stroke="none" fill="url(#colorInterval)" />
                    
                    {/* MAIN LINES */}
                    <Area type="monotone" dataKey="cases" name="Actual Cases" stroke="#ff5722" strokeWidth={3} fillOpacity={0} />
                    <Area type="monotone" dataKey="predicted" name="Predicted Cases" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" fill="url(#colorPredicted)" />
                 </AreaChart>
             </ResponsiveContainer>
          </div>

          <div className="glass-card" style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column' }}>
             <h3 style={{ marginTop: 0, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrainCircuit size={20} color="#8b5cf6" />
                Method and limitations
             </h3>
             <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0 0', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                 
                 <li className="fade-in" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '3px solid #eab308' }}>
                     <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                        <strong>Projection basis:</strong> The line extends the recent national weekly trend, damped each period with a simple seasonal term. It does not model state-level transmission, reporting delays, or interventions.
                     </p>
                     <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BrainCircuit size={12}/> Horizon: 12 epidemiological weeks
                     </p>
                 </li>
                 
                 <li className="fade-in" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '3px solid #ef4444', animationDelay: '0.1s' }}>
                     <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                        <strong>Interpretation:</strong> The shaded range is an illustrative sensitivity range (70%–140% of the heuristic estimate), not a calibrated prediction interval or confidence interval.
                     </p>
                     <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BrainCircuit size={12}/> Use for exploratory context only
                     </p>
                 </li>
                 
                 <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px dashed rgba(239, 68, 68, 0.3)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <AlertOctagon size={24} color="#ef4444" style={{ flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-main)' }}>This visualization is not validated for operational decision-making. A future forecasting model requires held-out evaluation, revision handling, and documented performance metrics.</p>
                 </div>
             </ul>
          </div>
      </div>
    </div>
  );
}
