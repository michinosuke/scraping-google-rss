import { format } from "date-fns";

// 指定したキーワード、開始日、終了日からGoogle News RSS用のクエリ文字列を生成
export const buildQuery = (keywords: string[], startDate: Date, endDate: Date): string => {
  const afterStr = format(startDate, "yyyy-MM-dd");
  const beforeStr = format(endDate, "yyyy-MM-dd");
  // キーワードを OR 検索で連結し、日付条件を付与
  const keywordQuery = keywords.map((word) => `"${word}"`).join(" OR ");
  return `${keywordQuery} after:${afterStr} before:${beforeStr}`;
};
