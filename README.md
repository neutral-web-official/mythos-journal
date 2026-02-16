# Mythos Journal

神話から学んだことを、5つの視点で記録するジャーナルアプリ。

## セットアップ & デプロイ手順

### 1. GitHubリポジトリを作成

1. [github.com/new](https://github.com/new) でリポジトリを作成
   - リポジトリ名: `mythos-journal`
   - Public / Private どちらでもOK
2. ダウンロードしたファイル一式をリポジトリにプッシュ:

```bash
cd mythos-journal
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/mythos-journal.git
git push -u origin main
```

### 2. Vercelにデプロイ

1. [vercel.com](https://vercel.com) にGitHubアカウントでログイン
2. 「Add New → Project」をクリック
3. `mythos-journal` リポジトリを選択して「Import」
4. 設定はそのまま（Viteが自動検出される）で「Deploy」
5. 完了！URLが発行されます（例: `mythos-journal-xxx.vercel.app`）

### 3. 以降の更新

GitHubにpushするだけで自動デプロイされます。

```bash
git add .
git commit -m "update"
git push
```

## データについて

- データはブラウザの `localStorage` に保存されます
- 同じブラウザでアクセスすればデータは残ります
- ブラウザを変えたりキャッシュクリアするとデータは消えます
- 将来的にデータベース連携（Supabase等）で永続化も可能です
