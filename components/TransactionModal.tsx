
import React, { useState, useEffect } from 'react';
import { Transaction, ExpenseType, Category, Bank, SubCategory } from '../types';
import { CreditCard, Landmark, Wallet } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Transaction) => void;
  defaultType: ExpenseType;
}

const PROFESSIONAL_FIXED_ITEMS = [
  { label: "Aluguel", sub: "ALUGUEL" },
  { label: "Água", sub: "ALUGUEL" },
  { label: "Energia", sub: "ALUGUEL" },
  { label: "Internet", sub: "ALUGUEL" },
  { label: "Aluguel da Cadeira", sub: "ALUGUEL" }
];

const PROFESSIONAL_VARIABLE_ITEMS = [
  { label: "Gel", sub: "MATERIAL" },
  { label: "Cabine", sub: "CURSOS" },
  { label: "Instrumentos", sub: "MATERIAL" },
  { label: "Produtos Nail", sub: "MATERIAL" },
  { label: "Alimentação Stúdio", sub: "OUTROS" },
  { label: "Descartáveis", sub: "MATERIAL" },
  { label: "Mercado (Stúdio)", sub: "MATERIAL" },
  { label: "Manutenção do Ar", sub: "OUTROS" },
  { label: "Taxa com o Cartão", sub: "MARKETING" },
  { label: "MEI / Impostos", sub: "IMPOSTOS" }
];

