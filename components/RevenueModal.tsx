
import React, { useState } from 'react';
import { Revenue, PaymentMethod } from '../types';

interface RevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (revenue: Revenue) => void;
}

const NAIL_SERVICES = [
  "Blindagem",
  "Alongamento",
  "Banho em Gel",
  "Banho em Gel com Esmaltação",
  "Esmaltação em Gel",
  "Alongamento com Esmaltação",
  "Plástica dos Pés",
  "Remoção",
  "Remoção com Esmaltação",
  "Pedicure",
  "Manicure+Pedicure",
  "Outro"
];

const RevenueModal: React.FC<RevenueModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [description, setDescription] = useState(NAIL_SERVICES[0]);
  const [customDescription, setCustomDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDescription = description === "Outro" ? customDescription : description;
    
    const newRevenue: Revenue = {
      id: crypto.randomUUID(),
      description: finalDescription || 'Serviço Prestado',
      amount: parseFloat(amount),
      date,
      paymentMethod,
      type: 'PROFESSIONAL' // Serviços são sempre faturamento do Stúdio
    };
    onAdd(newRevenue);
    onClose();
    setDescription(NAIL_SERVICES[0]);
    setCustomDescription('');
    setAmount('');
    setPaymentMethod('PIX');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-8 text-white">
          <h2 className="text-2xl font-bold font-display tracking-tight">Novo Atendimento</h2>
          <p className="text-emerald-50 text-xs font-medium mt-1">Registre o faturamento do serviço realizado</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Serviço Realizado</label>
            <select
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm border p-4 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold text-black bg-white"
            >
              {NAIL_SERVICES.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          {description === "Outro" && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Qual serviço?</label>
              <input
                required
                type="text"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Descreva o serviço..."
                className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm border p-4 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-black text-black bg-white"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Valor Recebido</label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-gray-400 font-bold text-sm">R$</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm border p-4 pl-10 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-black text-black bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Data</label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm border p-4 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold text-black bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Forma de Recebimento</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl mt-1">
              {(['PIX', 'CARD', 'CASH'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 text-[10px] font-black uppercase rounded-lg transition-all ${paymentMethod === method ? 'bg-white text-emerald-700 shadow-sm scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {method === 'PIX' ? 'Pix' : method === 'CARD' ? 'Cartão' : 'Dinheiro'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-4 border border-gray-200 rounded-2xl text-gray-500 hover:bg-gray-50 font-bold transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-emerald-100"
            >
              Confirmar Ganho
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RevenueModal;
