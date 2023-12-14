from src.slack_app import SlackApp


def main():
    slack_app = SlackApp()
    slack_app.start()


if __name__ == "__main__":
    main()
