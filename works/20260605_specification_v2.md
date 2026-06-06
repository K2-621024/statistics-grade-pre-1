# 役割と目的

あなたはシニアフロントエンドエンジニアです。以下の要件定義に従い、**統計検定準1級**対策用の学習PWA（MVP）を構築してください。
ユーザーはNext.js未経験であるため、複雑な設計は避け、再現性と安定性の高いシンプルな実装を行うこと。

> **v1からの主な変更点**
> - 対象試験を「2級」から「**準1級**」へ変更
> - 問題を静的JSONから**動的生成**に完全移行（`questions.json` 廃止）
> - `public/data/question_formats/` に章ごとの出題形式定義JSONを配置
> - 1つの問題設定シナリオに対して5問を連続で解く**セット形式**を採用
> - 弱点分析UIを「プログレスバー」から「**レーダーチャート**（recharts）」へ変更
> - **デイリーミッション**（忘却曲線ベース）と**アンロック**ゲーミフィケーションを追加
> - **統計数値表ポップアップ**（StatTableModal）を追加
> - 数値入力モード（テンキー型）は**後続フェーズ**（本仕様外）

---

# 技術スタックと厳格なルール

- フレームワーク: Next.js (App Router)
- スタイリング: Tailwind CSS
- 数式レンダリング: react-katex (KaTeX)
- アイコン: lucide-react
- チャート: **recharts**（レーダーチャート用）
- PWA化: next-pwa（または同等の安定したライブラリ）
- 状態管理・DB: ブラウザの localStorage（サーバーサイドのDBは一切使用しない）

**【絶対遵守のルール（Next.jsエラー回避のため）】**
1. すべてのページおよびコンポーネントの最上部に `"use client"` を記述すること（サーバーコンポーネントは使用しない）。
2. localStorage を読み込む際は、必ず `useEffect` を使用し、初回マウント時（Hydration）の不一致エラーを防ぐこと。
3. パッケージのインストールは `npm` を使用すること。
4. recharts の `<ResponsiveContainer>` は SSR で幅を取得できないため、必ず `useEffect` で `isMounted` フラグを立ててからレンダリングすること。

---

# ディレクトリ構造とルーティング

```
app/
├── layout.tsx              # PWAメタタグ、KaTeXのCSS読み込み、全体レイアウト
├── page.tsx                # 【/】学習画面（デイリーミッション起点）
├── history/
│   └── page.tsx            # 【/history】学習履歴画面
└── weakness/
    └── page.tsx            # 【/weakness】弱点分析画面（レーダーチャート）
components/
├── BottomNav.tsx           # 画面下部に固定されるナビゲーション（3つの画面へのリンク）
├── ScenarioBanner.tsx      # セット問題の問題設定シナリオを表示するバナー
├── QuestionCard.tsx        # 問題文、選択肢、数式をレンダリングするコンポーネント
├── ResultModal.tsx         # セット終了後の結果表示と保存用モーダル
├── StatTableModal.tsx      # 統計数値表（正規分布表・t分布表）のオーバーレイ
├── RadarChart.tsx          # 単元別習熟度レーダーチャート（recharts使用）
└── DailyMission.tsx        # 今日の復習ミッション（2セット=10問）の進捗バナー
lib/
├── questionGenerator.ts    # 出題形式定義JSONから問題セットを動的生成するエンジン
└── storage.ts              # localStorageのRead/Writeを隠蔽するユーティリティ関数群
public/
├── data/
│   ├── question_formats/   # 章ごとの出題形式定義（各章1ファイル）
│   │   ├── ch05.json       # 第5章: 離散型分布
│   │   └── ch06.json       # 第6章: 連続型分布と標本分布（今後追加）
│   └── stat_tables/
│       ├── normal.json     # 標準正規分布表（z値 → P値のマッピング）
│       └── t.json          # t分布表（自由度 × α → t値のマッピング）
└── manifest.json           # PWA設定用
```

---

# データスキーマ

