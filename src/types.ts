/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  remarks: string;
  transactionType: 'debit' | 'credit' | 'payment';
}

export interface StatementData {
  transactions: Transaction[];
  summary: {
    totalSpent: number;
    totalCredits: number;
    period: string;
    currency: string;
    cardType?: string;
  };
}
