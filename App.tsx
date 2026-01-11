
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, ExpenseType, MonthlyExpense, Revenue, Withdrawal, ProLaboreFrequency, DistributionConfig, ProfitCycle, UserSession } from './types';
import { generateMonthlyExpenses, getMonthlyRevenues, getDailyQuote } from './utils';
import Dashboard from './components/Dashboard';
import TransactionModal from './components/TransactionModal';
import RevenueModal from './components/RevenueModal';
import ChartsView from './components/ChartsView';
import SpreadsheetView from './components/SpreadsheetView';
import OverviewView from './components/OverviewView';
import LoginScreen from './components/LoginScreen';
import { Plus, User, Briefcase, Sparkles, PieChart, Coins, Table, LogOut, LayoutDashboard, Quote, Download, Upload } from 'lucide-react';

type ViewMode = ExpenseType | 'CHARTS' | 'PLANILHAS' | 'OVERVIEW';

const INITIAL_EXAMPLE_TRANSACTIONS: Transaction[] = [];

const DEFAULT_DISTRIBUTION: DistributionConfig = {
  isCustom: false,
  fixed: 12.3,
  variable: 20.0,
  profit: 10.0,
  investment: 10.0,
  proLabore: 47.7
};

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('glow_auth_session_v2');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<ViewMode>('OVERVIEW');
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('glow_finance_data');
    return saved ? JSON.parse(saved) : INITIAL_EXAMPLE_TRANSACTIONS;
  });
  const [revenues, setRevenues] = useState<Revenue[]>(() => {
    const saved = localStorage.getItem('glow_revenue_data');
    return saved ? JSON.parse(saved) : [];
  });
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() => {
    const saved = localStorage.getItem('glow_withdrawal_data');
    return saved ? JSON.parse(saved) : [];
  });
  const [proLaboreFrequency, setProLaboreFrequency] = useState<ProLaboreFrequency>(() => {
    const saved = localStorage.getItem('glow_prolabore_freq');
    return (saved as ProLaboreFrequency) || 'MONTHLY';
  });
  const [proLaboreStartDate, setProLaboreStartDate] = useState<string>(() => {
    const saved = localStorage.getItem('glow_prolabore_start_date');
    return saved || new Date().toISOString().split('T')[0];
  });
  const [profitCycle, setProfitCycle] = useState<ProfitCycle>(() => {
    const saved = localStorage.getItem('glow_profit_cycle');
    return saved ? (parseInt(saved) as ProfitCycle) : 6;
  });
  const [proLaboreMode, setProLaboreMode] = useState<'PERCENT' | 'FIXED'>(() => {
    const saved = localStorage.getItem('glow_prolabore_mode');
    return (saved as 'PERCENT' | 'FIXED') || 'PERCENT';
  });
  const [fixedProLaboreValue, setFixedProLaboreValue] = useState<number>(() => {
    const saved = localStorage.getItem('glow_prolabore_fixed_val');
    return saved ? parseFloat(saved) : 0;
  });
  const [distributionConfig, setDistributionConfig] = useState<DistributionConfig>(() => {
    const saved = localStorage.getItem('glow_distribution_config');
    return saved ? JSON.parse(saved) : DEFAULT_DISTRIBUTION;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const dailyQuote = useMemo(() => getDailyQuote(), []);

  // Persistência Automática
  useEffect(() => {
    localStorage.setItem('glow_finance_data', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('glow_revenue_data', JSON.stringify(revenues));
  }, [revenues]);

  useEffect(() => {
    localStorage.setItem('glow_withdrawal_data', JSON.stringify(withdrawals));
    localStorage.setItem('glow_prolabore_freq', proLaboreFrequency);
    localStorage.setItem('glow_prolabore_start_date', proLaboreStartDate);
    localStorage.setItem('glow_profit_cycle', profitCycle.toString());
    localStorage.setItem('glow_prolabore_mode', proLaboreMode);
    localStorage.setItem('glow_prolabore_fixed_val', fixedProLaboreValue.toString());
    localStorage.setItem('glow_distribution_config', JSON.stringify(distributionConfig));
  }, [withdrawals, proLaboreFrequency, proLaboreStartDate, profitCycle, proLaboreMode, fixedProLaboreValue, distributionConfig]);

  const handleLogin = (name: string, email: string) => {
    const newSession = { name, email, lastLogin: new Date().toISOString() };
    setSession(newSession);
    localStorage.setItem('glow_auth_session_v2', JSON.stringify(newSession));
  };

  const handleLogout = () => {
    if (confirm('Deseja sair da sua conta? Seus dados financeiros permanecerão salvos neste navegador.')) {
      setSession(null);
      localStorage.removeItem('glow_auth_session_v2');
    }
  };

  const exportData = () => {
    const allData = {
      transactions, revenues, withdrawals, proLaboreFrequency, proLaboreStartDate, profitCycle, proLaboreMode, fixedProLaboreValue, distributionConfig
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_financas_nail_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (confirm('Isso substituirá todos os seus dados atuais. Continuar?')) {
          if (data.transactions) setTransactions(data.transactions);
          if (data.revenues) setRevenues(data.revenues);
          if (data.withdrawals) setWithdrawals(data.withdrawals);
          if (data.proLaboreFrequency) setProLaboreFrequency(data.proLaboreFrequency);
          if (data.proLaboreStartDate) setProLaboreStartDate(data.proLaboreStartDate);
          if (data.profitCycle) setProfitCycle(data.profitCycle);
          if (data.proLaboreMode) setProLaboreMode(data.proLaboreMode);
          if (data.fixedProLaboreValue) setFixedProLaboreValue(data.fixedProLaboreValue);
          if (data.distributionConfig) setDistributionConfig(data.distributionConfig);
          alert('Dados importados com sucesso!');
        }
      } catch (err) {
        alert('Erro ao importar arquivo. Certifique-se que é um backup válido.');
      }
    };
    reader.readAsText(file);
  };

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthlyExpenses = useMemo(() => {
    return generateMonthlyExpenses(transactions, currentMonth, currentYear);
  }, [transactions, currentMonth, currentYear]);

  const monthlyRevenues = useMemo(() => {
    return getMonthlyRevenues(revenues, currentMonth, currentYear);
  }, [revenues, currentMonth, currentYear]);

  const addTransaction = (t: Transaction) => setTransactions(prev => [...prev, t]);
  const addRevenue = (r: Revenue) => setRevenues(prev => [...prev, r]);
  
  const addWithdrawal = (w: Withdrawal) => {
    setWithdrawals(prev => [...prev, w]);
    const desc = w.description || (w.type === 'PRO_LABORE' ? 'Retirada de Pró-labore' : 'Retirada de Lucro');
    const studioExpense: Transaction = {
      id: `withdraw-ref-${w.id}`,
      description: desc,
      amount: w.amount,
      date: w.date.split('T')[0],
      type: 'PROFESSIONAL',
      category: 'FIXED',
      subCategory: 'OUTROS',
      bank: 'CASH',
      installments: 1
    };
    setTransactions(prev => [...prev, studioExpense]);
    const personalGain: Revenue = {
      id: `personal-ref-${w.id}`,
      description: desc,
      amount: w.amount,
      date: w.date.split('T')[0],
      paymentMethod: 'PIX',
      type: 'PERSONAL'
    };
    setRevenues(prev => [...prev, personalGain]);
  };

  const deleteTransaction = (id: string) => {
    if (confirm('Deseja excluir este registro?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      if (id.startsWith('withdraw-ref-')) {
        const originalWithdrawId = id.replace('withdraw-ref-', '');
        setRevenues(prev => prev.filter(r => r.id !== `personal-ref-${originalWithdrawId}`));
        setWithdrawals(prev => prev.filter(w => w.id !== originalWithdrawId));
      }
    }
  };

  const deleteRevenue = (id: string) => {
    if (confirm('Deseja excluir este registro?')) {
      setRevenues(prev => prev.filter(r => r.id !== id));
      if (id.startsWith('personal-ref-')) {
        const originalWithdrawId = id.replace('personal-ref-', '');
        setTransactions(prev => prev.filter(t => t.id !== `withdraw-ref-${originalWithdrawId}`));
        setWithdrawals(prev => prev.filter(w => w.id !== originalWithdrawId));
      }
    }
  };

  const deleteWithdrawal = (id: string) => {
    if (confirm('Deseja estornar esta retirada? Isso também removerá os lançamentos automáticos de gastos e ganhos.')) {
      setWithdrawals(prev => prev.filter(w => w.id !== id));
      setTransactions(prev => prev.filter(t => t.id !== `withdraw-ref-${id}`));
      setRevenues(prev => prev.filter(r => r.id !== `personal-ref-${id}`));
    }
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  if (!session) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#FDFCFD] text-gray-900 pb-20 md:pb-0 md:pl-64 relative overflow-hidden">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white/90 backdrop-blur-md border-r border-gray-100 hidden md:flex flex-col z-40">
        <div className="p-8">
            <h1 className="text-2xl font-display font-bold wave-text flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-vibrantPink-500" /> Expert Finanças
            </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
            <button onClick={() => setActiveTab('OVERVIEW')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'OVERVIEW' ? 'bg-vibrantPink-500 text-white shadow-lg' : 'text-gray-500 hover:bg-vibrantPink-50'}`}>
                <LayoutDashboard className="w-5 h-5" /> <span className="font-semibold text-sm">Visão Geral</span>
            </button>
            <button onClick={() => setActiveTab('PROFESSIONAL')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'PROFESSIONAL' ? 'bg-vibrantPink-500 text-white shadow-lg' : 'text-gray-500 hover:bg-vibrantPink-50'}`}>
                <Briefcase className="w-5 h-5" /> <span className="font-semibold text-sm">Estratégia Stúdio</span>
            </button>
            <button onClick={() => setActiveTab('PERSONAL')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'PERSONAL' ? 'bg-vibrantPink-500 text-white shadow-lg' : 'text-gray-500 hover:bg-vibrantPink-50'}`}>
                <User className="w-5 h-5" /> <span className="font-semibold text-sm">Gastos Pessoais</span>
            </button>
            <button onClick={() => setActiveTab('PLANILHAS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'PLANILHAS' ? 'bg-vibrantPink-500 text-white shadow-lg' : 'text-gray-500 hover:bg-vibrantPink-50'}`}>
                <Table className="w-5 h-5" /> <span className="font-semibold text-sm">Tabelas</span>
            </button>
            <button onClick={() => setActiveTab('CHARTS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'CHARTS' ? 'bg-vibrantPink-500 text-white shadow-lg' : 'text-gray-500 hover:bg-vibrantPink-50'}`}>
                <PieChart className="w-5 h-5" /> <span className="font-semibold text-sm">Gráficos</span>
            </button>
        </nav>
        <div className="p-4 mb-4 space-y-2">
            <button onClick={exportData} className="w-full flex items-center gap-2 px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all font-bold text-[10px] uppercase">
                <Download size={14} /> Backup Dados
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-[10px] uppercase">
                <LogOut size={14} /> Sair
            </button>
        </div>
      </aside>

      <main className="max-w-5xl mx-auto p-4 md:p-8 pt-6 relative z-10">
        <header className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-display font-bold text-gray-800">Olá, {session.name.split(' ')[0]} ✨</h2>
              <div className="flex items-center gap-2 text-vibrantPink-500/80 italic text-xs font-semibold">
                <Quote size={12} className="shrink-0" /> <p className="line-clamp-1">{dailyQuote}</p>
              </div>
            </div>
            {(activeTab !== 'CHARTS' && activeTab !== 'PLANILHAS') && (
              <div className="flex gap-2">
                {activeTab !== 'PERSONAL' && (
                  <button onClick={() => setIsRevenueModalOpen(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all text-sm">
                    <Coins className="w-4 h-4" /> Ganhos
                  </button>
                )}
                <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-vibrantPink-500 text-white rounded-2xl font-bold shadow-lg hover:bg-vibrantPink-600 transition-all text-sm">
                  <Plus className="w-4 h-4" /> Gasto
                </button>
              </div>
            )}
          </div>
        </header>

        {activeTab === 'CHARTS' ? (
          <ChartsView allTransactions={transactions} allRevenues={revenues} currentMonth={currentMonth} currentYear={currentYear} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth} />
        ) : activeTab === 'PLANILHAS' ? (
          <SpreadsheetView expenses={monthlyExpenses} revenues={monthlyRevenues} currentMonth={currentMonth} currentYear={currentYear} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth} onDeleteExpense={deleteTransaction} onDeleteRevenue={deleteRevenue} />
        ) : activeTab === 'OVERVIEW' ? (
          <OverviewView 
            expenses={monthlyExpenses} 
            revenues={monthlyRevenues} 
            withdrawals={withdrawals} 
            currentMonth={currentMonth} 
            currentYear={currentYear} 
            onPrevMonth={handlePrevMonth} 
            onNextMonth={handleNextMonth}
            proLaboreFrequency={proLaboreFrequency}
            proLaboreStartDate={proLaboreStartDate}
            proLaboreMode={proLaboreMode}
            fixedProLaboreValue={fixedProLaboreValue}
            distributionConfig={distributionConfig}
            onAddWithdrawal={addWithdrawal}
            onDeleteExpense={deleteTransaction}
            onDeleteRevenue={deleteRevenue}
            onDeleteWithdrawal={deleteWithdrawal}
          />
        ) : (
          <Dashboard 
            expenses={monthlyExpenses} 
            revenues={monthlyRevenues}
            allTransactions={transactions}
            allRevenues={revenues}
            withdrawals={withdrawals}
            proLaboreFrequency={proLaboreFrequency}
            onSetProLaboreFrequency={setProLaboreFrequency}
            proLaboreStartDate={proLaboreStartDate}
            onSetProLaboreStartDate={setProLaboreStartDate}
            profitCycle={profitCycle}
            onSetProfitCycle={setProfitCycle}
            proLaboreMode={proLaboreMode}
            onSetProLaboreMode={setProLaboreMode}
            fixedProLaboreValue={fixedProLaboreValue}
            onSetFixedProLaboreValue={setFixedProLaboreValue}
            distributionConfig={distributionConfig}
            onSetDistributionConfig={setDistributionConfig}
            onAddWithdrawal={addWithdrawal}
            onDeleteWithdrawal={deleteWithdrawal}
            currentMonth={currentMonth}
            currentYear={currentYear}
            activeTab={activeTab as ExpenseType}
            onDeleteExpense={deleteTransaction}
            onDeleteRevenue={deleteRevenue}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onImport={importData}
            onExport={exportData}
          />
        )}
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-100 flex md:hidden justify-around p-3 z-50">
        <button onClick={() => setActiveTab('OVERVIEW')} className={`flex flex-col items-center gap-1 ${activeTab === 'OVERVIEW' ? 'text-vibrantPink-500' : 'text-gray-400'}`}>
          <LayoutDashboard className="w-5 h-5" /> <span className="text-[10px] font-bold">GERAL</span>
        </button>
        <button onClick={() => setActiveTab('PROFESSIONAL')} className={`flex flex-col items-center gap-1 ${activeTab === 'PROFESSIONAL' ? 'text-vibrantPink-500' : 'text-gray-400'}`}>
          <Briefcase className="w-5 h-5" /> <span className="text-[10px] font-bold">STÚDIO</span>
        </button>
        <button onClick={() => setActiveTab('PERSONAL')} className={`flex flex-col items-center gap-1 ${activeTab === 'PERSONAL' ? 'text-vibrantPink-500' : 'text-gray-400'}`}>
          <User className="w-5 h-5" /> <span className="text-[10px] font-bold">PESSOAL</span>
        </button>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addTransaction} defaultType={activeTab === 'CHARTS' || activeTab === 'PLANILHAS' || activeTab === 'OVERVIEW' ? 'PROFESSIONAL' : activeTab as ExpenseType} />
      <RevenueModal isOpen={isRevenueModalOpen} onClose={() => setIsRevenueModalOpen(false)} onAdd={addRevenue} />
    </div>
  );
};

export default App;
