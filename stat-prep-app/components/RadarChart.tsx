"use client";
import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CategoryStat } from "@/lib/storage";

type Props = { data: Record<string, CategoryStat> };

const CATEGORIES = [
  "確率と確率分布",
  "統計的推測",
  "多変量解析法",
  "種々の応用",
];

export default function MasteryRadarChart({ data }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chartData = CATEGORIES.map((cat) => {
    const stat = data[cat];
    const rate = stat && stat.total > 0
      ? Math.round((stat.correct / stat.total) * 100)
      : 0;
    return { subject: cat.replace("と", "と\n"), rate };
  });

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        チャートを読込中…
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: "#374151" }}
        />
        <Tooltip
          formatter={(v) => [`${v}%`, "正答率"]}
        />
        <Radar
          name="正答率"
          dataKey="rate"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.35}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
