import { formatCurrency, formatDate } from '../utils';
import { useData } from '../contexts/DataContext';
import { Loader2 } from 'lucide-react';

export default function MembersList() {
  const { members, transactions, isLoading, error } = useData();

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

  const membersWithContributions = members.map(member => {
    const totalContributed = transactions
      .filter(t => t.memberId === member.id && t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    return { ...member, totalContributed };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-100">Danh sách thành viên</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {membersWithContributions.map((member, index) => (
          <div key={`${member.id || 'member'}-${index}`} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800 transition-colors shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <img src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} alt={member.name} className="w-14 h-14 rounded-full bg-slate-700 object-cover border-2 border-slate-600" />
              <div>
                <h3 className="font-bold text-slate-200">{member.name}</h3>
                <p className="text-sm text-slate-400">{member.position}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Tổng tiền đã đóng</p>
                <p className="text-lg font-bold text-emerald-400">{formatCurrency(member.totalContributed)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
