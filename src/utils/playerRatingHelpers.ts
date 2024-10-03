import { PlayerRating, Player } from './Players';

export const getNumberOfAppearancesString = (playerRating: PlayerRating | undefined) => {
  if (!playerRating || (!playerRating.startingAppearances && !playerRating.substituteAppearances)) return '0';

  return `${playerRating.startingAppearances}+${playerRating.substituteAppearances} (${playerRating.startingAppearances + playerRating.substituteAppearances})`;
};

export const getNumberOfAppearancesByMonth = (playerRating: PlayerRating | undefined, month: number) => {
  if (!playerRating) return 0;

  return playerRating.ratings.filter((rating) => new Date(rating.date).getMonth() === month).length;
};

export const getNumberOfAppearances = (playerRating: PlayerRating | undefined) => {
  if (!playerRating) return 0;

  return playerRating.startingAppearances + playerRating.substituteAppearances;
};

export const getPlayerRatingObject = (player: Player, ratingsArr: Array<PlayerRating>) => ratingsArr.find((rating) => rating.playerId === player.id);

export const getPlayerMonthlyRating = (playerRating: PlayerRating | undefined, customMonth?: number) => {
  if (!playerRating || !playerRating.ratings || !playerRating.ratings.length) return '-';

  const currentMonth = new Date().getMonth();
  const month = customMonth || currentMonth;
  const numberOfGamesThisMonth = playerRating.ratings.filter((rating) => new Date(rating.date).getMonth() === month).length;

  if (!numberOfGamesThisMonth) return '-';

  const totalRatingThisMonth = playerRating.ratings.filter((rating) => new Date(rating.date).getMonth() === month)
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

export const getMonthString = (month: string) => {
  switch (month) {
    case '0':
      return 'Januari';
    case '1':
      return 'Februari';
    case '2':
      return 'Mars';
    case '3':
      return 'April';
    case '4':
      return 'Maj';
    case '5':
      return 'Juni';
    case '6':
      return 'Juli';
    case '7':
      return 'Augusti';
    case '8':
      return 'September';
    case '9':
      return 'Oktober';
    case '10':
      return 'November';
    case '11':
      return 'December';
    default:
      return '';
  }
};
