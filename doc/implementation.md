# Dynamic Ontology システム実装ガイド

## 目次

1. [アーキテクチャ概要](#アーキテクチャ概要)
2. [バックエンド実装](#バックエンド実装)
3. [フロントエンド実装](#フロントエンド実装)
4. [LLM統合](#llm統合)
5. [データフロー](#データフロー)
6. [拡張方法](#拡張方法)

---

## アーキテクチャ概要

### システム構成

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│  ┌───────────┐  ┌──────────────────┐   │
│  │ Ontology  │  │   Operation      │   │
│  │  Viewer   │  │     Panel        │   │
│  └───────────┘  └──────────────────┘   │
│  ┌───────────────────────────────────┐ │
│  │      Result Display               │ │
│  └───────────────────────────────────┘ │
└─────────────────┬───────────────────────┘
                  │ HTTP/JSON
                  │
┌─────────────────▼───────────────────────┐
│      Backend (Node.js + Express)        │
│  ┌───────────────────────────────────┐  │
│  │      API Routes                   │  │
│  │  /api/operations                  │  │
│  │  /api/execute/:operation          │  │
│  │  /api/validate, /api/examples     │  │
│  └──────────────┬────────────────────┘  │
│                 │                        │
│  ┌──────────────▼────────────────────┐  │
│  │   Services Layer                  │  │
│  │  ┌──────────────┐ ┌────────────┐ │  │
│  │  │ Ontology     │ │   LLM      │ │  │
│  │  │  Service     │ │  Service   │ │  │
│  │  └──────────────┘ └────────────┘ │  │
│  └──────────────┬────────────────────┘  │
│                 │                        │
│  ┌──────────────▼────────────────────┐  │
│  │   Prompt Templates                │  │
│  │   (operations.js)                 │  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  LLM API       │
         │  (OpenAI/      │
         │   Anthropic)   │
         └────────────────┘
```

### 技術スタック

**バックエンド**:
- Node.js (v18+)
- Express.js (Web フレームワーク)
- dotenv (環境変数管理)

**フロントエンド**:
- React 18 (UIライブラリ)
- Vite (ビルドツール)
- CSS Modules (スタイリング)

**LLM統合**:
- OpenAI API
- Anthropic Claude API

---

## バックエンド実装

### 1. サーバー構成 (`src/server.js`)

```javascript
// 基本構成
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ontologyRouter from './routes/ontology.js';

dotenv.config();
const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ルート
app.use('/api', ontologyRouter);

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});
```

**ポイント**:
- JSONペイロードサイズを10MBに制限（大きなオントロジー対応）
- CORSを有効化（フロントエンドとの通信）
- グローバルエラーハンドラーで統一的なエラー処理

---

### 2. オントロジーサービス (`src/services/ontologyService.js`)

#### データ構造

```javascript
/**
 * オントロジー構造
 * @typedef {Object} DynamicOntology
 * @property {string} id
 * @property {string} name
 * @property {string} version
 * @property {Object} metadata
 * @property {Class[]} classes
 * @property {Relation[]} relations
 * @property {Axiom[]} axioms
 * @property {Instance[]} instances
 * @property {Object} vocabulary
 */
```

#### 主要メソッド

**1. validate(ontology)**

オントロジーの構造を検証：

```javascript
static validate(ontology) {
  const errors = [];

  // 必須フィールドの確認
  if (!ontology.id) errors.push('id is required');
  if (!Array.isArray(ontology.classes))
    errors.push('classes must be an array');

  // 参照の整合性チェック
  const classIds = new Set(ontology.classes.map(c => c.id));
  ontology.relations.forEach(rel => {
    if (rel.domain && !classIds.has(rel.domain)) {
      errors.push(`Unknown domain: ${rel.domain}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
```

**2. toTurtle(ontology)**

オントロジーをTurtle形式に変換：

```javascript
static toTurtle(ontology) {
  let turtle = `@prefix : <http://example.org/${ontology.id}#> .\n`;
  turtle += `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\n`;

  // クラス
  ontology.classes.forEach(cls => {
    turtle += `:${cls.id} a rdfs:Class .\n`;
    if (cls.superClasses) {
      cls.superClasses.forEach(parent => {
        turtle += `:${cls.id} rdfs:subClassOf :${parent} .\n`;
      });
    }
  });

  // 関係
  ontology.relations.forEach(rel => {
    turtle += `:${rel.id} a rdf:Property ;\n`;
    turtle += `  rdfs:domain :${rel.domain} ;\n`;
    turtle += `  rdfs:range ${rel.range} .\n`;
  });

  return turtle;
}
```

---

### 3. LLMサービス (`src/services/llmService.js`)

#### 設計パターン: Strategy Pattern

異なるLLMプロバイダーを統一インターフェースで扱う：

```javascript
export class LLMService {
  constructor(config = {}) {
    this.provider = config.provider || process.env.LLM_PROVIDER;
    this.apiKey = config.apiKey || process.env.LLM_API_KEY;
    this.model = config.model || this.getDefaultModel();
  }

  // プロバイダー別のデフォルトモデル
  getDefaultModel() {
    switch (this.provider) {
      case 'openai': return 'gpt-4-turbo-preview';
      case 'anthropic': return 'claude-haiku-4-5';
      default: return 'gpt-4-turbo-preview';
    }
  }

  // 統一実行インターフェース
  async execute(prompt, options = {}) {
    if (!this.apiKey) {
      return this.getMockResponse(prompt);
    }

    const response = await this.callAPI(prompt, options);
    return this.parseResponse(response);
  }
}
```

#### OpenAI API呼び出し

```javascript
async callOpenAI(prompt, options) {
  const response = await fetch(`${this.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    },
    body: JSON.stringify({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert in ontology engineering...'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature || 0.3,
      response_format: { type: 'json_object' }
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

#### Anthropic Claude API呼び出し

```javascript
async callAnthropic(prompt, options) {
  const response = await fetch(`${this.baseURL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: this.model,
      max_tokens: options.maxTokens || 4000,
      temperature: options.temperature || 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  const data = await response.json();
  return data.content[0].text;
}
```

#### モックモード

API キーがない場合の動作：

```javascript
getMockResponse(prompt) {
  console.log('Using mock LLM response (no API key configured)');

  if (prompt.includes('Merge')) {
    return {
      result: { /* モックの統合結果 */ },
      alignments: [
        {
          sourceA: 'Person',
          sourceB: 'Human',
          confidence: 0.95,
          reasoning: 'Mock alignment'
        }
      ],
      conflicts: [],
      metadata: { operation: 'merge', mock: true }
    };
  }

  return { /* デフォルトモック */ };
}
```

---

### 4. プロンプトテンプレート (`src/prompts/operations.js`)

#### テンプレート設計

各演算用のプロンプトを関数として定義：

```javascript
export const OPERATION_PROMPTS = {
  merge: {
    name: 'Merge (Alignment-based Union)',
    description: 'Merge two ontologies by identifying alignments',
    template: (ontologyA, ontologyB) => `
# Task: Ontology Merge

You are performing an INTELLIGENT MERGE of two ontologies.

## Input Ontology A:
${JSON.stringify(ontologyA, null, 2)}

## Input Ontology B:
${JSON.stringify(ontologyB, null, 2)}

## Instructions:
1. Identify semantic correspondences between A and B
2. Merge aligned concepts
3. Detect and resolve conflicts
4. Output in JSON format

## Output Format:
{
  "result": { /* merged ontology */ },
  "alignments": [ /* detected alignments */ ],
  "conflicts": [ /* detected conflicts */ ],
  "metadata": { /* operation metadata */ }
}
`
  }
};
```

#### プロンプト生成関数

```javascript
export function generatePrompt(operation, params) {
  const promptConfig = OPERATION_PROMPTS[operation];

  if (!promptConfig) {
    throw new Error(`Unknown operation: ${operation}`);
  }

  switch (operation) {
    case 'merge':
      return promptConfig.template(
        params.ontologyA,
        params.ontologyB
      );
    case 'composition':
      return promptConfig.template(
        params.ontologyA,
        params.ontologyB,
        params.interface
      );
    default:
      return promptConfig.template(
        params.ontologyA,
        params.ontologyB
      );
  }
}
```

---

### 5. APIルート (`src/routes/ontology.js`)

#### 演算実行エンドポイント

```javascript
router.post('/execute/:operation', async (req, res) => {
  try {
    const { operation } = req.params;
    const { ontologyA, ontologyB, interface, options = {} } = req.body;

    // 入力検証
    if (!ontologyA) {
      return res.status(400).json({
        error: 'ontologyA is required'
      });
    }

    // プロンプト生成
    const prompt = generatePrompt(operation, {
      ontologyA,
      ontologyB,
      interface
    });

    // LLM実行
    const llmService = createLLMService(options.llm);
    const result = await llmService.execute(prompt, {
      temperature: options.temperature,
      maxTokens: options.maxTokens
    });

    // 結果の検証
    if (result.result) {
      const validation = OntologyService.validate(result.result);
      if (!validation.valid) {
        console.warn('Invalid ontology:', validation.errors);
        result.validation = validation;
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Operation execution error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

#### サンプルデータエンドポイント

```javascript
router.get('/examples', (req, res) => {
  const examples = {
    person: { /* Person/Employee オントロジー */ },
    factory: { /* Factory Production オントロジー */ },
    ghg: { /* GHG Report オントロジー */ }
  };

  res.json({ examples });
});
```

---

## フロントエンド実装

### 1. アプリケーション構造 (`src/App.jsx`)

#### 状態管理

```javascript
function App() {
  // オントロジー状態
  const [ontologyA, setOntologyA] = useState(null);
  const [ontologyB, setOntologyB] = useState(null);

  // 演算選択
  const [selectedOperation, setSelectedOperation] = useState('merge');
  const [operations, setOperations] = useState([]);

  // 実行状態
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // LLM接続状態
  const [llmStatus, setLlmStatus] = useState(null);
}
```

#### 演算実行ロジック

```javascript
const executeOperation = async () => {
  if (!ontologyA || !ontologyB) {
    setError('Please select or define both ontologies');
    return;
  }

  setLoading(true);
  setError(null);
  setResult(null);

  try {
    const response = await fetch(
      `/api/execute/${selectedOperation}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ontologyA,
          ontologyB,
          options: {}
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Operation failed');
    }

    const data = await response.json();
    setResult(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

---

### 2. オントロジービューア (`src/components/OntologyViewer.jsx`)

#### 2つの表示モード

**ツリービュー**:
```javascript
<div className="tree-view">
  <div className="ontology-section">
    <h5>Classes ({ontology.classes?.length || 0})</h5>
    <ul className="class-list">
      {ontology.classes?.map((cls) => (
        <li key={cls.id} className="class-item">
          <span className="class-name">{cls.name}</span>
          {cls.superClasses && (
            <span className="super-classes">
              ⊑ {cls.superClasses.join(', ')}
            </span>
          )}
        </li>
      ))}
    </ul>
  </div>

  <div className="ontology-section">
    <h5>Relations ({ontology.relations?.length || 0})</h5>
    {/* 関係のリスト表示 */}
  </div>
</div>
```

**JSONビュー**:
```javascript
<textarea
  className="json-editor"
  value={JSON.stringify(ontology, null, 2)}
  onChange={handleJsonEdit}
  spellCheck={false}
/>
```

---

### 3. 結果表示 (`src/components/ResultDisplay.jsx`)

#### タブ構造

```javascript
const [activeTab, setActiveTab] = useState('result');

<div className="result-tabs">
  <button onClick={() => setActiveTab('result')}>
    Ontology Result
  </button>
  <button onClick={() => setActiveTab('alignments')}>
    Alignments ({result.alignments?.length})
  </button>
  <button onClick={() => setActiveTab('conflicts')}>
    Conflicts ({result.conflicts?.length})
  </button>
  <button onClick={() => setActiveTab('metadata')}>
    Metadata & Analysis
  </button>
</div>
```

#### アライメント表示

```javascript
const renderAlignments = () => {
  return (
    <div className="alignments-list">
      {result.alignments.map((alignment, idx) => (
        <div key={idx} className="alignment-item">
          <div className="alignment-mapping">
            <span>{alignment.sourceA}</span>
            <span className="arrow">≡</span>
            <span>{alignment.sourceB}</span>
            <span className="confidence">
              {(alignment.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="reasoning">
            {alignment.reasoning}
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## LLM統合

### プロンプトエンジニアリング

#### 効果的なプロンプトの要素

1. **明確なタスク定義**:
```
# Task: Ontology Merge
You are performing an INTELLIGENT MERGE of two ontologies.
```

2. **入力データの提示**:
```
## Input Ontology A:
${JSON.stringify(ontologyA, null, 2)}
```

3. **詳細な指示**:
```
## Instructions:
1. Identify correspondences with confidence scores
2. Merge aligned concepts
3. Detect conflicts and propose resolutions
```

4. **出力フォーマットの指定**:
```
## Output Format (JSON):
{
  "result": { ... },
  "alignments": [ ... ],
  "conflicts": [ ... ]
}
```

### レスポンスパース

JSONの抽出と検証：

```javascript
parseResponse(responseText) {
  try {
    // 直接JSONとしてパース
    return JSON.parse(responseText);
  } catch (e) {
    // マークダウンコードブロック内のJSONを抽出
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // テキスト内の最初のJSONオブジェクトを抽出
    const objectMatch = responseText.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    throw new Error('Could not extract valid JSON');
  }
}
```

---

## データフロー

### 演算実行の完全なフロー

```
1. ユーザー操作
   ↓
2. Frontend: executeOperation() 呼び出し
   ↓
3. HTTP POST /api/execute/:operation
   ↓
4. Backend: ルートハンドラー
   - 入力検証
   - プロンプト生成
   ↓
5. LLMService.execute()
   - API呼び出し（OpenAI/Anthropic）
   - レスポンスパース
   ↓
6. 結果の検証
   - OntologyService.validate()
   ↓
7. HTTP Response (JSON)
   ↓
8. Frontend: 結果の表示
   - ResultDisplay コンポーネント
```

### エラーハンドリングフロー

```
エラー発生
   ↓
┌──────────────────┐
│ バックエンドエラー│
│ - API呼び出し失敗│
│ - 検証エラー     │
└─────┬────────────┘
      │
      ├─→ エラーログ出力
      ├─→ HTTP 500 レスポンス
      │
┌─────▼────────────┐
│フロントエンド     │
│ catch ブロック   │
└─────┬────────────┘
      │
      └─→ setError(message)
          ↓
      エラーメッセージ表示
```

---

## 拡張方法

### 新しい演算の追加

#### 1. プロンプトテンプレート追加

`backend/src/prompts/operations.js`:

```javascript
export const OPERATION_PROMPTS = {
  // ... 既存の演算 ...

  newOperation: {
    name: 'New Operation',
    description: 'Description of new operation',
    template: (ontologyA, ontologyB) => `
      # Task: New Operation

      ## Inputs:
      ${JSON.stringify(ontologyA, null, 2)}
      ${JSON.stringify(ontologyB, null, 2)}

      ## Instructions:
      1. Step 1
      2. Step 2

      ## Output Format:
      {
        "result": { ... }
      }
    `
  }
};
```

#### 2. フロントエンドに演算ボタン追加

`frontend/src/components/OperationPanel.jsx`:

```javascript
const operationSymbols = {
  // ... 既存のシンボル ...
  newOperation: '⊙'
};
```

#### 3. バリデーション追加（必要に応じて）

`backend/src/routes/ontology.js`:

```javascript
const validOperations = [
  'addition', 'subtraction', 'merge',
  'composition', 'division',
  'newOperation'  // 追加
];
```

### 新しいLLMプロバイダーの追加

`backend/src/services/llmService.js`:

```javascript
async callAPI(prompt, options) {
  switch (this.provider) {
    case 'openai':
      return this.callOpenAI(prompt, options);
    case 'anthropic':
      return this.callAnthropic(prompt, options);
    case 'newProvider':  // 追加
      return this.callNewProvider(prompt, options);
    default:
      throw new Error(`Unsupported provider: ${this.provider}`);
  }
}

async callNewProvider(prompt, options) {
  // 新しいプロバイダーのAPI呼び出しロジック
  const response = await fetch(/* ... */);
  return response.json();
}
```

---

## まとめ

Dynamic Ontologyシステムの実装は：

1. **モジュラー設計**: 各コンポーネントが独立して機能
2. **拡張可能**: 新しい演算やLLMプロバイダーの追加が容易
3. **エラーハンドリング**: 各層で適切なエラー処理
4. **検証重視**: LLMの出力を必ず検証
5. **ユーザビリティ**: 直感的なUI/UX

これにより、形式的な理論を実用的なシステムとして実装できています。
