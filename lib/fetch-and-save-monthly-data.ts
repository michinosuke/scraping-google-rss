import { writeFile } from "fs/promises";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { resolve } from "path";
import { format, addDays, isAfter } from "date-fns";
import { settings } from "../settings";
import { buildQuery } from "./build-query";
import { sleep } from "./sleep";

// XMLパーサーのインスタンス
const xmlParser = new XMLParser({
  isArray: (name, jpath, isLeafNode, isAttribute) => {
    if (jpath === "rss.channel.item") return true;
    return false;
  },
});

// RSSアイテムの型定義（最低限のフィールドのみ）
interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  [key: string]: unknown;
}

/**
 * 指定年・月に対応するニュース記事を取得し、JSONファイルに出力する関数
 * @param year 年 (例: 2023)
 * @param month 月 (1～12)
 */
export const fetchAndSaveMonthlyData = async (year: number, month: number): Promise<void> => {
  // この月の最初の日付を生成
  let currentDate = new Date(`${year}-${String(month).padStart(2, "0")}`);
  const collectedItems: RssItem[] = [];

  // 対象月内で、DATE_FETCH_INTERVAL日ずつずらしながらニュース記事を取得
  while (true) {
    // 開始日からINTERVAL日ずらした日付を算出
    const endDate = addDays(currentDate, settings.dateFetchInterval - 1);

    // endDateの月が対象月と異なる場合はループを抜ける目安
    const shouldBreak = endDate.getMonth() + 1 !== month;

    console.log(`  Fetching from ${currentDate.getDate()} to ${endDate.getDate()}`);

    // クエリを組み立て
    const queryString = buildQuery(settings.searchKeywords, currentDate, endDate);
    const query = new URLSearchParams({
      q: queryString,
      hl: "ja",
      gl: "JP",
      ceid: "JP:ja",
    });

    // RSSフィードのURL
    const url = `https://news.google.com/rss/search?${query.toString()}`;

    // RSSフィード取得
    const response = await axios.get(url);
    const jsonData = xmlParser.parse(response.data);

    // RSSフィードからアイテム配列を抽出
    const items: RssItem[] = jsonData?.rss?.channel?.item ?? [];

    // 対象月のアイテムのみフィルタリング
    const filteredItems = items.filter((item) => {
      const pubDate = new Date(item.pubDate ?? "");
      return pubDate.getMonth() + 1 === month;
    });

    // pubDateを元にソート（古い順）
    filteredItems.sort((a, b) => {
      const dateA = new Date(a.pubDate ?? "");
      const dateB = new Date(b.pubDate ?? "");
      return isAfter(dateA, dateB) ? 1 : -1;
    });

    collectedItems.push(...filteredItems);

    // 対象月を超えたらループ終了
    if (shouldBreak) break;

    // 次の開始日を、endDateの翌日にセット
    currentDate = addDays(endDate, 1);

    // 次の取得まで待機
    await sleep(settings.scrapeDelaySeconds);
  }

  // 取得結果をファイルに書き出し
  const filePath = `${settings.outputJsonDirectory}/${settings.createFileName(year, month)}`;
  await writeFile(filePath, JSON.stringify(collectedItems, null, 4));
};
