
import React, { useMemo, useState } from 'react';
import { MonthlyExpense, Revenue, Withdrawal, ExpenseType, ProLaboreFrequency, DistributionConfig } from '../types';
import { formatCurrency, getMonthName, calculateSmartDistribution, generateProLaborePredictions } from '../utils';
import { 
  ArrowUpCircle, ArrowDownCircle, Calendar, Filter, 
  Search, TrendingUp, TrendingDown, Wallet, Clock, 
  ChevronLeft, ChevronRight, Briefcase, User, HelpCircle,
  History, DollarSign, Plus, Minus, CheckCircle2, Trash2
} from 'lucide-react';
import WithdrawalModal from './WithdrawalModal';

interface OverviewViewProps {
  expenses: MonthlyExpense[];
  revenues: Revenue[];
  withdrawals: Withdrawal[];
  currentMonth: number;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  proLaboreFrequency: ProLaboreFrequency;
  proLaboreStartDate: string;
  proLaboreMode: 'PERCENT' | 'FIXED';
  fixedProLaboreValue: number;
  distributionConfig: DistributionConfig;
  onAddWithdrawal: (w: Withdrawal) => void;
  onDeleteExpense: (id: string) => void;
  onDeleteRevenue: (id: string) => void;
  onDeleteWithdrawal: (id: string) => void;
}

interface TimelineItem {
  id: string;
  originalId: string;
  date: string;
  description: string;
  amount: number;
  type: 'IN' | 'OUT' | 'PRED';
  source: 'REVENUE' | 'EXPENSE' | 'WITHDRAWAL' | 'PREDICTION';
  category: string;
}