## 1. `public/data/question_formats/ch05.json`

第5章「離散型分布」の出題形式定義ファイル。章ごとに同形式のJSONを用意する。

### トップレベル構造

```typescript
{
  chapter: number,           // 章番号 (5)
  title: string,             // 章タイトル
  category: string,          // 4大カテゴリのいずれか
  phase: 1 | 2 | 3,         // 学習フェーズ
  question_types: QuestionTypeDef[],  // この章で使用する問題タイプ定義
  distributions: DistributionDef[]    // 分布ごとの定義
}
```

### `QuestionTypeDef` の構造

問題タイプを定義する。第5章では以下の5種類を使用する。

```json
"question_types": [
  {
    "id": "distribution_name",
    "label": "分布の名称",
    "question_template": "次のシナリオに最も適した確率分布はどれか。"
  },
  {
    "id": "pmf",
    "label": "確率関数",
    "question_template": "上のシナリオで {{distribution_name}} に従う確率変数 $X$ の確率関数 $P(X=k)$ として正しいものを選べ。"
  },
  {
    "id": "pgf",
    "label": "確率母関数",
    "question_template": "上のシナリオで {{distribution_name}} に従う確率変数 $X$ の確率母関数 $G_X(s) = E[s^X]$ として正しいものを選べ。"
  },
  {
    "id": "expected_value",
    "label": "期待値",
    "question_template": "上のシナリオで {{distribution_name}} に従う確率変数 $X$ の期待値 $E[X]$ として正しいものを選べ。"
  },
  {
    "id": "variance",
    "label": "分散",
    "question_template": "上のシナリオで {{distribution_name}} に従う確率変数 $X$ の分散 $V[X]$ として正しいものを選べ。"
  }
]
```

`{{distribution_name}}` は生成時に実際の分布名（例: `ポアソン分布`）で置換する。

### `DistributionDef` の構造

```typescript
{
  id: string,                          // 分布の識別子（スネークケース）
  name: string,                        // 分布名（日本語）
  notation: string,                    // 記法（LaTeX）
  applicable_question_types: string[], // この分布で出題するタイプIDのリスト
  keywords: string,                    // Q1(分布名問題)の解説用キーワード（LaTeX可）
  scenarios: string[],                 // 問題設定シナリオ（10個）
  pmf?: FormulaSet,                    // 確率関数
  pgf?: FormulaSet,                    // 確率母関数（定義不要な分布はフィールドごと省略）
  expected_value: FormulaSet,          // 期待値
  variance: FormulaSet                 // 分散
}

type FormulaSet = {
  correct: string,        // 正解の式（LaTeX）
  explanation: string,    // 解説文（LaTeX可）
  distractors: string[]   // 不正解候補（最低5個）
}
```

### `distractors` の構成ルール

各問題タイプの不正解候補 `distractors` は以下の2種類を混在させて5個以上用意する。

| 種類 | 説明 | 例（ポアソン分布の確率関数） |
| :--- | :--- | :--- |
| **他分布の式** | 第5章に登場する他の分布の同じ要素の式 | 二項分布の PMF: $\binom{n}{k}p^k(1-p)^{n-k}$ |
| **変形誤答** | 正解の符号・指数・変数・係数を微妙に変えたもの | $\dfrac{\lambda^k e^{-\lambda}}{(k+1)!}$（分母が $(k+1)!$）|

`distribution_name` タイプのみ式ではなく他の分布名を不正解候補とする（後述）。

---

### `ch05.json` フルサンプル（ポアソン分布のみ完全記載）

