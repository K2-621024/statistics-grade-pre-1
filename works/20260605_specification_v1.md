# 役割と目的

あなたはシニアフロントエンドエンジニアです。以下の要件定義に従い、統計検定2級対策用の学習PWA（MVP）を構築してください。
ユーザーはNext.js未経験であるため、複雑な設計は避け、再現性と安定性の高いシンプルな実装を行うこと。

# 技術スタックと厳格なルール

- フレームワーク: Next.js (App Router)
- スタイリング: Tailwind CSS
- 数式レンダリング: react-katex (KaTeX)
- アイコン: lucide-react
- PWA化: next-pwa (または同等の安定したライブラリ)
- 状態管理・DB: ブラウザの localStorage（サーバーサイドのDBは一切使用しない）

**【絶対遵守のルール（Next.jsエラー回避のため）】**
1. すべてのページおよびコンポーネントの最上部に `"use client"` を記述すること（サーバーコンポーネントは使用しない）。
2. localStorage を読み込む際は、必ず `useEffect` を使用し、初回マウント時（Hydration）の不一致エラーを防ぐこと。
3. パッケージのインストールは `npm` を使用すること。

---

# ディレクトリ構造とルーティング

```markdown
app/
├── layout.tsx      # PWAメタタグ、KaTeXのCSS読み込み、全体レイアウト
├── page.tsx        # 【/】学習画面（トップ）
├── history/
│    └── page.tsx   # 【/history】学習履歴画面
└── weakness/
└── page.tsx   # 【/weakness】弱点分析画面
components/
├── BottomNav.tsx   # 画面下部に固定されるナビゲーション（3つの画面へのリンク）
├── QuestionCard.tsx# 問題文、選択肢、数式をレンダリングするコンポーネント
└── ResultModal.tsx # 5問終了後の結果表示と保存用モーダル
lib/
└── storage.ts      # localStorageのRead/Writeを隠蔽するユーティリティ関数群
public/
├── data/
│    └── questions.json # 問題データ
└── manifest.json   # PWA設定用
```

---

# データスキーマとLaTeX記述規約

1. `public/data/questions.json` には以下の構造でダミーデータを最低2問作成すること。
2. LaTeXを記述する際、JSON内ではバックスラッシュを必ず二重にエスケープ（`\\\\`）すること。

```json
[
{
"id": "q1",
"category": "確率分布",
"difficulty": 1,
"question": "平均が \\mu、分散が \\sigma^2 の正規分布に従う確率変数 X を標準化する式を選べ。",
"options": [
{ "id": "A", "text": "Z = \\frac{X - \\mu}{\\sigma}", "isCorrect": true },
{ "id": "B", "text": "Z = \\frac{X - \\sigma}{\\mu}", "isCorrect": false }
],
"explanation": "標準化は平均を引き、標準偏差で割ることで求められます。"
}
]
```

localStorageの保存スキーマ:

- `learning_history`: [{ date: "YYYY-MM-DD", score: 4, total: 5 }]
- `weakness_data`: { "確率分布": { correct: 8, total: 10 }, "推定": { correct: 3, total: 5 } }

---

# 実装フェーズ（ステップバイステップで実行すること）

## Phase 1: 初期セットアップとデータ準備

1. Next.jsプロジェクトの作成、Tailwindの初期化。
2. `react-katex`, `katex`, `lucide-react` のインストール。
3. `public/data/questions.json` の作成。
4. `app/layout.tsx` にKaTeXのCSS (`katex/dist/katex.min.css`) をインポート。

## Phase 2: UIコンポーネントとストレージ機能

1. `lib/storage.ts` を作成し、履歴と弱点を安全に保存・取得するロジックを実装。
2. `components/BottomNav.tsx` を作成し、画面下部に固定（fixed, bottom-0）。
3. `components/QuestionCard.tsx` を作成し、`react-katex` の `<BlockMath>` または `<InlineMath>` を用いて数式が正しくレンダリングされるか確認。

## Phase 3: ページ実装（ロジック結合）

1. `app/page.tsx`:
    - "学習開始"ボタンで状態を更新。
    - `questions.json` からランダムに5問抽出し、1問ずつ表示。
    - 選択肢タップ → 正誤判定＆解説表示 → "次へ"ボタン表示。
    - 5問終了後、結果を `storage.ts` を通じて保存し、トップに戻る。
2. `app/history/page.tsx`: localStorageから直近の学習履歴をリスト表示。
3. `app/weakness/page.tsx`: localStorageからカテゴリ別正答率を計算し、プログレスバー等で視覚的に表示。

## Phase 4: PWA対応

1. `next-pwa` 等を導入し、`next.config.js` を設定。
2. `manifest.json` とダミーのアイコンを配置し、インストール可能にする。

まずは Phase 1 と Phase 2 の完了を目指して作業を開始してください。