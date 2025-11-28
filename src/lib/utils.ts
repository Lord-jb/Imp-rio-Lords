import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: any): string {
  if (!date) return '-';

  // Se é um Firestore Timestamp, converter para Date
  if (date.toDate && typeof date.toDate === 'function') {
    date = date.toDate();
  }
  // Se é uma string, converter para Date
  else if (typeof date === 'string') {
    date = new Date(date);
  }
  // Se é um número (timestamp em ms), converter para Date
  else if (typeof date === 'number') {
    date = new Date(date);
  }

  // Verificar se é uma data válida
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}