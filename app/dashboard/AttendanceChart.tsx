"use client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function AttendanceChart({ data }: { data: { bulan: string; hadir: number; total: number }[] }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";
  const barColor = isDark ? "#06d6ff" : "#0f172a";
  const textColor = isDark ? "#8891c9" : "#64748b";
  const gridColor = isDark ? "#2a3170" : "#f1f5f9";

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
        <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
        <Tooltip />
        <Bar dataKey="hadir" fill={barColor} radius={[4, 4, 0, 0]} name="Hadir" />
      </BarChart>
    </ResponsiveContainer>
  );
}