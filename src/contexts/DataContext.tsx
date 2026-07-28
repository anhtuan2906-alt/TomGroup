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
  addMatch: (match: Omit<Match, 'id'>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const DataContext = createContext<AppData | undefined>(undefined);

const MEMBERS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRfJntW2SkaQIWje-6sZOvAsX2Cs3qH9N9ByjudwXUN6ibZDD-ApdmKFCzevWCQLxPJBoUkE5T3niES/pub?gid=0&single=true&output=csv';
const MATCHES_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRfJntW2SkaQIWje-6sZOvAsX2Cs3qH9N9ByjudwXUN6ibZDD-ApdmKFCzevWCQLxPJBoUkE5T3niES/pub?gid=791003713&single=true&output=csv';
const TRANSACTIONS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRfJntW2SkaQIWje-6sZOvAsX2Cs3qH9N9ByjudwXUN6ibZDD-ApdmKFCzevWCQLxPJBoUkE5T3niES/pub?gid=1900093703&single=true&output=csv';

async function fetchAndParse<T>(url: string): Promise<T[]> {
  const cacheBuster = `&_t=${new Date().getTime()}`;
  const response = await fetch(url.includes('?') ? url + cacheBuster : url + '?' + cacheBuster);
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

  const PENDING_MATCHES_KEY = 'fc_pending_matches';
  const PENDING_TRANSACTIONS_KEY = 'fc_pending_transactions';

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      
      let fetchedMembers: Member[] = [];
      let fetchedMatches: Match[] = [];
      let fetchedTransactions: any[] = [];

      const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
      let fetchedViaScript = false;

      if (appsScriptUrl) {
        try {
          const response = await fetch(appsScriptUrl + '?action=getData');
          const json = await response.json();
          if (json.status === 'success') {
            fetchedMembers = json.data.members;
            fetchedMatches = json.data.matches;
            fetchedTransactions = json.data.transactions;
            fetchedViaScript = true;
          }
        } catch (e) {
          console.warn('Lỗi khi lấy dữ liệu trực tiếp từ Apps Script, chuyển sang lấy từ CSV...', e);
        }
      }
      
      if (!fetchedViaScript) {
        [fetchedMembers, fetchedMatches, fetchedTransactions] = await Promise.all([
          fetchAndParse<Member>(MEMBERS_URL),
          fetchAndParse<Match>(MATCHES_URL),
          fetchAndParse<any>(TRANSACTIONS_URL) // use any initially to handle number conversion
        ]);
      }

      // Process numeric fields in transactions
      const processedTransactions: Transaction[] = fetchedTransactions.map(t => ({
        ...t,
        amount: Number(t.amount) || 0
      }));

      // Lấy các dữ liệu pending từ localStorage
      const pendingMatches: Match[] = JSON.parse(localStorage.getItem(PENDING_MATCHES_KEY) || '[]');
      const pendingTransactions: Transaction[] = JSON.parse(localStorage.getItem(PENDING_TRANSACTIONS_KEY) || '[]');

      // Lọc bỏ những dữ liệu pending ĐÃ xuất hiện trong CSV (dựa theo ID)
      const remainingPendingMatches = pendingMatches.filter(pm => !fetchedMatches.some(fm => fm.id === pm.id));
      const remainingPendingTransactions = pendingTransactions.filter(pt => !processedTransactions.some(ft => ft.id === pt.id));

      // Cập nhật lại localStorage với những mục vẫn còn pending
      localStorage.setItem(PENDING_MATCHES_KEY, JSON.stringify(remainingPendingMatches));
      localStorage.setItem(PENDING_TRANSACTIONS_KEY, JSON.stringify(remainingPendingTransactions));

      setMembers(fetchedMembers);
      setMatches([...fetchedMatches, ...remainingPendingMatches]);
      setTransactions([...processedTransactions, ...remainingPendingTransactions]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Không thể tải dữ liệu từ Google Sheets. Vui lòng thử lại sau.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const addMatch = async (matchData: Omit<Match, 'id'>) => {
    // Cập nhật giao diện ngay lập tức
    const newMatch: Match = {
      ...matchData,
      id: `match-${Date.now()}`
    };
    
    // Lưu vào pending storage
    const pendingMatches = JSON.parse(localStorage.getItem(PENDING_MATCHES_KEY) || '[]');
    localStorage.setItem(PENDING_MATCHES_KEY, JSON.stringify([...pendingMatches, newMatch]));

    setMatches(prev => [...prev, newMatch]);

    // Gửi lên Google Apps Script
    const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwKo3VLP3IXNo7rsDwGMKzYze-94MFwnyqPbzaJOEnhMExfJF9cFUQ24z9ZRH7fwLSePQ/exec';
    if (appsScriptUrl) {
      try {
        await fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors', // Cần thiết để tránh lỗi CORS khi gọi Google Apps Script
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'addMatch', payload: newMatch })
        });
      } catch (e) {
        console.error('Lỗi khi lưu lên Google Sheets:', e);
        // Với no-cors, fetch hiếm khi ném lỗi (trừ khi mất mạng), nhưng nếu có lỗi thì báo:
        alert('Lưu thất bại: Vui lòng kiểm tra lại đường truyền mạng.');
      }
    } else {
      console.warn('VITE_APPS_SCRIPT_URL chưa được thiết lập. Dữ liệu chỉ được lưu tạm trên giao diện.');
      alert('Chưa cấu hình VITE_APPS_SCRIPT_URL. Vui lòng thêm biến môi trường này trong phần Settings để có thể lưu dữ liệu vào Google Sheets.');
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    // Cập nhật giao diện ngay lập tức
    const newTransaction: Transaction = {
      ...transactionData,
      id: `t-${Date.now()}`
    };

    // Lưu vào pending storage
    const pendingTransactions = JSON.parse(localStorage.getItem(PENDING_TRANSACTIONS_KEY) || '[]');
    localStorage.setItem(PENDING_TRANSACTIONS_KEY, JSON.stringify([...pendingTransactions, newTransaction]));

    setTransactions(prev => [...prev, newTransaction]);

    // Gửi lên Google Apps Script
    const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwKo3VLP3IXNo7rsDwGMKzYze-94MFwnyqPbzaJOEnhMExfJF9cFUQ24z9ZRH7fwLSePQ/exec';
    if (appsScriptUrl) {
      try {
        await fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors', // Cần thiết để tránh lỗi CORS khi gọi Google Apps Script
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'addTransaction', payload: newTransaction })
        });
      } catch (e) {
        console.error('Lỗi khi lưu lên Google Sheets:', e);
        alert('Lưu thất bại: Vui lòng kiểm tra lại đường truyền mạng.');
      }
    } else {
      console.warn('VITE_APPS_SCRIPT_URL chưa được thiết lập. Dữ liệu chỉ được lưu tạm trên giao diện.');
      alert('Chưa cấu hình VITE_APPS_SCRIPT_URL. Vui lòng thêm biến môi trường này trong phần Settings để có thể lưu dữ liệu vào Google Sheets.');
    }
  };

  useEffect(() => {
    fetchData();
    
    // Tự động refresh ngầm mỗi 30 giây để lấy dữ liệu mới từ CSV mà không giật màn hình
    const interval = setInterval(() => {
      fetchData(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DataContext.Provider value={{ members, matches, transactions, isLoading, error, refreshData: fetchData, addMatch, addTransaction }}>
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
