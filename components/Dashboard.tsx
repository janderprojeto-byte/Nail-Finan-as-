
import React, { useState, useMemo } from 'react';
import { MonthlyExpense, Bank, ExpenseType, Revenue, PaymentMethod, Transaction, SmartDistributionItem, Withdrawal, WithdrawalType, ProLaboreFrequency, DistributionConfig, ProfitCycle } from '../types';
import { 
  formatCurrency, 
  getMonthName, 
  SUB_CATEGORY_LABELS, 
  getBusinessHealthStatus, 
  // Fix: removed non-existent calculateProfitReserve member
  calculateSmartDistribution,
  FREQUENCY_LABELS,
  getFrequencyDivisor,
  generateProLaborePredictions
} from '../utils';
import { 
  CreditCard, Wallet, Calendar, Trash2, 
  Coins, Landmark, Smartphone, Banknote, 
  Activity, AlertTriangle, Zap, Gem,
  User, PiggyBank, GraduationCap, Briefcase, Target,
  RefreshCcw, Repeat, Cog, Clock, CheckCircle2, ChevronRight, Info,
  Download, Upload, ShieldCheck
} from 'lucide-react';
import WithdrawalModal from './WithdrawalModal';

interface DashboardProps {
  expenses: MonthlyExpense[];
  revenues: Revenue[];
  allTransactions: Transaction[];
  allRevenues: Revenue[];
  withdrawals: Withdrawal[];
  proLaboreFrequency: ProLaboreFrequency;
  onSetProLaboreFrequency: (freq: ProLaboreFrequency) => void;
  proLaboreStartDate: string;
  onSetProLaboreStartDate: (date: string) => void;
  profitCycle: ProfitCycle;
  onSetProfitCycle: (cycle: ProfitCycle) => void;
  proLaboreMode: 'PERCENT' | 'FIXED';
  onSetProLaboreMode: (mode: 'PERCENT' | 'FIXED') => void;
  fixedProLaboreValue: number;
  onSetFixedProLaboreValue: (val: number) => void;
  distributionConfig: DistributionConfig;
  onSetDistributionConfig: (config: DistributionConfig) => void;
  onAddWithdrawal: (w: Withdrawal) => void;
  onDeleteWithdrawal: (id: string) => void;
  currentMonth: number;
  currentYear: number;
  activeTab: ExpenseType;
  onDeleteExpense: (id: string) => void;
  onDeleteRevenue: (id: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onImport?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  expenses,
  revenues,
  allTransactions,
  allRevenues,
  withdrawals,
  proLaboreFrequency,
  onSetProLaboreFrequency,
  proLaboreStartDate,
  onSetProLaboreStartDate,
  profitCycle,
  onSetProfitCycle,
  proLaboreMode,
  onSetProLaboreMode,
  fixedProLaboreValue,
  onSetFixedProLaboreValue,
  distributionConfig,
  onSetDistributionConfig,
  onAddWithdrawal,
  onDeleteWithdrawal,
  currentMonth,
  currentYear,
  activeTab,
  onDeleteExpense,
  onDeleteRevenue,
  onPrevMonth,
  onNextMonth,
  onImport,
  onExport
}) => {
  const [listType, setListType] = useState<'EXPENSES' | 'REVENUES' | 'DISTRIBUTION' | 'WITHDRAWALS' | 'CONFIG'>('EXPENSES');
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>('PRO_LABORE');
  const [preFilledWithdrawal, setPreFilledWithdrawal] = useState<{amount: number, date: string} | null>(null);
  
  const profExpenses = expenses.filter(e => e.type === 'PROFESSIONAL');
  const persExpenses = expenses.filter(e => e.type === 'PERSONAL');
  const currentTabExpenses = activeTab === 'PROFESSIONAL' ? profExpenses : persExpenses;

  const monthlyProfRevenues = revenues.filter(r => (r.type || 'PROFESSIONAL') === 'PROFESSIONAL');
  const totalRevenues = monthlyProfRevenues.reduce((acc, curr) => acc + curr.amount, 0);

  const currentTabRevenues = revenues.filter(r => (r.type || 'PROFESSIONAL') === activeTab);

  const totalProfExpenses = profExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const netProfit = totalRevenues - totalProfExpenses;
  const profitMargin = totalRevenues > 0 ? (netProfit / totalRevenues) * 100 : 0;
  
  const currentMonthWithdrawalsSum = withdrawals
    .filter(w => {
      const d = new Date(w.date.includes('T') ? w.date : w.date + 'T12:00:00');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + curr.amount, 0);

  const remainingStudioBalance = netProfit - currentMonthWithdrawalsSum;
  
  const currentTabRevenuesSum = currentTabRevenues.reduce((acc, curr) => acc + curr.amount, 0);
  const currentTabExpensesSum = currentTabExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const finalBalance = currentTabRevenuesSum - currentTabExpensesSum;
  
  const health = getBusinessHealthStatus(totalRevenues, totalProfExpenses);
  const smartDistribution = useMemo(() => calculateSmartDistribution(totalRevenues, distributionConfig), [totalRevenues, distributionConfig]);

  const proLaborePredictions = useMemo(() => {
    if (activeTab === 'PROFESSIONAL') {
      const currentWithdrawals = withdrawals.filter(w => {
          const d = new Date(w.date.includes('T') ? w.date : w.date + 'T12:00:00');
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      return generateProLaborePredictions(
        currentMonth, 
        currentYear, 
        proLaboreFrequency, 
        monthlyProfRevenues, 
        currentWithdrawals,
        distributionConfig.proLabore,
        proLaboreMode,
        fixedProLaboreValue,
        proLaboreStartDate
      );
    }
    return [];
  }, [currentMonth, currentYear, proLaboreFrequency, withdrawals, activeTab, monthlyProfRevenues, proLaboreStartDate, distributionConfig.proLabore, proLaboreMode, fixedProLaboreValue]);

  const combinedExpenses = useMemo(() => {
    const list: any[] = [...currentTabExpenses.map(e => ({ ...e, isPrediction: false }))];
    if (activeTab === 'PROFESSIONAL') {
      list.push(...proLaborePredictions.map(p => ({ ...p, isPrediction: true })));
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentTabExpenses, proLaborePredictions, activeTab]);

  const handleOpenWithdrawal = (type: WithdrawalType, preFill?: {amount: number, date: string}) => {
    setWithdrawalType(type);
    setPreFilledWithdrawal(preFill || null);
    setIsWithdrawalModalOpen(true);
  };

  const updateConfig = (key: keyof DistributionConfig, val: number | boolean) => {
    onSetDistributionConfig({ ...distributionConfig, [key]: val });
  };

  const getBankBadge = (bank: Bank, customBank?: string) => {
    switch (bank) {
      case 'NUBANK': return <span className="flex items-center gap-1 text-[10px] font-black text-purple-600 uppercase tracking-tighter"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Nubank</span>;
      case 'BRADESCO': return <span className="flex items-center gap-1 text-[10px] font-black text-red-600 uppercase tracking-tighter"><div className="w-2 h-2 rounded-full bg-red-600"></div> Bradesco</span>;
      case 'CASH': return <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-tighter"><Wallet size={10}/> Pix/Dinheiro</span>;
      case 'OTHER': return <span className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase tracking-tighter"><Landmark size={10}/> {customBank || 'Banco'}</span>;
      default: return null;
    }
  };

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'PIX': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200 flex items-center gap-1"><Smartphone size={10}/> Pix</span>;
      case 'CARD': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1"><CreditCard size={10}/> Cartão</span>;
      case 'CASH': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1"><Banknote size={10}/> Dinheiro</span>;
      default: return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">Outro</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 relative">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-gray-100">
        <button onClick={onPrevMonth} className="p-2 hover:bg-vibrantPink-50 rounded-full transition-colors group">
          <Calendar className="w-5 h-5 text-vibrantPink-500 group-hover:scale-110 transition-transform" />
        </button>
        <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">{getMonthName(currentMonth)} {currentYear}</h2>
            <div className={`mt-1 flex items-center justify-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border
              ${health.color === 'red' ? 'bg-red-50 text-red-600 border-red-100' : 
                health.color === 'orange' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                health.color === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              Saúde do Stúdio: {health.label}
            </div>
        </div>
        <button onClick={onNextMonth} className="p-2 hover:bg-vibrantPink-50 rounded-full transition-colors group">
          <Calendar className="w-5 h-5 text-vibrantPink-500 group-hover:scale-110 transition-transform transform scale-x-[-1]" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-gradient-to-br from-gray-900 via-vibrantPink-900 to-black p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
            <p className="text-vibrantPink-200 text-[10px] font-black uppercase tracking-[0.2em]">
              {activeTab === 'PROFESSIONAL' ? 'Saldo Disponível (Stúdio)' : 'Fôlego Financeiro (Pessoal)'}
            </p>
            <h3 className="text-5xl font-black mt-3 tracking-tighter">
              {activeTab === 'PROFESSIONAL' ? formatCurrency(remainingStudioBalance) : formatCurrency(finalBalance)}
            </h3>
            <div className="mt-8">
                {activeTab === 'PROFESSIONAL' ? (
                  <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold border border-white/10">{profitMargin.toFixed(1)}% Margem Real</span>
                ) : (
                  <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold border border-white/10">Controle Pessoal</span>
                )}
            </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-7 rounded-[40px] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1">Reserva de Lucro</p>
                    <h3 className="text-2xl font-black">{formatCurrency(smartDistribution.profit.amount)}</h3>
                </div>
                <button 
                  onClick={() => handleOpenWithdrawal('PROFIT')}
                  disabled={totalRevenues === 0}
                  className={`mt-4 w-full py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-lg transition-all 
                    ${totalRevenues === 0 ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-white text-emerald-600 hover:scale-105 active:scale-95'}`}
                >
                  Resgatar Lucro
                </button>
            </div>
        </div>

        <div className="bg-white p-7 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-between">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Gasto {activeTab === 'PROFESSIONAL' ? 'Operacional' : 'Pessoal'}</p>
            <h3 className="text-3xl font-black text-red-500 tracking-tighter">{formatCurrency(currentTabExpensesSum)}</h3>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase italic">Total Mensal</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-x-auto">
            <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit shrink-0">
              <button onClick={() => setListType('EXPENSES')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${listType === 'EXPENSES' ? 'bg-white text-vibrantPink-600 shadow-md' : 'text-gray-500'}`}>Gastos</button>
              <button onClick={() => setListType('REVENUES')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${listType === 'REVENUES' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-500'}`}>Ganhos</button>
              {activeTab === 'PROFESSIONAL' && (
                <>
                  <button onClick={() => setListType('DISTRIBUTION')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${listType === 'DISTRIBUTION' ? 'bg-white text-sky-600 shadow-md' : 'text-gray-500'}`}>Estratégia</button>
                  <button onClick={() => setListType('WITHDRAWALS')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${listType === 'WITHDRAWALS' ? 'bg-white text-amber-600 shadow-md' : 'text-gray-500'}`}>Retiradas</button>
                  <button onClick={() => setListType('CONFIG')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${listType === 'CONFIG' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-500'}`}>
                    <Cog size={14} /> Ajustes
                  </button>
                </>
              )}
            </div>
            <div className="text-right shrink-0">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Saldo do Mês</p>
                <p className={`text-sm font-bold ${finalBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(finalBalance)}</p>
            </div>
        </div>
        
        <div className="p-8">
            {listType === 'EXPENSES' ? (
                <div className="overflow-x-auto -mx-8 text-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-[0.15em]">
                            <tr>
                                <th className="px-10 py-5">Data / Detalhe</th>
                                <th className="px-10 py-5">Categoria</th>
                                <th className="px-10 py-5 text-right">Valor</th>
                                <th className="px-10 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {combinedExpenses.length === 0 ? (
                                <tr><td colSpan={4} className="px-10 py-20 text-center text-gray-300 italic font-medium">Sem registros para este mês.</td></tr>
                            ) : (
                                combinedExpenses.map((item, idx) => {
                                    if (item.isPrediction) {
                                        return (
                                            <tr key={`pred-${idx}`} className="bg-amber-50/20 border-l-4 border-l-amber-400 group border-b border-dashed border-amber-100">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                                            <Clock size={16} className="animate-pulse" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-amber-600 font-black mb-1 italic">PREVISTO PARA: {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                                            <span className="font-bold text-gray-800 tracking-tight">Seu Pró-Labore ({FREQUENCY_LABELS[proLaboreFrequency]})</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                                        Provisão de Salário
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 text-right font-black text-amber-600 italic opacity-70">
                                                    {formatCurrency(item.amount)}
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <button 
                                                        onClick={() => handleOpenWithdrawal('PRO_LABORE', { amount: item.amount, date: item.date })}
                                                        className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2 mx-auto"
                                                    >
                                                        <CheckCircle2 size={12} /> Efetivar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return (
                                        <tr key={item.id} className="hover:bg-vibrantPink-50/30 transition-colors group">
                                            <td className="px-10 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-400 font-black mb-1">{new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                                    <span className="font-bold text-gray-800 tracking-tight">{item.description}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-2">
                                                    {getBankBadge(item.bank, item.customBank)}
                                                    <span className="text-[10px] text-gray-300">•</span>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${item.category === 'FIXED' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-orange-50 text-orange-500 border-orange-100'}`}>
                                                       {item.category === 'FIXED' ? 'Fixo' : 'Variável'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right font-black text-red-500">-{formatCurrency(item.amount)}</td>
                                            <td className="px-10 py-6 text-right w-10">
                                                <button onClick={() => onDeleteExpense(item.originalId)} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-60 hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            ) : listType === 'REVENUES' ? (
                <div className="overflow-x-auto -mx-8 text-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-[0.15em]">
                            <tr>
                                <th className="px-10 py-5">{activeTab === 'PROFESSIONAL' ? 'Data / Cliente' : 'Data / Recebimento'}</th>
                                <th className="px-10 py-5">Forma / Canal</th>
                                <th className="px-10 py-5 text-right">Valor Total Recebido</th>
                                <th className="px-10 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentTabRevenues.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="px-10 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                      <div className="p-4 bg-gray-50 rounded-full text-gray-200"><Coins size={40} /></div>
                                      <p className="text-gray-300 italic font-medium">
                                        {activeTab === 'PROFESSIONAL' 
                                          ? 'Nenhum serviço registrado neste mês.' 
                                          : 'Seu salário ainda não foi retirado do caixa do Stúdio.'}
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                            ) : (
                                currentTabRevenues.map((revenue) => (
                                    <tr key={revenue.id} className={`transition-colors group ${activeTab === 'PROFESSIONAL' ? 'hover:bg-emerald-50/30' : 'hover:bg-vibrantPink-50/30'}`}>
                                        <td className="px-10 py-7">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400 font-black mb-1">{new Date(revenue.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                                <span className="font-bold text-gray-800 tracking-tight">{revenue.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                          {activeTab === 'PROFESSIONAL' ? (
                                            getPaymentMethodBadge(revenue.paymentMethod)
                                          ) : (
                                            <span className="px-3 py-1 bg-vibrantPink-50 text-vibrantPink-600 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                                              <Wallet size={12}/> Vindo do Stúdio
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-10 py-7 text-right">
                                           <span className={`text-2xl font-black block tracking-tighter ${activeTab === 'PROFESSIONAL' ? 'text-emerald-700' : 'text-vibrantPink-600'}`}>
                                             +{formatCurrency(revenue.amount)}
                                           </span>
                                        </td>
                                        <td className="px-10 py-7 text-right w-10">
                                            <button onClick={() => onDeleteRevenue(revenue.id)} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-60 hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : listType === 'DISTRIBUTION' ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Sua Estratégia de Sucesso</h3>
                          <p className="text-xs text-gray-400 font-medium">Divisão inteligente baseada no seu faturamento atual de <span className="text-emerald-600 font-black">{formatCurrency(totalRevenues)}</span></p>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button onClick={() => updateConfig('isCustom', false)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${!distributionConfig.isCustom ? 'bg-white text-vibrantPink-600 shadow-sm' : 'text-gray-400'}`}>Automática</button>
                            <button onClick={() => updateConfig('isCustom', true)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${distributionConfig.isCustom ? 'bg-white text-vibrantPink-600 shadow-sm' : 'text-gray-400'}`}>Manual</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(Object.entries(smartDistribution) as [string, SmartDistributionItem][]).map(([key, item]) => (
                            <div key={key} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-2xl 
                                        ${key === 'fixed' ? 'bg-red-50 text-red-500' : 
                                          key === 'variable' ? 'bg-orange-50 text-orange-500' : 
                                          key === 'profit' ? 'bg-emerald-50 text-emerald-500' : 
                                          key === 'investment' ? 'bg-sky-50 text-sky-500' : 'bg-vibrantPink-50 text-vibrantPink-500'}`}>
                                        {key === 'fixed' ? <Target size={20}/> : 
                                         key === 'variable' ? <Activity size={20}/> : 
                                         key === 'profit' ? <Gem size={20}/> : 
                                         key === 'investment' ? <GraduationCap size={20}/> : <User size={20}/>}
                                    </div>
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{item.percent}%</span>
                                </div>
                                <h4 className="font-bold text-gray-800 mb-1">{item.label}</h4>
                                <p className="text-2xl font-black text-gray-900 mb-3 tracking-tighter">{formatCurrency(item.amount)}</p>
                                <div className="pt-3 border-t border-gray-50">
                                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">{item.items}</p>
                                </div>
                                
                                {distributionConfig.isCustom && (
                                  <div className="mt-4 flex items-center gap-2">
                                     <input 
                                        type="range" min="0" max="100" 
                                        value={distributionConfig[key as keyof DistributionConfig] as number} 
                                        onChange={(e) => updateConfig(key as keyof DistributionConfig, parseInt(e.target.value))}
                                        className="flex-1 accent-vibrantPink-500 h-1"
                                     />
                                  </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-900 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-6">
                        <div className="p-4 bg-white/10 rounded-[32px] text-vibrantPink-300"><Info size={24}/></div>
                        <div className="flex-1 text-center md:text-left">
                            <h4 className="font-bold text-lg">Por que seguir essa estratégia?</h4>
                            <p className="text-gray-400 text-xs mt-1 leading-relaxed">Essa divisão garante que seu Stúdio pague todas as contas, renove o estoque, invista no seu crescimento e ainda pague seu salário e lucro, sem nunca deixar o caixa no vermelho.</p>
                        </div>
                        <div className="shrink-0">
                           <button onClick={() => setListType('CONFIG')} className="px-6 py-3 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-vibrantPink-500 hover:text-white transition-all">Ajustar Estratégia</button>
                        </div>
                    </div>
                </div>
            ) : listType === 'WITHDRAWALS' ? (
                <div className="overflow-x-auto -mx-8 text-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-[0.15em]">
                            <tr>
                                <th className="px-10 py-5">Data da Retirada</th>
                                <th className="px-10 py-5">Categoria</th>
                                <th className="px-10 py-5 text-right">Valor Pago</th>
                                <th className="px-10 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {withdrawals.length === 0 ? (
                                <tr><td colSpan={4} className="px-10 py-20 text-center text-gray-300 italic font-medium">Nenhuma retirada efetuada.</td></tr>
                            ) : (
                                [...withdrawals].reverse().map((w) => (
                                    <tr key={w.id} className="hover:bg-amber-50/30 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400 font-black mb-1">{new Date(w.date.includes('T') ? w.date : w.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                                <span className="font-bold text-gray-800">{w.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${w.type === 'PRO_LABORE' ? 'bg-vibrantPink-50 text-vibrantPink-500 border-vibrantPink-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                                                {w.type === 'PRO_LABORE' ? 'Pró-labore' : 'Distribuição de Lucro'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right font-black text-amber-600">{formatCurrency(w.amount)}</td>
                                        <td className="px-10 py-6 text-right w-10">
                                            <button onClick={() => onDeleteWithdrawal(w.id)} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-60 hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : listType === 'CONFIG' ? (
                 <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-purple-50/50 p-8 rounded-[40px] border border-purple-100 space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-purple-500 text-white rounded-2xl"><Repeat size={20}/></div>
                                <div>
                                    <h3 className="font-black uppercase tracking-tighter text-purple-900">Frequência de Pró-labore</h3>
                                    <p className="text-[10px] text-purple-600 font-bold">A cada quanto tempo você retira seu salário?</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(['DAILY', 'WEEKLY', '15_DAYS', '20_DAYS', 'MONTHLY'] as ProLaboreFrequency[]).map((freq) => (
                                    <button 
                                        key={freq}
                                        onClick={() => onSetProLaboreFrequency(freq)}
                                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${proLaboreFrequency === freq ? 'bg-purple-500 text-white border-purple-600 shadow-md' : 'bg-white text-purple-400 border-purple-100 hover:bg-purple-50'}`}
                                    >
                                        {FREQUENCY_LABELS[freq]}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="pt-4 border-t border-purple-100">
                                <label className="block text-[10px] font-black text-purple-900 uppercase tracking-widest mb-2 ml-1">Início das Previsões</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                                    <input 
                                      type="date" 
                                      value={proLaboreStartDate} 
                                      onChange={(e) => onSetProLaboreStartDate(e.target.value)}
                                      className="w-full pl-10 pr-4 py-3 bg-white border border-purple-200 rounded-xl text-xs font-bold text-purple-900 outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50/50 p-8 rounded-[40px] border border-emerald-100 space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-emerald-500 text-white rounded-2xl"><Gem size={20}/></div>
                                <div>
                                    <h3 className="font-black uppercase tracking-tighter text-emerald-900">Ciclo de Retirada de Lucro</h3>
                                    <p className="text-[10px] text-emerald-600 font-bold">Resgate do lucro do Stúdio:</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {([1, 3, 6, 12] as ProfitCycle[]).map((cycle) => (
                                    <button 
                                        key={cycle}
                                        onClick={() => onSetProfitCycle(cycle)}
                                        className={`flex-1 min-w-[80px] py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${profitCycle === cycle ? 'bg-emerald-500 text-white border-emerald-600 shadow-md' : 'bg-white text-emerald-400 border-emerald-100 hover:bg-purple-50'}`}
                                    >
                                        {cycle === 1 ? 'Mensal' : cycle === 3 ? 'Trimestral' : cycle === 6 ? 'Semestral' : 'Anual'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gray-900 text-white rounded-2xl"><ShieldCheck size={20}/></div>
                            <div>
                                <h3 className="font-black uppercase tracking-tighter text-gray-900">Segurança de Dados</h3>
                                <p className="text-[10px] text-gray-500 font-bold">Faça o backup de suas informações para maior segurança.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={onExport} className="flex items-center justify-center gap-2 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-black uppercase text-gray-700 hover:bg-gray-100 transition-all">
                                <Download size={16}/> Exportar JSON de Backup
                            </button>
                            <label className="flex items-center justify-center gap-2 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-black uppercase text-gray-700 hover:bg-gray-100 transition-all cursor-pointer">
                                <Upload size={16}/> Importar JSON de Backup
                                <input type="file" accept=".json" onChange={onImport} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-10 text-center text-gray-400 italic font-medium">Ops! Esta aba ainda está sendo finalizada.</div>
            )}
        </div>
      </div>

      <WithdrawalModal 
          isOpen={isWithdrawalModalOpen} 
          onClose={() => setIsWithdrawalModalOpen(false)} 
          onAdd={onAddWithdrawal} 
          type="PRO_LABORE" 
          maxAmount={remainingStudioBalance + 100000} 
          preFilled={preFilledWithdrawal}
      />
    </div>
  );
};

export default Dashboard;
