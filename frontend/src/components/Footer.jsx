import React from 'react';
import { useData } from '../context/useData';

export default function Footer() {
  const { data } = useData();
  const latest = [...data].sort((a, b) => b.week_end_date.localeCompare(a.week_end_date))[0];
  return (
    <div className="footer">
      Data source: Nigeria Centre for Disease Control (NCDC) situation reports • Weekly national coverage: 2020–2025{latest ? ` • Latest eligible period ends ${latest.week_end_date}` : ''}
    </div>
  );
}
