import re

USAGE_MESSAGE = """```
Usage: /add-line-stamp [LINE STOREのURL] [登録絵文字名]

期待しているURLの形式: https://store.line.me/stickershop/product/[0-9]+
登録絵文字名: 20文字以下

Example: /add-line-stamp https://store.line.me/stickershop/product/24945321/ja  LOVOT
```
"""


def validate_args(command):
    error_messages = []

    message = command["text"]
    args = message.replace("　", " ").split()

    if len(args) != 2:
        error_messages.append("- コマンドの引数は2つにしてください。")

    if validate_line_store_url(args[0]):
        error_messages.append("- 第一引数がLINE STOREのURLではありません。")

    if len(args) > 1 and len(args[1]) > 20:
        error_messages.append("- 登録絵文字名は20文字以下にしてください。(誤操作で長くなっちゃったと思っています)")

    if error_messages:
        error_messages = (
            [
                "*叩かれたコマンド*",
                f"`/add-line-stamp {message}`",
                "",
            ]
            + error_messages
            + ["", USAGE_MESSAGE]
        )

    return "\n".join(error_messages)


def validate_line_store_url(url):
    pattern = r"^https://store.line.me/stickershop/product/[0-9]+/$"
    return re.match(pattern, url) is None
