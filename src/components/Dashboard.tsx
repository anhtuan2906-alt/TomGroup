import { formatCurrency, formatDate, safeGetTime } from '../utils';
import { TrendingUp, TrendingDown, Wallet, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../contexts/DataContext';

export default function Dashboard({ onNavigate }: { onNavigate?: (tab: string, filter?: 'all' | 'income' | 'expense') => void }) {
  const { transactions, isLoading, error } = useData();

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

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const recentTransactions = [...transactions].sort((a, b) => safeGetTime(b.date) - safeGetTime(a.date)).slice(0, 5);

  const chartData = transactions.reduce((acc, curr) => {
    const existing = acc.find(item => item.date === curr.date);
    if (existing) {
      if (curr.type === 'income') existing.income += curr.amount;
      else existing.expense += curr.amount;
    } else {
      acc.push({ date: curr.date, income: curr.type === 'income' ? curr.amount : 0, expense: curr.type === 'expense' ? curr.amount : 0 });
    }
    return acc;
  }, [] as any[]).sort((a, b) => safeGetTime(a.date) - safeGetTime(b.date));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-100">Tổng quan quỹ đội</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div 
          onClick={() => onNavigate?.('finances', 'all')}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-sm cursor-pointer hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Tồn quỹ hiện tại</h3>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <Wallet className="text-emerald-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-50">{formatCurrency(balance)}</p>
        </div>

        <div 
          onClick={() => onNavigate?.('finances', 'income')}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-sm cursor-pointer hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Tổng thu</h3>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <TrendingUp className="text-emerald-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-50">{formatCurrency(totalIncome)}</p>
        </div>

        <div 
          onClick={() => onNavigate?.('finances', 'expense')}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-sm cursor-pointer hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Tổng chi</h3>
            <div className="w-10 h-10 bg-rose-500/10 rounded-full flex items-center justify-center">
              <TrendingDown className="text-rose-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-50">{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 flex flex-col shadow-sm">
          <h3 className="text-lg font-bold text-slate-200 mb-6">Biểu đồ thu chi</h3>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="income" name="Thu" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" name="Chi" stroke="#fb7185" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-sm">
          <h3 className="text-lg font-bold text-slate-200 mb-6">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {recentTransactions.map((t, index) => (
              <div key={`${t.id || 'tx'}-${index}`} className="flex items-center justify-between pb-4 border-b border-slate-700/50 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {t.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{t.description}</p>
                    <p className="text-xs text-slate-400">{formatDate(t.date)}</p>
                  </div>
                </div>
                <div className={`text-sm font-bold whitespace-nowrap ml-2 ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
