import { QueryDocumentSnapshot, DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { PredictionOutcomeEnum, PredictionStatus } from './Fixture';
import { LeagueGameWeek } from './League';
import { ProfilePictureEnum } from '../components/avatar/Avatar';
import {
  ExactPositionEnum, GeneralPositionEnum, Player, PlayerStatusEnum,
} from './Players';
import { TournamentsEnum } from './Team';
import { theme } from '../theme';

export const defenderGoalPoints = 5;
export const midfielderGoalPoints = 3;
export const forwardGoalPoints = 2;

export const withDocumentIdOnObjectsInArray = <T>(docs: QueryDocumentSnapshot<DocumentData>[]): T[] => docs.map((doc) => ({
  ...(doc.data() as T),
  documentId: doc.id,
}));

export const withDocumentIdOnObject = <T>(docSnap: DocumentSnapshot): T & { documentId: string } => ({
  ...(docSnap.data() as T),
  documentId: docSnap.id,
});

export const generateLeagueInviteCode = (): string => Math.random().toString(20).substring(2, 8).toUpperCase();

export const hasInvalidTeamName = (teamName: string): boolean => {
  if (teamName === 'Välj lag' || teamName === '') {
    return true;
  }
  return false;
};

export const getPredictionStatus = (currentGameWeek: LeagueGameWeek, userId: string, fixtureId: string): PredictionStatus => {
  if (currentGameWeek.games.predictions.some((prediction) => prediction.userId === userId && prediction.fixtureId === fixtureId)) {
    return PredictionStatus.PREDICTED;
  }
  return PredictionStatus.NOT_PREDICTED;
};

export const getPredictionOutcome = (homeGoals: number, awayGoals: number): PredictionOutcomeEnum => {
  if (homeGoals > awayGoals) {
    return PredictionOutcomeEnum.HOME_TEAM_WIN;
  } if (homeGoals < awayGoals) {
    return PredictionOutcomeEnum.AWAY_TEAM_WIN;
  }
  return PredictionOutcomeEnum.DRAW;
};

export const getHomeTeamPredictedGoals = (gameWeek: LeagueGameWeek, fixtureId: string, userId: string): number | undefined => {
  const prediction = gameWeek.games.predictions.find((prediction) => prediction.userId === userId && prediction.fixtureId === fixtureId);
  return prediction ? prediction.homeGoals : undefined;
};

export const getAwayTeamPredictedGoals = (gameWeek: LeagueGameWeek, fixtureId: string, userId: string): number | undefined => {
  const prediction = gameWeek.games.predictions.find((prediction) => prediction.userId === userId && prediction.fixtureId === fixtureId);
  return prediction ? prediction.awayGoals : undefined;
};

export const getGeneralPositionShorthand = (position: string) => {
  switch (position) {
    case 'Forward':
      return 'ANF';
    case 'Midfielder':
      return 'MF';
    case 'Defender':
      return 'FÖR';
    case 'Goalkeeper':
      return 'MV';
    default:
      return '';
  }
};

export const getProfilePictureUrl = (picture: ProfilePictureEnum) => {
  switch (picture) {
    case ProfilePictureEnum.GRANNEN:
      return '/images/grannen.png';
    case ProfilePictureEnum.CARL_GUSTAF:
      return '/images/carl-gustaf.png';
    case ProfilePictureEnum.DONKEY:
      return '/images/donkey.png';
    case ProfilePictureEnum.ZLATAN:
      return '/images/zlatan.png';
    case ProfilePictureEnum.ANIMAL:
      return '/images/animal.png';
    case ProfilePictureEnum.SHREK:
      return '/images/shrek.png';
    case ProfilePictureEnum.ANTONY:
      return '/images/antony.png';
    case ProfilePictureEnum.FELLAINI:
      return '/images/fellaini.png';
    default:
      return '/images/generic.png';
  }
};

export const getUserPreviousGameWeekPrecitedGoalScorers = (previousGameWeek: LeagueGameWeek | undefined, userId: string, teams?: Array<string>): Array<Player> => {
  if (!previousGameWeek) {
    return [];
  }

  const allPreviousGameWeekPredictedGoalScorers = previousGameWeek.games.predictions.filter((prediction) => prediction.userId === userId && prediction.goalScorer);
  const allPredictedGoalScorers = allPreviousGameWeekPredictedGoalScorers.map((prediction) => prediction.goalScorer);

  return allPredictedGoalScorers.filter((goalScorer) => goalScorer !== undefined) as Array<Player>;
  // return allPreviousGameWeekPredictedGoalScorers.map((prediction) => ({
  //   playerName: prediction.goalScorer?.name || '',
  //   playerId: prediction.goalScorer?.id || '',
  //   teamName: teams || '',
  //   teamId: prediction.goalScorer?.teamId || '',
  // }));

  // const predictions = previousGameWeek.games.predictions.filter((prediction) => prediction.userId === userId && prediction.goalScorer);

  // if (!predictions) {
  //   return undefined;
  // }

  // return predictions.goalScorer;
};

export const getLastGameWeek = (previousGameWeeks: Array<LeagueGameWeek> | undefined): LeagueGameWeek | undefined => {
  if (!previousGameWeeks || previousGameWeeks.length === 0) {
    return undefined;
  }

  const sortedGameWeeks = previousGameWeeks.sort((a, b) => a.round - b.round);

  return sortedGameWeeks[sortedGameWeeks.length - 1];
};

export const getIsBottomOfLeague = (position: number, tournament: TournamentsEnum): boolean => {
  switch (tournament) {
    case TournamentsEnum.ALLSVENSKAN:
      return position >= 16;
    case TournamentsEnum.SERIE_A:
    case TournamentsEnum.LA_LIGA:
    case TournamentsEnum.PREMIER_LEAGUE:
      return position >= 20;
    case TournamentsEnum.LIGUE_1:
    case TournamentsEnum.BUNDESLIGA:
      return position >= 18;
    case TournamentsEnum.CHAMPIONS_LEAGUE:
    case TournamentsEnum.EUROPA_LEAGUE:
      return position >= 36;
    default:
      return false;
  }
};

export const getPlayerPositionColor = (position: GeneralPositionEnum) => {
  switch (position) {
    case GeneralPositionEnum.FW:
      return theme.colors.blue;
    case GeneralPositionEnum.MF:
      return theme.colors.primary;
    case GeneralPositionEnum.DF:
      return theme.colors.red;
    default:
      return theme.colors.gold;
  }
};

export const getExactPositionOptions = (generalPosition: GeneralPositionEnum) => {
  switch (generalPosition) {
    case GeneralPositionEnum.GK:
      return Object.values(ExactPositionEnum).filter((position) => position === ExactPositionEnum.GK);
    case GeneralPositionEnum.DF:
      return Object.values(ExactPositionEnum).filter((position) => position === ExactPositionEnum.CB || position === ExactPositionEnum.LB || position === ExactPositionEnum.RB);
    case GeneralPositionEnum.MF:
      return Object.values(ExactPositionEnum).filter((position) => position === ExactPositionEnum.CM || position === ExactPositionEnum.DM || position === ExactPositionEnum.AM || position === ExactPositionEnum.LM || position === ExactPositionEnum.RM);
    case GeneralPositionEnum.FW:
      return Object.values(ExactPositionEnum).filter((position) => position === ExactPositionEnum.ST || position === ExactPositionEnum.LW || position === ExactPositionEnum.RW);
    default:
      return Object.values(ExactPositionEnum);
  }
};

export const createRandomPlayerId = (): string => Math.random().toString(36).substring(2, 8).toUpperCase();

export const getSortedPlayerByPosition = (players: Array<Player>): Array<Player> => {
  if (!players) {
    return [];
  }

  const goalKeepers = players.filter((player) => player.position.general === GeneralPositionEnum.GK);

  const defenders = players.filter((player) => player.position.general === GeneralPositionEnum.DF);
  const midfielders = players.filter((player) => player.position.general === GeneralPositionEnum.MF);
  const forwards = players.filter((player) => player.position.general === GeneralPositionEnum.FW);

  const defenderOrder = ['RB', 'CB', 'LB'];
  const midfielderOrder = ['DM', 'CM', 'RM', 'AM', 'LM'];
  const forwardOrder = ['RW', 'ST', 'LW'];

  const sortByExactPosition = (players: Array<Player>, order: Array<string>): Array<Player> => players.sort((a, b) => {
    const positionComparison = order.indexOf(a.position.exact) - order.indexOf(b.position.exact);
    if (positionComparison !== 0) {
      return positionComparison;
    }
    if (a.number !== undefined && b.number !== undefined) {
      return a.number - b.number;
    }
    return 0;
  });

  const sortedDefenders = sortByExactPosition(defenders, defenderOrder);
  const sortedMidfielders = sortByExactPosition(midfielders, midfielderOrder);
  const sortedForwards = sortByExactPosition(forwards, forwardOrder);

  return [...goalKeepers, ...sortedDefenders, ...sortedMidfielders, ...sortedForwards];
};

export const getPlayerStatusName = (status: PlayerStatusEnum) => {
  switch (status) {
    case PlayerStatusEnum.AVAILABLE:
      return 'Tillgänglig';
    case PlayerStatusEnum.INJURED:
      return 'Skadad';
    case PlayerStatusEnum.SUSPENDED:
      return 'Avstängd';
    case PlayerStatusEnum.MAY_BE_INJURED:
      return 'Möjligtvis skadad';
    case PlayerStatusEnum.ILL:
      return 'Sjuk';
    default:
      return '';
  }
};
