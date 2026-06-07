"use client";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import MasteryRadarChart from "@/components/RadarChart";
import MathText from "@/components/MathText";
import { getWeaknessData, type CategoryStat } from "@/lib/storage";
import { CATEGORIES, CHEAT_SHEET_TEXTS } from "@/lib/constants";

export default function WeaknessPage() {
  const [weaknessData, setWeaknessData] = useState<Record<string, CategoryStat>>({});
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    setWeaknessData(getWeaknessData());
  }, []);

  return (
    <main className="min-h-screen flex flex-col pb-20">
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">弱点分析</h1>
          <p className="text-sm text-gray-600">カテゴリ別の習熟度</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <MasteryRadarChart data={weaknessData} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => {
              const stat = weaknessData[cat];
              const pct =
                stat && stat.total > 0
                  ? Math.round((stat.correct / stat.total) * 100)
                  : 0;
              return (
                <div key={cat} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500 leading-tight">{cat}</p>
                  <p className="text-lg font-bold text-blue-600">{pct}%</p>
                  <p className="text-xs text-gray-400">
                    {stat ? `${stat.correct}/${stat.total}問` : "未学習"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-gray-700 mb-3">チートシート</h2>
          <div className="space-y-2">
            {Object.entries(CHEAT_SHEET_TEXTS).map(([key, text]) => (
              <div
                key={key}
                className="border border-amber-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedKey(expandedKey === key ? null : key)
                  }
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-amber-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-700">
                    {key.replace("ch", "第")}章 チートシート
                  </span>
                  <span className="text-gray-400 text-xs">
                    {expandedKey === key ? "▲" : "▼"}
                  </span>
                </button>
                {expandedKey === key && (
                  <div className="px-4 py-3 bg-amber-50 text-sm text-gray-700 border-t border-amber-100">
                    <MathText text={text} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
