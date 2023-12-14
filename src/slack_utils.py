import os
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
from dotenv import load_dotenv

# 環境変数を.envファイルから読み込み
load_dotenv()

# 環境変数からBotのトークンとSigning Secretを取得
SLACK_BOT_TOKEN = os.environ.get("BOT_USER_OAUTH_TOKEN")
SLACK_SIGNING_SECRET = os.environ.get("SLACK_SIGNING_SECRET")
SLACK_APP_TOKEN = os.environ.get("SLACK_APP_TOKEN")

# Appの初期化
app = App(token=SLACK_BOT_TOKEN, signing_secret=SLACK_SIGNING_SECRET)

# Appの初期化が正しく出来ているかのテスト
response = app.client.auth_test()
if response["ok"]:
    print("Bot token is valid.")
else:
    print("Error with Bot token:", response["error"])

# メンションを検知するイベントリスナー
@app.event("app_mention")
def handle_app_mention(event, say):
    print("----------------------------")
    for key,val in event.items():
        print(key,val)

    # メッセージにリアクションをつける
    try:
        channel_id = event["channel"]
        timestamp = event["ts"]  # メッセージのタイムスタンプ
        reaction = "thumbsup"    # 追加するリアクション（例: "thumbsup"）

        # リアクションを追加
        app.client.reactions_add(
            channel=channel_id,
            timestamp=timestamp,
            name=reaction
        )
        print("Reaction added")
    except Exception as e:
        print(f"Error adding reaction: {e}")

# Botを起動
if __name__ == "__main__":
    handler = SocketModeHandler(app, SLACK_APP_TOKEN)
    handler.start()