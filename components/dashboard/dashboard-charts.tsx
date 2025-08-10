"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import React, { useMemo, useRef, useState } from "react";

// --- Data Type Definitions ---
interface DataPoint {
  emails?: number;
  total?: number;
  [key: string]: any;
}
interface DailyData extends DataPoint {
  date: string;
}
interface HourlyData extends DataPoint {
  time: string;
}
interface MonthlyData extends DataPoint {
  month: string;
}

interface RecentEmail {
  id: string;
  to: string;
  createdAt: string | Date;
}

interface DashboardChartsProps {
  emailsByDay: DailyData[];
  hoursData: HourlyData[];
  monthlyData: MonthlyData[];
  recentEmails: RecentEmail[];
}

export function DashboardCharts({
  emailsByDay,
  hoursData,
  monthlyData,
  recentEmails,
}: DashboardChartsProps) {
  // --- State and Config ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number; active: boolean; idx: number }>({ x: 0, y: 0, active: false, idx: -1 });
  const NEON_COLOR = "#ffffff"; // Monochrome white for all effects

  // --- Data Key Logic ---
  // Consistently use 'total' with a fallback to 'emails'
  const getDataKey = (data: DataPoint[]) => {
    if (data && data.length > 0 && 'total' in data[0]) {
      return 'total';
    }
    return 'emails';
  };

  const dailyDataKey = getDataKey(emailsByDay);
  const hourlyDataKey = getDataKey(hoursData);
  const monthlyDataKey = getDataKey(monthlyData);
  
  // Memoized sorted data for "Top" tables
  const getTopData = (data: any[], key: string) => {
    return [...data].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0)).slice(0, 3);
  };
  
  const topDays = useMemo(() => getTopData(emailsByDay, dailyDataKey), [emailsByDay, dailyDataKey]);
  const topHours = useMemo(() => getTopData(hoursData, hourlyDataKey), [hoursData, hourlyDataKey]);
  const topMonths = useMemo(() => getTopData(monthlyData, monthlyDataKey), [monthlyData, monthlyDataKey]);

  // --- UI Interaction Handlers ---
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, idx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPointer({ x, y, active: true, idx });
  };
  const handlePointerLeave = () => setPointer({ ...pointer, active: false, idx: -1 });

  const getCardStyle = (idx: number) => {
    const isHovered = pointer.active && pointer.idx === idx;
    if (isHovered) {
      return {
        boxShadow: `0 0 10px 1.5px ${NEON_COLOR}22`,
        border: `1px solid ${NEON_COLOR}44`,
        background: `radial-gradient(180px at ${pointer.x}px ${pointer.y}px, ${NEON_COLOR}0C, transparent 80%), #0a0a0a`,
        transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
      };
    }
    return {
      transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
      border: '1px solid #ffffff1a',
      background: '#0a0a0a',
    };
  };

  const renderAreaChart = (data: any[], xAxisKey: string, dataKey: string) => (
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
            <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={NEON_COLOR} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={NEON_COLOR} stopOpacity={0.05}/>
            </linearGradient>
        </defs>
        <XAxis dataKey={xAxisKey} stroke="#888" tick={{ fill: '#bbb', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis stroke="#888" tick={{ fill: '#bbb', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
        <ChartTooltip cursor={{ stroke: NEON_COLOR }} content={<ChartTooltipContent indicator="line" labelClassName="text-white" className="bg-black/80 border-white/20" />} />
        <Area type="monotone" dataKey={dataKey} stroke={NEON_COLOR} fill="url(#gradient-area)" strokeWidth={2} />
      </AreaChart>
  );

  const renderBarChart = (data: any[], xAxisKey: string, dataKey: string) => (
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey={xAxisKey} stroke="#888" tick={{ fill: '#bbb', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis stroke="#888" tick={{ fill: '#bbb', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false}/>
        <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
        <ChartTooltip cursor={{ fill: 'rgba(255,255,255,0.08)' }} content={<ChartTooltipContent labelClassName="text-white" className="bg-black/80 border-white/20"/>} />
        <Bar dataKey={dataKey} fill={NEON_COLOR} opacity={0.8} radius={[4, 4, 0, 0]} />
      </BarChart>
  );

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto w-full flex flex-col gap-6 relative text-white px-0 sm:px-0 bg-transparent">
      <div className="w-full flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* --- ROW 1: CHARTS --- */}
          <Card style={getCardStyle(0)} onPointerMove={e => handlePointerMove(e, 0)} onPointerLeave={handlePointerLeave} className="relative overflow-hidden">
            <CardHeader><CardTitle className="text-base font-medium text-gray-300">Hourly Distribution</CardTitle></CardHeader>
            <CardContent className="h-[200px]">
              <ChartContainer config={{ default: { color: NEON_COLOR } }}>
                <ResponsiveContainer width="100%" height="100%">{renderBarChart(hoursData, 'time', hourlyDataKey)}</ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card style={getCardStyle(1)} onPointerMove={e => handlePointerMove(e, 1)} onPointerLeave={handlePointerLeave} className="relative overflow-hidden">
            <CardHeader><CardTitle className="text-base font-medium text-gray-300">Daily Activity</CardTitle></CardHeader>
            <CardContent className="h-[200px]">
              <ChartContainer config={{ default: { color: NEON_COLOR } }}>
                <ResponsiveContainer width="100%" height="100%">{renderAreaChart(emailsByDay, 'date', dailyDataKey)}</ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card style={getCardStyle(2)} onPointerMove={e => handlePointerMove(e, 2)} onPointerLeave={handlePointerLeave} className="relative overflow-hidden">
            <CardHeader><CardTitle className="text-base font-medium text-gray-300">Monthly Trends</CardTitle></CardHeader>
            <CardContent className="h-[200px]">
              <ChartContainer config={{ default: { color: NEON_COLOR } }}>
                <ResponsiveContainer width="100%" height="100%">{renderAreaChart(monthlyData, 'month', monthlyDataKey)}</ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* --- ROW 2: TABLES & SUMMARY --- */}
          <Card style={getCardStyle(3)} onPointerMove={e => handlePointerMove(e, 3)} onPointerLeave={handlePointerLeave} className="relative overflow-hidden">
            <CardHeader><CardTitle className="text-base font-medium text-gray-300">Top Days</CardTitle></CardHeader>
            <CardContent><Table><TableHeader><TableRow><TableHead className="text-gray-400">Date</TableHead><TableHead className="text-right text-gray-400">Hits</TableHead></TableRow></TableHeader><TableBody>{topDays.map((d) => (<TableRow key={d.date} className="border-white/10"><TableCell className="font-medium">{d.date}</TableCell><TableCell className="text-right">{d[dailyDataKey] ?? 0}</TableCell></TableRow>))}</TableBody></Table></CardContent>
          </Card>

          <Card style={getCardStyle(4)} onPointerMove={e => handlePointerMove(e, 4)} onPointerLeave={handlePointerLeave} className="relative overflow-hidden">
            <CardHeader><CardTitle className="text-base font-medium text-gray-300">Top Hours</CardTitle></CardHeader>
            <CardContent><Table><TableHeader><TableRow><TableHead className="text-gray-400">Time</TableHead><TableHead className="text-right text-gray-400">Hits</TableHead></TableRow></TableHeader><TableBody>{topHours.map((h) => (<TableRow key={h.time} className="border-white/10"><TableCell className="font-medium">{h.time}</TableCell><TableCell className="text-right">{h[hourlyDataKey] ?? 0}</TableCell></TableRow>))}</TableBody></Table></CardContent>
          </Card>
          
          <Card style={getCardStyle(5)} onPointerMove={e => handlePointerMove(e, 5)} onPointerLeave={handlePointerLeave} className="relative overflow-hidden">
            <CardHeader><CardTitle className="text-base font-medium text-gray-300">Recent Emails</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-400">To</TableHead>
                    <TableHead className="text-right text-gray-400">Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEmails.length === 0 ? (
                    <TableRow className="border-white/10">
                      <TableCell colSpan={2} className="text-center text-gray-400">
                        No emails sent yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentEmails.slice(0, 3).map((email) => (
                      <TableRow key={email.id} className="border-white/10">
                        <TableCell className="font-medium text-gray-300 max-w-[200px] truncate">
                          {email.to}
                        </TableCell>
                        <TableCell className="text-right text-gray-400 text-xs">
                          {formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}