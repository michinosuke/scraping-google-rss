import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { glob } from "glob";
import { settings } from "../settings";

type JSONRaw = {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  description?: string;
  source?: string;
};

export const exportCsv = () => {
  // CSVファイルのヘッダー
  const headers = ["title", "link", "pubDate", "source"];

  // JSONファイルのリストを取得 (glob同期的取得)
  const jsonFilePaths = glob.sync(`${settings.outputJsonDirectory}/*.json`);

  // 既存のCSVがある場合は上書きするため、ヘッダーを書き込む
  writeFileSync(settings.csvPath, headers.join(",") + "\n", { encoding: "utf-8" });

  // 各 JSON ファイルを処理
  for (const jsonFilePath of jsonFilePaths) {
    console.log(`Processing file: ${jsonFilePath}`);

    // JSONファイルを読み込み
    const fileContent = readFileSync(jsonFilePath, { encoding: "utf-8" });
    const entries: JSONRaw[] = JSON.parse(fileContent);

    // 各エントリをCSVに書き込む
    for (const entry of entries) {
      let title = entry.title ?? "";
      let link = entry.link ?? "";
      let pubDate = entry.pubDate ?? "";
      let source = entry.source ?? "";

      // pubDateが空でない場合、日付フォーマットを変換
      if (pubDate) {
        // Pythonの '%a, %d %b %Y %H:%M:%S %Z' フォーマットは
        // RFC 2822形式であることが多く、new Dateでパース可能な場合が多い。
        const dateObj = new Date(pubDate);
        if (!isNaN(dateObj.getTime())) {
          pubDate = dateObj.toISOString().slice(0, 10); // YYYY-MM-DD
        } else {
          // パースできなかった場合は元の文字列を残すか、適宜対応を検討
          console.warn(`Unable to parse date: ${pubDate}`);
        }
      }

      const row = [title, link, pubDate, source]
        .map((field) => `"${field.replace(/"/g, '""')}"`) // CSVのフィールドをダブルクォートでエスケープ
        .join(",");

      appendFileSync(settings.csvPath, row + "\n", { encoding: "utf-8" });
    }
  }
};
