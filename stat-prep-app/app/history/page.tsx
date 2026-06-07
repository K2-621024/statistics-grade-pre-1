"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import BottomNav from "@/components/BottomNav";
import { getHistory, type SessionRecord } from "@/lib/storage";

const CHAPTER_COLORS: Record<number, string> = {
  5:  "#3b82f6",
  6:  "#10b981",
  7:  "#f59e0b",
  8:  "#ef4444",
  9:  "#8b5cf6",
  10: "#06b6d4",
};

function getChapterColor(chapterId: number): string {
  return CHAPTER_COLORS[chapterId] ?? "#6b7280";
}

export default function HistoryPage() {
  const [history, setHistory] = useState<SessionRecord[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const recentHistory = history.filter((r) => r.date >= cutoffStr);

  const dateChapterMap: Record<string, Record<string, number>> = {};
  for (const record of recentHistory) {
    if (!dateChapterMap[record.date]) dateChapterMap[record.date] = {};
    const chKey = `ch${record.chapterId}`;
    dateChapterMap[record.date][chKey] =
      (dateChapterMap[record.date][chKey] ?? 0) + 1;
  }

  const sortedDates = Object.keys(dateChapterMap).sort();
  const allChapters = [
    ...new Set(recentHistory.map((r) => r.chapterId)),
  ].sort((a, b) => a - b);

  const chartData = sortedDates.map((date) => ({
    date: date.slice(5),
    ...dateChapterMap[date],
  }));

  return (
    <main className="min-h-screen flex flex-col pb-20">
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <div className="-mx-4 -mt-6 px-4 pt-6 pb-4 bg-blue-600 mb-6">
          <h1 className="text-xl font-bold text-white">学習履歴</h1>
          <p className="text-sm text-blue-100">直近7日間の進捗グラフ</p>
        </div>

        {recentHistory.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p>直近7日間の学習履歴がありません</p>
            <p className="text-xs mt-1">トップから学習を始めましょう！</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-500 mb-3">解いた大問数（章別）</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
              >
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  width={24}
                />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                {allChapters.map((ch) => (
                  <Bar
                    key={ch}
                    dataKey={`ch${ch}`}
                    name={`第${ch}章`}
                    stackId="stack"
                    fill={getChapterColor(ch)}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
