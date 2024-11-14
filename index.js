const KEYWORDS = ["vtuber", "バーチャルYouTuber", "Vチューバー"]; // 検索するキーワード
const START_MONTH = "2023-01"; // いつの分からスクレイピングを始めるか
const FETCH_DATE_COUNT = 2; // 一度に取得する日付。最低 2
const DIST_DIR = "results"; // 結果を出力するフォルダ
const fileName = (year, month) => `${year}-${month}.json`; // DIST_DIR 内に出力するファイル名を決定する関数
const SLEEP_SECONDS = 0.5; // スクレイピングの間隔（秒）

// --------------- ここから上が設定項目 ---------------------------------

const { format, addDays, isAfter } = require("date-fns");
const { writeFile } = require("fs/promises");
const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");
const path = require("path");
const xp = new XMLParser();

const getQ = (keywords, after, before) => {
  const afterStr = format(after, "yyyy-MM-dd");
  const beforeStr = format(before, "yyyy-MM-dd");
  const q = `${keywords.map((word) => `"${word}"`).join(" OR ")} after:${afterStr} before:${beforeStr}`;
  return q;
};

const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

const fetchMonth = async (year, month) => {
  let after = new Date(`${year}-${month}`);
  const fetchedItems = [];

  while (true) {
    const before = addDays(after, FETCH_DATE_COUNT - 1);
    const shouldBreak = before.getMonth() + 1 !== month;
    console.log(`  ${after.getDate()} → ${before.getDate()}`);
    const q = getQ(KEYWORDS, after, before);
    const query = new URLSearchParams({ q, hl: "ja", gl: "JP", ceid: "JP:ja" });
    const url = `https://news.google.com/rss/search?${query}`;
    const { data } = await axios(url);
    const json = xp.parse(data);
    const items = json.rss.channel.item ?? [];
    const filteredItems = items
      .filter((item) => new Date(item.pubDate).getMonth() + 1 === month)
      .sort((a, b) => (isAfter(a.pubDate, b.pubDate) ? 1 : -1));
    fetchedItems.push(...filteredItems);
    if (shouldBreak) break;
    after = addDays(before, 1);
    await sleep(SLEEP_SECONDS);
  }

  const filePath = path.resolve(__dirname, DIST_DIR, fileName(year, month));
  await writeFile(filePath, JSON.stringify(fetchedItems, null, 4));
};

const main = async () => {
  const startDate = new Date(START_MONTH);
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  for (let year = startYear; year <= currentYear; year++) {
    for (let month = startMonth; month <= 12; month++) {
      console.log(`${year}/${month}`);
      await fetchMonth(year, month);
      if (year === currentYear && month === currentMonth) {
        break;
      }
    }
  }
};

main();