import { PlayerRating, Player } from './Players';

export const getNumberOfAppearances = (playerRating: PlayerRating | undefined) => {
  if (!playerRating || (!playerRating.startingAppearances && !playerRating.substituteAppearances)) return 0;

  return `${playerRating.startingAppearances}+${playerRating.substituteAppearances} (${playerRating.startingAppearances + playerRating.substituteAppearances})`;
};

export const getPlayerRatingObject = (player: Player, ratingsArr: Array<PlayerRating>) => ratingsArr.find((rating) => rating.playerId === player.id);

export const getPlayerMonthlyRating = (playerRating: PlayerRating | undefined) => {
  if (!playerRating || !playerRating.ratings || !playerRating.ratings.length) return '-';

  const currentMonth = new Date().getMonth();
  const numberOfGamesThisMonth = playerRating.ratings.filter((rating) => new Date(rating.date).getMonth() === currentMonth).length;
  const totalRatingThisMonth = playerRating.ratings.filter((rating) => new Date(rating.date).getMonth() === currentMonth)
    .reduce((acc, curr) => acc + curr.rating, 0);
  const averageRatingThisMonth = totalRatingThisMonth / numberOfGamesThisMonth;
  return averageRatingThisMonth.toFixed(1);
};

export const getPlayerSeasonRating = (playerRating: PlayerRating | undefined) => {
  if (!playerRating || !playerRating.ratings || !playerRating.ratings.length) return '-';
  const totalRatingThisSeason = playerRating.ratings.reduce((acc, curr) => acc + curr.rating, 0);
  const averageRatingThisSeason = totalRatingThisSeason / playerRating.ratings.length;
  return averageRatingThisSeason.toFixed(1);
};
