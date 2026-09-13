"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function AttendanceDonut({ percent }: { percent: number }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";
  const data = [
    { name: "Hadir", value: percent },
    { name: "Sisa", value: 100 - percent },
  ];
  const COLORS = isDark ? ["#06d6ff", "#232a5c"] : ["#f59e0b", "#f1f5f9"];

  return (
    <div className="relative w-full flex items-center justify-center" style={{ height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={55} outerRadius={75} startAngle={90} endAngle={-270}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <p className={`text-2xl font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>{percent}%</p>
      </div>
    </div>
  );
}