```json
{
  "chapter": 5,
  "title": "離散型分布",
  "category": "確率と確率分布",
  "phase": 1,
  "question_types": [
    { "id": "distribution_name", "label": "分布の名称",   "question_template": "次のシナリオに最も適した確率分布はどれか。" },
    { "id": "pmf",               "label": "確率関数",     "question_template": "上のシナリオで {{distribution_name}} に従う確率変数 $X$ の確率関数 $P(X=k)$ として正しいものを選べ。" },
    { "id": "pgf",               "label": "確率母関数",   "question_template": "上のシナリオで {{distribution_name}} に従う確率変数 $X$ の確率母関数 $G_X(s) = E[s^X]$ として正しいものを選べ。" },
    { "id": "expected_value",    "label": "期待値",       "question_template": "上のシナリオで {{distribution_name}} に従う確率変数 $X$ の期待値 $E[X]$ として正しいものを選べ。" },
    { "id": "variance",          "label": "分散",         "question_template": "上のシナリオで {{distribution_name}} に従う確率変数 $X$ の分散 $V[X]$ として正しいものを選べ。" }
  ],
  "distributions": [
    {
      "id": "poisson",
      "name": "ポアソン分布",
      "notation": "Po(\\lambda)",
      "applicable_question_types": ["distribution_name", "pmf", "pgf", "expected_value", "variance"],
      "keywords": "単位時間・単位面積あたりの平均発生回数 $\\lambda$ が既知で、まれな事象が独立に発生する場面",
      "scenarios": [
        "ある工場のカスタマーサポートには、1時間あたり平均 $\\lambda$ 件の問い合わせが入る。1時間の着信件数を $X$ とするとき",
        "市内の交差点において、1日あたり平均 $\\lambda$ 件の交通事故が発生する。ある1日の事故件数を $X$ とするとき",
        "ある放射性物質が1分間に平均 $\\lambda$ 個の粒子を放出する。1分間の放出粒子数を $X$ とするとき",
        "ある書籍の1ページあたり平均 $\\lambda$ 個の誤字が含まれる。任意の1ページの誤字数を $X$ とするとき",
        "ある銀行窓口に、1時間あたり平均 $\\lambda$ 人の顧客が到着する。1時間の来客数を $X$ とするとき",
        "あるWebサーバーに、1秒あたり平均 $\\lambda$ 回のリクエストが来る。ある1秒間のリクエスト数を $X$ とするとき",
        "製造ライン1000mあたり平均 $\\lambda$ 箇所の欠陥が発生する。製品1000mの欠陥箇所数を $X$ とするとき",
        "救急病院に、1時間あたり平均 $\\lambda$ 人の重症患者が搬送される。ある1時間の搬送人数を $X$ とするとき",
        "ある生態系において、1日あたり平均 $\\lambda$ 頭の動物が罠にかかる。ある1日の捕獲数を $X$ とするとき",
        "コールセンターで、1分間あたり平均 $\\lambda$ 件の苦情電話が来る。1分間の苦情件数を $X$ とするとき"
      ],
      "pmf": {
        "correct": "P(X=k) = \\dfrac{\\lambda^k e^{-\\lambda}}{k!} \\quad (k=0,1,2,\\ldots)",
        "explanation": "ポアソン分布の確率関数。分母の $k!$ と指数部の符号（$e^{-\\lambda}$）に注意。",
        "distractors": [
          "P(X=k) = \\dfrac{e^{\\lambda} \\lambda^k}{k!}",
          "P(X=k) = \\dfrac{\\lambda^k e^{-\\lambda}}{(k+1)!}",
          "P(X=k) = \\dfrac{\\lambda^{k+1} e^{-\\lambda}}{k!}",
          "P(X=k) = \\dbinom{n}{k} p^k (1-p)^{n-k}",
          "P(X=k) = (1-p)^{k-1} p",
          "P(X=k) = \\dfrac{1}{n}"
        ]
      },
      "pgf": {
        "correct": "G_X(s) = e^{\\lambda(s-1)}",
        "explanation": "$G_X(s) = e^{-\\lambda} \\sum_{k=0}^\\infty \\frac{(\\lambda s)^k}{k!} = e^{-\\lambda} \\cdot e^{\\lambda s} = e^{\\lambda(s-1)}$",
        "distractors": [
          "G_X(s) = e^{\\lambda(s+1)}",
          "G_X(s) = e^{-\\lambda(s-1)}",
          "G_X(s) = e^{\\lambda(1-s)}",
          "G_X(s) = \\{(1-p)+ps\\}^n",
          "G_X(s) = \\dfrac{ps}{1-(1-p)s}",
          "G_X(s) = (1-p)+ps"
        ]
      },
      "expected_value": {
        "correct": "E[X] = \\lambda",
        "explanation": "$E[X] = G_X'(1) = \\lambda e^{\\lambda(1-1)} = \\lambda$。ポアソン分布では期待値＝分散＝$\\lambda$。",
        "distractors": [
          "E[X] = \\lambda^2",
          "E[X] = 2\\lambda",
          "E[X] = \\dfrac{1}{p}",
          "E[X] = np",
          "E[X] = \\dfrac{n+1}{2}",
          "E[X] = \\dfrac{r}{p}"
        ]
      },
      "variance": {
        "correct": "V[X] = \\lambda",
        "explanation": "ポアソン分布の重要性質：期待値＝分散＝$\\lambda$。",
        "distractors": [
          "V[X] = \\lambda^2",
          "V[X] = 2\\lambda",
          "V[X] = np(1-p)",
          "V[X] = \\dfrac{1-p}{p^2}",
          "V[X] = \\dfrac{n^2-1}{12}",
          "V[X] = n \\cdot \\dfrac{M}{N} \\cdot \\left(1-\\dfrac{M}{N}\\right) \\cdot \\dfrac{N-n}{N-1}"
        ]
      }
    }
  ]
}
```

