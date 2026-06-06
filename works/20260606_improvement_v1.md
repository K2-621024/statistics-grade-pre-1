# 改善仕様書：stat-prep-app UI/UX 修正

作成日：2026-06-06  
対象：`stat-prep-app/` 以下の実装

---

## 背景

初期実装の動作確認で発見された UX 上の問題点を修正する。  
対象タスク：project_context.md T001〜T006

---

## T001 + T002：回答フロー変更

### 現状の問題
- 選択肢をタップした瞬間に `onAnswer(isCorrect)` が呼ばれ、page.tsx が即座に次の問題へ遷移する
- 解説・正誤フィードバックが画面に残る前に次問に切り替わってしまう

### 変更後の3段階フロー

```
[未選択] → 選択肢タップ → [選択済（pending）] → 「回答する」ボタン押下 → [回答済（answered）]
                                                                             ↓
                                                               正誤表示 + 解説 + 「次へ」ボタン
```

### 変更内容

#### `components/QuestionCard.tsx`
- state: `null | { optId: string; confirmed: boolean }`
  - `null` → 未選択
  - `{ optId, confirmed: false }` → 選択済・未確定（pending）
  - `{ optId, confirmed: true }` → 回答済
- 選択肢タップ時：`onAnswer` を**呼ばない**。state を pending に更新するだけ
- 「回答する」ボタン：pending 時に表示。押下で confirmed に更新し、`onAnswer(isCorrect)` を呼ぶ
- 「次へ」/「結果を見る」ボタン：answered 時に表示。押下で `onNext()` を呼ぶ

#### `app/page.tsx`
- `handleAnswer(isCorrect)`: 答えを記録するだけ（answers 配列に追加）。遷移しない
- `handleNext()`: 最終問かどうかを判断して result モードへ遷移 or qIndex+1
- QuestionCard の `onAnswer` に `handleAnswer`、`onNext` に `handleNext` を渡す

---

## T003：選択肢テキストの文字色改善

### 現状の問題
- 未回答時の選択肢に text カラーが明示されておらず、Tailwind のデフォルト（gray-400 相当）で薄く見える

### 変更内容

#### `components/QuestionCard.tsx`
- 未選択状態のオプションスタイルに `text-gray-900` を追加
- pending 状態で選択されている選択肢：`bg-blue-50 border-blue-500 text-gray-900`
- pending 状態で未選択の選択肢：`bg-white border-gray-200 text-gray-900 hover:bg-blue-50`

---

## T004：Q1（分布名問題）での答えリーク防止

### 現状の問題
- `ScenarioBanner` に分布名（例：「ポアソン分布」）が常時表示されている
- Q1 は「このシナリオに適した分布はどれか」という問題のため、バナーの分布名が答えになってしまっている

### 変更内容

#### `components/ScenarioBanner.tsx`
- `maskName?: boolean` prop を追加
- `maskName === true` のとき、分布名バッジを `???` で表示する

#### `app/page.tsx`
- 現在の問題の `typeId === "distribution_name"` のとき `maskName={true}` を渡す
- Q1 に正答した（または次の問題へ進んだ）後は通常表示に戻る（qIndex > 0 で自動解決）

---

## T005：選択肢の数式が LaTeX 形式で表示される問題

### 現状の問題
- `ch05.json` の数式フィールド（`correct`, `distractors`）は生の LaTeX 文字列で保存されている
  - 例：`"P(X=k) = \\dfrac{1}{n} \\quad (k=1,2,\\ldots,n)"`
- `MathText` コンポーネントは `$...$` / `$$...$$` で囲まれた部分だけを KaTeX でレンダリングする
- 結果として、数式オプションが LaTeX ソースのまま表示される

### 変更内容

#### `lib/questionGenerator.ts`
- 数式タイプ（`pmf`, `pgf`, `expected_value`, `variance`）の選択肢テキストを `$...$` でラップするヘルパー `wrapMath` を追加
- `distribution_name` タイプは分布名テキストなのでラップしない

```ts
function wrapMath(s: string): string {
  return s.startsWith("$") ? s : `$${s}$`;
}
```

---

## T006：スマートフォン動作確認環境（Vercel デプロイ）

### 方針
Vercel へデプロイしてスマートフォンからアクセスできるようにする。

### 手順（手動）
1. `stat-prep-app/` を独立した Git リポジトリとして GitHub に push する
2. Vercel (vercel.com) でリポジトリを連携してデプロイ
3. 生成された URL にスマートフォンからアクセス

### コード側の対応（`next.config.ts`）
- PWA の `disable` フラグが `NODE_ENV === "development"` のみ無効になっているため、Vercel 本番環境では自動的に PWA が有効になる
- コード変更は不要

---

## 変更対象ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `components/QuestionCard.tsx` | フロー3段階化・pending状態・文字色修正 |
| `components/ScenarioBanner.tsx` | `maskName` prop 追加 |
| `app/page.tsx` | `handleAnswer` / `handleNext` 分離・maskName 制御 |
| `lib/questionGenerator.ts` | `wrapMath` で数式を `$...$` ラップ |
