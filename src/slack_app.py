import os
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
from dotenv import load_dotenv


class SlackApp:
    def __init__(self):
        # 環境変数の読み込み
        self.load_env()

        # Appの初期化
        self.app = App(
            token=self.SLACK_BOT_TOKEN, signing_secret=self.SLACK_SIGNING_SECRET
        )

        # Appの初期化が正しく出来ているかのテスト
        self.check_slack_app()

        # イベントハンドラのセット
        self.app.event("app_mention")(self.handle_app_mention)

    # 環境変数を.envファイルから読み込む
    def load_env(self):
        load_dotenv()
        self.SLACK_BOT_TOKEN = os.environ.get("BOT_USER_OAUTH_TOKEN")
        self.SLACK_SIGNING_SECRET = os.environ.get("SLACK_SIGNING_SECRET")
        self.SLACK_APP_TOKEN = os.environ.get("SLACK_APP_TOKEN")

    # Appの起動
    def start(self):
        handler = SocketModeHandler(self.app, self.SLACK_APP_TOKEN)
        handler.start()

    # Appの初期化が正しく出来ているかのテスト
    def check_slack_app(self):
        response = self.app.client.auth_test()

        if response["ok"]:
            print("Bot token is valid.")
        else:
            print("Error with Bot token:", response["error"])
            exit(1)

    # メンションを検知するイベントリスナー
    def handle_app_mention(self, event, say):
        print("----------------------------")
        for key, val in event.items():
            print(key, val)

        # メッセージにリアクションをつける
        try:
            channel_id = event["channel"]
            timestamp = event["ts"]  # メッセージのタイムスタンプ
            reaction = "thumbsup"  # 追加するリアクション（例: "thumbsup"）

            # リアクションを追加
            app.client.reactions_add(
                channel=channel_id, timestamp=timestamp, name=reaction
            )
            print("Reaction added")
        except Exception as e:
            print(f"Error adding reaction: {e}")
