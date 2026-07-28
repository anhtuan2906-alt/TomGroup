/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Home, Users, DollarSign, Calendar, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MembersList from './components/MembersList';
import FinanceManager from './components/FinanceManager';
import MatchHistory from './components/MatchHistory';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [financeFilter, setFinanceFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigateTo = (tab: string, filter?: 'all' | 'income' | 'expense') => {
    setActiveTab(tab);
    if (tab === 'finances' && filter) {
      setFinanceFilter(filter);
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Tổng quan', icon: Home },
    { id: 'members', name: 'Thành viên', icon: Users },
    { id: 'finances', name: 'Thu chi', icon: DollarSign },
    { id: 'matches', name: 'Trận đấu', icon: Calendar },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500/30">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800/80">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-emerald-400 tracking-tight flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              FC
            </div>
            Tom Group
          </h1>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon size={20} className={activeTab === tab.id ? 'text-emerald-400' : 'text-slate-400'} />
                <span className="font-semibold">{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
           <h1 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
             <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-black text-sm">
               FC
             </div>
             Tom Group
           </h1>
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 p-2 hover:bg-slate-800 rounded-lg transition-colors">
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[69px] left-0 right-0 bg-slate-950 border-b border-slate-800 z-50 p-4 space-y-1.5 shadow-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'text-slate-400 active:bg-slate-800 border border-transparent'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-semibold">{tab.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard onNavigate={navigateTo} />}
            {activeTab === 'members' && <MembersList />}
            {activeTab === 'finances' && <FinanceManager filter={financeFilter} onFilterChange={setFinanceFilter} />}
            {activeTab === 'matches' && <MatchHistory />}
          </div>
        </div>
      </main>
    </div>
  );
}
