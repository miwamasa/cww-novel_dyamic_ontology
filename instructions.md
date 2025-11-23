この、形式的なDyamic ontologyを実証するための、システムを作成してほしい
## 背景
- 形式的なDyamic ontologyの理論と説明のための事例は、それぞれ以下にある
 - the_theory/theory_dyamic_ontology.md
 - the_theory/explanatory_example.md
- 具体的な事例、工場の生産工程とGHGレポートの事例は、
 - sample_by_chatgpt

事例の説明は、sample_by_chatgpt/README.md　に書いてある。

## 要件
背景をよく理解したうえで、この全く新しい、形式的なオントロジーについて、
- 表現形式を策定する、従来のentity/relationshipの枠組みを超えて
- 演算（足し算、引き算、合併、合成、割り算）ができるような体系を作る
- 演算はLLMにこれをやらせるとして、プロンプトを作成
- AI APIを設定することで、プロンプトを実行して結果を確かめることができる
- これらを簡単に確かめることができる web フロントエンドを作成する
- フロントエンドでは、少なくとも、説明の事例と、工場の事例が動くようにする。

