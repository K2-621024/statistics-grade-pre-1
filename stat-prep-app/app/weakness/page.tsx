"use client";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import MasteryRadarChart from "@/components/RadarChart";
import {
  getWeaknessData,
  getMasteryData,
  type CategoryStat,
  type DistributionStat,
} from "@/lib/storage";
import { CATEGORIES, CHAPTER_TO_CATEGORY } from "@/lib/constants";

export default function WeaknessPage() {
  const [weaknessData, setWeaknessData] = useState<Record<string, CategoryStat>>({});
  const [masteryData, setMasteryData] = useState<Record<string, DistributionStat>>({});

  useEffect(() => {
    setWeaknessData(getWeaknessData());
    setMasteryData(getMasteryData());
  }, []);

  const masteryStats: Record<string, CategoryStat> = {};
  Object.entries(masteryData).forEach(([key, stat]) => {
    const chId = Number(key.split("_")[0]);
    const category = CHAPTER_TO_CATEGORY[chId];
    if (!category) return;
    if (!masteryStats[category]) masteryStats[category] = { correct: 0, total: 0 };
    masteryStats[category].total += 1;
    if (stat.consecutiveCorrect >= 3) masteryStats[category].correct += 1;
  });

  return (
    <main className="min-h-screen flex flex-col pb-20">
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <div className="-mx-4 -mt-6 px-4 pt-6 pb-4 bg-blue-600 mb-6">
          <h1 className="text-xl font-bold text-white">弱点分析</h1>
          <p className="text-sm text-blue-100">カテゴリ別の習熟度</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <MasteryRadarChart data={masteryStats} />
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
      </div>
      <BottomNav />
    </main>
  );
}
