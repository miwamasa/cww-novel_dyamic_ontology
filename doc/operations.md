# Dynamic Ontology 演算詳細

## 目次

1. [演算の概要](#演算の概要)
2. [Addition（足し算）](#addition足し算)
3. [Subtraction（引き算）](#subtraction引き算)
4. [Merge（合併）](#merge合併)
5. [Composition（合成）](#composition合成)
6. [Division（割り算）](#division割り算)
7. [演算の組み合わせ](#演算の組み合わせ)

---

## 演算の概要

Dynamic Ontologyでは、オントロジーに対して5つの基本演算が定義されています：

| 演算 | 記号 | 数学的意味 | 用途 |
|------|------|-----------|------|
| Addition | ⊕ | Disjoint Union | モジュールの結合 |
| Subtraction | ∖ | Set Difference | 不要部分の削除 |
| Merge | ∪ | Alignment-based Union | 意味的統合 |
| Composition | ∘ | Interface Connection | ワークフロー接続 |
| Division | ÷ | Inverse Problem | 補完・復元 |

### 演算の選択基準

```
目的は何か？
  │
  ├─ 独立したモジュールを結合したい
  │  └─→ Addition
  │
  ├─ 不要な情報を除去したい
  │  └─→ Subtraction
  │
  ├─ 類似したオントロジーを統合したい
  │  └─→ Merge
  │
  ├─ 処理フローを接続したい
  │  └─→ Composition
  │
  └─ 失われた部分を復元したい
     └─→ Division
```

---

## Addition（足し算）

### 定義

**数学的表現**:
```
O₁ ⊕ O₂ = (C₁ ⊔ C₂, R₁ ⊔ R₂, A₁ ⊔ A₂, I₁ ⊔ I₂, Σ₁ ⊔ Σ₂)
```

**意味**: 二つのオントロジーを対応付けなしで単純に結合。各要素は独立したまま保持。

### 特徴

- ✅ **単純**: 対応付け不要
- ✅ **可逆**: A ⊕ B から A と B を分離可能
- ✅ **保存的**: 情報損失なし
- ⚠️ **冗長**: 類似概念が重複

### アルゴリズム

```python
def addition(O_A, O_B):
    result = empty_ontology()

    # 1. クラスに接頭辞を付けて追加
    for cls in O_A.classes:
        result.add_class(prefix="A_", class=cls)
    for cls in O_B.classes:
        result.add_class(prefix="B_", class=cls)

    # 2. 関係に接頭辞を付けて追加
    for rel in O_A.relations:
        result.add_relation(prefix="A_", relation=rel)
    for rel in O_B.relations:
        result.add_relation(prefix="B_", relation=rel)

    # 3. 他の要素も同様に追加
    # ...

    return result
```

### 使用例

#### シナリオ1: モジュラーオントロジー

```
医療情報システム:
  Patient Ontology ⊕ Medical Device Ontology ⊕ Treatment Ontology
```

各モジュールは独立して開発・更新可能。

#### シナリオ2: マルチドメイン統合

```
IoTシステム:
  Sensor Ontology ⊕ Actuator Ontology ⊕ Network Ontology
```

### LLMプロンプト例

```
# Task: Ontology Addition (Disjoint Union)

## Input Ontology A:
{
  "classes": ["Person", "Employee"],
  ...
}

## Input Ontology B:
{
  "classes": ["Vehicle", "Car"],
  ...
}

## Instructions:
1. Add prefix "A_" to all elements from Ontology A
2. Add prefix "B_" to all elements from Ontology B
3. Combine both into single ontology
4. NO alignment or merging
5. List potential name conflicts (if any)

## Output Format:
{
  "result": {
    "classes": ["A_Person", "A_Employee", "B_Vehicle", "B_Car"],
    ...
  },
  "metadata": {
    "operation": "addition",
    "conflicts": []
  }
}
```

### 注意点

- **名前衝突**: 接頭辞で回避
- **スケーラビリティ**: 多数のオントロジーでは管理が複雑化
- **クエリの複雑化**: 接頭辞を考慮したクエリが必要

---

## Subtraction（引き算）

### 定義

**数学的表現**:
```
O₁ ∖ O₂ = {e ∈ O₁ | e ∉ O₂}
```

**意味**: O₁から O₂ に含まれる要素を除去。

### 特徴

- ✅ **プライバシー対応**: 個人情報の削除
- ✅ **軽量化**: 不要な部分を削除
- ⚠️ **非可換**: A ∖ B ≠ B ∖ A
- ⚠️ **破壊的**: 削除は不可逆

### アルゴリズム

```python
def subtraction(O_A, O_B):
    result = copy(O_A)

    # 1. 対応する要素を特定（ID or 意味的類似性）
    alignments = find_alignments(O_A, O_B, threshold=0.9)

    # 2. クラスの削除
    for (a_cls, b_cls) in alignments.classes:
        result.remove_class(a_cls)

        # 2.1 参照整合性: このクラスを参照する関係も削除
        for rel in result.relations:
            if rel.domain == a_cls or rel.range == a_cls:
                result.remove_relation(rel)

    # 3. 関係の削除
    for (a_rel, b_rel) in alignments.relations:
        result.remove_relation(a_rel)

    # 4. インスタンスの削除
    for (a_inst, b_inst) in alignments.instances:
        result.remove_instance(a_inst)

    return result
```

### 使用例

#### シナリオ1: データ匿名化

```
元のオントロジー:
  Person
    - hasName: "John Doe"
    - hasSSN: "123-45-6789"
    - hasAge: 35
    - worksAt: "Acme Corp"

個人情報部分 (PII):
  - hasName
  - hasSSN

匿名化後 = 元 ∖ PII:
  Person
    - hasAge: 35
    - worksAt: "Acme Corp"
```

#### シナリオ2: スキーマ簡略化

```
完全なeコマースオントロジー:
  Product, Customer, Order, Payment, Shipping, Reviews, Analytics

簡略版 = 完全版 ∖ {Reviews, Analytics}:
  Product, Customer, Order, Payment, Shipping
```

### LLMプロンプト例

```
# Task: Ontology Subtraction

## Input Ontology A (base):
{
  "classes": ["Person", "Employee", "Address"],
  "relations": ["hasName", "hasSSN", "hasAddress", "worksAt"]
}

## Input Ontology B (to remove - PII):
{
  "classes": [],
  "relations": ["hasName", "hasSSN"]
}

## Instructions:
1. Identify matching elements between A and B
2. Remove from A:
   - Matched relations
   - Instances using those relations
3. Maintain referential integrity
4. Document what was removed

## Output Format:
{
  "result": {
    "classes": ["Person", "Employee", "Address"],
    "relations": ["hasAddress", "worksAt"]  // hasName, hasSSN removed
  },
  "metadata": {
    "removed": {
      "relations": ["hasName", "hasSSN"],
      "reasoning": ["PII removal for privacy compliance"]
    }
  }
}
```

### 注意点

- **依存関係**: 削除時の参照整合性維持が重要
- **復元不可**: 削除前にバックアップ推奨
- **部分一致**: 完全一致か部分一致かを明確に

---

## Merge（合併）

### 定義

**数学的表現** (Pushout):
```
      φ_A
  I -----> O_A
  |        |
φ_B |        |
  ↓        ↓
 O_B ----> O_merged
```

**意味**: 意味的に対応する要素を特定し、統合。

### 特徴

- ✅ **意味理解**: 異なる用語でも同じ概念を認識
- ✅ **矛盾解決**: 競合を検出し解決策を提示
- ✅ **情報保持**: Aliasで元の名前を保持
- ⚠️ **複雑**: アライメントと矛盾解決が必要

### アルゴリズム（3フェーズ）

#### Phase 1: Alignment（対応付け）

```python
def alignment_phase(O_A, O_B):
    alignments = []

    # クラスの対応付け
    for cls_a in O_A.classes:
        for cls_b in O_B.classes:
            confidence = semantic_similarity(cls_a, cls_b)
            if confidence > THRESHOLD:  # 例: 0.8
                alignments.append({
                    'sourceA': cls_a.id,
                    'sourceB': cls_b.id,
                    'type': 'class',
                    'confidence': confidence,
                    'reasoning': generate_reasoning(cls_a, cls_b)
                })

    # 関係の対応付け
    for rel_a in O_A.relations:
        for rel_b in O_B.relations:
            # ドメイン・レンジの一致も考慮
            if domains_match(rel_a, rel_b, alignments):
                confidence = semantic_similarity(rel_a, rel_b)
                if confidence > THRESHOLD:
                    alignments.append({...})

    return alignments
```

#### Phase 2: Integration（統合）

```python
def integration_phase(O_A, O_B, alignments):
    result = empty_ontology()

    # 対応付けられた要素を統合
    for align in alignments:
        if align.type == 'class':
            merged_class = {
                'id': align.sourceA,  # Aの名前を採用
                'name': get_name(O_A, align.sourceA),
                'aliases': [get_name(O_B, align.sourceB)],
                'superClasses': merge_hierarchies(...),
                'metadata': {
                    'mergedFrom': [align.sourceA, align.sourceB],
                    'confidence': align.confidence
                }
            }
            result.add_class(merged_class)

    # 対応付けられなかった要素を追加
    for cls in O_A.classes:
        if not aligned(cls, alignments):
            result.add_class(cls)
    for cls in O_B.classes:
        if not aligned(cls, alignments):
            result.add_class(cls)

    return result
```

#### Phase 3: Conflict Resolution（矛盾解決）

```python
def conflict_resolution(O_A, O_B, alignments):
    conflicts = []

    for align in alignments:
        elem_a = get_element(O_A, align.sourceA)
        elem_b = get_element(O_B, align.sourceB)

        # カーディナリティの違い
        if elem_a.cardinality != elem_b.cardinality:
            conflicts.append({
                'description': f'Cardinality mismatch: {elem_a.cardinality} vs {elem_b.cardinality}',
                'resolutionStrategies': [
                    'Use min cardinality',
                    'Use max cardinality',
                    'Make it optional'
                ],
                'selectedStrategy': 'Use max cardinality',
                'reasoning': 'More permissive, backward compatible'
            })

        # データ型の違い
        if elem_a.datatype != elem_b.datatype:
            conflicts.append({...})

    return conflicts
```

### 使用例

#### シナリオ1: 企業合併

```
Company A の人事システム:
  Employee, Department, Salary

Company B の人事システム:
  Staff, Division, Compensation

統合後:
  Employee (alias: Staff)
  Department (alias: Division)
  Salary (alias: Compensation)
```

#### シナリオ2: 標準化

```
複数のサプライヤーの製品カタログ:
  Supplier1: Product, Item, SKU
  Supplier2: Article, Good, ProductCode
  Supplier3: Merchandise, Commodity, PartNumber

統合後の標準オントロジー:
  Product (aliases: Item, Article, Good, Merchandise, Commodity)
  ProductCode (aliases: SKU, ProductCode, PartNumber)
```

### LLMプロンプトの重要部分

```
## Instructions:
1. **Alignment Phase**:
   - Compare class names semantically
   - Consider domain/range for relations
   - Assign confidence scores (0.0 to 1.0)
   - Provide reasoning for each alignment

2. **Integration Phase**:
   - Merge elements with confidence > 0.8
   - Keep original names as aliases
   - Merge hierarchies (take union of superclasses)

3. **Conflict Resolution**:
   - Detect contradictions (cardinality, types, constraints)
   - Propose 2-3 resolution strategies per conflict
   - Select and justify the best strategy

4. **Validation**:
   - Ensure no dangling references
   - Check for logical contradictions
   - Verify all alignments are used
```

### 矛盾の種類と解決策

| 矛盾の種類 | 解決策1 | 解決策2 | 解決策3 |
|-----------|---------|---------|---------|
| カーディナリティ | 最小値採用 | 最大値採用 | オプション化 |
| データ型 | 上位型に統一 | Union型 | 変換関数追加 |
| 命名規則 | 規約Aに統一 | 規約Bに統一 | Alias保持 |
| 階層構造 | 交差を採用 | 和集合を採用 | 新親クラス作成 |

---

## Composition（合成）

### 定義

**数学的表現**:
```
O_A ∘_I O_B
```

ここで $I$ は接続インターフェース。

**意味**: 一方の出力を他方の入力として接続。

### 特徴

- ✅ **ワークフロー**: 処理の連鎖を表現
- ✅ **データフロー**: 情報の流れを明示
- ✅ **モジュラー**: 独立したモジュールを接続
- ⚠️ **型一致**: インターフェースの型が一致する必要

### アルゴリズム

```python
def composition(O_A, O_B, interface=None):
    result = empty_ontology()

    # 1. 両方のオントロジーを含める
    result.add_all(O_A)
    result.add_all(O_B)

    # 2. インターフェース検出
    if interface is None:
        interface = detect_interface(O_A, O_B)

    # 3. 接続リンクの作成
    for connection in interface.connections:
        link = {
            'id': f'link_{connection.fromA}_to_{connection.toB}',
            'type': 'derived_relation',
            'domain': connection.fromA,
            'range': connection.toB,
            'computation': connection.transform
        }
        result.add_relation(link)

    # 4. データフローの検証
    validate_dataflow(result, interface)

    return result
```

### インターフェース検出

```python
def detect_interface(O_A, O_B):
    connections = []

    # O_A の出力型を特定
    output_classes_A = find_output_classes(O_A)

    # O_B の入力型を特定
    input_classes_B = find_input_classes(O_B)

    # 型の一致を確認
    for out_cls in output_classes_A:
        for in_cls in input_classes_B:
            if types_compatible(out_cls, in_cls):
                connections.append({
                    'fromA': out_cls.id,
                    'toB': in_cls.id,
                    'confidence': type_similarity(out_cls, in_cls),
                    'transform': infer_transform(out_cls, in_cls)
                })

    return Interface(connections)
```

### 使用例

#### シナリオ1: Factory → GHG

```
Factory Production:
  ProductionBatch
    - quantity: 1000
    - product: WidgetX

    ↓ (Composition)

GHG Calculation:
  EmissionEntry
    - activity: 1000  (from ProductionBatch.quantity)
    - emissionFactor: 0.75
    - emissions: 750  (computed: activity × emissionFactor)
```

#### シナリオ2: Sensor → Analysis → Alert

```
Sensor Ontology:
  Reading { value, timestamp, sensor_id }

    ↓ (Composition)

Analysis Ontology:
  AnalysisResult { input_value, result, anomaly_score }

    ↓ (Composition)

Alert Ontology:
  Alert { severity, message, timestamp }
```

3つのオントロジーを連鎖的に合成：

```
Sensor ∘ Analysis ∘ Alert
```

### LLMプロンプト例

```
# Task: Ontology Composition

## Ontology A (Factory Production):
{
  "classes": ["ProductionBatch"],
  "relations": ["quantity", "product"]
}

## Ontology B (GHG Calculation):
{
  "classes": ["EmissionEntry"],
  "relations": ["activity", "emissionFactor", "emissions"]
}

## Instructions:
1. **Detect Interface**:
   - Identify O_A outputs: ProductionBatch.quantity
   - Identify O_B inputs: EmissionEntry.activity
   - Check type compatibility

2. **Create Connections**:
   - Link ProductionBatch.quantity → EmissionEntry.activity
   - Add computed property: emissions = activity × emissionFactor

3. **Validate**:
   - Ensure data flows correctly
   - No type mismatches
   - All required inputs satisfied

## Output Format:
{
  "result": {
    "classes": [...],  // Both A and B
    "relations": [...],  // Both A and B + new links
    "derivedProperties": [
      {
        "property": "emissions",
        "computation": "activity * emissionFactor",
        "dependencies": ["activity", "emissionFactor"]
      }
    ]
  },
  "interface": {
    "connections": [
      {
        "fromA": "ProductionBatch.quantity",
        "toB": "EmissionEntry.activity",
        "transform": "identity"
      }
    ]
  }
}
```

---

## Division（割り算）

### 定義

**数学的表現**:

与えられた $O_{full}$ と $O_A$ から $O_B$ を求める逆問題：

```
O_{full} ≈ O_A ⊕ O_B
```

$O_B$ を推定。

### 特徴

- ✅ **復元**: 失われた情報を推定
- ✅ **分析**: 構成要素を特定
- ⚠️ **一意でない**: 複数の解が存在しうる
- ⚠️ **不確実性**: 推定には限界がある

### アルゴリズム

```python
def division(O_full, O_A):
    # 1. 差分抽出
    D = simple_difference(O_full, O_A)

    # 2. パターン推論
    patterns = identify_patterns(D)

    # 3. 候補生成（LLM使用）
    candidates = []
    for i in range(N_CANDIDATES):
        O_B_candidate = llm.generate_ontology(
            prompt=f"""
            Given:
            - Full ontology: {O_full}
            - Known part: {O_A}
            - Difference: {D}

            Reconstruct the unknown component O_B such that:
            O_full ≈ O_A ⊕ O_B

            Apply Occam's Razor: simplest explanation.
            """
        )
        candidates.append(O_B_candidate)

    # 4. 検証とスコアリング
    scored_candidates = []
    for O_B in candidates:
        O_reconstructed = addition(O_A, O_B)
        similarity = ontology_similarity(O_full, O_reconstructed)
        complexity = ontology_complexity(O_B)

        score = similarity - LAMBDA * complexity  # Occam's Razor
        scored_candidates.append((O_B, score))

    # 5. 最良候補を選択
    best_O_B = max(scored_candidates, key=lambda x: x[1])[0]

    return best_O_B, scored_candidates
```

### 使用例

#### シナリオ1: スキーマリバースエンジニアリング

```
統合済みデータベース:
  Customer, Order, Product, Supplier, Warehouse

既知の部分（Customer Management）:
  Customer, Order

推定される未知部分:
  Product, Supplier, Warehouse
  + 関係: suppliedBy, storedIn, etc.
```

#### シナリオ2: 要因分析

```
全体の性能指標:
  Response Time = 500ms

既知の要因:
  Network Latency = 100ms
  Database Query = 150ms

推定される未知要因:
  Application Processing = 250ms
  (500 - 100 - 150 = 250)
```

### LLMプロンプト例

```
# Task: Ontology Division (Inverse Problem)

## Full Ontology (merged result):
{
  "classes": ["Person", "Employee", "Organization", "Project"],
  "relations": [...]
}

## Known Component A:
{
  "classes": ["Person", "Employee"],
  "relations": ["hasName", "worksAt"]
}

## Instructions:
1. **Difference Analysis**:
   - Elements in Full but not in A: {Organization, Project}
   - Relations in Full but not in A: {...}

2. **Pattern Inference**:
   - Group related elements
   - Identify conceptual domains
   - Look for coherent structures

3. **Reconstruction**:
   - Build most plausible O_B
   - Apply Occam's Razor (simplest explanation)
   - Ensure: Known + Unknown ≈ Full

4. **Validation**:
   - Check: A ⊕ B ≈ Full
   - List discrepancies

## Output Format:
{
  "result": {
    "id": "reconstructed-B",
    "classes": [...],  // Organization, Project
    "relations": [...]
  },
  "analysis": {
    "uniqueToFull": {...},
    "inferredDomain": "Project Management",
    "certainty": "medium"
  },
  "alternatives": [
    "Alternative explanation 1",
    "Alternative explanation 2"
  ]
}
```

### 不確実性の扱い

複数の候補を提示：

```json
{
  "candidates": [
    {
      "ontology": {...},
      "probability": 0.6,
      "reasoning": "Most parsimonious explanation"
    },
    {
      "ontology": {...},
      "probability": 0.3,
      "reasoning": "Alternative structure with additional abstractions"
    },
    {
      "ontology": {...},
      "probability": 0.1,
      "reasoning": "Complex but explains all edge cases"
    }
  ]
}
```

---

## 演算の組み合わせ

### 複合演算の例

#### 例1: 段階的統合

```
Step 1: Merge similar ontologies
  O_unified = Merge(O_A, O_B, O_C)

Step 2: Remove sensitive data
  O_safe = O_unified ∖ O_PII

Step 3: Compose with analysis
  O_complete = O_safe ∘ O_Analytics
```

#### 例2: モジュール分解と再構成

```
Step 1: Divide into modules
  O_full = O_core ⊕ O_ext1 ⊕ O_ext2

Step 2: Update one module
  O_ext1_new = Update(O_ext1)

Step 3: Recompose
  O_new = O_core ⊕ O_ext1_new ⊕ O_ext2
```

### 演算の可換性・結合性

| 性質 | Addition | Merge | Composition |
|------|----------|-------|-------------|
| 可換 | ✅ O_A ⊕ O_B = O_B ⊕ O_A | ⚠️ 近似的 | ❌ O_A ∘ O_B ≠ O_B ∘ O_A |
| 結合 | ✅ (A ⊕ B) ⊕ C = A ⊕ (B ⊕ C) | ⚠️ 近似的 | ✅ (A ∘ B) ∘ C = A ∘ (B ∘ C) |
| 単位元 | ✅ ∅ | ✅ ∅ | ⚠️ 恒等オントロジー |

### ベストプラクティス

1. **段階的に実行**: 一度に一つの演算
2. **検証を挟む**: 各ステップで結果を確認
3. **バージョン管理**: 各演算結果を保存
4. **ドキュメント化**: 演算の理由と結果を記録
5. **テストケース**: 期待される結果を事前定義

---

## まとめ

各演算の特徴：

| 演算 | 複雑度 | 可逆性 | 主な用途 |
|------|--------|--------|----------|
| Addition | 低 | ✅ | モジュール結合 |
| Subtraction | 低 | ❌ | データ削除・簡略化 |
| Merge | 高 | ⚠️ | 意味的統合 |
| Composition | 中 | ✅ | ワークフロー接続 |
| Division | 高 | N/A | 復元・分析 |

適切な演算を選択し、組み合わせることで、柔軟なオントロジー管理が実現できます。
