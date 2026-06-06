"use client";
import { useState, useEffect } from "react";
import { BookOpen, PlayCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import DailyMission from "@/components/DailyMission";
import ScenarioBanner from "@/components/ScenarioBanner";
import QuestionCard from "@/components/QuestionCard";
import ResultModal from "@/components/ResultModal";
import StatTableModal from "@/components/StatTableModal";
import {
  generateQuestionSet,
  type QuestionSet,
  type ChapterFormat,
} from "@/lib/questionGenerator";
import {
  getDailyMission,
  generateDailyMission,
  markMissionSetComplete,
  saveSession,
  updateWeaknessData,
  updateMasteryData,
  checkAndUnlock,
  type DailyMissionState,
} from "@/lib/storage";

type AppMode =
  | { kind: "home" }
  | { kind: "session"; set: QuestionSet; qIndex: number; answers: boolean[] }
  | { kind: "result"; set: QuestionSet; answers: boolean[] };

const ALL_FORMAT_PATHS = ["/data/question_formats/ch05.json"];
const ALL_DISTRIBUTION_KEYS = [
  "5_discrete_uniform","5_hypergeometric","5_poisson","5_bernoulli",
  "5_binomial","5_geometric","5_negative_binomial","5_multinomial",
];

export default function HomePage() {
  const [mode, setMode] = useState<AppMode>({ kind: "home" });
  const [mission, setMission] = useState<DailyMissionState | null>(null);
  const [showStatTable, setShowStatTable] = useState(false);
  const [formats, setFormats] = useState<ChapterFormat[]>([]);

  useEffect(() => {
    Promise.all(ALL_FORMAT_PATHS.map((p) => fetch(p).then((r) => r.json()))).then(
      (loaded: ChapterFormat[]) => {
        setFormats(loaded);
        const today = new Date().toISOString().slice(0, 10);
        const existing = getDailyMission();
        if (existing && existing.date === today) {
          setMission(existing);
        } else {
          setMission(generateDailyMission(ALL_DISTRIBUTION_KEYS));
        }
      }
    );
  }, []);

  function startSession(format: ChapterFormat) {
    const set = generateQuestionSet(format);
    setMode({ kind: "session", set, qIndex: 0, answers: [] });
  }

  function startRandomSession() {
    if (formats.length === 0) return;
    const f = formats[Math.floor(Math.random() * formats.length)];
    startSession(f);
  }

  function startDailyMission() {
    if (!mission || formats.length === 0) return;
    const nextKey = mission.targetKeys.find(
      (k) => !mission.completedKeys.includes(k)
    );
    if (!nextKey) return;
    const chId = Number(nextKey.split("_")[0]);
    const format = formats.find((f) => f.chapter === chId);
    if (!format) return;
    startSession(format);
  }

  function handleAnswer(isCorrect: boolean) {
    if (mode.kind !== "session") return;
    const newAnswers = [...mode.answers, isCorrect];
    const atLast = mode.qIndex >= mode.set.questions.length - 1;
    if (atLast) {
      setMode({ kind: "result", set: mode.set, answers: newAnswers });
    } else {
      setMode({ ...mode, answers: newAnswers, qIndex: mode.qIndex + 1 });
    }
  }

  function handleSaveAndExit(set: QuestionSet, answers: boolean[]) {
    const score = answers.filter(Boolean).length;
    const key = `${set.chapterId}_${set.distributionId}`;
    const today = new Date().toISOString().slice(0, 10);

    saveSession({
      date: today,
      chapterId: set.chapterId,
      distributionId: set.distributionId,
      distributionName: set.distributionName,
      score,
      total: answers.length,
    });
    updateWeaknessData(set.chapterId, score, answers.length);
    updateMasteryData(key, score, answers.length);
    checkAndUnlock();

    if (mission && mission.targetKeys.includes(key)) {
      markMissionSetComplete(key);
      setMission(getDailyMission());
    }

    setMode({ kind: "home" });
  }

  // ── 結果画面 ──────────────────────────────────────────
  if (mode.kind === "result") {
    return (
      <ResultModal
        questionSet={mode.set}
        answers={mode.answers}
        onSaveAndExit={() => handleSaveAndExit(mode.set, mode.answers)}
        onPlayAgain={() => {
          handleSaveAndExit(mode.set, mode.answers);
          setTimeout(() => startRandomSession(), 0);
        }}
      />
    );
  }

  // ── セッション画面 ────────────────────────────────────
  if (mode.kind === "session") {
    const { set, qIndex } = mode;
    const question = set.questions[qIndex];
    const isLast = qIndex >= set.questions.length - 1;

    return (
      <main className="min-h-screen flex flex-col pb-20">
        <div className="max-w-lg mx-auto w-full px-4 pt-6">
          <ScenarioBanner
            distributionName={set.distributionName}
            scenario={set.scenario}
            current={qIndex + 1}
            total={set.questions.length}
          />
          <QuestionCard
            key={`${set.distributionId}-${qIndex}`}
            question={question}
            onAnswer={handleAnswer}
            onNext={() => {}}
            isLast={isLast}
            onOpenStatTable={() => setShowStatTable(true)}
          />
        </div>
        {showStatTable && (
          <StatTableModal onClose={() => setShowStatTable(false)} />
        )}
        <BottomNav />
      </main>
    );
  }

  // ── ホーム画面 ────────────────────────────────────────
  return (
    <main className="min-h-screen flex flex-col pb-20">
      <div className="max-w-lg mx-auto w-full px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">統計検定準1級</h1>
          <p className="text-sm text-gray-500">対策学習アプリ</p>
        </div>

        <DailyMission mission={mission} onStart={startDailyMission} />

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-blue-500" />
            <span className="font-semibold text-gray-700">通常学習</span>
          </div>
          {formats.map((f) => (
            <button
              key={f.chapter}
              onClick={() => startSession(f)}
              className="w-full text-left border border-gray-200 rounded-lg px-4 py-3 mb-2 last:mb-0 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <span className="text-xs text-blue-600 font-semibold">
                第{f.chapter}章
              </span>
              <span className="ml-2 text-sm text-gray-700">{f.title}</span>
            </button>
          ))}
          {formats.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">読込中…</p>
          )}
        </div>

        <button
          onClick={startRandomSession}
          disabled={formats.length === 0}
          className="mt-4 w-full bg-blue-600 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <PlayCircle size={20} />
          ランダムで1セット開始
        </button>
      </div>
      <BottomNav />
    </main>
  );
}
