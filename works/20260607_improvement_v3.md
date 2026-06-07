# 改善仕様書：履歴グラフ・チートシート・デイリーミッション改善

作成日：2026-06-07
前回：works/20260606_improvement_v2.md

---

## 対象タスク

| ID | 中分類 | 施策内容 |
|----|--------|---------|
| T013 | UX改善 | 履歴ページを日次の進捗グラフ（縦軸：解いた大問数、横軸：日付）に変更する |
| T014 | コンテンツ | 履歴グラフを章別に色分けした積み上げグラフに変更する |
| T015 | コンテンツ | チートシートのアンロック機能を削除する |
| T016 | バグ修正 | デイリーミッションの目標値をこれまでの日次平均回答数に自動設定する |
| T017 | UX改善 | 各ページのタイトル文字色を視認性の高い色に修正する |
| T018 | バグ修正 | デイリーミッションの進捗カウントが更新されないバグを修正する |

---

## T013+T014: 履歴ページをグラフ表示に変更

### 現状の問題
`app/history/page.tsx` はセッション一覧リストを表示しているだけで、日次の傾向が把握しにくい。

### 変更内容
- `SessionRecord[]` を日付×章でグループ化して recharts `BarChart` で描画
- `stackId="stack"` で章別に色分けした積み上げ棒グラフにする
- X 軸: 日付（MM-DD）、Y 軸: 解いた大問数（セッション数）
- 章ごとにカラーコードを定義（CHAPTER_COLORS）

---

## T015: チートシートのアンロック機能を削除

### 現状の問題
`app/weakness/page.tsx` でチートシートがアンロック条件（正答率80%以上）により隠されていた。

### 変更内容
- `getUnlockStatus()` の呼び出しと `unlockStatus` state を削除
- `Lock` / `Unlock` アイコンと locked バッジ一覧を削除
- すべての CHEAT_SHEET_TEXTS を直接表示
- `app/page.tsx` の `checkAndUnlock()` 呼び出しを削除

---

## T016: デイリーミッション目標値を日次平均に設定

### 現状の問題
`generateDailyMission()` がターゲット件数を固定値 2 にしていた。

### 変更内容
- `lib/storage.ts` の `generateDailyMission()` で `getHistory()` から日別セッション数を集計
- 平均を `Math.round` して `targetCount` とし、最低値 1 に clamp
- 履歴ゼロの場合はデフォルト 2 を維持

---

## T017: ページタイトル文字色を修正

### 現状の問題
3 ページすべてで `h1` が `text-gray-800`、サブタイトルが `text-gray-500` と薄め。

### 変更内容
- `h1`: `text-gray-800` → `text-gray-900`
- サブタイトル `p`: `text-gray-500` → `text-gray-600`
- 対象ファイル: `app/page.tsx`, `app/history/page.tsx`, `app/weakness/page.tsx`

---

## T018: デイリーミッション進捗が更新されないバグを修正

### 現状の問題
`startDailyMission()` が `nextKey`（例: `"5_bernoulli"`）を特定するが、
`generateQuestionSet(format)` でランダムに分布を選ぶため、
実際のセッションの `distributionId` が `nextKey` と一致せず、
`handleSaveAndExit` 内の `targetKeys.includes(key)` が false になる。

### 変更内容
- `lib/questionGenerator.ts`: `generateQuestionSet` に `targetDistributionId?: string` を追加。
  指定時はその分布を優先選択（見つからなければランダム）。
- `app/page.tsx`: `startSession()` に `distributionId?` を追加。
  `startDailyMission()` では `nextKey` から distributionId を抽出して渡す。

---

## 変更対象ファイル一覧

| ファイル | タスク | 変更内容 |
|---------|--------|---------|
| app/history/page.tsx | T013, T014, T017 | グラフ表示に全面リプレース |
| app/weakness/page.tsx | T015, T017 | アンロック機能削除・タイトル色修正 |
| app/page.tsx | T015, T017, T018 | checkAndUnlock削除・タイトル色・mission分岐修正 |
| lib/storage.ts | T016 | generateDailyMission に日次平均算出を追加 |
| lib/questionGenerator.ts | T018 | generateQuestionSet に targetDistributionId 追加 |
