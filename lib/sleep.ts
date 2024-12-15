// 指定された秒数だけ待機する非同期関数
export const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));