const PERSONAL_ITEMS = [
  { label: "Moradia", sub: "MORADIA" },
  { label: "Supermercado", sub: "ALIMENTACAO" },
  { label: "Restaurante/Lazer", sub: "LAZER" },
  { label: "Transporte/Combustível", sub: "TRANSPORTE" },
  { label: "Saúde/Farmácia", sub: "SAUDE" },
  { label: "Educação/Cursos", sub: "OUTROS" },
  { label: "Vestuário", sub: "OUTROS" }
];

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onAdd, defaultType }) => {
  const [description, setDescription] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<ExpenseType>(defaultType);
  const [category, setCategory] = useState<Category>('VARIABLE');
  const [subCategory, setSubCategory] = useState<SubCategory>('OUTROS');
  const [bank, setBank] = useState<Bank>('CASH');
  const [customBank, setCustomBank] = useState('');
  const [installments, setInstallments] = useState('1');

  useEffect(() => {
    setType(defaultType);
  }, [defaultType, isOpen]);

  if (!isOpen) return null;

  const getItemsList = () => {
    if (type === 'PERSONAL') return PERSONAL_ITEMS;
    return category === 'FIXED' ? PROFESSIONAL_FIXED_ITEMS : PROFESSIONAL_VARIABLE_ITEMS;
  };

  const handleItemSelect = (val: string) => {
    setDescription(val);
    if (val !== 'Outro') {
      const item = getItemsList().find(i => i.label === val);
      if (item) setSubCategory(item.sub as SubCategory);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDescription = description === 'Outro' ? customDescription : description;
    
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      description: finalDescription || 'Gasto sem descrição',
      amount: parseFloat(amount),
      date,
      type,
      category,
      subCategory,
      bank,
      customBank: bank === 'OTHER' ? customBank : undefined,
      installments: parseInt(installments) || 1,
    };
    onAdd(newTransaction);
    onClose();
    setDescription('');
    setCustomDescription('');
    setAmount('');
    setInstallments('1');
    setCustomBank('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-vibrantPink-400 to-vibrantPink-600 p-8 text-white">
          <h2 className="text-2xl font-bold font-display tracking-tight">Nova Despesa</h2>
          <p className="text-vibrantPink-50 text-[11px] font-medium mt-1 tracking-wide">Registre seu gasto com precisão.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Destino</label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button type="button" onClick={() => setType('PROFESSIONAL')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${type === 'PROFESSIONAL' ? 'bg-white text-vibrantPink-600 shadow-sm' : 'text-gray-400'}`}>Stúdio</button>
                <button type="button" onClick={() => setType('PERSONAL')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${type === 'PERSONAL' ? 'bg-white text-vibrantPink-600 shadow-sm' : 'text-gray-400'}`}>Pessoal</button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Tipo de Gasto</label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button type="button" onClick={() => setCategory('VARIABLE')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${category === 'VARIABLE' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400'}`}>Variável</button>
                <button type="button" onClick={() => setCategory('FIXED')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${category === 'FIXED' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`}>Fixo</button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Onde Gastei?</label>
            <select required value={description} onChange={(e) => handleItemSelect(e.target.value)} className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm border p-3 focus:ring-vibrantPink-500 focus:border-vibrantPink-500 text-sm font-bold bg-white text-black">
              <option value="" disabled className="text-gray-400">Selecione o gasto...</option>
              {getItemsList().map(item => (
                <option key={item.label} value={item.label} className="text-black font-semibold">{item.label}</option>
              ))}
              <option value="Outro" className="text-black font-semibold">Outro (Digitar...)</option>
            </select>
          </div>

          {description === "Outro" && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Descrição do Gasto</label>
              <input required type="text" value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} placeholder="Ex: Reforma da Fachada..." className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm border p-3 focus:ring-vibrantPink-500 focus:border-vibrantPink-500 text-sm font-black text-black bg-white" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Valor Total</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400 font-bold text-sm">R$</span>
                <input required type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm border p-3 pl-10 focus:ring-vibrantPink-500 focus:border-vibrantPink-500 text-sm font-black text-black bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Data Inicial</label>
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm border p-3 focus:ring-vibrantPink-500 focus:border-vibrantPink-500 text-sm font-bold text-black bg-white" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
               {category === 'FIXED' ? 'Duração (Quantidade de Meses)' : 'Parcelas (Divisão Automática)'}
            </label>
            <div className="relative group">
               <CreditCard className="absolute left-3 top-3.5 w-4 h-4 text-gray-300 group-focus-within:text-vibrantPink-500 transition-colors" />
               <input type="number" min="1" max="48" value={installments} onChange={(e) => setInstallments(e.target.value)} className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm border p-3 pl-10 focus:ring-vibrantPink-500 focus:border-vibrantPink-500 text-sm font-black text-black bg-white" />
            </div>
            <p className="text-[9px] text-gray-400 mt-1 italic font-medium">
               {category === 'FIXED' ? '*O valor será repetido integralmente por todos os meses.' : '*O valor total será dividido pelo número de meses.'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Cartão / Banco / Pix</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setBank('NUBANK')} className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-xs font-bold ${bank === 'NUBANK' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-100 text-gray-400'}`}>
                   <div className="w-4 h-4 rounded-full bg-purple-500"></div> Nubank
                </button>
                <button type="button" onClick={() => setBank('BRADESCO')} className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-xs font-bold ${bank === 'BRADESCO' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-100 text-gray-400'}`}>
                   <div className="w-4 h-4 rounded-full bg-red-600"></div> Bradesco
                </button>
                <button type="button" onClick={() => setBank('CASH')} className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-xs font-bold ${bank === 'CASH' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-100 text-gray-400'}`}>
                   <Wallet size={16} /> Pix / Dinheiro
                </button>
                <button type="button" onClick={() => setBank('OTHER')} className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-xs font-bold ${bank === 'OTHER' ? 'bg-gray-100 border-gray-300 text-black' : 'bg-white border-gray-100 text-gray-400'}`}>
                   <Landmark size={16} /> Outro Banco
                </button>
              </div>
            </div>

            {bank === 'OTHER' && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nome do Banco</label>
                <input required type="text" value={customBank} onChange={(e) => setCustomBank(e.target.value)} placeholder="Ex: Itaú, Inter, Santander..." className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm border p-3 focus:ring-vibrantPink-500 focus:border-vibrantPink-500 text-sm font-black text-black bg-white" />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-gray-500 hover:bg-gray-50 font-bold transition-colors text-sm">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-vibrantPink-500 text-white rounded-2xl hover:bg-vibrantPink-600 font-bold transition-all shadow-lg shadow-vibrantPink-100 text-sm">Salvar Gasto</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
