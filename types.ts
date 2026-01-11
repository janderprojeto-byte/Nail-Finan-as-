
export type ExpenseType = 'PERSONAL' | 'PROFESSIONAL';
export type Category = 'FIXED' | 'VARIABLE';
export type Bank = 'NUBANK' | 'BRADESCO' | 'CASH' | 'OTHER';
export type PaymentMethod = 'CARD' | 'CASH' | 'PIX';

export type PersonalSubCategory = 
  | 'MORADIA' 
  | 'ALIMENTACAO' 
  | 'TRANSPORTE' 
  | 'LAZER' 
  | 'SAUDE' 
  | 'EDUCACAO'
  | 'BELEZA'
  | 'OUTROS';

export type ProfessionalSubCategory = 
  | 'MATERIAL' 
  | 'CURSOS' 
  | 'MARKETING' 
  | 'ALUGUEL' 
  | 'IMPOSTOS' 
  | 'OUTROS';

export type SubCategory = PersonalSubCategory | ProfessionalSubCategory;

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string
  type: ExpenseType;
  category: Category;
  subCategory: SubCategory;
  bank: Bank;
  customBank?: string;
  installments: number;
}

export interface Revenue {
  id: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  type: ExpenseType;
}

export interface MonthlyExpense {
  id: string;
  originalId: string;
  description: string;
  amount: number;
  currentInstallment: number;
  totalInstallments: number;
  bank: Bank;
  customBank?: string;
  category: Category;
  subCategory: SubCategory;
  type: ExpenseType;
  date: string;
}

export type WithdrawalType = 'PRO_LABORE' | 'PROFIT';
export type ProLaboreFrequency = 'DAILY' | 'WEEKLY' | '15_DAYS' | '20_DAYS' | 'MONTHLY';
export type ProfitCycle = 1 | 3 | 6 | 12;

export interface Withdrawal {
  id: string;
  amount: number;
  date: string;
  type: WithdrawalType;
  description: string;
}

export interface SmartDistributionItem {
  percent: number;
  amount: number;
  label: string;
  items: string;
}

export interface DistributionConfig {
  isCustom: boolean;
  fixed: number;
  variable: number;
  profit: number;
  investment: number;
  proLabore: number;
}

export interface UserSession {
  name: string;
  email: string;
  lastLogin: string;
}
