# Dynamic Ontology Operations System

形式的なDynamic Ontologyの実証システム

## 概要

このシステムは、従来のentity/relationshipの枠組みを超えた、新しい形式的オントロジー体系を実証するために作成されました。オントロジーを「多様体（manifold）的な対象」とみなし、その上で以下の5つの演算を実装しています：

### サポートする演算

1. **足し算 (Addition/Sum)** `⊕` - 単純な合併（Disjoint Union）
2. **引き算 (Subtraction)** `∖` - 差分（Set Difference）
3. **合併 (Merge)** `∪` - 対応付けベースの統合（Alignment-based Union）
4. **合成 (Composition)** `∘` - インターフェース経由の接続（Interface-based Connection）
5. **割り算 (Division)** `÷` - 逆問題・補完（Inverse Problem/Decomposition）

## 理論的背景

詳細な理論は以下のドキュメントを参照：

- **理論**: `the_theory/theory_dyamic_ontology.md`
- **説明事例**: `the_theory/explanatory_example.md`
- **工場とGHGの事例**: `sample_by_chatgpt/README.md`

### オントロジーの形式的定義

```
O = (C, R, A, I, Σ)
```

- **C**: Classes（概念の集合）
- **R**: Relations（関係の集合）
- **A**: Axioms（公理・制約の集合）
- **I**: Instances（インスタンス空間）
- **Σ**: Vocabulary（語彙・メタ情報）

## プロジェクト構造

```
.
├── backend/                  # Node.js/Express バックエンド
│   ├── src/
│   │   ├── server.js        # メインサーバー
│   │   ├── routes/          # API ルート
│   │   │   └── ontology.js
│   │   ├── services/        # ビジネスロジック
│   │   │   ├── ontologyService.js
│   │   │   └── llmService.js
│   │   └── prompts/         # LLM プロンプトテンプレート
│   │       └── operations.js
│   ├── package.json
│   └── .env.example
│
├── frontend/                 # React フロントエンド
│   ├── src/
│   │   ├── App.jsx          # メインアプリケーション
│   │   ├── components/      # UIコンポーネント
│   │   │   ├── OntologyViewer.jsx
│   │   │   ├── OperationPanel.jsx
│   │   │   └── ResultDisplay.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── the_theory/              # 理論ドキュメント
│   ├── theory_dyamic_ontology.md
│   └── explanatory_example.md
│
├── sample_by_chatgpt/       # サンプルデータ
│   ├── factory_production.ttl
│   ├── ghg_report.ttl
│   └── ...
│
└── README.md                # このファイル
```

## セットアップと起動

### 必要な環境

- Node.js 18.x 以上
- npm または yarn

### 1. 依存パッケージのインストール

```bash
# バックエンド
cd backend
npm install

# フロントエンド
cd ../frontend
npm install
```

### 2. 環境変数の設定（オプション）

LLM APIを使用する場合、バックエンドディレクトリに `.env` ファイルを作成します：

```bash
cd backend
cp .env.example .env
```

`.env` ファイルを編集して、LLM プロバイダーとAPIキーを設定：

```env
# OpenAI を使用する場合
LLM_PROVIDER=openai
LLM_API_KEY=sk-your-openai-api-key

# または Anthropic を使用する場合
LLM_PROVIDER=anthropic
LLM_API_KEY=sk-ant-your-anthropic-api-key
```

**注意**: APIキーを設定しない場合、システムはモックモードで動作します（演算結果はダミーデータになります）。

### 3. サーバーの起動

**バックエンドサーバー**（ターミナル1）:

```bash
cd backend
npm start
```

サーバーは `http://localhost:3000` で起動します。

**フロントエンドサーバー**（ターミナル2）:

```bash
cd frontend
npm run dev
```

フロントエンドは `http://localhost:5173` で起動します。

### 4. ブラウザでアクセス

ブラウザで `http://localhost:5173` を開いてください。

## 使い方

### 1. 事例の選択

画面上部の「Examples」セクションから、以下の事例を選択できます：

- **Person/Employee vs Human/Worker**: 理論説明用の簡単な事例
- **Factory Production + GHG Report**: 工場の生産記録とGHG報告の事例

### 2. 演算の選択

中央のパネルから、実行したい演算を選択します：

- ⊕ Addition (Sum)
- ∖ Subtraction (Difference)
- ∪ Merge (Alignment-based Union)
- ∘ Composition (Interface-based Connection)
- ÷ Division (Inverse/Decomposition)

### 3. 演算の実行

「Execute Operation」ボタンをクリックして、選択した演算を実行します。

### 4. 結果の確認

結果は以下のタブで確認できます：

- **Ontology Result**: 結果として生成されたオントロジー
- **Alignments**: 対応付け情報（Merge演算の場合）
- **Conflicts**: 検出された矛盾と解決策
- **Metadata & Analysis**: メタデータと分析情報
- **Full JSON**: 完全なJSON出力

## API エンドポイント

バックエンドは以下のAPIエンドポイントを提供します：

### GET /api/operations

利用可能な演算のリストを取得

### GET /api/examples

サンプルオントロジーを取得

### POST /api/execute/:operation

オントロジー演算を実行

**パラメータ**:
- `:operation`: 演算タイプ（addition, subtraction, merge, composition, division）

**リクエストボディ**:
```json
{
  "ontologyA": { ... },
  "ontologyB": { ... },
  "options": {
    "llm": {
      "provider": "openai",
      "apiKey": "...",
      "model": "gpt-4-turbo-preview"
    }
  }
}
```

### POST /api/validate

オントロジー構造を検証

### POST /api/convert/to-turtle

オントロジーをTurtle形式に変換

### POST /api/test-llm

LLM接続をテスト

## オントロジーのJSON形式

システムで使用するオントロジーは以下の形式です：

```json
{
  "id": "ontology-id",
  "name": "Ontology Name",
  "version": "1.0",
  "metadata": {},
  "classes": [
    {
      "id": "ClassName",
      "name": "Class Name",
      "superClasses": ["ParentClass"],
      "metadata": {}
    }
  ],
  "relations": [
    {
      "id": "relationId",
      "name": "relation name",
      "domain": "DomainClass",
      "range": "RangeClass",
      "type": "object",
      "constraints": {},
      "metadata": {}
    }
  ],
  "axioms": [],
  "instances": [],
  "vocabulary": {}
}
```

## 技術スタック

### バックエンド
- **Node.js** - ランタイム
- **Express** - Webフレームワーク
- **dotenv** - 環境変数管理

### フロントエンド
- **React 18** - UIライブラリ
- **Vite** - ビルドツール

### LLM統合
- OpenAI API (GPT-4)
- Anthropic API (Claude)

## トラブルシューティング

### バックエンドが起動しない

- Node.jsのバージョンを確認: `node --version` (18.x以上が必要)
- 依存パッケージを再インストール: `rm -rf node_modules package-lock.json && npm install`

### フロントエンドが起動しない

- ポート5173が使用中でないか確認
- Viteの設定を確認: `vite.config.js`

### LLM APIエラー

- `.env` ファイルのAPIキーが正しいか確認
- APIキーに十分なクレジットがあるか確認
- プロバイダー（openai/anthropic）が正しく設定されているか確認

### モックモードで動作している

- APIキーを設定していない場合、システムは自動的にモックモードになります
- 実際のLLMを使用するには、`.env` ファイルを設定してサーバーを再起動してください

## ライセンス

MIT

## 参考文献

- オントロジー工学
- 圏論（Category Theory）
- 多様体理論（Manifold Theory）
- LLMを用いた知識処理