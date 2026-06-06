"use client";
import { useState } from "react";
import { CheckCircle, XCircle, ChevronRight, TableProperties } from "lucide-react";
import MathText from "./MathText";
import type { GeneratedQuestion, Option } from "@/lib/questionGenerator";

type Props = {
  question: GeneratedQuestion;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  isLast: boolean;
  requiresStatTable?: boolean;
  onOpenStatTable?: () => void;
};

export default function QuestionCard({
  question,
  onAnswer,
  onNext,
  isLast,
  requiresStatTable = false,
  onOpenStatTable,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;

  function handleSelect(opt: Option) {
    if (answered) return;
    setSelected(opt.id);
    onAnswer(opt.isCorrect);
  }

  function optionStyle(opt: Option): string {
    if (!answered) {
      return "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer";
    }
    if (opt.isCorrect) {
      return "bg-green-50 border-green-400 text-green-800";
    }
    if (opt.id === selected) {
      return "bg-red-50 border-red-400 text-red-800";
    }
    return "bg-white border-gray-200 text-gray-400";
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      {/* 問題タイプラベル */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold bg-blue-100 text-blue-700 rounded-full px-3 py-0.5">
          {question.typeLabel}
        </span>
        {requiresStatTable && onOpenStatTable && (
          <button
            onClick={onOpenStatTable}
            className="flex items-center gap-1 text-xs text-blue-600 border border-blue-300 rounded-full px-2 py-0.5 hover:bg-blue-50"
          >
            <TableProperties size={12} />
            数値表
          </button>
        )}
      </div>

      {/* 問題文 */}
      <p className="text-sm font-medium text-gray-800 mb-4 leading-relaxed">
        <MathText text={question.questionText} />
      </p>

      {/* 選択肢 */}
      <div className="space-y-2">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt)}
            className={`w-full text-left border-2 rounded-lg px-4 py-3 text-sm transition-all flex items-start gap-3 ${optionStyle(opt)}`}
          >
            <span className="font-bold min-w-[1.2rem]">{opt.id}.</span>
            <span className="flex-1 break-all">
              <MathText text={opt.text} />
            </span>
            {answered && opt.isCorrect && (
              <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
            )}
            {answered && opt.id === selected && !opt.isCorrect && (
              <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            )}
          </button>
        ))}
      </div>

      {/* 解説 */}
      {answered && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700">
          <p className="font-semibold text-yellow-800 mb-1">解説</p>
          <MathText text={question.explanation} />
        </div>
      )}

      {/* 次へボタン */}
      {answered && (
        <button
          onClick={onNext}
          className="mt-4 w-full bg-blue-600 text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          {isLast ? "結果を見る" : "次へ"}
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
