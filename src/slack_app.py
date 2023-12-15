import os
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
from dotenv import load_dotenv
from src.line_stamp_util import (
    save_line_stamps,
)
from src.validation import validate_args


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
        self.app.command("/add-line-stamp")(self.handle_command)

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

    def handle_command(self, ack, command, say):
        """
        /add-line-stampコマンドを叩かれたら呼ばれる関数

        1. 引数のチェック
        2. LINEスタンプを保存（スクレイピング）
        3. LINEスタンプをSlack絵文字として登録
        4. Slackに結果を投稿
        """
        try:
            # コマンドを受け取ったことを確認
            ack()

            # コマンドの叩き方をチェックして不適切だったらエラーメッセージを返す
            error_message = validate_args(command)
            if error_message:
                say(error_message)
                return

            # コマンドの引数をパース
            url, stamp_name = command["text"].split()

            # LINEスタンプを保存
            stamps_file_paths = save_line_stamps(url, stamp_name)

            # LINEスタンプをSlack絵文字として登録
            self._register_line_stamps_to_slack(stamp_name, stamps_file_paths)

            # Slackに結果を投稿
            self._post_result_to_channel(command, stamps_file_paths[0])

        except Exception as e:
            say(f"予期せぬエラーが発生しました: \n\n{e}")

    # LINEスタンプをSlack絵文字として登録する関数
    def _register_line_stamps_to_slack(self, stamp_name, stamps_file_paths):
        pass

    # Slackに結果を投稿する関数
    def _post_result_to_channel(self, command, thumbnail_path):
        args = command["text"]
        channel = command["channel_id"]

        response_messages = ["*叩かれたコマンド*", f"`/add-line-stamp {args}`", ""]
        try:
            self.app.client.files_upload_v2(
                channel=channel,
                file=thumbnail_path,
                initial_comment="\n".join(response_messages),
            )
        except Exception as e:
            print(f"ファイルのアップロード中にエラーが発生しました: {e}")