---

### 第5章 全8分布の正解式一覧（実装時の参照テーブル）

以下を基に、各分布の `DistributionDef` を上記と同形式で作成すること。

| 分布 | `id` | PMF $P(X=k)$ | PGF $G_X(s)$ | 期待値 $E[X]$ | 分散 $V[X]$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 離散一様分布 | `discrete_uniform` | $\frac{1}{n}$ $(k=1,\ldots,n)$ | $\frac{s(1-s^n)}{n(1-s)}$ | $\frac{n+1}{2}$ | $\frac{n^2-1}{12}$ |
| 超幾何分布 | `hypergeometric` | $\frac{\binom{M}{k}\binom{N-M}{n-k}}{\binom{N}{n}}$ | ※複雑なため省略 | $n\cdot\frac{M}{N}$ | $n\frac{M}{N}\left(1-\frac{M}{N}\right)\frac{N-n}{N-1}$ |
| ポアソン分布 | `poisson` | $\frac{\lambda^k e^{-\lambda}}{k!}$ | $e^{\lambda(s-1)}$ | $\lambda$ | $\lambda$ |
| ベルヌーイ分布 | `bernoulli` | $p^k(1-p)^{1-k}$ $(k\in\{0,1\})$ | $(1-p)+ps$ | $p$ | $p(1-p)$ |
| 二項分布 | `binomial` | $\binom{n}{k}p^k(1-p)^{n-k}$ | $\{(1-p)+ps\}^n$ | $np$ | $np(1-p)$ |
| 幾何分布 | `geometric` | $(1-p)^{k-1}p$ $(k\ge1)$ | $\frac{ps}{1-(1-p)s}$ | $\frac{1}{p}$ | $\frac{1-p}{p^2}$ |
| 負の二項分布 | `negative_binomial` | $\binom{k-1}{r-1}p^r(1-p)^{k-r}$ $(k\ge r)$ | $\left(\frac{ps}{1-(1-p)s}\right)^r$ | $\frac{r}{p}$ | $\frac{r(1-p)}{p^2}$ |
| 多項分布 | `multinomial` | $\frac{m!}{k_1!\cdots k_c!}p_1^{k_1}\cdots p_c^{k_c}$ | $(p_1 s_1+\cdots+p_c s_c)^m$ | $m p_i$ | $m p_i(1-p_i)$ |

