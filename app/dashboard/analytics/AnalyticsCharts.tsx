'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsChartsProps {
  recentHarvestsData: Array<{ crop: string; yield: number; date: string }>;
  cropPerformanceArray: Array<{
    crop: string;
    avgYield: number;
    totalYield?: number;
    revenue?: number;
    cost?: number;
    profit?: number;
  }>;
}

export function AnalyticsCharts({ recentHarvestsData, cropPerformanceArray }: AnalyticsChartsProps) {
  return (
    <>
      {/* 5. Recent Harvests */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-base font-medium text-green-800">Recent Harvests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentHarvestsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#059669" }} />
                <YAxis tick={{ fontSize: 12, fill: "#059669" }} />
                <Tooltip />
                <Bar dataKey="yield" fill="#10b981" radius={[8, 8, 0, 0]} name="Yield (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 6. Crop Performance */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-base font-medium text-green-800">Crop Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropPerformanceArray} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#059669" }} />
                <YAxis dataKey="crop" type="category" width={80} tick={{ fontSize: 11, fill: "#059669" }} />
                <Tooltip />
                <Bar dataKey="avgYield" fill="#22c55e" radius={[0, 8, 8, 0]} name="Avg Yield" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 7. Production Overview */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-base font-medium text-green-800">Production Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropPerformanceArray.map(item => ({
                    name: item.crop,
                    value: item.totalYield || 0
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(0)}kg`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cropPerformanceArray.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
