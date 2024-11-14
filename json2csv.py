import json
import csv
from datetime import datetime
import glob

# json が配置されている ディレクトリ名
JSON_DIRECTORY = 'results'

# 出力する CSV のパス
CSV_PATH = './all.csv'

# CSVファイルのヘッダー
headers = ["title", "link", "pubDate", "source"]

# JSONファイルのリストを取得
json_file_paths = glob.glob(f'{JSON_DIRECTORY}/*.json')

with open(CSV_PATH, 'w', encoding='utf-8') as csv_file:
    csv_writer = csv.writer(csv_file)
    
    # ヘッダーを書き込む
    csv_writer.writerow(headers)
    
    # 各JSONファイルを処理
    for json_file_path in json_file_paths:
        print(f"Processing file: {json_file_path}")

        with open(json_file_path, 'r', encoding='utf-8') as f:
            entries = json.load(f)
        
            # 各エントリをCSVに書き込む
            for entry in entries:
                title = entry.get("title", "")
                link = entry.get("link", "")
                pubDate = entry.get("pubDate", "")
                # pubDateが空でない場合、日付フォーマットを変換
                if pubDate:
                    pubDate = datetime.strptime(pubDate, '%a, %d %b %Y %H:%M:%S %Z').strftime('%Y-%m-%d')
                source = entry.get("source", "")
                csv_writer.writerow([title, link, pubDate, source])