**注意事項:**
- 超幾何分布 (`hypergeometric`) は PGF が複雑なため、`applicable_question_types` から `"pgf"` を除外すること。
- 多項分布 (`multinomial`) は多変数分布のため `applicable_question_types` は `["distribution_name", "pmf", "expected_value", "variance"]` とする。
- 分布名問題 (`distribution_name`) の不正解候補は **数式ではなく他の7分布の名称** をそのまま使用する（`distractors` フィールド不要）。生成エンジンが `distributions` 配列の他要素から自動収集する。

---

### シナリオ設計ガイドライン（各分布10シナリオ）

各分布に対してシナリオを10個用意する際の方針。

| 分布 | シナリオの典型的な場面設定 |
| :--- | :--- |
| 離散一様分布 | サイコロ・カード・くじ引き・乱数など、各値が等確率 |
| 超幾何分布 | ロットからの非復元抽出（製品検査・抽選・委員選出など） |
| ポアソン分布 | 単位時間・面積あたりのまれな事象（事故・問い合わせ・粒子放射） |
| ベルヌーイ分布 | 1回の試行の成否（購入する/しない・合格/不合格） |
| 二項分布 | $n$ 回の独立試行の成功数（品質検査・アンケート・射撃） |
| 幾何分布 | 初めて成功するまでの試行回数（初購入・初ヒット・初不良品） |
| 負の二項分布 | $r$ 回目の成功までの試行回数（$r$ 件成約・$r$ 番目の合格者） |
| 多項分布 | 3種類以上の結果が排他的に起こる試行の組み合わせ（商品カテゴリ・血液型） |

---

## 2. `lib/questionGenerator.ts` — 動的問題生成エンジン

### 型定義

```typescript
// QuestionSet: 1シナリオ=5問のセット
export type QuestionSet = {
  distributionId: string;      // 例: "poisson"
  distributionName: string;    // 例: "ポアソン分布"
  chapterId: number;           // 例: 5
  scenario: string;            // ランダム選択されたシナリオ文
  questions: GeneratedQuestion[];
};

export type GeneratedQuestion = {
  typeId: string;              // "distribution_name" | "pmf" | "pgf" | "expected_value" | "variance"
  typeLabel: string;           // "確率関数" など
  questionText: string;        // question_template の {{distribution_name}} を置換後
  options: Option[];           // シャッフル済み（A〜E のラベル付き）
  explanation: string;
};

export type Option = {
  id: "A" | "B" | "C" | "D" | "E";
  text: string;
  isCorrect: boolean;
};
```

### `generateQuestionSet(formatData)` の処理フロー

```
1. distributions 配列からランダムに1つの分布を選択
2. 選択した分布の scenarios 配列からランダムに1つのシナリオを選択
3. 分布の applicable_question_types の各タイプについて以下を実行:

   【distribution_name タイプ】
   - questionText = question_types[0].question_template（そのまま使用）
   - 正解: 選択した分布の name
   - 不正解: 他の distributions から name を最大4つランダム選択
   - 計5択（正解1 + 不正解4）をシャッフル → A〜E のラベルを付与

   【pmf / pgf / expected_value / variance タイプ】
   - questionText = question_template の {{distribution_name}} を分布名で置換
   - 正解: 対応するフィールドの correct
   - 不正解: distractors 配列からランダムに4つ選択
   - 計5択をシャッフル → A〜E のラベルを付与

4. GeneratedQuestion[] を返す（最大5問）
```

### ユーティリティ関数

```typescript
// ランダム選択
function randomElement<T>(arr: T[]): T
function shuffleArray<T>(arr: T[]): T[]

// ラベル付与
function assignOptionLabels(items: { text: string; isCorrect: boolean }[]): Option[]
// → シャッフル済み配列に順番に "A"〜"E" を付与する
```

### フォーマットファイルのロード

```typescript
// page.tsx 側でセッション開始時に fetch する
const formatData = await fetch("/data/question_formats/ch05.json").then(r => r.json());
const questionSet = generateQuestionSet(formatData);
```

