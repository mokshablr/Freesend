"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import React, { useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface DashboardChartsProps {
  emailsByDay: Array<{
    date: string;
    emails: number;
    fullDate: string;
  }>;
  hoursData: Array<{
    hour: number;
    time: string;
    emails: number;
  }>;
  monthlyData: Array<{
    month: string;
    emails: number;
    apiKeys: number;
  }>;
  apiKeyStatusData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  totalApiKeys: number;
  activeApiKeys: number;
}

export function DashboardCharts({
  emailsByDay,
  hoursData,
  monthlyData,
  apiKeyStatusData,
  totalApiKeys,
  activeApiKeys
}: DashboardChartsProps) {
  // Chart configurations
  const chartConfig = {
    emails: {
      label: "Emails Sent",
      color: "#00f0ff", // Neon cyan
    },
    apiKeys: {
      label: "API Keys",
      color: "#ff00ea", // Neon magenta
    },
  };

  // Unified pointer tracking for all elements
  const [pointer, setPointer] = useState<{ x: number; y: number; active: boolean; idx: number }>({ x: 0, y: 0, active: false, idx: -1 });
  const pageRef = useRef<HTMLDivElement>(null);

  // Minimal table data (example: top 5 days, top 5 hours)
  const topDays = [...emailsByDay].sort((a, b) => b.emails - a.emails).slice(0, 5);
  const topHours = [...hoursData].sort((a, b) => b.emails - a.emails).slice(0, 5);

  // Subtle neon glow style for all elements
  const getSubtleNeonStyle = (idx: number) => {
    if (pointer.active && pointer.idx === idx) {
      return {
        boxShadow: `0 0 2px 0.5px #00f0ff22`,
        border: `1px solid #00f0ff44`,
        background: `radial-gradient(180px at ${pointer.x}px ${pointer.y}px, #00f0ff08, transparent 90%)`,
        transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
      };
    }
    return {
      transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
    };
  };

  // Add chart metric selector state
  const [selectedMetric, setSelectedMetric] = useState<'successful' | 'failed' | 'total'>('successful');

  // Example: extend emailsByDay, hoursData, monthlyData to support all metrics (assume data shape is updated)
  // If not, you will need to update your data fetching to include these fields.

  // Table headers for all tables
  const renderTableHeader = () => (
    <TableHeader>
      <TableRow>
        <TableHead>Date</TableHead>
        <TableHead>Total Hit</TableHead>
        <TableHead>Successful</TableHead>
        <TableHead>Failed</TableHead>
      </TableRow>
    </TableHeader>
  );

  // Table row renderer for daily, hourly, monthly
  const renderTableRows = (data: any[], dateKey: string) => (
    <TableBody>
      {data.map(row => (
        <TableRow key={row[dateKey]}>
          <TableCell>{row[dateKey]}</TableCell>
          <TableCell>{(row.total ?? row.emails) === 0 ? '-' : (row.total ?? row.emails ?? '-')}</TableCell>
          <TableCell>{(row.successful ?? row.emails) === 0 ? '-' : (row.successful ?? row.emails ?? '-')}</TableCell>
          <TableCell>{(row.failed ?? 0) === 0 ? '-' : (row.failed ?? 0)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  return (
    <div 
      ref={pageRef}
      className="w-full flex flex-col gap-8 relative"
      onPointerMove={e => {
        if (!pageRef.current) return;
        const container = pageRef.current.getBoundingClientRect();
        const globalX = e.clientX - container.left;
        const globalY = e.clientY - container.top;
        setPointer({ x: globalX, y: globalY, active: true, idx: pointer.idx });
      }}
      onPointerLeave={() => setPointer({ ...pointer, active: false, idx: -1 })}
    >
      {/* Page-wide subtle pointer-following neon glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={pointer.active ? {
          background: `radial-gradient(250px at ${pointer.x}px ${pointer.y}px, #00f0ff08, transparent 90%)`,
          transition: 'background 0.2s',
        } : { transition: 'background 0.2s' }}
      />
      <Tabs defaultValue="daily" className="w-full relative z-10">
        <div className="rounded-xl border border-border bg-background/60 mb-6 relative overflow-hidden">
          <TabsList className="flex w-full justify-between gap-2 bg-transparent p-0">
            <TabsTrigger value="daily" className="flex-1 text-base font-medium data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-white data-[state=active]:shadow-[0_0_4px_#00f0ff33] transition-all">Daily</TabsTrigger>
            <TabsTrigger value="hourly" className="flex-1 text-base font-medium data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-white data-[state=active]:shadow-[0_0_4px_#00f0ff33] transition-all">Hourly</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1 text-base font-medium data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-white data-[state=active]:shadow-[0_0_4px_#00f0ff33] transition-all">Monthly</TabsTrigger>
          </TabsList>
          {/* Subtle pointer-following border glow */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={pointer.active ? {
              background: `radial-gradient(60px at ${pointer.x}px ${pointer.y}px, #00f0ff22, transparent 90%)`,
              transition: 'background 0.2s',
            } : { transition: 'background 0.2s' }}
          />
        </div>
        <TabsContent value="daily">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Area Chart: Daily Emails */}
            <div
              className="rounded-2xl bg-[#0a0a0a] p-6 shadow-xl border border-[#e5e7eb]/10 relative overflow-hidden transition-all"
              style={getSubtleNeonStyle(0)}
              onPointerMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const localX = e.clientX - rect.left;
                const localY = e.clientY - rect.top;
                setPointer({ x: localX, y: localY, active: true, idx: 0 });
              }}
              onPointerLeave={() => setPointer({ ...pointer, active: false, idx: -1 })}
            >
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={emailsByDay}>
                    <defs>
                      <linearGradient id="neonCyan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#00f0ff" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey={emailsByDay[0] && 'total' in emailsByDay[0] ? 'total' : 'emails'}
                      stroke="#00f0ff"
                      fill="url(#neonCyan)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#00f0ff', stroke: '#fff', strokeWidth: 1 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            {/* Table: Top Days */}
            <div 
              className="rounded-2xl bg-[#0a0a0a] p-6 shadow-xl border border-[#e5e7eb]/10 flex flex-col justify-between relative transition-all"
              style={getSubtleNeonStyle(1)}
              onPointerMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const localX = e.clientX - rect.left;
                const localY = e.clientY - rect.top;
                setPointer({ x: localX, y: localY, active: true, idx: 1 });
              }}
              onPointerLeave={() => setPointer({ ...pointer, active: false, idx: -1 })}
            >
              <h3 className="text-lg font-semibold mb-4 text-white relative z-10">Top Days</h3>
              <div className="relative z-10">
                <Table>
                  {renderTableHeader()}
                  {renderTableRows(topDays, 'date')}
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="hourly">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bar Chart: Hourly Distribution */}
            <div
              className="rounded-2xl bg-[#0a0a0a] p-6 shadow-xl border border-[#e5e7eb]/10 relative overflow-hidden transition-all"
              style={getSubtleNeonStyle(2)}
              onPointerMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const localX = e.clientX - rect.left;
                const localY = e.clientY - rect.top;
                setPointer({ x: localX, y: localY, active: true, idx: 2 });
              }}
              onPointerLeave={() => setPointer({ ...pointer, active: false, idx: -1 })}
            >
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={hoursData}>
                    <XAxis dataKey="time" stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey={hoursData[0] && 'total' in hoursData[0] ? 'total' : 'emails'} fill="#ff00ea" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            {/* Table: Top Hours */}
            <div 
              className="rounded-2xl bg-[#0a0a0a] p-6 shadow-xl border border-[#e5e7eb]/10 flex flex-col justify-between relative transition-all"
              style={getSubtleNeonStyle(3)}
              onPointerMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const localX = e.clientX - rect.left;
                const localY = e.clientY - rect.top;
                setPointer({ x: localX, y: localY, active: true, idx: 3 });
              }}
              onPointerLeave={() => setPointer({ ...pointer, active: false, idx: -1 })}
            >
              <h3 className="text-lg font-semibold mb-4 text-white relative z-10">Top Hours</h3>
              <div className="relative z-10">
                <Table>
                  {renderTableHeader()}
                  {renderTableRows(topHours, 'time')}
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="monthly">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Area Chart: Emails Sent (Monthly) */}
            <div
              className="rounded-2xl bg-[#0a0a0a] p-6 shadow-xl border border-[#e5e7eb]/10 relative overflow-hidden transition-all"
              style={getSubtleNeonStyle(4)}
              onPointerMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const localX = e.clientX - rect.left;
                const localY = e.clientY - rect.top;
                setPointer({ x: localX, y: localY, active: true, idx: 4 });
              }}
              onPointerLeave={() => setPointer({ ...pointer, active: false, idx: -1 })}
            >
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="neonCyanMonthly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#00f0ff" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey={monthlyData[0] && 'total' in monthlyData[0] ? 'total' : 'emails'}
                      stroke="#00f0ff"
                      fill="url(#neonCyanMonthly)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#00f0ff', stroke: '#fff', strokeWidth: 1 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            {/* Table: Top Months by Emails */}
            <div 
              className="rounded-2xl bg-[#0a0a0a] p-6 shadow-xl border border-[#e5e7eb]/10 flex flex-col justify-between relative transition-all"
              style={getSubtleNeonStyle(5)}
              onPointerMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const localX = e.clientX - rect.left;
                const localY = e.clientY - rect.top;
                setPointer({ x: localX, y: localY, active: true, idx: 5 });
              }}
              onPointerLeave={() => setPointer({ ...pointer, active: false, idx: -1 })}
            >
              <h3 className="text-lg font-semibold mb-4 text-white relative z-10">Top Months</h3>
              <div className="relative z-10">
                <Table>
                  {renderTableHeader()}
                  {monthlyData && monthlyData.length > 0
                    ? renderTableRows([...monthlyData]
                        .filter(row => row && row.month)
                        .sort((a, b) => {
                          // Parse month string to Date for correct sorting
                          const parseMonth = (m) => {
                            // Try to parse 'Jul 2025' as Date
                            const d = Date.parse('01 ' + m);
                            return isNaN(d) ? 0 : d;
                          };
                          return parseMonth(b.month) - parseMonth(a.month);
                        })
                        .slice(0, 5), 'month')
                    : null}
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
