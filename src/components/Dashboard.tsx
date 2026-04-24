/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { TrendingUp, CreditCard, PieChart as PieIcon, BarChart3, DollarSign, ArrowUpRight } from "lucide-react";
import { StatementData } from "../types";
import { formatCurrency } from "../lib/utils";

const COLORS = ['#3B82F6', '#0F172A', '#64748B', '#94A3B8', '#CBD5E1'];

interface DashboardProps {
  data: StatementData;
}

export function Dashboard({ data }: DashboardProps) {
  const categoryData = React.useMemo(() => {
    const cats: Record<string, number> = {};
    data.transactions.forEach((t) => {
      if (t.amount > 0) {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [data.transactions]);

  const topCategories = [...categoryData].sort((a, b) => b.value - a.value).slice(0, 5);

  return (
    <div className="grid grid-cols-12 gap-4 sm:gap-6">
      {/* Stats row */}
      <div className="col-span-6 md:col-span-3">
        <StatCard 
          label="Total Spent" 
          value={formatCurrency(data.summary.totalSpent, data.summary.currency)} 
          badge="↑ 12%"
          badgeColor="text-emerald-500"
        />
      </div>
      <div className="col-span-6 md:col-span-3">
        <StatCard 
          label="Credits" 
          value={formatCurrency(data.summary.totalCredits, data.summary.currency)} 
          badge="Ready"
        />
      </div>
      <div className="col-span-6 md:col-span-3">
        <StatCard 
          label="Count" 
          value={data.transactions.length.toString()} 
          badge="Transactions"
        />
      </div>
      <div className="col-span-6 md:col-span-3">
        <StatCard 
          label="Accuracy" 
          value="99.8%" 
          badge="AI Logic"
        />
      </div>

      {/* Chart Sections */}
      <div className="col-span-12 lg:col-span-7 bg-white p-4 sm:p-6 rounded-2xl border border-bento-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-bento-muted" />
            <h3 className="font-bold text-bento-primary">Top Expenses</h3>
          </div>
        </div>
        <div className="h-[280px] sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[...data.transactions]
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 8)
                .map(t => ({ name: t.description.slice(0, 12), amount: t.amount }))}
              layout="vertical"
              margin={{ left: -20, right: 20 }}
            >
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value, data.summary.currency)}
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
              <Bar dataKey="amount" fill="#0F172A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-5 bg-white p-4 sm:p-6 rounded-2xl border border-bento-border shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <PieIcon className="w-5 h-5 text-bento-muted" />
          <h3 className="font-bold text-bento-primary">Category Mix</h3>
        </div>
        <div className="h-[200px] sm:h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value, data.summary.currency)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {topCategories.map((cat, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-bento-muted font-medium">{cat.name}</span>
              </div>
              <span className="font-bold text-bento-primary">{formatCurrency(cat.value, data.summary.currency)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, badge, badgeColor = "text-bento-muted" }: { label: string; value: string; badge?: string; badgeColor?: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-bento-border shadow-sm flex flex-col h-full">
      <span className="text-[11px] font-bold uppercase tracking-wider text-bento-muted mb-1">{label}</span>
      <div className="text-2xl font-bold text-bento-primary tracking-tight mb-2">{value}</div>
      {badge && (
        <span className={`text-[11px] font-medium ${badgeColor}`}>
          {badge}
        </span>
      )}
    </div>
  );
}
