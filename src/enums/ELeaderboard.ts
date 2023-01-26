export enum ELeaderboard {
  Daily = "Daily",
  Weekly = "Weekly",
  Season = "Season",
  Ever = "Ever",
  BestTrade = "Best Trade",
  LargestYolo = "Largest Yolo",
}

export namespace Leaderboard {
  export function toDays(eLeaderboard: ELeaderboard) {
    switch (eLeaderboard) {
      case ELeaderboard.Daily:
        return 1;
      case ELeaderboard.Weekly:
        return 7;
      default:
        throw new Error("bad ELeaderboard.toDays call");
    }
  }

  export function isTimeframe(eLeaderboard: ELeaderboard) {
    return [ELeaderboard.Daily, ELeaderboard.Weekly, ELeaderboard.Season, ELeaderboard.Ever].includes(eLeaderboard);
  }
}
