# ローカル環境での実行ガイド

## サーバーの起動

### 方法1: 別々のターミナルで起動（推奨）

**Terminal 1 - Backend:**
```bash
cd /home/user/cww-novel_dyamic_ontology/backend
npm run dev
```

ログが表示されます：
```
╔════════════════════════════════════════════════════╗
║  Dynamic Ontology Backend Server                  ║
║  Status: Running                                   ║
║  Port: 3000                                        ║
╚════════════════════════════════════════════════════╝
```

**Terminal 2 - Frontend:**
```bash
cd /home/user/cww-novel_dyamic_ontology/frontend
npm run dev
```

ログが表示されます：
```
VITE v5.4.21  ready in 298 ms
➜  Local:   http://localhost:5173/
```

### 方法2: ステータス確認スクリプト

```bash
./check-status.sh
```

## アクセス方法

1. **ブラウザを開く**
2. **http://localhost:5173** にアクセス

## ログの確認方法

### Backend のログ

Backend が起動しているターミナルに以下が表示されます：
- API リクエストのログ
- エラーメッセージ
- LLM API 呼び出しのログ

### Frontend のログ

**ブラウザのDevToolsで確認：**
1. ブラウザで **F12** を押す
2. **Console** タブを開く
3. 以下が確認できます：
   - エラーメッセージ
   - API 呼び出しのログ
   - デバッグ情報

**Network タブで API 通信を確認：**
1. ブラウザで **F12** を押す
2. **Network** タブを開く
3. 以下が確認できます：
   - `/api/operations` - 利用可能なオペレーション取得
   - `/api/examples` - サンプルデータ取得
   - `/api/generate-prompt/:operation` - プロンプト生成
   - `/api/execute/:operation` - オペレーション実行

## トラブルシューティング

### サーバーが起動しない

**1. ポートが使用中の場合:**
```bash
# ポート3000と5173を使用しているプロセスを確認
lsof -i :3000
lsof -i :5173

# プロセスを終了
pkill -f "node.*server.js"
pkill -f "vite"
```

**2. 依存関係の問題:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### ERR_CONNECTION_RESET エラー

**原因:**
- ファイアウォール設定
- ネットワーク設定
- ブラウザキャッシュ

**対処法:**
```bash
# 1. サーバーを再起動
pkill -f "node|vite"
cd backend && npm run dev &
cd frontend && npm run dev &

# 2. ブラウザキャッシュをクリア
# Chrome: Ctrl+Shift+Del → キャッシュをクリア

# 3. 別のブラウザで試す
```

### API が応答しない

**確認手順:**
```bash
# Backend の health check
curl http://localhost:3000/health

# Operations 一覧取得
curl http://localhost:3000/api/operations

# Examples 取得
curl http://localhost:3000/api/examples
```

### Frontend が表示されない

**確認手順:**
```bash
# Frontend にアクセスできるか確認
curl http://localhost:5173/

# Vite のログを確認
# ターミナルでエラーメッセージを確認
```

## デバッグ方法

### 1. Backend のデバッグ

**backend/src/server.js** にログ追加：
```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});
```

### 2. Frontend のデバッグ

**ブラウザのConsoleで確認：**
```javascript
// 現在の state を確認
console.log('Current state:', { ontologyA, ontologyB, selectedOperation });
```

**frontend/src/App.jsx** にログ追加：
```javascript
const viewPrompt = async () => {
  console.log('viewPrompt called with:', { ontologyA, ontologyB, selectedOperation });
  // ...
};
```

### 3. ネットワークリクエストの確認

**ブラウザのNetwork タブで:**
1. **Request Headers** - 送信されたヘッダー
2. **Request Payload** - 送信されたデータ
3. **Response** - サーバーからのレスポンス
4. **Timing** - リクエストの所要時間

## 環境変数の確認

**backend/.env:**
```bash
cat backend/.env
```

確認項目：
- `LLM_PROVIDER=anthropic`
- `LLM_MODEL=claude-haiku-4-5`
- `ANTHROPIC_API_KEY=sk-ant-api03-...`

## テストコマンド

### Backend のテスト

```bash
# Health check
curl http://localhost:3000/health

# LLM 接続テスト
curl -X POST http://localhost:3000/api/test-llm \
  -H "Content-Type: application/json" \
  -d '{}'

# Merge operation テスト
curl -X POST http://localhost:3000/api/execute/merge \
  -H "Content-Type: application/json" \
  -d @backend/test-data/merge-example.json
```

### Frontend のテスト

ブラウザで以下を確認：
1. http://localhost:5173 にアクセス
2. サンプルデータをロード
3. Operation を選択
4. 「📋 View Prompt」ボタンをクリック → プロンプトが表示される
5. 「▶ Execute Operation」をクリック → 結果が表示される
6. 「Raw LLM Response」タブをクリック → 生のレスポンスが表示される

## よく使うコマンド

```bash
# ステータス確認
./check-status.sh

# サーバー再起動
pkill -f "node|vite"
cd backend && npm run dev &
cd frontend && npm run dev &

# ログをファイルに保存
cd backend && npm run dev > backend.log 2>&1 &
cd frontend && npm run dev > frontend.log 2>&1 &

# ログを確認
tail -f backend/backend.log
tail -f frontend/frontend.log
```

## 開発時のヒント

1. **ファイル変更時の自動リロード**
   - Backend: `--watch` フラグで自動リスタート
   - Frontend: Vite が自動的にホットリロード

2. **エラーが出たら**
   - Backend のターミナルを確認
   - ブラウザの Console を確認
   - Network タブで失敗したリクエストを確認

3. **プロンプトの確認**
   - 「View Prompt」ボタンで事前確認
   - `backend/src/prompts/operations.js` でテンプレート編集

4. **LLM レスポンスの確認**
   - 実行後「Raw LLM Response」タブで確認
   - `result._meta.rawResponse` に格納
