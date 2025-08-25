# 不動産査定システム

GAS（Google Apps Script）からNext.js + Supabaseに移行した不動産査定・マッチングシステムです。

## 🚀 機能

### 📊 データ管理
- **物件データ統合管理**: レインズ・楽待からのデータを一元管理
- **リアルタイム更新**: Supabaseによる高速データベース
- **重複除去**: 自動的な重複データの検出・統合

### 🔍 査定機能
- **多角的査定**: 賃貸・ホテル・オフィス・地価の4つの査定軸
- **AI査定エンジン**: 相場データとAIによる正確な価値評価
- **リアルタイム計算**: 即座に査定結果を表示

### 🎯 マッチング
- **投資家マッチング**: 投資条件に基づく自動マッチング
- **割安物件通知**: Slackで即座にアラート
- **条件カスタマイズ**: 細かい投資条件の設定

## 🛠️ 技術スタック

- **Frontend**: Next.js 15 (App Router)
- **Backend**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Language**: TypeScript

## 📦 セットアップ

### 1. リポジトリクローン
```bash
git clone https://github.com/a-yamazaki/real-estate-appraisal.git
cd real-estate-appraisal
```

### 2. 依存関係インストール
```bash
npm install
```

### 3. 環境変数設定
```bash
cp .env.example .env.local
```

`.env.local`を編集してSupabaseの接続情報を設定：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. データベースセットアップ
```bash
# テーブル作成
npm run create-tables

# サンプルデータ追加
npm run add-sample-data
```

### 5. 開発サーバー起動
```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## 📝 NPMスクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバー起動
- `npm run check-db` - データベース状況確認
- `npm run create-tables` - テーブル作成
- `npm run add-sample-data` - サンプルデータ追加

## 📁 プロジェクト構成

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理画面
│   │   ├── properties/    # 物件管理
│   │   ├── appraisals/    # 査定結果
│   │   └── investors/     # 投資家管理
│   └── api/               # API Routes
├── components/            # 共通コンポーネント
├── lib/                   # ユーティリティ
│   └── supabase/          # Supabase設定
├── database/              # データベーススキーマ
└── scripts/               # 管理スクリプト
```

## 🎯 主要画面

### 管理画面 (`/admin`)
- ダッシュボード（統計情報）
- 物件一覧・詳細
- 査定結果確認
- 投資家管理

### 物件管理 (`/admin/properties`)
- 物件一覧表示
- 詳細情報確認
- 査定実行
- データ編集

## 🔄 GASからの移行

このシステムは以下のGAS機能を移行・強化しています：

1. **データ収集**: スプレッドシート → Supabase PostgreSQL
2. **査定処理**: GASスクリプト → Next.js API
3. **UI/UX**: Google Forms → モダンWebアプリ
4. **スケーラビリティ**: GAS制限 → 無制限スケール

## 📊 データベース

### 主要テーブル
- `properties` - 物件データ
- `appraisals` - 査定結果
- `investors` - 投資家情報
- `market_data` - 相場データ
- `processing_logs` - 処理ログ

## 🚀 デプロイ

### Vercelデプロイ
```bash
npm run build
vercel deploy
```

### 環境変数
Vercelの環境変数に以下を設定：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

## 🤝 コントリビューション

1. Forkしてください
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. コミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. Pull Requestを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は`LICENSE`ファイルを参照してください。

## 📞 サポート

質問やサポートが必要な場合は、以下にお問い合わせください：
- GitHub Issues: [Issues](https://github.com/a-yamazaki/real-estate-appraisal/issues)
- Email: a.yamazaki@kitajisho.com

---

© 2024 Real Estate Appraisal System. Powered by Next.js & Supabase.