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

type AnswerState =
  | { phase: "idle" }
  | { phase: "pending"; selectedId: string }
  | { phase: "answered"; selectedId: string; isCorrect: boolean };

export default function QuestionCard({
  question,
  onAnswer,
  onNext,
  isLast,
  requiresStatTable = false,
  onOpenStatTable,
}: Props) {
  const [state, setState] = useState<AnswerState>({ phase: "idle" });

  function handleSelect(opt: Option) {
    if (state.phase === "answered") return;
    setState({ phase: "pending", selectedId: opt.id });
  }

  function handleConfirm() {
    if (state.phase !== "pending") return;
    const opt = question.options.find((o) => o.id === state.selectedId);
    if (!opt) return;
    setState({ phase: "answered", selectedId: state.selectedId, isCorrect: opt.isCorrect });
    onAnswer(opt.isCorrect);
  }

  function optionStyle(opt: Option): string {
    if (state.phase === "idle") {
      return "bg-white border-gray-200 text-gray-900 hover:bg-blue-50 hover:border-blue-300 cursor-pointer";
    }
    if (state.phase === "pending") {
      if (opt.id === state.selectedId) {
        return "bg-blue-50 border-blue-500 text-gray-900 cursor-pointer";
      }
      return "bg-white border-gray-200 text-gray-900 hover:bg-blue-50 hover:border-blue-300 cursor-pointer";
    }
    // answered
    if (opt.isCorrect) {
      return "bg-green-50 border-green-400 text-green-800";
    }
    if (opt.id === state.selectedId) {
      return "bg-red-50 border-red-400 text-red-800";
    }
    return "bg-white border-gray-200 text-gray-400";
  }

  const answered = state.phase === "answered";
  const pending = state.phase === "pending";

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
            disabled={answered}
            className={`w-full text-left border-2 rounded-lg px-4 py-3 text-sm transition-all flex items-start gap-3 ${optionStyle(opt)}`}
          >
            <span className="font-bold min-w-[1.2rem]">{opt.id}.</span>
            <span className="flex-1 min-w-0 overflow-x-auto">
              <MathText text={opt.text} />
            </span>
            {answered && opt.isCorrect && (
              <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
            )}
            {answered && opt.id === state.selectedId && !opt.isCorrect && (
              <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            )}
          </button>
        ))}
      </div>

      {/* 回答するボタン（pending 時） */}
      {pending && (
        <button
          onClick={handleConfirm}
          className="mt-4 w-full bg-blue-600 text-white font-semibold rounded-lg py-3 hover:bg-blue-700 transition-colors"
        >
          回答する
        </button>
      )}

      {/* 解説（answered 時） */}
      {answered && state.phase === "answered" && (
        <div className="mt-4 space-y-2">
          {!state.isCorrect && (() => {
            const selectedOpt = question.options.find((o) => o.id === state.selectedId);
            return selectedOpt?.explanation ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-gray-700">
                <p className="font-semibold text-orange-800 mb-1">この選択肢について</p>
                <MathText text={selectedOpt.explanation} />
              </div>
            ) : null;
          })()}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700">
            <p className="font-semibold text-yellow-800 mb-1">解説</p>
            <MathText text={question.explanation} />
          </div>
        </div>
      )}

      {/* 次へボタン（answered 時） */}
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
