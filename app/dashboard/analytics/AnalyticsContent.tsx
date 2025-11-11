'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, Target, BarChart3, Calendar } from 'lucide-react';
import { ProductionOverviewCard } from "@/components/production-overview-card";

type YieldRecord = {
  id: string;
  yield_amount: number;
  harvest_date: string;
  fields?: { name?: string; size_hectares?: number };
  crops?: { name?: string };
};

type AnalyticsContentProps = {
  cropPerformanceData: Array<{ crop: string; avgYield: number; revenue?: number; cost?: number; profit?: number }>;
  recentHarvestsData: Array<{ crop: string; yield: number; date: string }>;
  revenueChartData: Array<{ month: string; revenue: number; cost: number; profit: number }>;
  profitMargin: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  yieldRecords?: YieldRecord[];
};

export function AnalyticsContent({
  cropPerformanceData,
  recentHarvestsData,
  revenueChartData,
  profitMargin,
  totalRevenue,
  totalCost,
  totalProfit,
  yieldRecords
}: AnalyticsContentProps) {
  // Calculate max yield for percentage calculation
  const maxYield = Math.max(...cropPerformanceData.map(item => item.avgYield), 1);
  
  // State to track which bar types are hidden (toggled off)
  const [hiddenBars, setHiddenBars] = useState<Set<string>>(new Set());

  // Toggle bar visibility when clicked
  const toggleBar = (barType: string) => {
    setHiddenBars(prev => {
      const newSet = new Set(prev);
      if (newSet.has(barType)) {
        newSet.delete(barType);
      } else {
        newSet.add(barType);
      }
      return newSet;
    });
  };

  // Filter crop data: hide bars that are toggled off
  const filteredCropData = cropPerformanceData.map(item => {
    const filtered: Record<string, any> = { crop: item.crop };
    if (!hiddenBars.has('revenue')) filtered.revenue = item.revenue;
    if (!hiddenBars.has('cost')) filtered.cost = item.cost;
    if (!hiddenBars.has('profit')) filtered.profit = item.profit;
    if (!hiddenBars.has('avgYield')) filtered.avgYield = item.avgYield;
    return filtered;
  });

  return (
    <div className="space-y-6">
      {/* Revenue, Cost & Profit by Crop Chart Only */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Revenue, Cost & Profit by Crop</CardTitle>
          <CardDescription className="text-green-600">
            Click on a metric name below to toggle its visibility. Strikethrough indicates hidden bars.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Legend with clickable items */}
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => toggleBar('revenue')}
              className={`flex items-center gap-2 px-3 py-2 rounded border ${
                hiddenBars.has('revenue')
                  ? 'bg-gray-100 text-gray-600 line-through border-gray-300'
                  : 'bg-green-50 text-green-700 border-green-300'
              }`}
            >
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
              Revenue
            </button>
            <button
              onClick={() => toggleBar('cost')}
              className={`flex items-center gap-2 px-3 py-2 rounded border ${
                hiddenBars.has('cost')
                  ? 'bg-gray-100 text-gray-600 line-through border-gray-300'
                  : 'bg-orange-50 text-orange-700 border-orange-300'
              }`}
            >
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }}></div>
              Cost
            </button>
            <button
              onClick={() => toggleBar('profit')}
              className={`flex items-center gap-2 px-3 py-2 rounded border ${
                hiddenBars.has('profit')
                  ? 'bg-gray-100 text-gray-600 line-through border-gray-300'
                  : 'bg-blue-50 text-blue-700 border-blue-300'
              }`}
            >
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
              Profit
            </button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredCropData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="crop" tick={{ fontSize: 10, fill: "#059669" }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12, fill: "#059669" }} />
                <Tooltip />
                {!hiddenBars.has('revenue') && <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Revenue" />}
                {!hiddenBars.has('cost') && <Bar dataKey="cost" fill="#f97316" radius={[8, 8, 0, 0]} name="Cost" />}
                {!hiddenBars.has('profit') && <Bar dataKey="profit" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Profit" />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
