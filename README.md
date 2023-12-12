LINE のスタンプストアの URL を入力すると、LINE のスタンプを SLACK の絵文字に登録する API
LINE のスタンプストアの URL 例：https://store.line.me/stickershop/product/24945321/ja

## セットアップ

```
// スクレイピング用
$ pip install requests beautifulsoup4
// Slack Bot用
$ pip install slack_bolt
// 環境変数管理用
$ pip install python-dotenv
```

## SLACK BOT で設定したこと

https://api.slack.com/apps/A069SMX732N/general

### 権限の追加

[OAuth & Permissions](https://api.slack.com/apps/A069SMX732N/oauth)

- app_mentions:read
- channels:read
- chat:write
- reactions:read
- reactions:write

### Socket Mode を許可

[Socket Mode](https://app.slack.com/app-settings/T0615D3E1S6/A069SMX732N/socket-mode)

- Enable Socket Mode : true

### イベント登録

[Event Subscriptions](https://api.slack.com/apps/A069SMX732N/event-subscriptions?)

Subscribe to bot events

- app_mention

### Install App

[Install App](https://api.slack.com/apps/A069SMX732N/install-on-team?)
※権限設定変更の度に必要

## 参考

[Slack ボットの作成手順 - Qiita](https://qiita.com/odm_knpr0122/items/04c342ec8d9fe85e0fe9)
