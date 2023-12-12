import requests
from bs4 import BeautifulSoup
import re

# LINEスタンプSTOREのURLを取得する関数
def get_line_store_url():
    # LINEスタンプSTOREのURL
    line_store_url = 'https://store.line.me/stickershop/product/24945321/ja'
    return line_store_url

# 入力で与えられたLINEスタンプSTOREに含まれるLINEスタンプのURLを取得する関数
def get_line_stamp_urls(line_store_url):
    # セッションを使用してウェブページを取得
    session = requests.Session()
    response = session.get(line_store_url)

    # BeautifulSoupオブジェクトの作成
    soup = BeautifulSoup(response.text, 'html.parser')

    # spanタグを検索
    span_tags = soup.find_all('span', class_='mdCMN09Image')

    # background-imageのURLを抽出
    line_stamp_urls = []
    for span in set(span_tags):
        # style属性を取得
        style = span.get('style')

        # style属性からbackground-imageのURLを抽出
        if style:
            match = re.search(r'url\((.*?)\);', style)
            if match:
                stamp_image_url = match.group(1)
                print(stamp_image_url)
                line_stamp_urls.append(stamp_image_url)
    
    return line_stamp_urls

# 入力で与えられたLINEスタンプを保存する関数
def save_line_stamps(line_stamp_urls:list):
    IMAGE_DIR = 'images'
    for idx, stamp_image_url in enumerate(line_stamp_urls):
        download_image(stamp_image_url, '{}/line_stamp{:0>2}.png'.format(IMAGE_DIR, idx))

# 入力で与えられたURLの画像をダウンロードする関数
def download_image(image_url, image_save_path):
    response = requests.get(image_url)
    if response.status_code == 200:
        with open(image_save_path, 'wb') as file:
            file.write(response.content)