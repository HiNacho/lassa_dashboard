import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { validateNationalRows, validateStateRows } from '../lib/dataValidation';
import { DataContext } from './dataContextInstance';

export const DataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMetric, setSelectedMetric] = useState('Confirmed Cases');
  const [selectedState, setSelectedState] = useState('All');

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        setDataStatus('loading');
        setError(null);
        const csvResponse = await fetch('/dataset/lassa_fever_timeseries_full.csv', { signal: controller.signal });
        if (!csvResponse.ok) throw new Error(`National dataset could not be loaded (HTTP ${csvResponse.status}).`);
        const csvText = await csvResponse.text();
        const parsedCsv = Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });
        if (parsedCsv.errors.length) throw new Error(`National dataset could not be parsed: ${parsedCsv.errors[0].message}`);
        if (parsedCsv.data.length === 0) { setDataStatus('empty'); setLoading(false); return; }
        const nationalValidation = validateNationalRows(parsedCsv.data);
        if (nationalValidation.errors.length) throw new Error(`National dataset validation failed: ${nationalValidation.errors[0]}`);
        
        const stateResponse = await fetch('/dataset/lassa_state_data.json', { signal: controller.signal });
        if (!stateResponse.ok) throw new Error(`State dataset could not be loaded (HTTP ${stateResponse.status}).`);
        const parsedState = await stateResponse.json();
        const stateValidation = validateStateRows(parsedState);
        if (stateValidation.errors.length) throw new Error(`State dataset validation failed: ${stateValidation.errors[0]}`);

        setData(nationalValidation.valid);
        setStateData(stateValidation.valid);
        setDataStatus('loaded');
        setLoading(false);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown data loading error occurred.');
        setDataStatus('error');
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  const years = ['All', ...new Set(data.map(d => d.epi_year))].sort((a, b) => {
    if (a === 'All') return -1;
    if (b === 'All') return 1;
    return a - b;
  });

  const filteredData = selectedYear === 'All' 
    ? data 
    : data.filter(d => d.epi_year === selectedYear);

  return (
    <DataContext.Provider value={{
      data,
      stateData,
      filteredData,
      loading,
      error,
      dataStatus,
      selectedYear,
      setSelectedYear,
      selectedMetric,
      setSelectedMetric,
      selectedState,
      setSelectedState,
      years
    }}>
      {children}
    </DataContext.Provider>
  );
};
