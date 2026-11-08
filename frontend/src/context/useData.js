import { useContext } from 'react';
import { DataContext } from './dataContextInstance';

export const useData = () => useContext(DataContext);
