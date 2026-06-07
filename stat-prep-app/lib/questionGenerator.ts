import { CHAPTER_TO_CATEGORY } from "./constants";

// ─── 型定義 ──────────────────────────────────────────────
export type QuestionTypeDef = {
  id: string;
  label: string;
  question_template: string;
};

export type FormulaSet = {
  correct: string;
  explanation: string;
  distractors: string[];
};

export type DistributionDef = {
  id: string;
  name: string;
  notation: string;
  applicable_question_types: string[];
  keywords: string;
  scenarios: string[];
  pmf?: FormulaSet;
  pgf?: FormulaSet;
  pdf?: FormulaSet;
  mgf?: FormulaSet;
  expected_value?: FormulaSet;
  variance?: FormulaSet;
  distribution_summary?: FormulaSet;
  distribution_use_case?: FormulaSet;
};

export type ChapterFormat = {
  chapter: number;
  title: string;
  category: string;
  phase: 1 | 2 | 3;
  question_types: QuestionTypeDef[];
  distributions: DistributionDef[];
};

export type Option = {
  id: "A" | "B" | "C" | "D" | "E";
  text: string;
  isCorrect: boolean;
};

export type GeneratedQuestion = {
  typeId: string;
  typeLabel: string;
  questionText: string;
  options: Option[];
  explanation: string;
};

export type QuestionSet = {
  distributionId: string;
  distributionName: string;
  chapterId: number;
  category: string;
  scenario: string;
  questions: GeneratedQuestion[];
};

// ─── ユーティリティ ───────────────────────────────────────
function stripDomain(s: string): string {
  return s
    .replace(/\s*\\quad\s*\([^)]*\)\s*$/, "")
    .replace(/\s+\([^)]*k[^)]*\)\s*$/, "")
    .trim();
}

function wrapMath(s: string): string {
  const stripped = stripDomain(s);
  return stripped.startsWith("$") ? stripped : `$${stripped}$`;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function assignOptionLabels(
  items: { text: string; isCorrect: boolean }[]
): Option[] {
  const labels = ["A", "B", "C", "D", "E"] as const;
  return items.slice(0, 5).map((item, i) => ({
    id: labels[i],
    text: item.text,
    isCorrect: item.isCorrect,
  }));
}

// ─── メイン生成関数 ───────────────────────────────────────
export function generateQuestionSet(
  formatData: ChapterFormat,
  targetDistributionId?: string
): QuestionSet {
  const dist = targetDistributionId
    ? (formatData.distributions.find((d) => d.id === targetDistributionId) ??
        randomElement(formatData.distributions))
    : randomElement(formatData.distributions);
  const scenario = dist.scenarios.length > 0 ? randomElement(dist.scenarios) : "";
  const category =
    CHAPTER_TO_CATEGORY[formatData.chapter] ?? "確率と確率分布";

  const questions: GeneratedQuestion[] = [];

  for (const qtId of dist.applicable_question_types) {
    const qt = formatData.question_types.find((q) => q.id === qtId);
    if (!qt) continue;

    const questionText = qt.question_template.replace(
      /\{\{distribution_name\}\}/g,
      dist.name
    );

    let options: Option[];
    let explanation: string;

    if (qtId === "distribution_name") {
      const wrongNames = shuffleArray(
        formatData.distributions.filter((d) => d.id !== dist.id)
      )
        .slice(0, 4)
        .map((d) => ({ text: d.name, isCorrect: false }));

      options = assignOptionLabels(
        shuffleArray([{ text: dist.name, isCorrect: true }, ...wrongNames])
      );
      explanation = dist.keywords;
    } else {
      const formulaSet = dist[qtId as keyof DistributionDef] as
        | FormulaSet
        | undefined;
      if (!formulaSet) continue;

      const wrap = qtId === "distribution_use_case" ? (s: string) => s : wrapMath;

      const wrongOptions = shuffleArray(formulaSet.distractors)
        .slice(0, 4)
        .map((d) => ({ text: wrap(d), isCorrect: false }));

      options = assignOptionLabels(
        shuffleArray([
          { text: wrap(formulaSet.correct), isCorrect: true },
          ...wrongOptions,
        ])
      );
      explanation = formulaSet.explanation;
    }

    questions.push({
      typeId: qtId,
      typeLabel: qt.label,
      questionText,
      options,
      explanation,
    });
  }

  return {
    distributionId: dist.id,
    distributionName: dist.name,
    chapterId: formatData.chapter,
    category,
    scenario,
    questions,
  };
}
