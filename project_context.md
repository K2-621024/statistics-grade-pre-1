# プロジェクト方針と課題管理 (Project Context)

## 📍 現状 (Current Status)

### プロジェクトの目的
統計検定準1級（CBT）の合格に向けた自主学習を効率化する。各章の理論を問題演習を通じて定着させ、弱点分野を可視化・重点的に復習できる PWA アプリを自作する。

### 目指す状態・To-Be
- 統計検定準1級に合格する
- アプリ：全 32 章の question_format を整備し、忘却曲線に基づくデイリーミッションで継続的に学習できる状態
- アプリ：スマートフォンからもストレスなく問題演習できる（PWA インストール対応）

### 現在のベースライン・As-Is
- アプリ：第5章（離散確率分布）の question_format のみ実装済み・ビルド成功
- アプリ：数式レンダリング（KaTeX）・選択肢 UI に複数のバグが残存
- 演習問題ファイル：ch5（離散分布）・ch6（連続分布・標本分布）のみ作成済み

### 制約条件・前提事項
- 学習データは localStorage のみ（サーバー不使用）
- 問題の選択肢・シナリオはすべて事前定義 JSON から動的生成

---

## ⏩ 未来 (Future & Backlog)

### 当面のネクストアクション
- stat-prep-app の UI バグ修正（数式未表示・答えリーク・文字色）を優先対応する
- スマホ確認環境を整える（Vercel デプロイ or ngrok）

### 残課題リスト (Backlog)

| ID | 優先度 | 大分類 | 中分類 | 施策内容 | 想定作業量 | 実現可能性 | ステータス |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| T001 | 高 | stat-prep-app | UX改善 | 問題間で直前の問題の正答と解説を確認してから次へ進む導線に変更する | 小 | 高 | Completed |
| T002 | 高 | stat-prep-app | UX改善 | 選択肢タップ → 「回答する」ボタン押下 → 正誤表示、という2ステップ導線に変更する | 小 | 高 | Completed |
| T003 | 高 | stat-prep-app | UX改善 | 選択肢テキストの文字色が薄すぎるため視認性を改善する | 小 | 高 | Completed |
| T004 | 高 | stat-prep-app | バグ修正 | ScenarioBanner に分布名が表示されており Q1（分布名を問う問題）の答えがリークしている | 小 | 高 | Completed |
| T005 | 高 | stat-prep-app | バグ修正 | 選択肢の数式が LaTeX 記法のまま表示されている（KaTeX でレンダリングされていない） | 小 | 高 | Completed |
| T006 | 高 | stat-prep-app | 環境整備 | スマートフォンで動作確認できる環境を整える（Vercel デプロイ推奨） | 小 | 高 | In Progress |
| T007 | 中 | stat-prep-app | コンテンツ | constants.ts の CHEAT_SHEET_TEXTS に第6章以降のチートシートテキストを追加する | 中 | 高 | Not Started |
| T008 | 中 | stat-prep-app | テスト | npm run build && npm run start で PWA 本番モード（Service Worker・オフライン）の動作を確認する | 小 | 高 | Not Started |
| T009 | 中 | stat-prep-app | データ整備 | ch06.json（連続分布・標本分布）の question_format を作成してアプリに追加する | 大 | 高 | Not Started |
| T010 | 低 | 演習問題 | コンテンツ | ch0_Template.md のフォーマットに従って ch7〜ch32 の演習問題ファイルを順次作成する | 大 | 高 | In Progress |
