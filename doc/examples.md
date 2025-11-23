# Dynamic Ontology 実行例題

## 目次

1. [例題1: Person/Employee vs Human/Worker](#例題1-personemployee-vs-humanworker)
2. [例題2: Factory Production + GHG Report](#例題2-factory-production--ghg-report)
3. [演算別の詳細例](#演算別の詳細例)
4. [実行方法](#実行方法)

---

## 例題1: Person/Employee vs Human/Worker

### 概要

この例題は、**理論説明用の基本的な事例**です。

- 同じ概念を異なる用語で表現した2つのオントロジー
- 対応付け（alignment）の基本を学ぶ
- 矛盾解決の実例を理解する

### オントロジーA: Person/Employee

#### 構造

```
Person (人)
  ├─ hasName : String
  └─ hasAddress : Address

Employee (従業員)
  ├─ ⊑ Person (Personのサブクラス)
  └─ worksAt : String
```

#### JSON表現

```json
{
  "id": "person-ontology",
  "name": "Person Ontology",
  "version": "1.0",
  "classes": [
    {
      "id": "Person",
      "name": "Person",
      "superClasses": [],
      "metadata": {
        "description": "A human being"
      }
    },
    {
      "id": "Employee",
      "name": "Employee",
      "superClasses": ["Person"],
      "metadata": {
        "description": "A person employed by an organization"
      }
    },
    {
      "id": "Address",
      "name": "Address",
      "superClasses": [],
      "metadata": {}
    }
  ],
  "relations": [
    {
      "id": "hasName",
      "name": "has name",
      "domain": "Person",
      "range": "xsd:string",
      "type": "datatype"
    },
    {
      "id": "hasAddress",
      "name": "has address",
      "domain": "Person",
      "range": "Address",
      "type": "object"
    },
    {
      "id": "worksAt",
      "name": "works at",
      "domain": "Employee",
      "range": "xsd:string",
      "type": "datatype"
    }
  ]
}
```

### オントロジーB: Human/Worker

#### 構造

```
Human (人間)
  ├─ name : String
  └─ residesIn : Location

Worker (労働者)
  ├─ ⊑ Human (Humanのサブクラス)
  └─ employedBy : String
```

#### JSON表現

```json
{
  "id": "human-ontology",
  "name": "Human Ontology",
  "version": "1.0",
  "classes": [
    {
      "id": "Human",
      "name": "Human",
      "superClasses": [],
      "metadata": {}
    },
    {
      "id": "Worker",
      "name": "Worker",
      "superClasses": ["Human"],
      "metadata": {}
    },
    {
      "id": "Location",
      "name": "Location",
      "superClasses": [],
      "metadata": {}
    }
  ],
  "relations": [
    {
      "id": "name",
      "name": "name",
      "domain": "Human",
      "range": "xsd:string",
      "type": "datatype"
    },
    {
      "id": "residesIn",
      "name": "resides in",
      "domain": "Human",
      "range": "Location",
      "type": "object"
    },
    {
      "id": "employedBy",
      "name": "employed by",
      "domain": "Worker",
      "range": "xsd:string",
      "type": "datatype"
    }
  ]
}
```

### Merge演算の実行

#### 検出される対応付け（Alignments）

```json
{
  "alignments": [
    {
      "sourceA": "Person",
      "sourceB": "Human",
      "confidence": 0.98,
      "reasoning": "Both represent the fundamental concept of a human being. Semantic synonyms."
    },
    {
      "sourceA": "Employee",
      "sourceB": "Worker",
      "confidence": 0.95,
      "reasoning": "Both represent individuals engaged in work. Parallel hierarchical structures."
    },
    {
      "sourceA": "hasName",
      "sourceB": "name",
      "confidence": 0.96,
      "reasoning": "Both represent name association. Identical domain/range."
    },
    {
      "sourceA": "Address",
      "sourceB": "Location",
      "confidence": 0.85,
      "reasoning": "Related concepts for spatial information, though Address is more specific."
    }
  ]
}
```

#### 検出される矛盾（Conflicts）

```json
{
  "conflicts": [
    {
      "description": "Relation naming: 'hasName' vs 'name'",
      "type": "naming-convention",
      "severity": "low",
      "resolutionStrategies": [
        "Use 'hasName' (OWL verb-object pattern)",
        "Use 'name' (simpler)",
        "Keep both as aliases"
      ],
      "selectedStrategy": "Keep both as aliases",
      "reasoning": "Maintains backward compatibility"
    },
    {
      "description": "Class naming: 'Person' vs 'Human'",
      "type": "naming-convention",
      "severity": "low",
      "resolutionStrategies": [
        "Use 'Person' as primary",
        "Use 'Human' as primary",
        "Create superclass"
      ],
      "selectedStrategy": "Use 'Person' as primary",
      "reasoning": "More common in formal ontologies"
    }
  ]
}
```

#### 統合結果

```json
{
  "result": {
    "id": "person-human-merged",
    "name": "Person ∪ Human (merged)",
    "classes": [
      {
        "id": "Person",
        "name": "Person",
        "aliases": ["Human"],
        "superClasses": [],
        "metadata": {
          "mergedFrom": ["person-ontology:Person", "human-ontology:Human"],
          "alignmentConfidence": 0.98
        }
      },
      {
        "id": "Employee",
        "name": "Employee",
        "aliases": ["Worker"],
        "superClasses": ["Person"],
        "metadata": {
          "mergedFrom": ["person-ontology:Employee", "human-ontology:Worker"],
          "alignmentConfidence": 0.95
        }
      },
      {
        "id": "Address",
        "name": "Address",
        "aliases": ["Location"],
        "superClasses": []
      }
    ],
    "relations": [
      {
        "id": "hasName",
        "name": "has name",
        "aliases": ["name"],
        "domain": "Person",
        "range": "xsd:string",
        "type": "datatype"
      },
      {
        "id": "hasAddress",
        "name": "has address",
        "aliases": ["residesIn"],
        "domain": "Person",
        "range": "Address",
        "type": "object"
      },
      {
        "id": "worksAt",
        "name": "works at",
        "aliases": ["employedBy"],
        "domain": "Employee",
        "range": "xsd:string",
        "type": "datatype"
      }
    ]
  }
}
```

#### 統合の効果

- **元のクラス数**: 6 (Person, Employee, Address, Human, Worker, Location)
- **統合後のクラス数**: 3 (Person, Employee, Address)
- **削減率**: 50%
- **情報損失**: なし（aliasで保持）

---

## 例題2: Factory Production + GHG Report

### 概要

この例題は、**実用的な事例**です。

- 工場の生産記録とGHG（温室効果ガス）報告を統合
- 数値計算を含む実践的な演算
- Composition演算の実例

### オントロジーA: Factory Production

#### 構造

```
Factory (工場)
  └─ produces : ProductionBatch

ProductionBatch (生産バッチ)
  ├─ batchOf : Product
  ├─ quantity : Decimal (生産量)
  └─ timestamp : DateTime

Product (製品)
```

#### サンプルインスタンス

```json
{
  "instances": [
    {
      "id": "F1",
      "classId": "Factory",
      "properties": {},
      "metadata": { "name": "Factory 1" }
    },
    {
      "id": "Batch_2025_11_01",
      "classId": "ProductionBatch",
      "properties": {
        "batchOf": ":WidgetX",
        "quantity": { "value": "1000", "type": "xsd:decimal" },
        "timestamp": { "value": "2025-11-01T08:00:00", "type": "xsd:dateTime" }
      }
    },
    {
      "id": "WidgetX",
      "classId": "Product",
      "properties": {},
      "metadata": { "name": "Widget X" }
    }
  ]
}
```

### オントロジーB: GHG Report

#### 構造

```
EmissionReport (排出報告)
  └─ hasSource : EmissionEntry

EmissionEntry (排出エントリ)
  ├─ sourceFor : ProductionBatch (参照)
  ├─ activity : Decimal (活動量)
  ├─ emissionFactor : Decimal (排出係数)
  └─ emissions : Decimal (排出量 = activity × emissionFactor)
```

#### サンプルインスタンス

```json
{
  "instances": [
    {
      "id": "Entry_1",
      "classId": "EmissionEntry",
      "properties": {
        "sourceFor": "Batch_2025_11_01",
        "activity": { "value": "1000", "type": "xsd:decimal" },
        "emissionFactor": { "value": "0.75", "type": "xsd:decimal" },
        "emissions": { "value": "750", "type": "xsd:decimal" }
      }
    }
  ]
}
```

### Composition演算の実行

#### インターフェース検出

```
Factory Production の出力:
  ProductionBatch { quantity, timestamp }

GHG Report の入力:
  EmissionEntry { sourceFor → ProductionBatch, activity }

接続:
  ProductionBatch.quantity → EmissionEntry.activity
```

#### 数値計算

```
生産量 (quantity) = 1000 個
排出係数 (emissionFactor) = 0.75 kgCO2e/個

計算:
  emissions = activity × emissionFactor
           = 1000 × 0.75
           = 750 kgCO2e
```

#### 合成結果

```json
{
  "result": {
    "id": "factory-ghg-composed",
    "name": "Factory ∘ GHG (composed)",
    "classes": [
      "Factory", "ProductionBatch", "Product",
      "EmissionReport", "EmissionEntry"
    ],
    "relations": [
      "produces", "batchOf", "quantity", "timestamp",
      "hasSource", "sourceFor", "activity", "emissionFactor", "emissions",
      "autoLink_BatchToEntry"  // 新たに追加された接続
    ],
    "instances": [
      {
        "id": "Batch_2025_11_01",
        "classId": "ProductionBatch",
        "linkedTo": "Entry_1"  // 自動リンク
      },
      {
        "id": "Entry_1",
        "classId": "EmissionEntry",
        "computedValues": {
          "activity": 1000,  // Batchから自動取得
          "emissions": 750   // 自動計算
        }
      }
    ]
  },
  "interface": {
    "connections": [
      {
        "fromA": "ProductionBatch.quantity",
        "toB": "EmissionEntry.activity",
        "linkRelation": "autoLink_BatchToEntry",
        "reasoning": "Production quantity feeds directly into emission activity calculation"
      }
    ]
  }
}
```

### 拡張: BOM（部品表）との合成

#### オントロジーC: BOM (Bill of Materials)

```
BOM
  ├─ forProduct : Product
  ├─ component : Component
  ├─ quantityPerUnit : Decimal
  └─ emissionFactor : Decimal (LCA係数)

Component (部品)
```

#### 3段階の合成

```
1. Factory Production
   ↓ (Composition)
2. GHG Report (Scope 1, 2)
   ↓ (Composition with BOM)
3. Complete GHG Report (Scope 1, 2, 3)
```

#### Scope 3 計算例

```
WidgetX の BOM:
  - Component A: 2個/Widget, 0.4 kgCO2e/個
  - Component B: 1個/Widget, 1.2 kgCO2e/個

計算:
  Scope 3 (Component A) = 1000 × 2 × 0.4 = 800 kgCO2e
  Scope 3 (Component B) = 1000 × 1 × 1.2 = 1200 kgCO2e
  Scope 3 合計 = 800 + 1200 = 2000 kgCO2e

全体排出量:
  Scope 1,2: 750 kgCO2e
  Scope 3: 2000 kgCO2e
  合計: 2750 kgCO2e
```

### Transformation演算の実行（新規拡張）

#### 概要

**Composition vs Transformation**:
- **Composition**: Factory Production と GHG Report を接続（両方保持）
- **Transformation**: Factory Production を GHG Report に変換（データマイグレーション）

Transformationは、**ソースドメインからターゲットドメインへの構造的な変換**を行います。

#### シナリオ: 生産記録からGHGレポートへの自動変換

工場で記録された生産データを、GHG報告フォーマットに自動変換します。

#### 変換マッピングルール

```yaml
Class Mappings:
  ProductionBatch → EmissionEntry
  Product → (参照として保持)
  Factory → (メタデータとして保持)

Relation Mappings:
  quantity → activity
    - 型: decimal → decimal (そのまま)
    - 意味: 生産量 → 活動量

  batchOf → sourceFor
    - 型: object reference (そのまま)
    - 意味: 製品参照 → 排出源参照

  timestamp → (メタデータとして保持)
    - GHG報告には直接含まれないが、トレーサビリティのため保持

Computed Relations:
  emissionFactor:
    - ソース: Product.metadata.carbonFootprint または外部DB
    - 例: WidgetX → 0.75 kgCO2e/unit

  emissions:
    - 計算式: quantity × emissionFactor
    - 例: 1000 × 0.75 = 750 kgCO2e
```

#### 入力（ソースオントロジー）

```json
{
  "id": "factory-production-2025-11",
  "name": "Factory Production November 2025",
  "classes": [
    {"id": "Factory", "name": "Factory"},
    {"id": "ProductionBatch", "name": "Production Batch"},
    {"id": "Product", "name": "Product"}
  ],
  "relations": [
    {"id": "produces", "domain": "Factory", "range": "ProductionBatch"},
    {"id": "batchOf", "domain": "ProductionBatch", "range": "Product"},
    {"id": "quantity", "domain": "ProductionBatch", "range": "xsd:decimal"},
    {"id": "timestamp", "domain": "ProductionBatch", "range": "xsd:dateTime"}
  ],
  "instances": [
    {
      "id": "Batch_2025_11_01",
      "classId": "ProductionBatch",
      "properties": {
        "batchOf": ":WidgetX",
        "quantity": {"value": "1000", "type": "xsd:decimal"},
        "timestamp": {"value": "2025-11-01T08:00:00", "type": "xsd:dateTime"}
      }
    },
    {
      "id": "Batch_2025_11_02",
      "classId": "ProductionBatch",
      "properties": {
        "batchOf": ":WidgetY",
        "quantity": {"value": "500", "type": "xsd:decimal"},
        "timestamp": {"value": "2025-11-02T09:30:00", "type": "xsd:dateTime"}
      }
    },
    {
      "id": "WidgetX",
      "classId": "Product",
      "metadata": {"name": "Widget X", "carbonFootprint": 0.75}
    },
    {
      "id": "WidgetY",
      "classId": "Product",
      "metadata": {"name": "Widget Y", "carbonFootprint": 1.2}
    }
  ]
}
```

#### 外部データソース（排出係数データベース）

```json
{
  "emission_factors": {
    "WidgetX": {
      "factor": 0.75,
      "unit": "kgCO2e/unit",
      "source": "Internal LCA Database",
      "updated": "2025-01-15"
    },
    "WidgetY": {
      "factor": 1.2,
      "unit": "kgCO2e/unit",
      "source": "Supplier Data",
      "updated": "2025-02-10"
    }
  }
}
```

#### 変換プロセス

```python
# 擬似コード
for batch in source_ontology.instances.filter(classId="ProductionBatch"):
    # 1. EmissionEntryインスタンスを作成
    emission_entry = {
        "id": f"Emission_{batch.id}",
        "classId": "EmissionEntry"
    }

    # 2. マッピングを適用
    emission_entry.properties = {
        "sourceFor": batch.id,  # batchOf → sourceFor
        "activity": batch.properties.quantity  # quantity → activity
    }

    # 3. 排出係数を取得
    product_id = batch.properties.batchOf
    emission_factor = get_emission_factor(product_id)
    emission_entry.properties.emissionFactor = emission_factor

    # 4. 排出量を計算
    emissions = batch.properties.quantity.value * emission_factor
    emission_entry.properties.emissions = emissions

    # 5. トレーサビリティ情報を保持
    emission_entry.metadata = {
        "original_batch": batch.id,
        "timestamp": batch.properties.timestamp,
        "transformation_date": current_datetime()
    }

    target_ontology.add_instance(emission_entry)
```

#### 出力（ターゲットオントロジー）

```json
{
  "id": "ghg-report-2025-11-transformed",
  "name": "GHG Report November 2025 (Transformed from Production Data)",
  "classes": [
    {"id": "EmissionReport", "name": "Emission Report"},
    {"id": "EmissionEntry", "name": "Emission Entry"},
    {"id": "EmissionSource", "name": "Emission Source"}
  ],
  "relations": [
    {"id": "hasSource", "domain": "EmissionReport", "range": "EmissionEntry"},
    {"id": "sourceFor", "domain": "EmissionEntry", "range": "xsd:string"},
    {"id": "activity", "domain": "EmissionEntry", "range": "xsd:decimal"},
    {"id": "emissionFactor", "domain": "EmissionEntry", "range": "xsd:decimal"},
    {"id": "emissions", "domain": "EmissionEntry", "range": "xsd:decimal"}
  ],
  "instances": [
    {
      "id": "Emission_Batch_2025_11_01",
      "classId": "EmissionEntry",
      "properties": {
        "sourceFor": "Batch_2025_11_01",
        "activity": {"value": "1000", "type": "xsd:decimal"},
        "emissionFactor": {"value": "0.75", "type": "xsd:decimal"},
        "emissions": {"value": "750", "type": "xsd:decimal"}
      },
      "metadata": {
        "original_batch": "Batch_2025_11_01",
        "timestamp": "2025-11-01T08:00:00",
        "transformation_date": "2025-11-23T10:00:00",
        "product": "WidgetX"
      }
    },
    {
      "id": "Emission_Batch_2025_11_02",
      "classId": "EmissionEntry",
      "properties": {
        "sourceFor": "Batch_2025_11_02",
        "activity": {"value": "500", "type": "xsd:decimal"},
        "emissionFactor": {"value": "1.2", "type": "xsd:decimal"},
        "emissions": {"value": "600", "type": "xsd:decimal"}
      },
      "metadata": {
        "original_batch": "Batch_2025_11_02",
        "timestamp": "2025-11-02T09:30:00",
        "transformation_date": "2025-11-23T10:00:00",
        "product": "WidgetY"
      }
    }
  ],
  "metadata": {
    "transformation": {
      "source_ontology": "factory-production-2025-11",
      "target_schema": "ghg-reporting",
      "transformation_type": "functor_mapping",
      "instances_transformed": 2,
      "total_emissions": 1350,
      "unit": "kgCO2e",
      "mappings_applied": [
        {"source": "ProductionBatch", "target": "EmissionEntry", "type": "class"},
        {"source": "quantity", "target": "activity", "type": "relation"},
        {"source": "batchOf", "target": "sourceFor", "type": "relation"}
      ],
      "computed_properties": [
        {"property": "emissionFactor", "source": "external_db"},
        {"property": "emissions", "formula": "activity × emissionFactor"}
      ],
      "data_quality": {
        "completeness": "100%",
        "emission_factor_coverage": "100%",
        "data_loss": false
      }
    }
  }
}
```

#### 変換結果の検証

```
✅ 変換済みインスタンス数: 2
✅ 総排出量: 1350 kgCO2e
   - Batch_2025_11_01: 750 kgCO2e
   - Batch_2025_11_02: 600 kgCO2e

✅ データ品質:
   - 完全性: 100% (すべてのバッチが変換済み)
   - 排出係数カバレッジ: 100%
   - データロス: なし

✅ トレーサビリティ:
   - 各EmissionEntryは元のProductionBatchにリンク
   - タイムスタンプ保持
   - 変換プロセスのメタデータ記録
```

#### Composition vs Transformation の比較

| 観点 | Composition | Transformation |
|------|-------------|----------------|
| **結果の構造** | Factory Production ∘ GHG Report<br>（両方のオントロジーが存在） | GHG Report のみ<br>（Factory Productionは変換済み） |
| **データの流れ** | ProductionBatch → EmissionEntry<br>（参照関係） | ProductionBatch ⇒ EmissionEntry<br>（変換・置換） |
| **用途** | リアルタイム統合<br>継続的なデータフロー | データマイグレーション<br>レポート生成 |
| **可逆性** | ✅ 元データ保持 | ⚠️ 元データは変換済み（メタデータに記録） |
| **計算** | 動的（参照時に計算） | 静的（変換時に計算・固定） |

#### 実用例

**Composition の使用ケース:**
```
工場システム（生産記録） → GHGモニタリングシステム
- リアルタイムで排出量を監視
- 生産データは元システムで管理
- GHGシステムは参照のみ
```

**Transformation の使用ケース:**
```
月次レポート生成:
  生産記録 → 月次GHG報告書
- 生産データを集計・変換
- 固定されたレポートを生成
- 監査証跡として保管
```

---

## 演算別の詳細例

### Addition（足し算）

#### 入力

- オントロジーA: Person, Employee
- オントロジーB: Vehicle, Car

#### 出力

```json
{
  "result": {
    "classes": [
      { "id": "A_Person", "name": "Person (from A)" },
      { "id": "A_Employee", "name": "Employee (from A)" },
      { "id": "B_Vehicle", "name": "Vehicle (from B)" },
      { "id": "B_Car", "name": "Car (from B)" }
    ],
    "metadata": {
      "conflicts": [
        "No alignments performed - disjoint union"
      ]
    }
  }
}
```

**特徴**:
- 対応付けなし
- すべての要素が保持される
- 名前衝突を避けるため接頭辞付与

---

### Subtraction（引き算）

#### 入力

- オントロジーA: 統合済みPerson（個人情報含む）
- オントロジーB: 個人情報部分

#### 出力（匿名化版）

```json
{
  "result": {
    "classes": [
      { "id": "Person", "name": "Person" },
      { "id": "Employee", "name": "Employee" }
    ],
    "relations": [
      // hasName, hasAddress が削除された
      { "id": "worksAt", "name": "works at" }
    ]
  },
  "metadata": {
    "removed": {
      "classes": [],
      "relations": ["hasName", "hasAddress"],
      "instances": ["john.name", "john.address"]
    },
    "reasoning": [
      "Removed personal identifiable information for privacy"
    ]
  }
}
```

---

### Division（割り算）

#### シナリオ

統合済みオントロジーから一部を復元：

```
O_full = O_A ⊕ O_B
```

既知: O_full, O_A
求める: O_B

#### 入力

- O_full: Person, Employee, Organization, Project
- O_A: Person, Employee

#### 出力（推定されたO_B）

```json
{
  "result": {
    "id": "reconstructed-B",
    "name": "Unknown component (O_B)",
    "classes": [
      {
        "id": "Organization",
        "name": "Organization",
        "inferredFrom": "presence in O_full, absence in O_A"
      },
      {
        "id": "Project",
        "name": "Project",
        "inferredFrom": "presence in O_full, absence in O_A"
      }
    ],
    "relations": [
      {
        "id": "manages",
        "domain": "Organization",
        "range": "Project",
        "inferredFrom": "common pattern in organizational ontologies"
      }
    ]
  },
  "analysis": {
    "certainty": "medium",
    "alternativeSolutions": [
      "Organization and Project could be separate ontologies",
      "Could include additional classes not visible in current data"
    ]
  }
}
```

---

## 実行方法

### コマンドライン（curl）

```bash
# Merge演算の実行
cd backend
curl -X POST http://localhost:3000/api/execute/merge \
  -H "Content-Type: application/json" \
  -d @test-merge.json \
  | python3 -m json.tool
```

### Webインターフェース

1. サーバー起動:
   ```bash
   cd backend && npm start
   cd frontend && npm run dev
   ```

2. ブラウザで `http://localhost:5173` を開く

3. 例題を選択:
   - "Person/Employee vs Human/Worker"ボタンをクリック
   - または "Factory Production + GHG Report"ボタンをクリック

4. 演算を選択:
   - 中央パネルから演算を選択（Merge, Composition, etc.）

5. 実行:
   - "Execute Operation"ボタンをクリック

6. 結果確認:
   - "Ontology Result"タブ: 統合結果
   - "Alignments"タブ: 対応付け
   - "Conflicts"タブ: 矛盾と解決
   - "Full JSON"タブ: 完全な出力

### プログラマティック実行（JavaScript）

```javascript
async function executeMerge(ontologyA, ontologyB) {
  const response = await fetch('http://localhost:3000/api/execute/merge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ontologyA,
      ontologyB,
      options: {
        temperature: 0.3,
        maxTokens: 4000
      }
    })
  });

  const result = await response.json();
  return result;
}

// 使用例
const result = await executeMerge(personOntology, humanOntology);
console.log('Alignments:', result.alignments);
console.log('Conflicts:', result.conflicts);
console.log('Merged Ontology:', result.result);
```

---

## まとめ

### 例題1（Person/Employee）の学び

- ✅ 基本的な対応付けの理解
- ✅ 命名規則の違いへの対処
- ✅ 階層構造の統合

### 例題2（Factory/GHG）の学び

- ✅ 実用的なデータ統合
- ✅ 数値計算の組み込み
- ✅ ワークフローの接続

### 次のステップ

1. 独自のオントロジーを作成
2. 異なる演算を試す
3. 複雑な階層構造を扱う
4. 大規模なオントロジーに挑戦

これらの例題を通じて、Dynamic Ontologyの実践的な活用方法を学べます。
