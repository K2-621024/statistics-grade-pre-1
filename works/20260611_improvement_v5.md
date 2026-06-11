# 改善仕様書 v5：distribution_use_case 答えリーク解消・表示バグ修正・不正解説明追加

作成日：2026-06-11
前回：works/20260607_improvement_v4.md

---

## 対象タスク

| ID | 中分類 | 施策内容 |
|----|--------|---------|
| T024 | UX改善 | t分布の選択肢で式と定義を改行して表示するよう修正する |
| T025 | バグ修正 | "95％" が "95\%" と表示されているバグを修正する |
| T026 | データ整備 | distribution_use_case の選択肢から分布記号を除去し答えリークを解消する |
| T027 | UX改善 | 多変量正規分布の選択肢が見切れている表示を修正する |
| T028 | UX改善 | ユーザーが選択した不正解の選択肢の説明を正誤表示画面に表示する |

---

## T024: t分布選択肢の改行表示

### 現状の問題
`questionGenerator.ts` の `wrapMath` → `stripDomain` が `\\quad (...)` をすべて除去していたため、
t分布・カイ二乗分布・F分布の `distribution_summary` 選択肢が式のみ表示され、条件部が不可視。

### 変更内容
- `lib/questionGenerator.ts` の `wrapMath` を修正
  - `\\quad (...)` パターンを検出したら `$式$\n$(条件)$` の形式で返す
  - マッチしない場合は既存の `stripDomain` パスにフォールスルー

---

## T025/T026: distribution_use_case 答えリーク解消（95% バグも同時修正）

### 現状の問題
質問テンプレート「次のシナリオのうち、**カイ二乗分布**が最も適した手法はどれか」に対し、
正解選択肢が `～\\chi^2(n-1) を利用して求める` のように分布記号を含むため、
分布名を照合するだけで正解できてしまう。また `95\\%` がプレーンテキスト外に置かれ `95\%` と表示される。

### 変更内容
- `public/data/question_formats/ch06.json` の chi_squared・t・f の `distribution_use_case` を書き換え
  - `correct` / `distractors` から分布記号・数式を除去し、用途を日本語で記述
  - `distractor_explanations` フィールドを追加（T028 で使用）
  - `95\\%` → `95%` に修正（T025 を同時解決）

---

## T027: 多変量正規分布の選択肢見切れ修正

### 現状の問題
多変量正規分布の `pdf` 選択肢は長い数式（`\dfrac`, `\exp\left(...)` 等）を含み、
スマートフォン幅でボタンからはみ出る。

### 変更内容
- `components/QuestionCard.tsx` の選択肢テキスト span に `min-w-0 overflow-x-auto` を追加

---

## T028: 不正解選択肢の説明表示

### 現状の問題
回答後の解説は正解の説明のみ。不正解を選んだ場合も「なぜ違うのか」が表示されない。

### 変更内容
- `lib/questionGenerator.ts`
  - `FormulaSet` 型に `distractor_explanations?: string[]` を追加
  - `Option` 型に `explanation?: string` を追加
  - ジェネレーター内で distractor と explanation を対応づけてシャッフル
- `components/QuestionCard.tsx`
  - 回答後、不正解を選んだ場合に選択肢の `explanation` を「この選択肢について」セクションで表示

---

## 変更対象ファイル一覧

| ファイル | タスク | 変更内容 |
|---------|--------|---------|
| `lib/questionGenerator.ts` | T024, T028 | wrapMath 修正・型拡張・Generator 更新 |
| `public/data/question_formats/ch06.json` | T025/T026, T028 | distribution_use_case 書き換え・distractor_explanations 追加 |
| `components/QuestionCard.tsx` | T027, T028 | overflow 修正・不正解説明表示 |
