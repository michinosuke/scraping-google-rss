import { settings } from "./settings";
import { fetchAndSaveMonthlyData } from "./lib/fetch-and-save-monthly-data";
import { exportCsv } from "./lib/export-csv";
import { existsSync } from "fs";

/**
 * メイン処理：指定開始年月から現在までの間、月ごとにデータを収集
 */
const main = async (): Promise<void> => {
  const startDate = new Date(settings.scrapeStartMonth);
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;

  const endDate = settings.scrapeEndMonth ? new Date(settings.scrapeEndMonth) : new Date();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth() + 1;

  // 開始年～現在年までループ
  for (let year = startYear; year <= endYear; year++) {
    // 対象年内で開始月～12月までループ
    for (let month = year === startYear ? startMonth : 1; month <= 12; month++) {
      const filePath = `${settings.outputJsonDirectory}/${settings.createFileName(year, month)}`;
      if (existsSync(filePath)) {
        console.log(`Exists ${year}/${month}`);
        continue;
      }
      console.log(`Processing ${year}/${month}`);
      await fetchAndSaveMonthlyData(year, month);

      // 現在年月まで到達したら終了
      if (year === endYear && month === endMonth) {
        break;
      }
    }
  }

  // CSV ファイルをエクスポート
  exportCsv();
};

// メイン処理実行
main().catch((err) => {
  console.error("An error occurred:", err);
});