---

## 3. `public/data/stat_tables/`

### `normal.json` 形式

```json
{
  "description": "標準正規分布表 P(0 ≤ Z ≤ z)",
  "data": {
    "0.0": { "0": 0.0000, "1": 0.0040, "2": 0.0080 },
    "1.9": { "6": 0.4750 }
  }
}
```

キーは z 値の整数部＋小数第1位（文字列）、値オブジェクトのキーは小数第2位。

### `t.json` 形式

```json
{
  "description": "t分布の上側確率（両側）",
  "data": {
    "1":  { "0.10": 6.314, "0.05": 12.706 },
    "10": { "0.10": 1.812, "0.05": 2.228 }
  }
}
```

第1キーが自由度（文字列）、第2キーが有意水準 α。

---

## 4. localStorageスキーマ

| キー | 型 | 説明 |
| :--- | :--- | :--- |
| `learning_history` | `SessionRecord[]` | 学習セッション（セット単位）の履歴 |
| `weakness_data` | `Record<string, CategoryStat>` | カテゴリ別（4大カテゴリ）の正答数・出題数 |
| `mastery_data` | `Record<string, DistributionStat>` | 分布別の習熟度データ（忘却曲線計算用） |
| `daily_mission` | `DailyMissionState` | 今日のデイリーミッション状態 |
| `unlock_status` | `Record<string, boolean>` | チートシートのアンロック状態 |

```typescript
// 各型定義（lib/storage.ts に記述）

// セット1回 = 1レコード
type SessionRecord = {
  date: string;              // "YYYY-MM-DD"
  chapterId: number;         // 例: 5
  distributionId: string;    // 例: "poisson"
  distributionName: string;  // 例: "ポアソン分布"
  score: number;             // 正答数（最大5）
  total: number;             // 出題数（通常5）
};

type CategoryStat = {
  correct: number;
  total: number;
};

// キー: "{chapterId}_{distributionId}" 例: "5_poisson"
type DistributionStat = {
  consecutiveCorrect: number; // 連続正答回数（忘却曲線計算用）
  correct: number;
  total: number;
  lastAnsweredAt: string;     // "YYYY-MM-DDTHH:mm:ss"
  nextReviewAt: string;       // 忘却曲線から算出した次回復習予定日時
};

// DailyMission: 2セット（=10問）を1日のノルマとする
type DailyMissionState = {
  date: string;              // "YYYY-MM-DD"
  targetKeys: string[];      // ターゲット分布のキー ["5_poisson", "5_binomial"]
  completedKeys: string[];   // 完了済み分布のキー
};
```

**`weakness_data` の更新ルール:**  
セット終了時に `SessionRecord.chapterId` → 章→カテゴリのマッピングを用いて対応する `CategoryStat` を更新する。マッピングは `lib/questionGenerator.ts` に定数として持つ。

---

# UI/UX設計仕様

## セット形式の画面フロー

```
学習開始
  ↓
[ScenarioBanner] シナリオ提示（問題設定文を大きく表示）
  ↓
[QuestionCard] Q1: 分布の名称（5択）→ 回答 → 正誤フィードバック + 解説
  ↓「次へ」
[QuestionCard] Q2: 確率関数（5択）→ 回答 → 正誤フィードバック + 解説
  ↓「次へ」
（Q3〜Q5 も同様）
  ↓
[ResultModal] セット結果表示（例: "ポアソン分布 4 / 5 正解"）→ 保存して終了
```

## `ScenarioBanner.tsx`

- 背景色付きのバナー（例: 青背景）でシナリオ文を表示。
- 問題番号インジケータ（例: `Q1 / 5`）を右上に表示。
- セッション中は常に画面上部に固定表示し、Q2以降でも問題設定が確認できる。

## `QuestionCard.tsx`

