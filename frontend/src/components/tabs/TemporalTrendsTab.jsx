import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Line, ComposedChart, Bar, BarChart, Cell } from 'recharts';

export default function TemporalTrendsTab() {
  const { data, loading, selectedYear } = useData();

  const chartData = useMemo(() => {
    if (!data) return [];
    
    // Sort data chronologically if not already
    const sorted = [...data].sort((a,b) => {
        if(a.epi_year !== b.epi_year) return a.epi_year - b.epi_year;
        return a.epi_week - b.epi_week;
    });

    if (selectedYear !== 'All') {
        return sorted.filter(d => d.epi_year === selectedYear);
    }
    return sorted;
  }, [data, selectedYear]);

  const displayData = useMemo(() => {
    let raw = [];
    if (selectedYear === 'All') {
        const monthly = {};
        chartData.forEach(d => {
            const month = Math.ceil((d.epi_week || 1) / 4.33); 
            const key = `${d.epi_year}-${month.toString().padStart(2, '0')}`;
            if (!monthly[key]) monthly[key] = { name: key, cases: 0, deaths: 0 };
            monthly[key].cases += (d.confirmed_cases || 0);
            monthly[key].deaths += (d.deaths || 0);
        });
        raw = Object.values(monthly).sort((a,b) => a.name.localeCompare(b.name));
    } else {
        raw = chartData.map(d => ({
            name: `W${d.epi_week}`,
            cases: d.confirmed_cases || 0,
            deaths: d.deaths || 0
        }));
    }

    // Add moving average & growth rate
    return raw.map((d, i, arr) => {
        let maCases = d.cases;
        if (i >= 2) {
           maCases = (arr[i].cases + arr[i-1].cases + arr[i-2].cases) / 3;
        }
        let growth = 0;
        if (i > 0 && arr[i-1].cases > 0) {
           growth = ((d.cases - arr[i-1].cases) / arr[i-1].cases) * 100;
        }
        if (growth > 300) growth = 300; 
        if (growth < -100) growth = -100;

        return { ...d, maCases: Math.round(maCases), growth: Math.round(growth) };
    });
  }, [chartData, selectedYear]);

  const seasonalData = useMemo(() => {
     if (!data) return [];
     const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     const monthTotals = Array(12).fill(0);
     data.forEach(d => {
        const m = Math.min(11, Math.max(0, Math.ceil((d.epi_week || 1) / 4.33) - 1));
        monthTotals[m] += (d.confirmed_cases || 0);
     });
     return months.map((m, i) => ({ month: m, total: monthTotals[i] }));
  }, [data]);

  if (loading) return <div style={{ padding: '32px' }}>Loading Trends...</div>;

  return (
    <div className="tab-content fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div>
             <h2 style={{ margin: '0 0 4px', color: 'var(--text-main)', fontSize: '24px' }}>Temporal Trends</h2>
             <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
                {selectedYear === 'All' ? 'Aggregated Monthly Trends (2020 - 2025)' : `Weekly Epidemiological Trends for ${selectedYear}`}
             </p>
         </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* MAIN SPREAD CHART */}
              <div className="glass-card" style={{ padding: '30px', minHeight: '400px' }}>
                 <h3 style={{ marginTop: 0, marginBottom: '8px', color: 'var(--text-bright)' }}>Confirmed Cases vs Deaths</h3>
                 <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: '12px' }}>With 3-period Moving Average Smoothing</p>
                 <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff5722" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ff5722" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                      <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                      <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                          itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <Area type="monotone" dataKey="cases" name="Confirmed Cases (Raw)" stroke="#ff5722" strokeWidth={1} fillOpacity={1} fill="url(#colorCases)" />
                      <Line type="monotone" dataKey="maCases" name="Cases (3-wk MA)" stroke="#fcd34d" strokeWidth={3} dot={false} style={{ filter: 'drop-shadow(0 0 4px rgba(252,211,77,0.5))' }} />
                      <Line type="monotone" dataKey="deaths" name="Deaths" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>

              {/* GROWTH RATE CHART */}
              <div className="glass-card" style={{ padding: '24px', minHeight: '300px' }}>
                 <h3 style={{ marginTop: 0, marginBottom: '8px', color: 'var(--text-bright)' }}>Growth Rate (% Period-over-Period)</h3>
                 <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: '12px' }}>Highlighting sudden acceleration in outbreak volume</p>
                 <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                       <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                       <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} unit="%" />
                       <RechartsTooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                       />
                       <Bar dataKey="growth" name="Growth Rate">
                          {displayData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.growth > 0 ? '#ef4444' : '#10b981'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* SEASONAL PATTERNS */}
              <div className="glass-card" style={{ padding: '24px', flex: 1 }}>
                 <h3 style={{ marginTop: 0, marginBottom: '8px', color: 'var(--text-bright)' }}>Seasonal Burden</h3>
                 <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: '12px' }}>Total cumulative distributions across all selected years</p>
                 <ResponsiveContainer width="100%" height={250}>
                    <BarChart layout="vertical" data={seasonalData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                       <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                       <YAxis type="category" dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} width={40} />
                       <RechartsTooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                       />
                       <Bar dataKey="total" name="Total Cases" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
                 
                 <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(59,130,246,0.1)', borderLeft: '3px solid #3b82f6', borderRadius: '4px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)' }}>Historically, Lassa fever peaks drastically during the dry season (Jan - Mar) due to agricultural and rodent movement patterns.</p>
                 </div>
              </div>
          </div>
      </div>
    </div>
  );
}