const OverviewView: React.FC<OverviewViewProps> = ({
  expenses,
  revenues,
  withdrawals,
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth,
  proLaboreFrequency,
  proLaboreStartDate,
  proLaboreMode,
  fixedProLaboreValue,
  distributionConfig,
  onAddWithdrawal,
  onDeleteExpense,
  onDeleteRevenue,
  onDeleteWithdrawal
}) => {
  const [filterType, setFilterType] = useState<ExpenseType | 'ALL'>('PROFESSIONAL');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [preFilledWithdrawal, setPreFilledWithdrawal] = useState<{amount: number, date: string} | null>(null);

  const timeline = useMemo(() => {
    let items: TimelineItem[] = [];

    // Ganhos
    revenues.forEach(r => {
      const revType = r.type || 'PROFESSIONAL';
      if (filterType === 'ALL' || filterType === revType) {
        items.push({
          id: r.id,
          originalId: r.id,
          date: r.date,
          description: r.description,
          amount: r.amount,
          type: 'IN',
          source: 'REVENUE',
          category: revType === 'PROFESSIONAL' ? 'Serviço Realizado' : 'Salário Recebido'
        });
      }
    });

    // Gastos reais
    expenses.forEach(e => {
      if (filterType === 'ALL' || e.type === filterType) {
        items.push({
          id: e.id,
          originalId: e.originalId,
          date: e.date,
          description: e.description,
          amount: e.amount,
          type: 'OUT',
          source: 'EXPENSE',
          category: e.category === 'FIXED' ? 'Gasto Fixo' : 'Gasto Variável'
        });
      }
    });

    // Injetar Previsões de Pró-labore sensíveis ao fluxo de caixa
    if (filterType === 'ALL' || filterType === 'PROFESSIONAL') {
      const monthlyProfRevenues = revenues.filter(r => (r.type || 'PROFESSIONAL') === 'PROFESSIONAL');
      const currentWithdrawals = withdrawals.filter(w => {
        const d = new Date(w.date.includes('T') ? w.date : w.date + 'T12:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const preds = generateProLaborePredictions(
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
      
      preds.forEach((p, idx) => {
        items.push({
          id: `pred-ov-${idx}`,
          originalId: `pred-ov-${idx}`,
          date: p.date,
          description: 'Pró-Labore Previsto',
          amount: p.amount,
          type: 'PRED',
          source: 'PREDICTION',
          category: 'Planejamento de Salário'
        });
      });
    }

    if (directionFilter === 'IN') items = items.filter(i => i.type === 'IN');
    if (directionFilter === 'OUT') items = items.filter(i => i.type === 'OUT' || i.type === 'PRED');

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, revenues, withdrawals, filterType, directionFilter, currentMonth, currentYear, proLaboreFrequency, proLaboreMode, fixedProLaboreValue, distributionConfig, proLaboreStartDate]);

  const stats = useMemo(() => {
    const totalIn = timeline.filter(i => i.type === 'IN').reduce((acc, curr) => acc + curr.amount, 0);
    const totalOut = timeline.filter(i => i.type === 'OUT' || i.type === 'PRED').reduce((acc, curr) => acc + curr.amount, 0);
    return { totalIn, totalOut, balance: totalIn - totalOut };
  }, [timeline]);

  const handleEfetivar = (amount: number, date: string) => {
    setPreFilledWithdrawal({ amount, date });
    setIsWithdrawalModalOpen(true);
  };

  const handleItemDelete = (item: TimelineItem) => {
    if (item.source === 'REVENUE') onDeleteRevenue(item.originalId);
    else if (item.source === 'EXPENSE') onDeleteExpense(item.originalId);
    else if (item.source === 'WITHDRAWAL') onDeleteWithdrawal(item.originalId);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full md:w-fit">
            <button onClick={() => setFilterType('PROFESSIONAL')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${filterType === 'PROFESSIONAL' ? 'bg-white text-vibrantPink-600 shadow-sm' : 'text-gray-500'}`}>
              <Briefcase size={14} /> Stúdio
            </button>
            <button onClick={() => setFilterType('PERSONAL')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${filterType === 'PERSONAL' ? 'bg-white text-vibrantPink-600 shadow-sm' : 'text-gray-500'}`}>
              <User size={14} /> Pessoal
            </button>
            <button onClick={() => setFilterType('ALL')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${filterType === 'ALL' ? 'bg-white text-vibrantPink-600 shadow-sm' : 'text-gray-500'}`}>
              <History size={14} /> Tudo
            </button>
          </div>
          <div className="flex items-center gap-2 ml-1">
             <button onClick={() => setDirectionFilter('ALL')} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${directionFilter === 'ALL' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-600'}`}>Tudo</button>
             <button onClick={() => setDirectionFilter('IN')} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all flex items-center gap-1 ${directionFilter === 'IN' ? 'bg-emerald-500 text-white' : 'text-emerald-500/60 hover:text-emerald-500'}`}><Plus size={10}/> Ganhos</button>
             <button onClick={() => setDirectionFilter('OUT')} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all flex items-center gap-1 ${directionFilter === 'OUT' ? 'bg-vibrantPink-500 text-white' : 'text-vibrantPink-500/60 hover:text-vibrantPink-500'}`}><Minus size={10}/> Gastos</button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onPrevMonth} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-gray-400" /></button>
          <div className="text-center min-w-[120px]">
             <h3 className="font-black text-gray-800 uppercase tracking-tighter text-lg leading-tight">{getMonthName(currentMonth)}</h3>
             <p className="text-[10px] text-gray-400 font-bold tracking-widest">{currentYear}</p>
          </div>
          <button onClick={onNextMonth} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-gray-400" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-500 p-8 rounded-[40px] text-white shadow-xl shadow-emerald-100/50 relative overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-emerald-200/40 cursor-default">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700"><ArrowUpCircle size={100} /></div>
            <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1">Entradas</p>
            <h3 className="text-3xl font-black tracking-tighter">{formatCurrency(stats.totalIn)}</h3>
        </div>
        <div className="bg-vibrantPink-500 p-8 rounded-[40px] text-white shadow-xl shadow-vibrantPink-100/50 relative overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-vibrantPink-200/40 cursor-default">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700"><ArrowDownCircle size={100} /></div>
            <p className="text-vibrantPink-100 text-[10px] font-black uppercase tracking-widest mb-1">Saídas</p>
            <h3 className="text-3xl font-black tracking-tighter">{formatCurrency(stats.totalOut)}</h3>
        </div>
        <div className={`p-8 rounded-[40px] shadow-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl cursor-default ${stats.balance >= 0 ? 'bg-gray-900 text-white shadow-gray-200/50 hover:shadow-gray-300/40' : 'bg-orange-600 text-white shadow-orange-100/50 hover:shadow-orange-200/40'}`}>
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700"><DollarSign size={100} /></div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Resultado Líquido</p>
            <h3 className="text-3xl font-black tracking-tighter">{formatCurrency(stats.balance)}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
           <h3 className="font-bold text-gray-800 flex items-center gap-3">
             <div className="w-10 h-10 bg-vibrantPink-50 text-vibrantPink-500 rounded-2xl flex items-center justify-center shadow-sm"><Clock size={20} /></div>
             Extrato Unificado
           </h3>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{timeline.length} Registros</p>
        </div>
        <div className="p-2 md:p-8">
           <div className="space-y-4">
              {timeline.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4"><History size={32} className="text-gray-200" /></div>
                   <p className="text-gray-300 italic font-medium">Nenhum registro encontrado para este filtro.</p>
                </div>
              ) : (
                timeline.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <div className="hidden md:flex flex-col items-center gap-2">
                       <span className="text-[10px] font-black text-gray-300 uppercase w-10 text-center">{new Date(item.date + 'T12:00:00').getDate()}</span>
                       <div className={`w-0.5 h-12 ${index === timeline.length - 1 ? 'bg-transparent' : 'bg-gray-100'}`}></div>
                    </div>
                    <div className={`flex-1 flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 
                      ${item.type === 'IN' ? 'bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50' : 
                        item.type === 'PRED' ? 'bg-amber-50/20 border-amber-200 border-dashed hover:bg-amber-50' :
                        'bg-vibrantPink-50/40 border-vibrantPink-100 hover:bg-vibrantPink-50'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm 
                          ${item.type === 'IN' ? 'bg-emerald-500 text-white' : 
                            item.type === 'PRED' ? 'bg-amber-100 text-amber-600' :
                            'bg-vibrantPink-500 text-white'}`}>
                          {item.type === 'IN' ? <Plus size={24} /> : item.type === 'PRED' ? <Clock size={24} /> : <Minus size={24} />}
                        </div>
                        <div>
                          <p className="font-black text-gray-800 tracking-tight text-sm md:text-base">{item.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border 
                               ${item.type === 'IN' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : 
                                 item.type === 'PRED' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                                 'bg-vibrantPink-500/10 text-vibrantPink-600 border-vibrantPink-200'}`}>
                                {item.type === 'IN' ? 'Entrada' : item.type === 'PRED' ? 'Previsto' : 'Saída'}
                             </span>
                             <span className="text-gray-200">•</span>
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</span>
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest md:hidden">• Dia {new Date(item.date + 'T12:00:00').getDate()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className={`text-base md:text-xl font-black tracking-tighter ${item.type === 'IN' ? 'text-emerald-600' : item.type === 'PRED' ? 'text-amber-600 italic' : 'text-vibrantPink-600'}`}>
                            {item.type === 'IN' ? '+' : '-'}{formatCurrency(item.amount)}
                          </p>
                        </div>
                        {item.type === 'PRED' ? (
                          <button onClick={() => handleEfetivar(item.amount, item.date)} className="p-2 bg-amber-500 text-white rounded-xl shadow-md hover:bg-amber-600 active:scale-95 transition-all"><CheckCircle2 size={16}/></button>
                        ) : (
                          <button onClick={() => handleItemDelete(item)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-40 hover:opacity-100">
                            <Trash2 size={16}/>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
        <div className="bg-gray-900 p-8 flex items-center justify-between text-white">
           <span className="text-xs font-black uppercase tracking-widest text-gray-500">Saldo Consolidado</span>
           <div className="text-right">
              <span className={`text-2xl font-black tracking-tighter ${stats.balance >= 0 ? 'text-emerald-400' : 'text-vibrantPink-400'}`}>{formatCurrency(stats.balance)}</span>
           </div>
        </div>
      </div>

      <WithdrawalModal 
          isOpen={isWithdrawalModalOpen} 
          onClose={() => setIsWithdrawalModalOpen(false)} 
          onAdd={onAddWithdrawal} 
          type="PRO_LABORE" 
          maxAmount={999999} 
          preFilled={preFilledWithdrawal}
      />
    </div>
  );
};

export default OverviewView;