- 問題文・選択肢内の `$...$` を `<InlineMath>`、`$$...$$` を `<BlockMath>` に変換。
- 選択肢は大きめのボタン（`py-3 px-4`）で配置。
- 選択後、正解/不正解を色分け（緑/赤）で即時フィードバック。
- 正解の選択肢は常に緑でハイライト（不正解選択時でも正解がどれかを示す）。
- 正誤フィードバック下に解説文（`explanation`）を表示。
- 統計数値表が必要な問題（`requiresStatTable: true`、現在は第6章以降で使用）では右上に「数値表」アイコンボタンを表示。

## `ResultModal.tsx`

- セット（5問）終了後に自動表示。
- 表示内容:
  - ヘッダー: 分布名（例: `ポアソン分布`）
  - スコア: 大きく `4 / 5` と表示、正答率に応じて色変更
  - 正答/不正答の問題タイプ一覧（「✓ 確率関数」「✗ 確率母関数」など）
- 「保存して終了」ボタンで `storage.ts` に履歴・弱点・習熟度データを書き込みモーダルを閉じる。
- 「もう1セット」ボタンで新しいセットを即座に生成して開始。

## `RadarChart.tsx`（recharts）

- 4軸のレーダーチャート: 「確率と確率分布」「統計的推測」「多変量解析法」「種々の応用」。
- 各軸の値は `weakness_data` から正答率（0〜100）を算出して渡す。
- データがない（0問）カテゴリは値を 0 として扱う。
- SSRエラー回避のため、`useEffect` で `isMounted` フラグを確認してからレンダリング。

```typescript
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
```

## `DailyMission.tsx`

- トップ画面（`/`）上部に表示する進捗バナー。
- 表示内容: 「今日の復習: X / 2 セット完了」とプログレスバー（2セット=10問ノルマ）。
- `daily_mission.date` が今日と一致しない場合は新しいミッションを生成（後述）。

## `BottomNav.tsx`

- 3タブ固定ナビ（`fixed bottom-0`）: 「学習」「履歴」「分析」。
- アクティブタブは下線または背景色で区別。

---

# 学習機能仕様

## デイリーミッション生成ロジック

`lib/storage.ts` の `generateDailyMission()` 関数で以下のロジックを実行する。

1. `mastery_data` から `nextReviewAt` が今日以前のエントリを抽出する（忘却対象）。
2. 忘却対象を正答率の低い順に並べ、先頭2つを `targetKeys` とする。
3. 忘却対象が2つに満たない場合は、利用可能な `question_formats/*.json` の中から `phase: 1` の分布をランダム補完する。
4. 結果を `daily_mission` に書き込む（`date` を今日の日付で更新）。

**忘却曲線による `nextReviewAt` の更新**

| 連続正答回数 (`consecutiveCorrect`) | 次回復習までの間隔 |
| :---: | :---: |
| 1 | 1日後 |
| 2 | 3日後 |
| 3 | 7日後 |
| 4以上 | 14日後 |

不正答（セットのスコアが3/5未満）の場合は `consecutiveCorrect` をリセットし、`nextReviewAt` を「翌日」に設定する。

## セッションモード（通常学習）

- トップ画面の「学習開始」ボタンからスタート。
- フェーズ選択（1/2/3）→ 対応する `question_formats/*.json` から章をランダム選択 → `generateQuestionSet()` で1セット生成 → セット形式で出題。
- セット終了後に ResultModal を表示して結果を保存。

## アンロックゲーミフィケーション

- `phase: 1`（第5, 6, 16, 20章）の全分布のセット正答率が平均**80%以上**になると、`phase: 3` の難解な章の「チートシートバッジ」がアンロックされる。
- `unlock_status` に `{ "ch15": true }` 形式で保存。
- `/weakness` 画面のレーダーチャート下部にアンロック状況を表示（鍵アイコン + 章タイトル）。
- アンロック済みバッジはタップで解説テキストを展開表示する（外部ファイル不要、ハードコード文字列でよい）。

---

# 実装フェーズ（ステップバイステップで実行すること）

