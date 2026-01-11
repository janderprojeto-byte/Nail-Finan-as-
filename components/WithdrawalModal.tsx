
import React, { useState, useEffect } from 'react';
import { Withdrawal, WithdrawalType } from '../types';
import { formatCurrency } from '../utils';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (withdrawal: Withdrawal) => void;
  type: WithdrawalType;
  maxAmount: number;
  preFilled?: { amount: number, date: string } | null;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, onAdd, type, maxAmount, preFilled }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (preFilled) {
        setAmount(preFilled.amount.toFixed(2));
        setDate(preFilled.date);
      } else {
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
      }
      setDescription('');
    }
  }, [isOpen, preFilled]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (val <= 0) return alert('Valor deve ser maior que zero');
    
    onAdd({
      id: crypto.randomUUID(),
      amount: val,
      date: new Date(date + 'T12:00:00').toISOString(), // Garantir meio-dia para evitar problemas de fuso
      type,
      description: description || (type === 'PRO_LABORE' ? 'Retirada de Pró-labore' : 'Retirada de Lucro')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-md text-sm">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className={`p-8 text-white ${type === 'PRO_LABORE' ? 'bg-vibrantPink-500' : 'bg-emerald-600'}`}>
          <h2 className="text-2xl font-bold font-display tracking-tight">Efetuar Retirada Real</h2>
          <p className="text-white/80 text-xs font-medium mt-1">
            {preFilled ? 'Confirme ou ajuste os dados da provisão.' : 'Registre uma nova retirada de caixa.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Valor Final</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400 font-bold">R$</span>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="0,00" 
                    className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm border p-4 pl-10 focus:ring-vibrantPink-500 focus:border-vibrantPink-500 font-black text-black bg-white" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Data Real</label>
                <input 
                    required 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm border p-4 focus:ring-vibrantPink-500 focus:border-vibrantPink-500 font-bold text-black bg-white" 
                />
              </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nota da Retirada</label>
            <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Ex: Pagamento da semana..." 
                className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm border p-4 focus:ring-vibrantPink-500 focus:border-vibrantPink-500 text-black bg-white font-bold" 
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Dica de Gestão</p>
              <p className="text-[11px] text-gray-600 leading-relaxed italic">
                Ao confirmar, este valor será descontado do saldo do seu **Stúdio** e registrado como um gasto profissional consolidado.
              </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-4 border border-gray-200 rounded-2xl text-gray-500 hover:bg-gray-50 font-bold transition-colors">Cancelar</button>
            <button type="submit" className={`flex-1 px-4 py-4 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg ${type === 'PRO_LABORE' ? 'bg-vibrantPink-500 hover:bg-vibrantPink-600 shadow-vibrantPink-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}>Confirmar Retirada</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalModal;
