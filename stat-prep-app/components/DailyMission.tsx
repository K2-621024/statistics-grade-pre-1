"use client";
import { Zap } from "lucide-react";
import type { DailyMissionState } from "@/lib/storage";

type Props = {
  mission: DailyMissionState | null;
  onStart: () => void;
};

export default function DailyMission({ mission, onStart }: Props) {
  const completed = mission?.completedKeys.length ?? 0;
  const total = mission?.targetKeys.length ?? 2;
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const done = completed >= total && total > 0;

  return (
    <div
      className={`rounded-xl p-4 mb-4 ${
        done ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap size={18} className={done ? "text-green-500" : "text-amber-500"} />
          <span className="text-sm font-semibold text-gray-700">今日の復習</span>
        </div>
        <span className="text-xs text-gray-500">
          {completed} / {total} セット完了
        </span>
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            done ? "bg-green-500" : "bg-amber-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {!done && (
        <button
          onClick={onStart}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg py-2 text-sm transition-colors"
        >
          デイリーミッション開始
        </button>
      )}
      {done && (
        <p className="text-center text-green-600 text-sm font-semibold">
          今日のミッション完了！🎉
        </p>
      )}
    </div>
  );
}