## Phase 1: 初期セットアップとデータ準備

1. Next.jsプロジェクトの作成、Tailwindの初期化。
2. `react-katex`, `katex`, `lucide-react`, `recharts` のインストール。
3. `public/data/question_formats/ch05.json` を本仕様書のスキーマに従い作成する。
   - 8分布すべての `DistributionDef` を記述。シナリオは各10個。
   - `distractors` は各問題タイプにつき他分布の式3個＋変形誤答2個以上を含めること。
4. `public/data/stat_tables/normal.json` と `t.json` を最小データで作成する。
5. `app/layout.tsx` に KaTeX の CSS (`katex/dist/katex.min.css`) をインポート。

## Phase 2: 生成エンジンとストレージ基盤

1. `lib/questionGenerator.ts` を作成。以下を実装する:
   - 型定義: `QuestionSet`, `GeneratedQuestion`, `Option`
   - `generateQuestionSet(formatData: ChapterFormat): QuestionSet`
   - ユーティリティ: `randomElement`, `shuffleArray`, `assignOptionLabels`
   - カテゴリマッピング定数: `CHAPTER_TO_CATEGORY: Record<number, string>`
2. `lib/storage.ts` を作成。以下の関数を実装する:
   - `getHistory() → SessionRecord[]`
   - `saveSession(record: SessionRecord): void`
   - `getWeaknessData() → Record<string, CategoryStat>`
   - `updateWeaknessData(chapterId: number, isCorrect: boolean, total: number): void`
   - `getMasteryData() → Record<string, DistributionStat>`
   - `updateMasteryData(key: string, score: number, total: number): void`（忘却曲線の更新含む）
   - `getDailyMission() → DailyMissionState`
   - `generateDailyMission(availableKeys: string[]): DailyMissionState`
   - `getUnlockStatus() → Record<string, boolean>`
   - `checkAndUnlock(): void`

## Phase 3: UIコンポーネント

1. `components/BottomNav.tsx`（fixed, bottom-0）。
2. `components/ScenarioBanner.tsx`（シナリオ文 + Q番号インジケータ）。
3. `components/QuestionCard.tsx`（react-katex、選択肢ボタン、正誤フィードバック）。
4. `components/ResultModal.tsx`（スコア表示、保存ボタン、もう1セットボタン）。
5. `components/StatTableModal.tsx`（タブ切り替え、normal/t分布表表示）。

## Phase 4: ページ実装

1. `app/page.tsx`（学習画面）:
   - 上部に `DailyMission.tsx` バナーを表示。
   - 「デイリーミッション開始」ボタンと「通常学習（フェーズ選択）」ボタンを配置。
   - `ch05.json` を fetch → `generateQuestionSet()` → `ScenarioBanner` + `QuestionCard` でセット形式表示。
   - 5問終了 → `ResultModal` 表示 → 保存後 `checkAndUnlock()` 呼び出し。
2. `app/history/page.tsx`（履歴画面）:
   - `learning_history` を日付降順でリスト表示。
   - 各履歴に「日付」「分布名」「正答率（例: 4/5）」を表示。
3. `app/weakness/page.tsx`（弱点分析画面）:
   - `RadarChart.tsx` で4カテゴリの習熟度をレーダーチャート表示。
   - チャート下部にアンロック状況（鍵アイコン一覧）を表示。

## Phase 5: デイリーミッションとゲーミフィケーション

1. `components/DailyMission.tsx` を完成させ、`app/page.tsx` に組み込む。
2. `updateMasteryData` の忘却曲線ロジックを実装・テスト。
3. アンロックバッジのチートシートテキストをハードコードして展開表示を実装。

## Phase 6: PWA対応

1. `next-pwa` 等を導入し、`next.config.js` を設定。
2. `manifest.json` とダミーのアイコン（512×512, 192×192）を配置し、インストール可能にする。

まずは **Phase 1 と Phase 2** の完了を目指して作業を開始してください。
