import { CHAPTER_TO_CATEGORY } from "./constants";

// ─── 型定義 ──────────────────────────────────────────────
export type SessionRecord = {
  date: string;
  chapterId: number;
  distributionId: string;
  distributionName: string;
  score: number;
  total: number;
};

export type CategoryStat = {
  correct: number;
  total: number;
};

export type DistributionStat = {
  consecutiveCorrect: number;
  correct: number;
  total: number;
  lastAnsweredAt: string;
  nextReviewAt: string;
};

export type DailyMissionState = {
  date: string;
  targetKeys: string[];
  completedKeys: string[];
};

// ─── localStorage キー ────────────────────────────────────
const HISTORY_KEY = "learning_history";
const WEAKNESS_KEY = "weakness_data";
const MASTERY_KEY = "mastery_data";
const DAILY_KEY = "daily_mission";
const UNLOCK_KEY = "unlock_status";

// ─── ヘルパー ─────────────────────────────────────────────
function getJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── 学習履歴 ─────────────────────────────────────────────
export function getHistory(): SessionRecord[] {
  return getJSON<SessionRecord[]>(HISTORY_KEY, []);
}

export function saveSession(record: SessionRecord): void {
  const history = getHistory();
  history.unshift(record);
  setJSON(HISTORY_KEY, history.slice(0, 100));
}

// ─── 弱点データ（カテゴリ別） ─────────────────────────────
export function getWeaknessData(): Record<string, CategoryStat> {
  return getJSON<Record<string, CategoryStat>>(WEAKNESS_KEY, {});
}

export function updateWeaknessData(
  chapterId: number,
  correct: number,
  total: number
): void {
  const category = CHAPTER_TO_CATEGORY[chapterId] ?? "確率と確率分布";
  const data = getWeaknessData();
  if (!data[category]) data[category] = { correct: 0, total: 0 };
  data[category].correct += correct;
  data[category].total += total;
  setJSON(WEAKNESS_KEY, data);
}

// ─── 習熟度データ（分布別） ───────────────────────────────
export function getMasteryData(): Record<string, DistributionStat> {
  return getJSON<Record<string, DistributionStat>>(MASTERY_KEY, {});
}

function addDays(isoString: string, days: number): string {
  const d = new Date(isoString);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function computeNextReviewAt(consecutiveCorrect: number, now: string): string {
  const intervals = [1, 1, 3, 7, 14];
  const d = intervals[Math.min(consecutiveCorrect, intervals.length - 1)];
  return addDays(now, d);
}

export function updateMasteryData(
  key: string,
  score: number,
  total: number
): void {
  const data = getMasteryData();
  const now = new Date().toISOString();
  const existing: DistributionStat = data[key] ?? {
    consecutiveCorrect: 0,
    correct: 0,
    total: 0,
    lastAnsweredAt: now,
    nextReviewAt: now,
  };

  const isGood = score / total >= 0.6;
  existing.consecutiveCorrect = isGood ? existing.consecutiveCorrect + 1 : 0;
  existing.correct += score;
  existing.total += total;
  existing.lastAnsweredAt = now;
  existing.nextReviewAt = computeNextReviewAt(existing.consecutiveCorrect, now);
  data[key] = existing;
  setJSON(MASTERY_KEY, data);
}

// ─── デイリーミッション ───────────────────────────────────
export function getDailyMission(): DailyMissionState | null {
  return getJSON<DailyMissionState | null>(DAILY_KEY, null);
}

export function generateDailyMission(availableKeys: string[]): DailyMissionState {
  const today = new Date().toISOString().slice(0, 10);
  const masteryData = getMasteryData();
  const now = new Date().toISOString();

  const overdue = availableKeys.filter((key) => {
    const stat = masteryData[key];
    return stat && stat.nextReviewAt <= now;
  });

  const sorted = [...overdue].sort((a, b) => {
    const sa = masteryData[a];
    const sb = masteryData[b];
    const ra = sa.total > 0 ? sa.correct / sa.total : 0;
    const rb = sb.total > 0 ? sb.correct / sb.total : 0;
    return ra - rb;
  });

  let targets = sorted.slice(0, 2);
  if (targets.length < 2) {
    const remaining = shuffleArray(
      availableKeys.filter((k) => !targets.includes(k))
    );
    targets = [...targets, ...remaining].slice(0, 2);
  }

  const mission: DailyMissionState = {
    date: today,
    targetKeys: targets,
    completedKeys: [],
  };
  setJSON(DAILY_KEY, mission);
  return mission;
}

export function markMissionSetComplete(key: string): void {
  const mission = getDailyMission();
  if (!mission) return;
  if (!mission.completedKeys.includes(key)) {
    mission.completedKeys.push(key);
    setJSON(DAILY_KEY, mission);
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── アンロック ───────────────────────────────────────────
export function getUnlockStatus(): Record<string, boolean> {
  return getJSON<Record<string, boolean>>(UNLOCK_KEY, {});
}

export function checkAndUnlock(): void {
  const weakness = getWeaknessData();
  const stat = weakness["確率と確率分布"];
  if (!stat || stat.total < 10) return;
  if (stat.correct / stat.total < 0.8) return;

  const status = getUnlockStatus();
  const phase3Chapters = [4, 7, 13, 15, 17, 18, 19, 24, 29, 30, 32];
  let changed = false;
  for (const ch of phase3Chapters) {
    if (!status[`ch${ch}`]) {
      status[`ch${ch}`] = true;
      changed = true;
    }
  }
  if (changed) setJSON(UNLOCK_KEY, status);
}
