import React, { createContext, useContext, useState, useEffect } from 'react';
import Papa from 'papaparse';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMetric, setSelectedMetric] = useState('Confirmed Cases');
  const [selectedState, setSelectedState] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch National Time Series CSV
        const csvResponse = await fetch('/dataset/lassa_fever_timeseries_full.csv');
        const csvText = await csvResponse.text();
        const parsedCsv = Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        // Fetch State JSON data
        const stateResponse = await fetch('/dataset/lassa_state_data.json');
        const parsedState = await stateResponse.json();

        setData(parsedCsv.data);
        setStateData(parsedState);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
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

export const useData = () => useContext(DataContext);
