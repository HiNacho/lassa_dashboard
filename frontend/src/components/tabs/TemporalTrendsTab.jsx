import React, { useMemo } from 'react';
import { useData } from '../../context/useData';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Line, ComposedChart, Bar, BarChart, Cell } from 'recharts';
import { filterByEpiYear, groupByCalendarMonth } from '../../lib/aggregation';
import { movingAverage, periodGrowthRate } from '../../lib/epidemiology';

export default function TemporalTrendsTab() {
  const { data, loading, selectedYear } = useData();

  const chartData = useMemo(() => {
    if (!data) return [];
    
    // Sort data chronologically if not already
    const sorted = [...data].sort((a,b) => {
        if(a.epi_year !== b.epi_year) return a.epi_year - b.epi_year;
        return a.epi_week - b.epi_week;
    });

    return filterByEpiYear(sorted, selectedYear);
  }, [data, selectedYear]);

  const displayData = useMemo(() => {
    let raw = [];
    if (selectedYear === 'All') {
        raw = groupByCalendarMonth(chartData);
    } else {
        raw = chartData.map(d => ({
            name: `W${d.epi_week}`,
            cases: d.confirmed_cases,
            deaths: d.deaths,
        }));
    }

    // Add moving average & growth rate
    const averages = movingAverage(raw.map((d) => d.cases), 3);
    return raw.map((d, i, arr) => ({
      ...d,
      maCases: averages[i] === null ? null : Math.round(averages[i]),
      growth: i === 0 ? null : periodGrowthRate(d.cases, arr[i - 1].cases),
    }));
  }, [chartData, selectedYear]);

  const seasonalData = useMemo(() => {
     if (!data) return [];
     const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     const monthTotals = Array(12).fill(0);
     filterByEpiYear(data, selectedYear).forEach(d => {
        const m = new Date(`${d.week_start_date}T00:00:00Z`).getUTCMonth();
        if (Number.isFinite(d.confirmed_cases)) monthTotals[m] += d.confirmed_cases;
     });
     return months.map((m, i) => ({ month: m, total: monthTotals[i] }));
  }, [data, selectedYear]);

  if (loading) return <div style={{ padding: '32px' }}>Loading Trends...</div>;

  return (
    <div className="tab-content fade-in temporal-tab" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div>
             <h2 style={{ margin: '0 0 4px', color: 'var(--text-main)', fontSize: '24px' }}>Temporal Trends</h2>
             <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
                {selectedYear === 'All' ? 'Calendar-month aggregation of weekly incident observations (2020–2025)' : `Weekly incident observations for ${selectedYear}`}
             </p>
         </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* MAIN SPREAD CHART */}
              <div className="glass-card" style={{ padding: '30px', minHeight: '400px' }}>
                 <h3 style={{ marginTop: 0, marginBottom: '8px', color: 'var(--text-bright)' }}>Confirmed Cases vs Deaths</h3>
                 <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: '12px' }}>Three-observation trailing moving average (weekly or calendar-month observations)</p>
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
                      <Legend layout="vertical" align="left" verticalAlign="top" height={64} wrapperStyle={{ fontSize: 11, lineHeight: '18px' }} />
                      <Area type="monotone" dataKey="cases" name="Confirmed Cases (Raw)" stroke="#ff5722" strokeWidth={1} fillOpacity={1} fill="url(#colorCases)" />
                      <Line type="monotone" dataKey="maCases" name="Cases (3-observation MA)" stroke="#fcd34d" strokeWidth={3} dot={false} connectNulls={false} style={{ filter: 'drop-shadow(0 0 4px rgba(252,211,77,0.5))' }} />
                      <Line type="monotone" dataKey="deaths" name="Deaths" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>

              {/* GROWTH RATE CHART */}
              <div className="glass-card" style={{ padding: '24px', minHeight: '300px' }}>
                 <h3 style={{ marginTop: 0, marginBottom: '8px', color: 'var(--text-bright)' }}>Growth Rate (% Period-over-Period)</h3>
                 <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: '12px' }}>Not calculated when the preceding observation is zero or missing.</p>
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
                 <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: '12px' }}>Observed weekly incident cases grouped by calendar month for the selected period.</p>
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
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)' }}>Descriptive seasonal distribution only; this chart does not establish causation or predict future transmission.</p>
                 </div>
              </div>
          </div>
      </div>
    </div>
  );
}
