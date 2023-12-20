from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import os
import time
from dotenv import load_dotenv

# 参考

load_dotenv()


# WebDriverのセットアップ
driver = webdriver.Chrome()
workspace = os.environ.get("SLACK_WORKSPACE")
driver.get(
    f"https://{workspace}.slack.com/sign_in_with_password?redir=%2Fcustomize%2Femoji#/"
)

# Slackにログイン（適宜調整）
username = driver.find_element(By.ID, "email")
username.send_keys(os.environ.get("EMAIL"))
password = driver.find_element(By.ID, "password")
password.send_keys(os.environ.get("PASSWORD"))
password.send_keys(Keys.RETURN)

# 'boot_data'を含むscriptタグと、カスタム絵文字セクションが見つかるまで待つ
boot_data_script = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located(
        (By.XPATH, "//script[contains(text(), 'boot_data')]")
    )
)
custom_emoji_section = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, "list_emoji_section"))
)
print("OK")

# 絵文字を追加する処理（ページの要素に応じて調整）
# 例: 絵文字の名前と画像のファイルパスを指定

# driver.find_element(By.ID, "emoji_name").send_keys(emoji_name)
# driver.find_element(By.ID, "emoji_img").send_keys(file_path)
# driver.find_element(By.ID, "addemoji").click()


# アップロード用のフォームをページに挿入するJavaScriptコード
script1 = """
const uploadFormId = "petit_upload_form"
if (!document.querySelector('#' + uploadFormId)) {
    const form = document.createElement('form');
    const token = window.boot_data.api_token;
    
    form.id = uploadFormId; 
    form.innerHTML = `
        <input id="petit_emoji_name_input" name="name"> 
        <input type="file" id="petit_emoji_file_input" name="image">
        <input type="hidden" id="petit_token_input" name="token" value="${token}">
        <input type="hidden" id="petit_mode_input" name="mode" value="data">
    `;
    document.body.append(form);
}
"""

driver.execute_script(script1)

emoji_name = "test"
file_path = os.path.abspath("images/TEST00.png")
print(file_path)

file_input = driver.find_element(By.ID, "petit_emoji_file_input")
emoji_name_imput = driver.find_element(By.ID, "petit_emoji_name_input")

file_input.send_keys(file_path)
emoji_name_imput.send_keys(emoji_name)


script2 = """
const uploadFormId = "petit_upload_form"
const workspace = "mayoi-forest"
const form = document.querySelector('#' + uploadFormId);
const formData = new FormData(form);
const response = await fetch(`https://${workspace}.slack.com/api/emoji.add`, {
    method: 'POST',
    body: formData
});
const response_json = await response.json();
arguments[arguments.length-1](response_json); // コールバック関数を実行して終了したことを伝える
"""

result = driver.execute_async_script(script2)
print(result)

time.sleep(12)

driver.quit()


"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()
TOKEN = "xoxc-xxxxxxxxxx"  # トークン
COOKIE = os.environ.get("SLACK_COOKIE")  # Cookie

team_name = "mayoi-forest"  # ワークスペースのチーム名
emoji_name = "emoji"  # 絵文字の名前
emoji_img_filepath = "./images/TEST00.png"  # 絵文字の画像ファイルへのパス

URL_ADD = f"https://{team_name}.slack.com/api/emoji.add"
r = requests.post(
    URL_ADD,
    headers={"Cookie": COOKIE},
    data={"mode": "data", "name": emoji_name, "token": TOKEN},
    files={"image": open(emoji_img_filepath, "rb")},
)
print(type(r))
print(r.json())
print(r.text)
"""
