import React, { createContext, useContext, useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Member, Match, Transaction } from '../types';

interface AppData {
  members: Member[];
  matches: Match[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<AppData | undefined>(undefined);

const MEMBERS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRfJntW2SkaQIWje-6sZOvAsX2Cs3qH9N9ByjudwXUN6ibZDD-ApdmKFCzevWCQLxPJBoUkE5T3niES/pub?gid=0&single=true&output=csv';
const MATCHES_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRfJntW2SkaQIWje-6sZOvAsX2Cs3qH9N9ByjudwXUN6ibZDD-ApdmKFCzevWCQLxPJBoUkE5T3niES/pub?gid=791003713&single=true&output=csv';
const TRANSACTIONS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRfJntW2SkaQIWje-6sZOvAsX2Cs3qH9N9ByjudwXUN6ibZDD-ApdmKFCzevWCQLxPJBoUkE5T3niES/pub?gid=1900093703&single=true&output=csv';

async function fetchAndParse<T>(url: string): Promise<T[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }
  const text = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length && results.errors[0].type !== 'Delimiter') {
          console.warn('Parse errors:', results.errors);
        }
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [fetchedMembers, fetchedMatches, fetchedTransactions] = await Promise.all([
        fetchAndParse<Member>(MEMBERS_URL),
        fetchAndParse<Match>(MATCHES_URL),
        fetchAndParse<any>(TRANSACTIONS_URL) // use any initially to handle number conversion
      ]);

      // Process numeric fields in transactions
      const processedTransactions: Transaction[] = fetchedTransactions.map(t => ({
        ...t,
        amount: Number(t.amount) || 0
      }));

      setMembers(fetchedMembers);
      setMatches(fetchedMatches);
      setTransactions(processedTransactions);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Không thể tải dữ liệu từ Google Sheets. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ members, matches, transactions, isLoading, error, refreshData: fetchData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
