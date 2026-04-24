/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { Download, Search, Filter, X, Check } from "lucide-react";
import Papa from "papaparse";
import { Transaction, StatementData } from "../types";
import { formatCurrency, cn } from "../lib/utils";

interface TransactionTableProps {
  data: StatementData;
}

export function TransactionTable({ data }: TransactionTableProps) {
  const { transactions, summary } = data;
  const [search, setSearch] = React.useState("");
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(transactions.map((t) => t.category)));
    return cats.sort();
  }, [transactions]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(t.category);
    return matchesSearch && matchesCategory;
  });

  const downloadCSV = () => {
    // Explicitly mapping fields to ensure perfect CSV alignment and prevent mismatch
    const exportData = filteredTransactions.map(t => ({
      Date: t.date,
      Description: t.description,
      Type: t.transactionType.toUpperCase(),
      Category: t.category,
      Amount: t.amount,
      Currency: summary.currency,
      Remarks: t.remarks
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `statement_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-bento-border rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-bento-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bento-muted" />
            <input
              type="text"
              placeholder="Search activity..."
              className="w-full pl-10 pr-4 py-2.5 bg-bento-bg border border-bento-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-bento-accent/10 transition-all placeholder:text-bento-muted"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95",
                selectedCategories.length > 0 
                  ? "bg-bento-accent/5 border-bento-accent text-bento-accent" 
                  : "bg-white border-bento-border text-bento-muted hover:text-bento-primary shadow-sm"
              )}
            >
              <Filter className="w-4 h-4" />
              <span>Categories</span>
              {selectedCategories.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-bento-accent text-white text-[10px] rounded-md">
                  {selectedCategories.length}
                </span>
              )}
            </button>

            {isFilterOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsFilterOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 bg-white border border-bento-border rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                  <div className="p-3 border-b border-bento-line flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-bento-muted">Filter Categories</span>
                    {selectedCategories.length > 0 && (
                      <button 
                        onClick={() => setSelectedCategories([])}
                        className="text-[10px] font-bold text-bento-accent hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto p-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm text-left"
                      >
                        <span className={cn(
                          "font-medium",
                          selectedCategories.includes(cat) ? "text-bento-accent" : "text-bento-primary"
                        )}>
                          {cat}
                        </span>
                        {selectedCategories.includes(cat) && (
                          <Check className="w-4 h-4 text-bento-accent" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={downloadCSV}
          className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-bento-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Download CSV</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white text-bento-muted font-bold border-b border-bento-line">
              <th className="px-6 py-4 text-[11px] uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[11px] uppercase tracking-widest">Description</th>
              <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-center">Type</th>
              <th className="px-6 py-4 text-[11px] uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-right">Amount</th>
              <th className="px-10 py-4 text-[11px] uppercase tracking-widest">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bento-line">
            {filteredTransactions.map((t, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-5 text-bento-muted text-xs font-medium tabular-nums">{t.date}</td>
                <td className="px-6 py-5">
                  <div className="font-bold text-bento-primary text-sm tracking-tight leading-snug">{t.description}</div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter",
                    t.transactionType === 'payment' ? "bg-purple-100 text-purple-700" :
                    t.transactionType === 'credit' ? "bg-emerald-100 text-emerald-700" :
                    "bg-slate-100 text-slate-700"
                  )}>
                    {t.transactionType}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight inline-block border",
                    t.category.toLowerCase().includes('food') ? "bg-orange-50 text-orange-700 border-orange-100" :
                    t.category.toLowerCase().includes('travel') ? "bg-blue-50 text-blue-700 border-blue-100" :
                    t.category.toLowerCase().includes('soft') ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                    "bg-slate-50 text-slate-600 border-slate-200"
                  )}>
                    {t.category}
                  </span>
                </td>
                <td className={cn(
                  "px-6 py-5 text-right font-black text-sm tracking-tight tabular-nums",
                  t.transactionType === 'credit' || t.transactionType === 'payment' ? "text-emerald-600" : "text-bento-primary"
                )}>
                  {t.transactionType === 'credit' || t.transactionType === 'payment' ? '-' : ''}
                  {formatCurrency(t.amount, summary.currency)}
                </td>
                <td className="px-10 py-5">
                  <div className="text-[11px] text-bento-accent font-black uppercase tracking-widest max-w-[200px] leading-relaxed italic opacity-80">{t.remarks}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredTransactions.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-sm font-bold text-bento-primary">No transactions found</p>
          <p className="text-xs text-bento-muted mt-1 tracking-tight">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
