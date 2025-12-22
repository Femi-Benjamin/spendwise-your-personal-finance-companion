export type ExpenseCategory = 
  | 'food'
  | 'transportation'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'healthcare'
  | 'education'
  | 'housing'
  | 'other';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFormData {
  amount: number;
  category: ExpenseCategory;
  description?: string;
  expense_date: string;
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: 'Food & Dining',
  transportation: 'Transportation',
  utilities: 'Utilities',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  healthcare: 'Healthcare',
  education: 'Education',
  housing: 'Housing',
  other: 'Other',
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: 'hsl(24, 95%, 53%)',
  transportation: 'hsl(217, 91%, 60%)',
  utilities: 'hsl(271, 91%, 65%)',
  entertainment: 'hsl(330, 81%, 60%)',
  shopping: 'hsl(340, 82%, 52%)',
  healthcare: 'hsl(142, 76%, 36%)',
  education: 'hsl(199, 89%, 48%)',
  housing: 'hsl(45, 93%, 47%)',
  other: 'hsl(215, 16%, 47%)',
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  food: '🍔',
  transportation: '🚗',
  utilities: '💡',
  entertainment: '🎬',
  shopping: '🛒',
  healthcare: '🏥',
  education: '📚',
  housing: '🏠',
  other: '📦',
};
