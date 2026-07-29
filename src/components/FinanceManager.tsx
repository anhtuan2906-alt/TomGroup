import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatCurrency, formatDate, safeGetTime } from '../utils';
import { PlusCircle, MinusCircle, Search, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { Transaction } from '../types';

export default function FinanceManager({ filter = 'all', onFilterChange, isAdmin = false }: { filter?: 'all' | 'income' | 'expense', onFilterChange?: (f: 'all' | 'income' | 'expense') => void, isAdmin?: boolean }) {
  const { transactions, members, isLoading, error, addTransaction } = useData();
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [amountStr, setAmountStr] = useState('');

  const toggleDate = (date: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const handleFilterChange = (f: 'all' | 'income' | 'expense') => {
    if (onFilterChange) {
      onFilterChange(f);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-emerald-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 text-rose-400 p-4 rounded-xl border border-rose-500/20 text-center">
        {error}
      </div>
    );
  }

  const filteredTransactions = transactions
    .filter(t => filter === 'all' ? true : t.type === filter)
    .sort((a, b) => safeGetTime(b.date) - safeGetTime(a.date));

  const groupedTransactions = filteredTransactions.reduce((acc, t) => {
    if (!acc[t.date]) {
      acc[t.date] = {
        date: t.date,
        transactions: [],
        totalIncome: 0,
        totalExpense: 0,
      };
    }
    acc[t.date].transactions.push(t);
    if (t.type === 'income') {
      acc[t.date].totalIncome += t.amount;
    } else {
      acc[t.date].totalExpense += t.amount;
    }
    return acc;
  }, {} as Record<string, { date: string, transactions: Transaction[], totalIncome: number, totalExpense: number }>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => safeGetTime(b) - safeGetTime(a));

  const overallIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const overallExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const overallBalance = overallIncome - overallExpense;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value) {
      setAmountStr(new Intl.NumberFormat('vi-VN').format(Number(value)));
    } else {
      setAmountStr('');
    }
  };

  const handleTransactionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amountVal = Number(amountStr.replace(/\D/g, ''));
    if (!amountVal) return;
    
    const dateInput = formData.get('date') as string;
    const formattedDate = dateInput ? dateInput.split('-').reverse().join('/') : '';
    
    const newTransaction = {
      date: formattedDate,
      description: formData.get('description') as string,
      amount: amountVal,
      type: transactionType,
      memberId: transactionType === 'income' ? formData.get('memberId') as string : undefined,
    };
    if (addTransaction) {
      addTransaction(newTransaction);
    }
    setIsAddingTransaction(false);
    setAmountStr('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-100">Quản lý Thu Chi</h2>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              <button 
                onClick={() => { setTransactionType('expense'); setIsAddingTransaction(true); }}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex-1 sm:flex-auto"
              >
                <MinusCircle size={16} className="text-rose-400" /> Ghi chi
              </button>
              <button 
                onClick={() => { setTransactionType('income'); setIsAddingTransaction(true); }}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex-1 sm:flex-auto"
              >
                <PlusCircle size={16} /> Ghi thu
              </button>
            </>
          )}
        </div>
      </div>

      {isAddingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-100 mb-6">
                Thêm khoản {transactionType === 'income' ? 'thu' : 'chi'}
              </h3>
              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Ngày giao dịch</label>
                  <input required type="date" name="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nội dung</label>
                  <input required type="text" name="description" placeholder="Vd: Tiền sân, tiền nước..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Số tiền (Nghìn đồng)</label>
                  <input required type="text" value={amountStr} onChange={handleAmountChange} placeholder="Vd: 100" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500" />
                </div>
                {transactionType === 'income' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Người đóng quỹ</label>
                    <select required name="memberId" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500">
                      <option value="">-- Chọn thành viên --</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-800">
                  <button type="button" onClick={() => setIsAddingTransaction(false)} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
                    Hủy
                  </button>
                  <button type="submit" className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm text-white ${transactionType === 'income' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'}`}>
                    Lưu giao dịch
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/30">
          <div className="flex w-full sm:w-auto items-center bg-slate-950 rounded-lg p-1">
            {(['all', 'income', 'expense'] as const).map(f => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === f ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {f === 'all' ? 'Tất cả' : f === 'income' ? 'Khoản thu' : 'Khoản chi'}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-auto text-slate-400 focus-within:text-slate-200">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm giao dịch..." 
              className="w-full sm:w-64 bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-700/50">
                <th className="py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nội dung</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              <tr className="bg-slate-900 border-b border-slate-700">
                <td className="py-4 px-6 font-bold text-slate-100" colSpan={2}>
                  <div className="flex items-center justify-between">
                    <span>
                      {filter === 'all' ? 'Tổng quỹ' : filter === 'income' ? 'Tổng thu' : 'Tổng chi'}
                    </span>
                    <span className={`text-lg ${filter === 'all' ? (overallBalance >= 0 ? 'text-emerald-400' : 'text-rose-400') : filter === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {filter === 'all' ? formatCurrency(overallBalance) : filter === 'income' ? `+${formatCurrency(overallIncome)}` : `-${formatCurrency(overallExpense)}`}
                    </span>
                  </div>
                </td>
              </tr>
              {sortedDates.map((date, index) => {
                const group = groupedTransactions[date];
                const isMostRecent = index === 0;
                const isExpanded = expandedDates[date] !== undefined ? expandedDates[date] : isMostRecent;

                return (
                  <React.Fragment key={`${date}-${index}`}>
                    <tr 
                      className="bg-slate-800/80 cursor-pointer hover:bg-slate-700/80 transition-colors group"
                      onClick={() => toggleDate(date)}
                    >
                      <td className="py-3 px-6" colSpan={2}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-slate-400 group-hover:text-slate-200 transition-colors">
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                            <span className="font-bold text-slate-200">{formatDate(date)}</span>
                            <span className="text-xs font-medium text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded-full border border-slate-700/50">
                              {group.transactions.length} giao dịch
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-bold">
                            {group.totalIncome > 0 && <span className="text-emerald-400">+{formatCurrency(group.totalIncome)}</span>}
                            {group.totalExpense > 0 && <span className="text-rose-400">-{formatCurrency(group.totalExpense)}</span>}
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && group.transactions.map((t, index) => (
                      <tr key={`${t.id || 'tx'}-${index}`} className="hover:bg-slate-700/30 transition-colors bg-slate-900/10">
                        <td className="py-3 px-6 pl-14 text-sm text-slate-300">{t.description}</td>
                        <td className={`py-3 px-6 text-sm font-bold text-right whitespace-nowrap ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
