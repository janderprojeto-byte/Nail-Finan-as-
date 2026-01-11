
import React, { useMemo } from 'react';
import { MonthlyExpense, Transaction, Revenue, PaymentMethod } from '../types';
import { formatCurrency, getMonthName, SUB_CATEGORY_LABELS, generateMonthlyExpenses, getMonthlyRevenues } from '../utils';
import { 
  Calendar, TrendingUp, DollarSign, Activity, PieChart, Info, 
  Smartphone, CreditCard, Banknote, ShieldCheck, Target, Scissors
} from 'lucide-react';

interface ChartsViewProps {
  allTransactions: Transaction[];
  allRevenues: Revenue[];
  currentMonth: number;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const ChartsView: React.FC<ChartsViewProps> = ({
  allTransactions,
  allRevenues,
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth
}) => {
  const expenses = useMemo(() => 
    generateMonthlyExpenses(allTransactions, currentMonth, currentYear),
    [allTransactions, currentMonth, currentYear]
  );

  const revenues = useMemo(() => 
    getMonthlyRevenues(allRevenues, currentMonth, currentYear),
    [allRevenues, currentMonth, currentYear]
  );

  const profExpenses = expenses.filter(e => e.type === 'PROFESSIONAL');
  const totalProf = profExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalFixedProf = profExpenses.filter(e => e.category === 'FIXED').reduce((acc, curr) => acc + curr.amount, 0);
  const totalRevenue = revenues.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalRevenue - totalProf;

  const revenueByMethod = useMemo(() => {
    const agg: Record<PaymentMethod, number> = { PIX: 0, CARD: 0, CASH: 0 };
    revenues.forEach(r => {
      agg[r.paymentMethod] = (agg[r.paymentMethod] || 0) + r.amount;
    });
    return agg;
  }, [revenues]);

  const trendData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const m = date.getMonth();
      const y = date.getFullYear();
      const mExpenses = generateMonthlyExpenses(allTransactions, m, y);
      const mRevenues = getMonthlyRevenues(allRevenues, m, y);
      const totalExpProf = mExpenses.filter(e => e.type === 'PROFESSIONAL').reduce((acc, curr) => acc + curr.amount, 0);
      const totalRev = mRevenues.reduce((acc, curr) => acc + curr.amount, 0);
      data.push({
        label: getMonthName(m).substring(0, 3),
        expense: totalExpProf,
        revenue: totalRev,
      });
    }
    return data;
  }, [allTransactions, allRevenues, currentMonth, currentYear]);

  const maxValue = Math.max(...trendData.map(d => Math.max(d.expense, d.revenue)), 1);

  const profBySub = useMemo(() => {
    const agg: Record<string, number> = {};
    profExpenses.forEach(e => {
      agg[e.subCategory] = (agg[e.subCategory] || 0) + e.amount;
    });
    return Object.entries(agg)
      .sort(([, a], [, b]) => b - a)
      .map(([key, value]) => ({ label: SUB_CATEGORY_LABELS[key] || key, value }));
  }, [profExpenses]);

  const chartHeight = 120;
  const chartWidth = 400;
  const getPoints = (key: 'expense' | 'revenue') => trendData.map((d, i) => {
    const x = (i / (trendData.length - 1)) * chartWidth;
    const y = chartHeight - (d[key] / maxValue) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <button onClick={onPrevMonth} className="p-2.5 hover:bg-vibrantPink-50 rounded-2xl transition-colors"><Calendar className="w-5 h-5 text-vibrantPink-500" /></button>
        <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">Saúde do Negócio</h2>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{getMonthName(currentMonth)} {currentYear}</p>
        </div>
        <button onClick={onNextMonth} className="p-2.5 hover:bg-vibrantPink-50 rounded-2xl transition-colors"><Calendar className="w-5 h-5 text-vibrantPink-500 transform scale-x-[-1]" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl mb-4"><ShieldCheck size={32} /></div>
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Margem de Lucro</h4>
              <p className="text-3xl font-black text-emerald-600">{totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%</p>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="p-4 bg-sky-50 text-sky-600 rounded-3xl mb-4"><Target size={32} /></div>
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Ponto de Equilíbrio</h4>
              <p className="text-3xl font-black text-gray-800">{formatCurrency(totalFixedProf)}</p>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="p-4 bg-vibrantPink-50 text-vibrantPink-600 rounded-3xl mb-4"><Scissors size={32} /></div>
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Índice de Custos</h4>
              <p className="text-3xl font-black text-vibrantPink-600">{totalRevenue > 0 ? ((totalProf / totalRevenue) * 100).toFixed(1) : 0}%</p>
          </div>
      </div>

      <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-10">
            <div>
                <h3 className="text-xl font-bold text-gray-800">Desempenho Semestral</h3>
                <p className="text-sm text-gray-400 font-medium">Ganhos vs Custos Operacionais</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Ganho</div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-vibrantPink-400"><div className="w-3 h-3 bg-vibrantPink-400 rounded-full"></div> Custo</div>
            </div>
        </div>
        
        <div className="w-full h-[200px] relative">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} className="w-full h-full overflow-visible">
            <polyline fill="none" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" points={getPoints('revenue')} />
            <polyline fill="none" stroke="#ff007f" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" points={getPoints('expense')} />
            {trendData.map((d, i) => {
              const x = (i / (trendData.length - 1)) * chartWidth;
              return <g key={i}><text x={x} y={chartHeight + 25} className="text-[10px] fill-gray-300 font-black" textAnchor="middle">{d.label}</text><circle cx={x} cy={chartHeight - (d.revenue / maxValue) * chartHeight} r="4" className="fill-emerald-500 stroke-white stroke-2" /></g>;
            })}
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-8">Canais de Recebimento</h3>
          <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-sky-50 rounded-[32px] border border-sky-100">
                  <div className="flex items-center gap-4"><div className="p-3 bg-white rounded-2xl text-sky-600 shadow-sm"><Smartphone size={20}/></div><span className="text-sm font-bold text-sky-900">Pix</span></div>
                  <span className="text-lg font-black text-sky-900">{formatCurrency(revenueByMethod.PIX)}</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-orange-50 rounded-[32px] border border-orange-100">
                  <div className="flex items-center gap-4"><div className="p-3 bg-white rounded-2xl text-orange-600 shadow-sm"><CreditCard size={20}/></div><span className="text-sm font-bold text-orange-900">Cartão</span></div>
                  <span className="text-lg font-black text-orange-900">{formatCurrency(revenueByMethod.CARD)}</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-emerald-50 rounded-[32px] border border-emerald-100">
                  <div className="flex items-center gap-4"><div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm"><Banknote size={20}/></div><span className="text-sm font-bold text-emerald-900">Dinheiro</span></div>
                  <span className="text-lg font-black text-emerald-900">{formatCurrency(revenueByMethod.CASH)}</span>
              </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-8">Principais Gastos</h3>
          <div className="space-y-6">
            {profBySub.length === 0 ? <p className="text-center py-12 text-gray-300 italic font-medium">Sem dados.</p> : profBySub.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-widest"><span className="text-gray-400">{item.label}</span><span className="text-gray-800">{formatCurrency(item.value)}</span></div>
                <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-vibrantPink-400 to-vibrantPink-600 h-full transition-all" style={{ width: `${(item.value / (totalProf || 1)) * 100}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsView;
