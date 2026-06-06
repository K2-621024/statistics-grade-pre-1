"use client";
import { useState, useEffect } from "react";
import { Lock, Unlock } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import MasteryRadarChart from "@/components/RadarChart";
import MathText from "@/components/MathText";
import {
  getWeaknessData,
  getUnlockStatus,
  type CategoryStat,
} from "@/lib/storage";
import { CATEGORIES, CHEAT_SHEET_TEXTS } from "@/lib/constants";

export default function WeaknessPage() {
  const [weaknessData, setWeaknessData] = useState<Record<string, CategoryStat>>({});
  const [unlockStatus, setUnlockStatus] = useState<Record<string, boolean>>({});
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    setWeaknessData(getWeaknessData());
    setUnlockStatus(getUnlockStatus());
  }, []);

  const unlockedEntries = Object.entries(CHEAT_SHEET_TEXTS).filter(
    ([key]) => unlockStatus[key]
  );
  const lockedCount = Object.keys(CHEAT_SHEET_TEXTS).length - unlockedEntries.length;

  return (
    <main className="min-h-screen flex flex-col pb-20">
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">弱点分析</h1>
          <p className="text-sm text-gray-500">カテゴリ別の習熟度</p>
        </div>

        {/* レーダーチャート */}
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

        {/* アンロックバッジ */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Unlock size={16} className="text-amber-500" />
            チートシート
          </h2>

          {unlockedEntries.length === 0 && (
            <div className="text-center py-4 text-gray-400 text-sm">
              <Lock size={32} className="mx-auto mb-2 text-gray-300" />
              <p>第5章の正答率80%以上でアンロック！</p>
              <p className="text-xs mt-1">{lockedCount}章分がロック中</p>
            </div>
          )}

          <div className="space-y-2">
            {unlockedEntries.map(([key, text]) => (
              <div key={key} className="border border-amber-200 rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedKey(expandedKey === key ? null : key)
                  }
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Unlock size={14} className="text-amber-500" />
                    <span className="text-sm font-semibold text-gray-700">
                      {key.replace("ch", "第")}章 チートシート
                    </span>
                  </div>
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

          {/* ロック中のバッジ一覧 */}
          {lockedCount > 0 && unlockedEntries.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {Object.keys(CHEAT_SHEET_TEXTS)
                .filter((k) => !unlockStatus[k])
                .map((key) => (
                  <div
                    key={key}
                    className="bg-gray-100 rounded-lg p-2 flex flex-col items-center text-gray-400"
                  >
                    <Lock size={16} />
                    <span className="text-xs mt-1">
                      {key.replace("ch", "第")}章
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
