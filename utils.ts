
import { Transaction, MonthlyExpense, Revenue, SmartDistributionItem, ProLaboreFrequency, DistributionConfig, ProfitCycle } from './types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const getMonthName = (month: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month];
};

const MOTIVATIONAL_QUOTES = [
  "Sua técnica é sua assinatura. Deixe sua marca de excelência em cada unha.",
  "O luxo está nos detalhes. Hoje, seja impecável no acabamento.",
  "Atendimento premium não é sobre o preço, é sobre como você faz ela se sentir.",
  "Sua mesa de trabalho é o seu palco. Organize seu sucesso.",
  "O conhecimento é o único acessório que nunca sai de moda. Estude sempre.",
  "Grandes nail designers não vendem apenas unhas, vendem confiança.",
  "A consistência é o que transforma uma amadora em uma referência.",
  "Seu Stúdio cresce na mesma velocidade que a sua mentalidade.",
  "Não pare até se orgulhar. O sucesso é a soma de pequenos esforços diários.",
  "Dificuldades são apenas degraus para o seu próximo nível profissional.",
  "Foque na solução, não no cansaço. O topo é para quem persiste.",
  "Sua mente é o seu maior ativo financeiro. Investimento nela primeiro.",
  "Pense como uma empresária, execute como uma artista.",
  "Você é a protagonista da sua história. Brilhe intensamente hoje.",
  "Que suas mãos sejam canais de bênção e beleza hoje.",
  "Trabalhe com gratidão e o universo conspirará para o seu faturamento.",
  "Coloque amor em cada pincelada e o resultado será divino."
];

export const getDailyQuote = (): string => {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
};

