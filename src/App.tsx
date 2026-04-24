/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, History, RefreshCcw, LayoutDashboard, List, ShieldCheck } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { TransactionTable } from './components/TransactionTable';
import { StatementData } from './types';
import { extractTransactionsFromPDF } from './lib/gemini';
import { cn } from './lib/utils';

type ViewMode = 'dashboard' | 'transactions';

export default function App() {
  const [data, setData] = useState<StatementData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

  const handleUpload = async (input: { base64?: string; text?: string }) => {
    setIsProcessing(true);
    try {
      const extractedData = await extractTransactionsFromPDF(input);
      setData(extractedData);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setData(null);
    setViewMode('dashboard');
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer group" onClick={reset}>
          <div className="logo text-lg sm:text-xl font-extrabold tracking-tighter text-bento-primary">
            Statement<span className="text-bento-accent">Flow</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-white border border-bento-border rounded-full text-[11px] font-bold text-bento-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Finance_Admin</span>
          </div>
          {data && (
            <button 
              onClick={reset}
              className="w-10 h-10 flex items-center justify-center bg-white border border-bento-border rounded-xl text-bento-muted hover:text-bento-primary transition-colors shadow-sm"
              title="Process new statement"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
        <AnimatePresence mode="wait">
          {!data ? (
            <motion.div
              key="upload-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[70vh] sm:min-h-[60vh] space-y-8 sm:space-y-12"
            >
              <div className="text-center space-y-3 sm:space-y-4">
                <h2 className="text-3xl sm:text-5xl font-black text-bento-primary tracking-tight leading-[1.1]">
                  AI Precision <br />
                  <span className="text-bento-muted opacity-40">Financial Analytics</span>
                </h2>
                <p className="text-xs sm:text-sm text-bento-muted font-medium max-w-[280px] sm:max-w-sm mx-auto leading-relaxed">
                  Automatically parse complex PDF statements into actionable financial insights.
                </p>
              </div>
              <FileUpload onUpload={handleUpload} isProcessing={isProcessing} />
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl">
                <FeatureItem 
                  title="Amex & Chase" 
                  description="Multi-bank parsing logic." 
                />
                <FeatureItem 
                  title="99% Logic" 
                  description="Zero-shot data extraction." 
                />
                <FeatureItem 
                  title="Open Format" 
                  description="Standardized CSV exports." 
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="data-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Controls Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-bento-accent">
                    <History className="w-3 h-3" />
                    <span>Extraction Ready</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-bento-primary tracking-tight">
                    {data.summary.cardType || "Financial"} Overview
                  </h2>
                </div>

                <div className="flex w-full sm:w-auto bg-white p-1 rounded-2xl border border-bento-border shadow-sm">
                  <button
                    onClick={() => setViewMode('dashboard')}
                    className={cn(
                      "flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all",
                      viewMode === 'dashboard' ? "bg-bento-primary text-white shadow-lg" : "text-bento-muted hover:text-bento-primary"
                    )}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => setViewMode('transactions')}
                    className={cn(
                      "flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all",
                      viewMode === 'transactions' ? "bg-bento-primary text-white shadow-lg" : "text-bento-muted hover:text-bento-primary"
                    )}
                  >
                    <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Activity</span>
                  </button>
                </div>
              </div>

              {/* Content area wrapping Dashboard/Table */}
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {viewMode === 'dashboard' ? (
                  <Dashboard data={data} />
                ) : (
                  <TransactionTable data={data} />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-bento-border p-6 rounded-2xl shadow-sm text-center">
      <h4 className="font-bold text-bento-primary text-[11px] uppercase tracking-wider mb-2">{title}</h4>
      <p className="text-xs text-bento-muted font-medium leading-relaxed">{description}</p>
    </div>
  );
}
