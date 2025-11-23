# Dynamic Ontology Documentation

形式的なDynamic Ontologyシステムの包括的なドキュメント集

## ドキュメント一覧

### 📚 理論編

**[theory.md](theory.md)** - 理論的基礎

- 形式的定義: O = (C, R, A, I, Σ)
- 多様体的アプローチ
- 演算の数学的基礎（足し算、引き算、合併、合成、割り算）
- 圏論的解釈
- LLMによる実装戦略

**対象読者**: 数学的背景を持つ研究者、理論に興味のある開発者

---

### 🛠️ 実装編

**[implementation.md](implementation.md)** - システム実装ガイド

- アーキテクチャ概要
- バックエンド実装（Node.js + Express）
- フロントエンド実装（React + Vite）
- LLM統合（OpenAI/Anthropic）
- データフロー
- 拡張方法

**対象読者**: システム開発者、実装に携わるエンジニア

---

### 📖 例題編

**[examples.md](examples.md)** - 実行例題詳説

**例題1**: Person/Employee vs Human/Worker
- 基本的な対応付け
- 命名規則の違い
- 矛盾解決の実例

**例題2**: Factory Production + GHG Report
- 実用的なデータ統合
- 数値計算の組み込み
- Composition演算の実践

**対象読者**: システムの使い方を学びたいユーザー、実践的な例が必要な開発者

---

### ⚙️ 演算詳細編

**[operations.md](operations.md)** - 各演算の詳細解説

各演算の詳細：
- **Addition（⊕）**: 単純な合併
- **Subtraction（∖）**: 差分抽出
- **Merge（∪）**: 対応付けベースの統合
- **Composition（∘）**: インターフェース経由の接続
- **Division（÷）**: 逆問題・補完

各演算について：
- 定義と数学的表現
- アルゴリズム
- LLMプロンプト例
- 使用例
- 注意点

**対象読者**: 各演算の詳細を理解したい開発者、カスタマイズを行うエンジニア

---

## ドキュメントの読み方

### 初めての方

```
1. README.md（このファイル）
   ↓
2. examples.md（具体例で理解）
   ↓
3. operations.md（各演算の詳細）
   ↓
4. implementation.md（実装を学ぶ）
   ↓
5. theory.md（理論的背景）
```

### 開発者の方

```
1. implementation.md（アーキテクチャ理解）
   ↓
2. operations.md（演算の仕様確認）
   ↓
3. examples.md（実装例の参照）
   ↓
4. theory.md（必要に応じて理論を深掘り）
```

### 研究者の方

```
1. theory.md（理論的基礎）
   ↓
2. operations.md（演算の形式化）
   ↓
3. implementation.md（実装における課題）
   ↓
4. examples.md（検証例）
```

---

## クイックリファレンス

### 基本概念

| 用語 | 説明 | 参照 |
|------|------|------|
| Dynamic Ontology | 演算可能なオントロジー体系 | [theory.md](theory.md#概要) |
| O = (C, R, A, I, Σ) | オントロジーの5要素 | [theory.md](theory.md#形式的定義) |
| Alignment | オントロジー間の対応付け | [operations.md](operations.md#merge合併) |
| LLM Integration | 大規模言語モデルによる演算実行 | [implementation.md](implementation.md#llm統合) |

### 5つの演算

| 演算 | 記号 | 用途 | 詳細 |
|------|------|------|------|
| Addition | ⊕ | モジュール結合 | [operations.md](operations.md#addition足し算) |
| Subtraction | ∖ | データ削除 | [operations.md](operations.md#subtraction引き算) |
| Merge | ∪ | 意味的統合 | [operations.md](operations.md#merge合併) |
| Composition | ∘ | ワークフロー接続 | [operations.md](operations.md#composition合成) |
| Division | ÷ | 補完・復元 | [operations.md](operations.md#division割り算) |

### コード例の場所

| 内容 | ファイル | 行 |
|------|----------|-----|
| バックエンドサーバー | [implementation.md](implementation.md#1-サーバー構成-srcserverjs) | - |
| LLMサービス | [implementation.md](implementation.md#3-llmサービス-srcservicesllmservicejs) | - |
| プロンプトテンプレート | [implementation.md](implementation.md#4-プロンプトテンプレート-srcpromptsoperationsjs) | - |
| Reactコンポーネント | [implementation.md](implementation.md#1-アプリケーション構造-srcappjsx) | - |

---

## よくある質問

### Q1: どの演算を使えばいいですか？

**A**: 目的に応じて選択します：

- 独立したモジュールを結合 → **Addition**
- 類似したオントロジーを統合 → **Merge**
- 処理フローを接続 → **Composition**
- 不要な部分を削除 → **Subtraction**
- 失われた部分を復元 → **Division**

詳細は [operations.md](operations.md#演算の概要) を参照。

### Q2: LLMは必須ですか？

**A**: いいえ。APIキーがない場合、モックモードで動作します。ただし、実際の演算にはLLM（OpenAI または Anthropic）のAPIキーが必要です。

詳細は [implementation.md](implementation.md#llm統合) を参照。

### Q3: 新しい演算を追加できますか？

**A**: はい。プロンプトテンプレートを追加することで可能です。

詳細は [implementation.md](implementation.md#新しい演算の追加) を参照。

### Q4: オントロジーのフォーマットは？

**A**: JSON形式で、以下の構造を持ちます：

```json
{
  "id": "...",
  "name": "...",
  "classes": [...],
  "relations": [...],
  "axioms": [...],
  "instances": [...],
  "vocabulary": {...}
}
```

詳細は [theory.md](theory.md#形式的定義) を参照。

### Q5: Turtle形式も使えますか？

**A**: はい。バックエンドで変換機能があります（`/api/convert/to-turtle`）。

詳細は [implementation.md](implementation.md#5-apiルート-srcroutesontologyjs) を参照。

---

## 追加リソース

### 外部ドキュメント

- **理論の元資料**: `../the_theory/theory_dyamic_ontology.md`
- **説明的事例**: `../the_theory/explanatory_example.md`
- **サンプルデータ**: `../sample_by_chatgpt/`

### コードリポジトリ

- **バックエンド**: `../backend/`
- **フロントエンド**: `../frontend/`

### API仕様

メインREADME（`../README.md`）のAPIセクションを参照。

---

## 貢献・フィードバック

### ドキュメントの改善

ドキュメントに不明点や誤りがある場合：

1. GitHubでIssueを作成
2. Pull Requestで修正を提案
3. ディスカッションで質問

### 新しい例題の追加

実用的な例題があれば、`examples.md` への追加を歓迎します：

1. 問題の説明
2. オントロジーの定義（JSON）
3. 実行結果
4. 学びのポイント

---

## バージョン情報

- **最終更新**: 2025-11-23
- **システムバージョン**: 1.0.0
- **対応LLM**:
  - OpenAI: GPT-4 Turbo
  - Anthropic: Claude Haiku 4.5

---

## ライセンス

MIT License

---

## 謝辞

このシステムは、以下の理論と研究に基づいています：

- Category Theory for the Sciences (David I. Spivak)
- Ontology Matching (Jérôme Euzenat, Pavel Shvaiko)
- OWL 2 Web Ontology Language (W3C)
- Large Language Models in Semantic Web (最新研究)

---

## 関連プロジェクト

- **RDF**: Resource Description Framework
- **OWL**: Web Ontology Language
- **SPARQL**: RDF Query Language
- **Protégé**: Ontology Editor

Dynamic Ontologyはこれらの技術を補完し、**演算可能性**という新しい次元を追加します。

---

**Happy Ontology Engineering! 🚀**