export const generateMonthlyExpenses = (
  transactions: Transaction[],
  targetMonth: number,
  targetYear: number
): MonthlyExpense[] => {
  const monthlyExpenses: MonthlyExpense[] = [];

  transactions.forEach((t) => {
    const d = new Date(t.date + 'T12:00:00');
    const purchaseMonth = d.getMonth();
    const purchaseYear = d.getFullYear();

    const monthsDiff = (targetYear - purchaseYear) * 12 + (targetMonth - purchaseMonth);

    if (monthsDiff >= 0 && monthsDiff < t.installments) {
      const monthlyAmount = t.category === 'FIXED' ? t.amount : t.amount / t.installments;

      monthlyExpenses.push({
        id: `${t.id}-${monthsDiff}`,
        originalId: t.id,
        description: t.description,
        amount: monthlyAmount,
        currentInstallment: monthsDiff + 1,
        totalInstallments: t.installments,
        bank: t.bank,
        customBank: t.customBank,
        category: t.category,
        subCategory: t.subCategory,
        type: t.type,
        date: t.date
      });
    }
  });

  return monthlyExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getMonthlyRevenues = (
  revenues: Revenue[],
  targetMonth: number,
  targetYear: number
): Revenue[] => {
  return revenues
    .filter(r => {
      const d = new Date(r.date + 'T12:00:00');
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getBusinessHealthStatus = (revenue: number, expense: number) => {
  if (revenue === 0 && expense === 0) return { label: 'Sem Dados', color: 'gray', icon: 'Activity' };
  if (revenue === 0 && expense > 0) return { label: 'Crítica', color: 'red', icon: 'AlertCircle' };
  const margin = ((revenue - expense) / revenue) * 100;
  if (margin < 0) return { label: 'Prejuízo', color: 'red', icon: 'TrendingDown' };
  if (margin < 20) return { label: 'Atenção', color: 'orange', icon: 'AlertTriangle' };
  if (margin < 50) return { label: 'Saudável', color: 'blue', icon: 'Activity' };
  return { label: 'Excelente', color: 'emerald', icon: 'Zap' };
};

export const calculateSmartDistribution = (totalRevenue: number, config?: DistributionConfig): Record<string, SmartDistributionItem> => {
  const useConfig = config?.isCustom && config;
  const percents = {
    fixed: useConfig ? config.fixed : 12.3,
    variable: useConfig ? config.variable : 20.0,
    profit: useConfig ? config.profit : 10.0,
    investment: useConfig ? config.investment : 10.0,
    proLabore: useConfig ? config.proLabore : 47.7
  };

  return {
    fixed: { percent: percents.fixed, amount: totalRevenue * (percents.fixed / 100), label: 'Gastos Fixos', items: 'Aluguel, Água, Luz, Net' },
    variable: { percent: percents.variable, amount: totalRevenue * (percents.variable / 100), label: 'Gastos Variáveis', items: 'Gel, Produtos, Taxas, Ar' },
    profit: { percent: percents.profit, amount: totalRevenue * (percents.profit / 100), label: 'Lucro Stúdio', items: 'Caixa de Emergência' },
    investment: { percent: percents.investment, amount: totalRevenue * (percents.investment / 100), label: 'Investimentos', items: 'Cursos, Equipamentos' },
    proLabore: { percent: percents.proLabore, amount: totalRevenue * (percents.proLabore / 100), label: 'Seu Pró-Labore', items: 'Salário Nail Designer' }
  };
};

export const SUB_CATEGORY_LABELS: Record<string, string> = {
  MORADIA: 'Moradia',
  ALIMENTACAO: 'Alimentação',
  TRANSPORTE: 'Transporte',
  LAZER: 'Lazer',
  SAUDE: 'Saúde',
  EDUCACAO: 'Educação',
  BELEZA: 'Beleza/Autocuidado',
  MATERIAL: 'Gel e Materiais',
  CURSOS: 'Cursos/Investimentos',
  MARKETING: 'Marketing/Taxas',
  ALUGUEL: 'Aluguel/Fixo',
  IMPOSTOS: 'Impostos/MEI',
  OUTROS: 'Outros'
};

export const FREQUENCY_LABELS: Record<ProLaboreFrequency, string> = {
  DAILY: 'Diário',
  WEEKLY: 'Semanal',
  '15_DAYS': 'Quinzenal (15 dias)',
  '20_DAYS': '20 dias',
  MONTHLY: 'Mensal'
};

export const getFrequencyDivisor = (freq: ProLaboreFrequency): number => {
  switch (freq) {
    case 'DAILY': return 30;
    case 'WEEKLY': return 4;
    case '15_DAYS': return 2;
    case '20_DAYS': return 1.5;
    case 'MONTHLY': return 1;
    default: return 1;
  }
};

export const generateProLaborePredictions = (
  targetMonth: number,
  targetYear: number,
  frequency: ProLaboreFrequency,
  monthlyRevenues: Revenue[],
  existingWithdrawals: { date: string, amount: number, type: string }[],
  proLaborePercent: number,
  proLaboreMode: 'PERCENT' | 'FIXED',
  fixedProLaboreValue: number,
  userStartDate?: string
) => {
  if (monthlyRevenues.length === 0) return [];
  
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const predictions: { date: string, amount: number }[] = [];
  
  const firstRevenueDate = new Date(Math.min(...monthlyRevenues.map(r => new Date(r.date + 'T12:00:00').getTime())));
  let effectiveStartDay = firstRevenueDate.getDate();
  
  if (userStartDate) {
    const userDate = new Date(userStartDate + 'T12:00:00');
    if (userDate.getMonth() === targetMonth && userDate.getFullYear() === targetYear) {
      effectiveStartDay = Math.max(effectiveStartDay, userDate.getDate());
    }
  }

  let intervalDays = 1;
  if (frequency === 'WEEKLY') intervalDays = 7;
  else if (frequency === '15_DAYS') intervalDays = 15;
  else if (frequency === '20_DAYS') intervalDays = 20;
  else if (frequency === 'MONTHLY') intervalDays = daysInMonth;

  for (let day = 1; day <= daysInMonth; day += intervalDays) {
    if (day < effectiveStartDay) continue;

    const currentDayStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateLimit = new Date(currentDayStr + 'T23:59:59').getTime();

    const revenueUntilNow = monthlyRevenues
      .filter(r => new Date(r.date + 'T12:00:00').getTime() <= dateLimit)
      .reduce((acc, r) => acc + r.amount, 0);

    if (revenueUntilNow === 0) continue;

    const maxProLaboreAvailable = revenueUntilNow * (proLaborePercent / 100);

    const alreadyWithdrawn = existingWithdrawals
      .filter(w => w.type === 'PRO_LABORE')
      .reduce((acc, w) => acc + w.amount, 0);

    const remainingAvailable = maxProLaboreAvailable - alreadyWithdrawn;

    const divisor = getFrequencyDivisor(frequency);
    const idealSlice = proLaboreMode === 'PERCENT' 
      ? (revenueUntilNow * (proLaborePercent / 100)) / divisor 
      : fixedProLaboreValue / divisor;

    let suggestedAmount = Math.min(idealSlice, remainingAvailable);

    if (suggestedAmount < 1) continue;

    const hasWithdrawalThisDay = existingWithdrawals.some(w => {
      const d = new Date(w.date.includes('T') ? w.date : w.date + 'T12:00:00');
      return d.getDate() === day && w.type === 'PRO_LABORE';
    });

    if (!hasWithdrawalThisDay) {
      predictions.push({
        date: currentDayStr,
        amount: suggestedAmount
      });
    }

    if (frequency === 'MONTHLY') break;
  }

  return predictions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
