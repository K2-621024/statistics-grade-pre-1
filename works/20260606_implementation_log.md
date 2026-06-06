# 実装ログ：統計検定準1級対策PWA

実装日：2026-06-05〜06  
対象仕様：`works/20260605_specification_v2.md`

---

## 失敗事例と解決方法

### 1. PowerShell での日本語パスを含む mkdir が文字化けして失敗

**状況**  
`mkdir "c:\Users\Soichiro\Documents\資格試験\..."` を Bash ツール経由で実行すると、パスの日本語部分が文字化けして "ディレクトリが見つかりません" エラーになった。

**原因**  
Windows 環境では Bash ツールの文字エンコーディングと PowerShell の文字エンコーディングが異なるため、日本語を含むパスが正しく渡せなかった。

**解決方法**  
PowerShell ツールで `New-Item -ItemType Directory -Force` を使用することで正常にディレクトリを作成できた。

```powershell
New-Item -ItemType Directory -Force "C:\Users\Soichiro\Documents\資格試験\00_Statistic_GRADE_PRE_1\stat-prep-app"
```

---

### 2. Write ツールで「ファイルを先に読み取っていない」エラー

**状況**  
既存ファイル（`app/page.tsx` など Next.js のボイラープレート）を直接 Write ツールで上書きしようとするとエラーになった。

**原因**  
CLAUDE.md のルール：「既存ファイルへの書き込み・上書きは確認必要」に加え、Write ツール自体が「事前に Read していないファイルは書き込めない」という制約を持つ。

**解決方法**  
Write する前に必ず Read ツールで対象ファイルを読み込んでから上書きする。

---

### 3. JSON ファイルへの LaTeX 数式の二重エスケープ問題

**状況**  
`public/data/question_formats/ch05.json` に LaTeX 数式（`\lambda`, `\frac{1}{n}` など）を Write ツールで直接書こうとすると、正しいエスケープ数を把握しにくく、パース時に壊れた数式になった。

**原因**  
JSON では `\` を `\\` と書く必要があり、さらに Write ツールに渡す文字列でも考慮が必要になるため、`\lambda` → `\\lambda`（JSON上）→ Write ツール入力では `\\\\lambda` と 4 重になる場合がある。

**解決方法**  
Node.js の CommonJS スクリプト（`generate-ch05.cjs`）を作成し、JavaScript オブジェクトとして数式を定義（シングルバックスラッシュで記述）したうえで `JSON.stringify()` に任せてエスケープを自動処理させた。生成された `ch05.json` は正しい JSON エンコード済みファイルとなる。スクリプトは生成後に削除。

```js
// JavaScript 内では単一バックスラッシュで記述
const formula = "\\frac{1}{n}";
// JSON.stringify が \\frac{1}{n} に変換してくれる
fs.writeFileSync("ch05.json", JSON.stringify(data, null, 2));
```

同様の手法で PWA アイコン（192×512 の PNG）も `generate-icons.cjs` で生成し、Node.js 組み込みの `zlib` と手動 PNG バイナリ構築で外部ライブラリなしに生成した。

---

### 4. Next.js 16（Turbopack デフォルト）と next-pwa の webpack 設定が競合

**状況**  
`npm run build` 実行時に以下のエラーが発生した。

```
ERROR: This build is using Turbopack, with a `webpack` config and no `turbopack` config.
```

**原因**  
Next.js 16 では Turbopack がデフォルトで有効になった。`@ducanh2912/next-pwa` は内部で webpack 設定を注入するため、Turbopack モードで実行するとコンフリクトとして検出された。

**解決方法**  
`next.config.ts` に空の `turbopack: {}` を追加することで、意図的に Turbopack を使用する設定であることを明示し、エラーを解消した。

```ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
};
```

---

### 5. `lucide-react` パッケージが未インストール

**状況**  
ビルド時に `Module not found: Can't resolve 'lucide-react'` が 8 ファイルで発生した。

**原因**  
プロジェクト作成時の `package.json` に `lucide-react` が含まれていなかった。仕様書では使用を前提としていたが、初期インストールコマンドから漏れていた。

**解決方法**  
```
npm install lucide-react
```

---

### 6. `react-katex` の TypeScript 型宣言が存在しない

**状況**  
`components/MathText.tsx` で以下の型エラーが発生した。

```
Could not find a declaration file for module 'react-katex'.
```

**原因**  
`react-katex` v3 系は TypeScript の型定義（`@types/react-katex`）を公開しておらず、パッケージ本体にも `.d.ts` が含まれていない。

**解決方法**  
`types/react-katex.d.ts` を作成してモジュール宣言を手動で定義した。

```ts
declare module "react-katex" {
  import { ComponentProps } from "react";
  export const InlineMath: React.FC<{ math: string } & ComponentProps<"span">>;
  export const BlockMath: React.FC<{ math: string } & ComponentProps<"div">>;
}
```

`tsconfig.json` の `include: ["**/*.ts"]` によって自動認識された。

---

### 7. recharts `Tooltip` の `formatter` prop 型エラー

**状況**  
`components/RadarChart.tsx` で以下の型エラーが発生した。

```
Type '(v: number) => [string, string]' is not assignable to type 'Formatter<ValueType, NameType>'
Types of parameters 'v' and 'value' are incompatible.
  Type 'ValueType | undefined' is not assignable to type 'number'.
```

**原因**  
recharts v3 の `Formatter` 型は第1引数を `ValueType | undefined`（`string | number | undefined`）として定義しているため、`number` に絞った型注釈は代入不可だった。

**解決方法**  
型注釈を外して TypeScript に推論させるように変更した。

```tsx
// 修正前
formatter={(v: number) => [`${v}%`, "正答率"]}

// 修正後
formatter={(v) => [`${v}%`, "正答率"]}
```

---

### 8. `@ducanh2912/next-pwa` の `skipWaiting` オプションが存在しない

**状況**  
ビルド時に次の型エラーが発生した。

```
Object literal may only specify known properties, and 'skipWaiting' does not exist in type 'PluginOptions'.
```

**原因**  
`@ducanh2912/next-pwa` v10 系では `skipWaiting` は `PluginOptions` から削除されており（Service Worker 側で自動処理）、設定オブジェクトに渡せない。

**解決方法**  
`skipWaiting: true` の行を削除した。

---

## ビルド成功までのエラー解消順序

| # | エラー内容 | 解決策 |
|---|-----------|--------|
| 1 | Turbopack + webpack コンフリクト | `turbopack: {}` 追加 |
| 2 | `lucide-react` not found | `npm install lucide-react` |
| 3 | `react-katex` 型宣言なし | `types/react-katex.d.ts` 作成 |
| 4 | recharts Formatter 型不整合 | 型注釈を削除 |
| 5 | `skipWaiting` プロパティなし | オプション削除 |

最終的に `npm run build` が TypeScript エラー 0、静的ページ 3 ルート（`/`, `/history`, `/weakness`）で成功した。
