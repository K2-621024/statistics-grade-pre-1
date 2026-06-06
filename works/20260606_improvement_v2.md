# 改善仕様書 v2：stat-prep-app UI/UX 修正（第2ラウンド）

作成日：2026-06-06  
前回：`works/20260606_improvement.md`（T001〜T005 実装済み）

---

## 対象タスク

| ID | 中分類 | 施策内容 |
|----|--------|---------|
| T006 | 環境整備 | Vercel デプロイでスマートフォン確認環境を整える |
| T011 | UX改善 | pending 状態で別の選択肢に変更できるようにする |
| T012 | バグ修正 | PMF 正解選択肢だけ `(k=0,1,…)` ドメイン表記が付いており正解が特定できてしまう |

---

## T011：選択後に選択肢を変更できる

### 現状の問題
`handleSelect` が `state.phase !== "idle"` のとき `return` するため、一度選択したあと「回答する」ボタンを押す前に選択肢を変えられない。

### 変更内容

#### `components/QuestionCard.tsx`
- `handleSelect` の guard を `state.phase === "answered"` に変更し、`pending` 状態でも再選択可能にする
- pending 状態で別の選択肢をタップすると、ハイライトが新しい選択肢に移動する

```ts
// Before
if (state.phase !== "idle") return;

// After
if (state.phase === "answered") return;
```

---

## T012：PMF 選択肢のドメイン表記を均一化

### 現状の問題
ch05.json の `pmf.correct` には `\\quad (k=0,1,\\ldots,n)` のようなドメイン表記が含まれるが、`pmf.distractors` には含まれていないケースが多い。学習者は式の内容でなく「ドメイン表記の有無」で正解を判別できてしまう。

### 変更内容

#### `lib/questionGenerator.ts`
`wrapMath` の後処理として `stripDomain` を追加。すべての数式オプション（correct・distractors 両方）から末尾の `\\quad (...)` 形式ドメイン表記を除去し、式の形のみで勝負させる。

```ts
function stripDomain(s: string): string {
  // 末尾の \quad (k=...) または空白+(k=...) を除去
  return s.replace(/\s*\\quad\s*\([^)]*\)\s*$/, "")
          .replace(/\s+\([^)]*k[^)]*\)\s*$/, "")
          .trim();
}
```

`wrapMath` を適用する前に `stripDomain` を通す：
```ts
{ text: wrapMath(stripDomain(formulaSet.correct)), isCorrect: true }
// distractors も同様
```

---

## T006：Vercel デプロイ

### 方針
`stat-prep-app/` ディレクトリを Vercel にデプロイする。  
GitHub リポジトリ連携は手動で行い、コード側に必要な設定ファイルを追加する。

### 変更内容

#### `stat-prep-app/vercel.json`（新規作成）
Vercel がプロジェクトを Next.js として認識し、`/public` 以下の静的ファイルをキャッシュするよう設定する。

```json
{
  "framework": "nextjs",
  "headers": [
    {
      "source": "/data/:path*",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=3600" }]
    }
  ]
}
```

#### デプロイ手順（手動）
1. GitHub に `stat-prep-app/` の内容を push（または親リポジトリを push）
2. [vercel.com](https://vercel.com) でプロジェクトをインポート
3. **Root Directory** を `stat-prep-app` に設定
4. Deploy ボタンを押す → 生成 URL にスマートフォンからアクセス

---

## 変更対象ファイル一覧

| ファイル | タスク | 変更内容 |
|---------|--------|---------|
| `components/QuestionCard.tsx` | T011 | handleSelect の guard 条件を `answered` のみに変更 |
| `lib/questionGenerator.ts` | T012 | `stripDomain` 関数追加・wrapMath 適用前に呼び出し |
| `stat-prep-app/vercel.json` | T006 | 新規作成（Next.js + キャッシュ設定） |
