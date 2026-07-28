import React, { useState } from 'react';
import { formatDate } from '../utils';
import { useData } from '../contexts/DataContext';
import { MapPin, CalendarDays, Swords, Loader2 } from 'lucide-react';

export default function MatchHistory({ isAdmin = false }: { isAdmin?: boolean }) {
  const { matches, isLoading, error, addMatch } = useData();

  const [isAddingMatch, setIsAddingMatch] = useState(false);

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'loss': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'draw': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'upcoming': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'win': return 'Thắng';
      case 'loss': return 'Thua';
      case 'draw': return 'Hòa';
      case 'upcoming': return 'Sắp tới';
      default: return result;
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newMatch = {
      date: formData.get('date') as string,
      opponent: formData.get('opponent') as string,
      location: formData.get('location') as string,
      result: formData.get('result') as 'win' | 'loss' | 'draw' | 'upcoming',
      score: formData.get('score') as string,
    };
    addMatch(newMatch);
    setIsAddingMatch(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-100">Lịch sử trận đấu</h2>
        {isAdmin && (
          <button 
            onClick={() => setIsAddingMatch(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            + Thêm trận đấu
          </button>
        )}
      </div>

      {isAddingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-100 mb-6">Thêm trận đấu mới</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Ngày thi đấu</label>
                  <input required type="date" name="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Đối thủ</label>
                  <input required type="text" name="opponent" placeholder="Tên đội bóng..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Sân thi đấu</label>
                  <input required type="text" name="location" placeholder="Tên sân..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Kết quả</label>
                    <select required name="result" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500">
                      <option value="upcoming">Sắp tới</option>
                      <option value="win">Thắng</option>
                      <option value="draw">Hòa</option>
                      <option value="loss">Thua</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Tỷ số</label>
                    <input type="text" name="score" placeholder="Vd: 3-1" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-800">
                  <button type="button" onClick={() => setIsAddingMatch(false)} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
                    Hủy
                  </button>
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
                    Lưu trận đấu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-emerald-400">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 text-rose-400 p-4 rounded-xl border border-rose-500/20 text-center">
            {error}
          </div>
        ) : (
          matches.map((match, index) => (
            <div key={`${match.id || 'match'}-${index}`} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm group">
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2.5 py-1 border rounded-md text-xs font-bold uppercase tracking-wider ${getResultColor(match.result)}`}>
                  {getResultText(match.result)}
                </span>
                <span className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  {formatDate(match.date)}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-3 mt-2 group-hover:text-emerald-400 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                  <Swords size={16} className="text-slate-300" />
                </div>
                <span>FC Tom Group <span className="text-slate-500 font-medium mx-1">vs</span> {match.opponent}</span>
              </h3>
              
              <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-3 ml-11">
                <MapPin size={14} />
                {match.location}
              </p>
            </div>

            {match.score ? (
              <div className="shrink-0 flex flex-col items-center justify-center bg-slate-900 border-2 border-emerald-500/30 rounded-xl px-8 py-5 md:min-w-[160px] shadow-[0_0_15px_rgba(16,185,129,0.15)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1 relative z-10">Kết quả</span>
                <span className="text-4xl font-black text-white tracking-[0.1em] ml-[0.05em] relative z-10 drop-shadow-md">
                  {match.score}
                </span>
              </div>
            ) : (
              <div className="shrink-0 flex items-center justify-center bg-slate-900/50 border border-slate-800/50 border-dashed rounded-xl px-6 py-4 md:w-32">
                <span className="text-sm font-medium text-slate-500">Chưa đá</span>
              </div>
            )}
            
          </div>
        )))}
      </div>
    </div>
  );
}
