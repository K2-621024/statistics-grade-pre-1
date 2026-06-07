# 改善仕様書 v4：デイリーミッション条件・グラフ絞込・チートシート削除・タイトル白化・習熟度算出変更

作成日：2026-06-07
前回：works/20260607_improvement_v3.md

---

## 対象タスク

| ID | 中分類 | 施策内容 |
|----|--------|---------|
| T019 | バグ修正 | デイリーミッションの進捗を全問正答した場合のみ更新するよう変更する |
| T020 | UX改善 | 解いた大問数のグラフを直近7日間に絞って表示する |
| T021 | コンテンツ | 弱点分析ページのチートシートセクションを削除する |
| T022 | UX改善 | 各ページのタイトル文字色を白に変更する |
| T023 | バグ修正 | 弱点分析チャートの習熟度を3回以上連続正答した問題数の割合で算出するよう変更する |

---

## T019: デイリーミッション進捗条件の変更

### 現状の問題
`handleSaveAndExit` で `mission.targetKeys.includes(key)` が true であれば
正答率に関わらず完了マークがついていた。

### 変更内容
- `app/page.tsx` の条件に `&& score === answers.length` を追加
- 全問正答した場合のみ `markMissionSetComplete` を呼ぶ

---

## T020: 履歴グラフを直近7日間に絞る

### 現状の問題
`history` 全件でグラフを描画しており、長期利用で見にくくなる。

### 変更内容
- `app/history/page.tsx` でグラフ生成前に `date >= cutoff` でフィルタ（今日 -6 日以降）
- サブタイトルを「直近7日間の進捗グラフ」に更新

---

## T021: チートシートセクション削除

### 現状の問題
`app/weakness/page.tsx` にチートシートのアコーディオンブロックが残っていた。

### 変更内容
- チートシートセクション（`<div>` 全体）を削除
- `CHEAT_SHEET_TEXTS`・`MathText` のインポートを削除
- `expandedKey` state を削除

---

## T022: ページタイトルを白文字ヘッダー化

### 現状の問題
3 ページすべてのタイトルが白背景上の `text-gray-900` で、白文字化に背景が必要。

### 変更内容
- タイトル `<div>` を `-mx-4 -mt-6 px-4 pt-6 pb-4 bg-blue-600 mb-6` のヘッダーバーに変更
- `h1`: `text-white`、サブタイトル `p`: `text-blue-100`
- 対象: `app/page.tsx`, `app/history/page.tsx`, `app/weakness/page.tsx`

---

## T023: 弱点分析チャートの習熟度算出変更

### 現状の問題
RadarChart に `weaknessData`（累積正答数/累積問題数）を渡しており、
「連続して正答できているか」が反映されていない。

### 変更内容
- `app/weakness/page.tsx` で `getMasteryData()` を取得
- 各分布キーの `consecutiveCorrect >= 3` を集計し、カテゴリ別 `CategoryStat` を生成
- `{ correct: count(consec>=3), total: count(試行済み分布数) }` を RadarChart に渡す
- グリッドの正答率数値は引き続き `weaknessData` を使用

---

## 変更対象ファイル一覧

| ファイル | タスク | 変更内容 |
|---------|--------|---------|
| app/page.tsx | T019, T022 | mission 完了条件に全問正答チェック追加・タイトルヘッダー化 |
| app/history/page.tsx | T020, T022 | 直近7日フィルタ追加・タイトルヘッダー化 |
| app/weakness/page.tsx | T021, T022, T023 | チートシート削除・タイトルヘッダー化・習熟度算出変更 |
