
import React, { useState, useMemo } from 'react';
import { MonthlyExpense, Revenue, Bank, Category } from '../types';
import { formatCurrency, getMonthName, SUB_CATEGORY_LABELS } from '../utils';
import { 
  Search, Filter, Calendar, Trash2, CreditCard, Landmark, 
  Banknote, ArrowUpDown, ChevronLeft, ChevronRight, FileText, Wallet
} from 'lucide-react';

interface SpreadsheetViewProps {
  expenses: MonthlyExpense[];
  revenues: Revenue[];
  currentMonth: number;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDeleteExpense: (id: string) => void;
  onDeleteRevenue: (id: string) => void;
}

const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  expenses,
  revenues,
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth,
  onDeleteExpense,
  onDeleteRevenue
}) => {
  const [sheetSource, setSheetSource] = useState<'EXPENSES' | 'REVENUES'>('EXPENSES');
  const [sheetType, setSheetType] = useState<'PROFESSIONAL' | 'PERSONAL'>('PROFESSIONAL');
  const [searchTerm, setSearchTerm] = useState('');
  const [bankFilter, setBankFilter] = useState<Bank | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'ALL'>('ALL');

  const filteredData = useMemo(() => {
    if (sheetSource === 'EXPENSES') {
      return expenses.filter(e => {
        const matchesType = e.type === sheetType;
        const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBank = bankFilter === 'ALL' || e.bank === bankFilter;
        const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
        return matchesType && matchesSearch && matchesBank && matchesCategory;
      });
    } else {
      return revenues.filter(r => {
        const matchesType = r.type === sheetType;
        const matchesSearch = r.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
      });
    }
  }, [expenses, revenues, sheetSource, sheetType, searchTerm, bankFilter, categoryFilter]);

  const totalFiltered = filteredData.reduce((acc, curr) => acc + curr.amount, 0);

  const getBankBadge = (bank: Bank, customBank?: string) => {
    switch (bank) {
      case 'NUBANK': return <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-100"></div><span className="font-bold">Nubank</span></div>;
      case 'BRADESCO': return <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm shadow-red-100"></div><span className="font-bold">Bradesco</span></div>;
      case 'CASH': return <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-100"></div><span className="font-bold text-emerald-600">Pix</span></div>;
      case 'OTHER': return <div className="flex items-center gap-1.5"><Landmark size={12} className="text-gray-400"/><span className="font-bold">{customBank || 'Outro Banco'}</span></div>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 text-sm">
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full md:w-fit">
            <button onClick={() => setSheetType('PROFESSIONAL')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${sheetType === 'PROFESSIONAL' ? 'bg-white text-vibrantPink-600 shadow-sm' : 'text-gray-500'}`}>Stúdio</button>
            <button onClick={() => setSheetType('PERSONAL')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${sheetType === 'PERSONAL' ? 'bg-white text-vibrantPink-600 shadow-sm' : 'text-gray-500'}`}>Pessoal</button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onPrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-gray-400" /></button>
            <div className="text-center min-w-[140px] font-black text-gray-800 uppercase tracking-tighter">{getMonthName(currentMonth)} {currentYear}</div>
            <button onClick={onNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-gray-400" /></button>
          </div>
        </div>

        <div className="flex bg-vibrantPink-50 p-1 rounded-2xl w-full md:w-fit self-center md:self-start">
            <button onClick={() => setSheetSource('EXPENSES')} className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${sheetSource === 'EXPENSES' ? 'bg-white text-vibrantPink-600 shadow-sm' : 'text-vibrantPink-300'}`}>Gastos (Saídas)</button>
            <button onClick={() => setSheetSource('REVENUES')} className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${sheetSource === 'REVENUES' ? 'bg-white text-emerald-600 shadow-sm' : 'text-emerald-300'}`}>Ganhos (Entradas)</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input type="text" placeholder="Filtrar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-vibrantPink-200 transition-all outline-none font-medium text-gray-900" />
        </div>
        
        {sheetSource === 'EXPENSES' && (
          <>
            <select value={bankFilter} onChange={(e) => setBankFilter(e.target.value as Bank | 'ALL')} className="px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm outline-none font-bold text-gray-900">
              <option value="ALL">Todos os Bancos</option>
              <option value="NUBANK">Nubank</option>
              <option value="BRADESCO">Bradesco</option>
              <option value="CASH">Pix / Dinheiro</option>
              <option value="OTHER">Outros</option>
            </select>

            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as Category | 'ALL')} className="px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm outline-none font-bold text-gray-900">
              <option value="ALL">Todas Categorias</option>
              <option value="FIXED">Fixos</option>
              <option value="VARIABLE">Variáveis</option>
            </select>
          </>
        )}
      </div>

      <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição</th>
                {sheetSource === 'EXPENSES' && <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</th>}
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{sheetSource === 'EXPENSES' ? 'Banco' : 'Forma'}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Valor</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center"><FileText size={48} className="mx-auto opacity-10" /><p className="mt-4 text-gray-300 italic">Nenhum registro encontrado.</p></td></tr>
              ) : (
                filteredData.map((item: any, idx) => (
                  <tr key={item.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-vibrantPink-50/50 transition-colors group`}>
                    <td className="px-8 py-5"><span className="text-xs font-bold text-gray-400">{new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span></td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-800 tracking-tight">{item.description}</span>
                        {sheetSource === 'EXPENSES' && (
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight italic">{SUB_CATEGORY_LABELS[item.subCategory] || item.subCategory}</span>
                        )}
                      </div>
                    </td>
                    {sheetSource === 'EXPENSES' && (
                      <td className="px-8 py-5"><span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${item.category === 'FIXED' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-orange-50 text-orange-500 border-orange-100'}`}>{item.category === 'FIXED' ? 'Fixo' : 'Variável'}</span></td>
                    )}
                    <td className="px-8 py-5">
                      {sheetSource === 'EXPENSES' ? getBankBadge(item.bank, item.customBank) : (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100">{item.paymentMethod}</span>
                      )}
                    </td>
                    <td className={`px-8 py-5 text-right font-black ${sheetSource === 'EXPENSES' ? 'text-red-500' : 'text-emerald-600'}`}>{formatCurrency(item.amount)}</td>
                    <td className="px-8 py-5 text-right w-10">
                      <button 
                        onClick={() => sheetSource === 'EXPENSES' ? onDeleteExpense(item.originalId) : onDeleteRevenue(item.id)} 
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-gray-900 text-white">
                  <td colSpan={sheetSource === 'EXPENSES' ? 4 : 3} className="px-8 py-6 text-xs font-black uppercase tracking-widest">Total Consolidado</td>
                  <td className="px-8 py-6 text-right font-black text-lg">{formatCurrency(totalFiltered)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetView;
