"use client";
import { CheckCircle, XCircle, RotateCcw, Home } from "lucide-react";
import type { QuestionSet } from "@/lib/questionGenerator";

type Props = {
  questionSet: QuestionSet;
  answers: boolean[];
  onSaveAndExit: () => void;
  onPlayAgain: () => void;
};

export default function ResultModal({
  questionSet,
  answers,
  onSaveAndExit,
  onPlayAgain,
}: Props) {
  const score = answers.filter(Boolean).length;
  const total = answers.length;
  const pct = Math.round((score / total) * 100);
  const good = pct >= 80;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* ヘッダー */}
        <div className={`py-6 text-center ${good ? "bg-green-500" : "bg-orange-400"}`}>
          <p className="text-white text-sm font-semibold mb-1">
            {questionSet.distributionName}
          </p>
          <p className="text-white text-5xl font-bold">
            {score} <span className="text-2xl">/ {total}</span>
          </p>
          <p className="text-white/90 text-sm mt-1">{pct}% 正解</p>
        </div>

        {/* 問題別結果 */}
        <div className="p-4 space-y-2">
          {questionSet.questions.map((q, i) => (
            <div
              key={q.typeId}
              className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0"
            >
              <span className="text-gray-600">{q.typeLabel}</span>
              {answers[i] ? (
                <CheckCircle size={18} className="text-green-500" />
              ) : (
                <XCircle size={18} className="text-red-400" />
              )}
            </div>
          ))}
        </div>

        {/* アクション */}
        <div className="px-4 pb-4 space-y-2">
          <button
            onClick={onPlayAgain}
            className="w-full bg-blue-600 text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <RotateCcw size={16} />
            もう1セット
          </button>
          <button
            onClick={onSaveAndExit}
            className="w-full border border-gray-300 text-gray-700 font-semibold rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Home size={16} />
            保存して終了
          </button>
        </div>
      </div>
    </div>
  );
}
