"use client";
import { useState, useEffect } from "react";
import { Calendar, CheckCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { getHistory, type SessionRecord } from "@/lib/storage";

export default function HistoryPage() {
  const [history, setHistory] = useState<SessionRecord[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  return (
    <main className="min-h-screen flex flex-col pb-20">
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">学習履歴</h1>
          <p className="text-sm text-gray-500">過去のセット結果</p>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p>まだ学習履歴がありません</p>
            <p className="text-xs mt-1">トップから学習を始めましょう！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record, i) => {
              const pct = Math.round((record.score / record.total) * 100);
              const good = pct >= 80;
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow px-4 py-3 flex items-center gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      good
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {pct}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {record.distributionName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {record.date}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-700">
                      {record.score} / {record.total}
                    </p>
                    <CheckCircle
                      size={14}
                      className={good ? "text-green-500 ml-auto" : "text-gray-300 ml-auto"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
