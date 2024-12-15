export const settings: Setting = {
  // ニュース検索に使用するキーワード
  searchKeywords: ["vtuber", "バーチャルYouTuber", "Vチューバー"],

  // スクレイピングを開始する年月 (YYYY-MM)
  scrapeStartMonth: "2023-01",

  // スクレイピングを終了する年月 (YYYY-MM or null)（※ この年月を含まない）
  scrapeEndMonth: "2023-06",

  // 一度に取得する日数の幅（最低2）
  dateFetchInterval: 2,

  // 結果を保存するディレクトリ
  outputJsonDirectory: `${__dirname}/output`,

  // スクレイピング間隔(秒)
  scrapeDelaySeconds: 0.5,

  // 出力ファイル名を生成する関数
  createFileName: (year: number, month: number) => `${year}-${month}.json`,

  // 出力する CSV のパス
  csvPath: `${__dirname}/output/all.csv`,
};

type Setting = {
  searchKeywords: string[];
  scrapeStartMonth: string;
  scrapeEndMonth: string | null;
  dateFetchInterval: number;
  outputJsonDirectory: string;
  scrapeDelaySeconds: number;
  createFileName: (year: number, month: number) => string;
  csvPath: string;
};
